export interface IModelService {
  generate(model: string, input: any): Promise<string>;
}
