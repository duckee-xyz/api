import { ConfigKey } from '~/utils';

export class GenerationConfig {
  @ConfigKey({ env: 'REPLICATE_API_KEY', warnIfNotGiven: true })
  replicateApiKey: string;

  @ConfigKey({ env: 'OPENAI_API_KEY', warnIfNotGiven: true })
  openAIApiKey: string;
}
