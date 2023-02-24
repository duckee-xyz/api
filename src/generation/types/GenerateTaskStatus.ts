export interface GenerateTaskStatus {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  resultImageUrl?: string;
  error?: string;
  creditsSpent?: number;
  rawResult?: object;
}
