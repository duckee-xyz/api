import { GenerateTaskStatus } from '../types';

export interface IModelService {
  generate(model: string, input: any): Promise<GenerateTaskStatus>;

  getTaskStatus(id: string): Promise<GenerateTaskStatus>;

  cancelTask(id: string): Promise<void>;
}
