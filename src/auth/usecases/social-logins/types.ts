import { User } from '~/user';

export interface SocialLoginVerifyResult {
  userId: string;
  email: string;
  profileImage?: string;
  credentials?: any;
}

export interface SocialLoginChannel {
  findUserByEmail(email: string): Promise<User | undefined>;
  verifyToken(token: string): Promise<SocialLoginVerifyResult>;
  saveCredential(user: User, verifyResult: SocialLoginVerifyResult): Promise<void>;
}
