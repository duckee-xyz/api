import { Service } from 'typedi';
import { GoogleIntegrationRepository, GoogleService } from '~/integration/google';
import { User } from '~/user';
import { SocialLoginChannel, SocialLoginVerifyResult } from './types';

@Service()
export class GoogleLogin implements SocialLoginChannel {
  constructor(private googleService: GoogleService, private googleIntegrations: GoogleIntegrationRepository) {}

  async findUserByEmail(email: string): Promise<User | undefined> {
    const integration = await this.googleIntegrations.get({ email, isLoginChannel: true });
    return integration?.user;
  }

  /**
   * @param token Google OAuth redirect code from the client.
   */
  async verifyToken(token: string): Promise<SocialLoginVerifyResult> {
    const credentials = await this.googleService.getCredentialsFromRedirectCode(token);
    const { email, userId, profileUrl } = await this.googleService.verifyIdToken(credentials.idToken);
    return {
      userId,
      email,
      profileImage: profileUrl,
      credentials,
    };
  }

  async saveCredential(user: User, { email, credentials }: SocialLoginVerifyResult) {
    // on the above code, google credentials (i.e. acc/ref tokens) are put in SocialLoginVerifyResult.credentials
    await this.googleIntegrations.save(user, email!, {
      ...credentials,
      isLoginChannel: true,
    });
  }
}
