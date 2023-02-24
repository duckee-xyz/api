import axios, { Axios } from 'axios';
import { Service } from 'typedi';
import { NotFoundError } from '../../errors';
import { GenerationConfig } from '../GenerationConfig';
import { GenerateTaskStatus } from '../types';
import { IModelService } from './IModelService';

@Service()
export class ReplicateModelService implements IModelService {
  private replicateAPI: Axios;

  constructor(private config: GenerationConfig) {
    this.replicateAPI = axios.create({
      baseURL: 'https://api.replicate.com/v1',
      headers: { authorization: `Token ${config.replicateApiKey}` },
    });
  }

  async generate(model: string, input: any): Promise<GenerateTaskStatus> {
    const response = await this.replicateAPI.post('/predictions', { version: model, input });
    const prediction = response.data as Prediction;

    return { id: prediction.id, status: 'pending', rawResult: prediction };
  }

  async getTaskStatus(id: string): Promise<GenerateTaskStatus> {
    const response = await this.replicateAPI.get(`/predictions/${id}`);
    const prediction = response.data as Prediction;

    switch (prediction.status) {
      case 'starting':
      case 'processing':
        return { id, status: 'pending', rawResult: prediction };

      case 'succeeded':
        return {
          id,
          status: 'completed',
          resultImageUrl: prediction.output[0],
          creditsSpent: 5,
          rawResult: prediction,
        };

      case 'failed':
        return {
          id,
          status: 'failed',
          error: prediction.error!,
          rawResult: prediction,
        };

      case 'canceled':
        throw new NotFoundError();
    }
  }

  async cancelTask(id: string): Promise<void> {
    await this.replicateAPI.post(`/predictions/${id}/cancel`);
  }
}

interface Prediction {
  id: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  created_at: string;
  started_at: string;
  completed_at: string;

  output: string[];
  error: string | null;
  logs: string;
  metrics: object;
}
