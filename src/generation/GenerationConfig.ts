import { ConfigKey } from '~/utils';

export class GenerationConfig {
  @ConfigKey({ env: 'REPLICATE_API_KEY', default: '' })
  replicateApiKey: string;

  @ConfigKey({ env: 'OPENAI_API_KEY', default: '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' })
  openAIApiKey: string;
}
