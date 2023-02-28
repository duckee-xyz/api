import axios, { Axios } from 'axios';
import { Service } from 'typedi';
import { sleep } from '../../utils';
import { GenerationConfig } from '../GenerationConfig';
import { IModelService } from './IModelService';

@Service()
export class ReplicateModelService implements IModelService {
  private replicateAPI: Axios;

  constructor(private config: GenerationConfig) {
    this.replicateAPI = axios.create({
      baseURL: 'https://api.replicate.com/v1',
      headers: { authorization: `Token ${config.replicateApiKey}`, accept: 'application/json' },
    });
  }

  async generate(model: string, input: any): Promise<string> {
    const response = await this.replicateAPI.post('/predictions', { version: model, input });
    const prediction = response.data as Prediction;

    for (let attempt = 1; attempt <= 60; attempt++) {
      await sleep(1000);
      const { error, result } = await this.getPredictionStatus(prediction.id);
      if (error) {
        throw new Error(`Replicate prediction API failed: ${error}`);
      }
      if (result) {
        return result;
      }
    }
    throw new Error(`Replicate prediction API timeout: 60s`);
  }

  async getPredictionStatus(id: string): Promise<{ error?: string; result?: string }> {
    const response = await this.replicateAPI.get(`/predictions/${id}`);
    const prediction = response.data as Prediction;

    switch (prediction.status) {
      case 'succeeded':
        return { result: prediction.output[0] };

      case 'failed':
        return { error: prediction.error! };

      case 'canceled':
        return { error: 'canceled' };
    }
    return {};
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
