import { Service } from 'typedi';
import { User, UserRepository } from '~/user';
import { AuthConfig } from '../AuthConfig';
import { AuthError } from '../errors';
import { verifyJWT } from './jwt-utils';

/**
 * Authenticates using given JWT access token.
 */
@Service()
export class Authenticate {
  constructor(private authConfig: AuthConfig, private userRepository: UserRepository) {}

  /**
   * @param accessToken A JWT token you want to authenticate
   * @returns A corresponding {@link User} by the token
   * @throws AuthError if fails
   */
  async call(accessToken: string): Promise<User> {
    const userId = verifyJWT(accessToken, this.authConfig.jwtSecret);

    const user = await this.userRepository.findOne({ id: Number(userId) });
    if (!user) {
      throw new AuthError('user does not exist');
    }
    return user;
  }
}
