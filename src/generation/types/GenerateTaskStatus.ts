export interface GenerateTaskStatus {
  id: string;
  modelName: string;
  inferenceApiName: string;
  originalRequestId?: string;
  status: 'pending' | 'completed' | 'failed';
  resultImageUrl?: string;
  error?: string;
  creditsSpent?: number;
  rawResult?: any;
}
