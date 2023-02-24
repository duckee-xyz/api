export interface Recipe {
  model: Model;

  prompt: string;
  negativePrompt?: string;
  size: {
    width: number;
    height: number;
  };
  runs?: number;
  seed?: number;
  sampler?: string;
  guidanceScale?: number;
}

export interface Model {
  type: 'imported' | 'served';
  servedModelName?: string;
  importedModel?: string;
}

export interface ImportedModel {
  name: string;
  title: string;
  version: string;
}
