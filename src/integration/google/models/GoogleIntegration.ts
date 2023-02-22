import { User } from '~/user';

export interface GoogleIntegration {
  user: User;
  email: string;
  isLoginChannel: boolean;
  accessToken: string;
  refreshToken: string;
  scope: string;
  expiry: Date;
}
