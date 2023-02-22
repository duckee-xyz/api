import { injectable } from 'inversify';
import { JwtPayload } from 'jsonwebtoken';
import verifyAppleToken from 'verify-apple-id-token';
import { User, UserRepository } from '~/user';
import { AuthConfig } from '../../AuthConfig';
import { SocialLoginChannel, SocialLoginVerifyResult } from './types';

@injectable()
export class AppleLogin implements SocialLoginChannel {
  constructor(private authConfig: AuthConfig, private userRepository: UserRepository) {}

  async findUserByEmail(email: string): Promise<User | undefined> {
    // TODO: 이렇게 하면 회원가입 후 애플로그인 연동 못한다.
    return this.userRepository.findByEmail(email);
  }

  async verifyToken(token: string): Promise<SocialLoginVerifyResult> {
    // simply verify the validness of JWT since it contains all info we need. :shrug:
    // https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_rest_api/verifying_a_user
    const jwtClaims: JwtPayload = await verifyAppleToken({
      idToken: token,
      clientId: this.authConfig.appleClientId,
    });
    return {
      email: jwtClaims.email,
      userId: jwtClaims.sub!,
    };
  }

  async saveCredential(user: User, verifyResult: SocialLoginVerifyResult) {}
}
