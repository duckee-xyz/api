import { Service } from 'typedi';
import { FirebaseIntegrationRepository, FirebaseService } from '~/integration/firebase';
import { User } from '~/user';
import { SocialLoginChannel, SocialLoginVerifyResult } from './types';

@Service()
export class FirebaseLogin implements SocialLoginChannel {
  constructor(
    private firebaseService: FirebaseService,
    private firebaseIntegrationRepository: FirebaseIntegrationRepository,
  ) {}

  async findUserByEmail(email: string): Promise<User | undefined> {
    // TODO: not used :shrug:
    const integration = await this.firebaseIntegrationRepository.get({ email });
    return integration?.user;
  }

  /**
   * @param token Google OAuth redirect code from the client.
   */
  async verifyToken(token: string): Promise<SocialLoginVerifyResult> {
    const { email, uid, profileImage } = await this.firebaseService.verifyIdToken(token);
    return {
      userId: uid,
      email: email!,
      profileImage,
      credentials: token,
    };
  }

  async saveCredential(user: User, { email, userId, credentials }: SocialLoginVerifyResult) {
    await this.firebaseIntegrationRepository.save(user, userId, { email });
  }
}
