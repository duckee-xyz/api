export interface ServedModel {
  name: string;
  title: string;
  description: string;
  version: string;
  thumbnail: string;

  recipeDefinitions: {
    promptInputOnly: boolean;
    availableSizes: { width: number; height: number }[];

    samplers: string[];
    defaultSampler: string;

    defaultGuidanceScale: number;
    maxGuidanceScale: number;

    defaultRuns: number;
  };
}
