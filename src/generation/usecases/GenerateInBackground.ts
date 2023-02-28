import { InvocationType, Lambda } from '@aws-sdk/client-lambda';
import axios from 'axios';
import { log } from 'pine-log';
import { Service } from 'typedi';
import { Recipe } from '../../art';
import { NotFoundError } from '../../errors';
import { User, UserRepository } from '../../user';
import { uploadToS3 } from '../../utils';
import { GenerationRepository } from '../GenerationRepository';
import { IModel } from '../models';
import { GenerateTaskStatus } from '../types';
import { ServedModels } from './ServedModels';

export interface Payload {
  userId: number;
  recipe: Recipe;
  statusId: string;
}

@Service()
export class GenerateInBackground {
  constructor(
    private servedModels: ServedModels,
    private userRepo: UserRepository,
    private generationRepo: GenerationRepository,
  ) {}

  async call(user: User, model: IModel, recipe: Recipe, status: GenerateTaskStatus) {
    if (process.env.SERVERLESS) {
      // invoke lambda asynchronously
      const payload: Payload = {
        userId: user.id,
        recipe,
        statusId: status.id,
      };
      const lambdaClient = new Lambda({});
      console.log('invoking lambda');
      return await lambdaClient.invoke({
        FunctionName: 'duckee-api-dev-asyncTask',
        InvocationType: InvocationType.Event,
        Payload: Buffer.from(JSON.stringify({ type: 'generate', payload })),
      });
    }
    // do in background (normal server)
    this.doGenerate(user, model, recipe, status);
  }

  async doGenerate(user: User, model: IModel, recipe: Recipe, status: GenerateTaskStatus) {
    try {
      const resultImageInOrigin = await model.generate(user, recipe);

      log.trace('image generation completed', { model: status.modelName, id: status.id, resultImageInOrigin });

      const uploadImageToS3 = await uploadToS3(`/images/${status.id}.png`);
      const downloadImageFromOrigin = await axios({
        method: 'GET',
        url: resultImageInOrigin,
        responseType: 'stream',
      });
      downloadImageFromOrigin.data.pipe(uploadImageToS3.stream);
      await uploadImageToS3.done;

      await this.generationRepo.updateTaskStatus(status.id, {
        status: 'completed',
        resultImageUrl: uploadImageToS3.url,
      });
      log.trace('image upload completed', { model: status.modelName, id: status.id, resultImageInOrigin });
    } catch (err) {
      const error = err as Error;
      log.error('failed to generate image', error, { model: status.modelName, id: status.id });
      await this.generationRepo.updateTaskStatus(status.id, { status: 'failed', error: error.stack ?? error.message });
    }
  }

  async handleLambda({ userId, recipe, statusId }: Payload) {
    const user = await this.userRepo.findOne({ id: userId });
    if (!user) {
      throw new Error('user not found: ' + userId);
    }

    const model = this.servedModels.models.find((it) => it.constructor.name === recipe.model.servedModelName);
    if (!model) {
      throw new NotFoundError(`model ${recipe.model.servedModelName} not found`);
    }

    const status = await this.generationRepo.getTaskStatus(statusId);
    if (!status) {
      throw new NotFoundError(`unknown task status: ${statusId}`);
    }
    await this.doGenerate(user, model, recipe, status);
  }
}
