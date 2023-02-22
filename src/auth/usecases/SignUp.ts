import { injectable } from 'inversify';
import { User, UserRepository } from '~/user';
import { SignInAndUpInput } from '../types';
import { CheckUserUsesOtherLoginChannel } from './CheckUserUsesOtherLoginChannel';
import { LoginChannels } from './social-logins';

@injectable()
export class SignUp {
  constructor(
    private userRepository: UserRepository,
    private loginChannels: LoginChannels,
    private checkUserUsesOtherLoginChannel: CheckUserUsesOtherLoginChannel,
  ) {}

  // TODO: transactional
  async call({ channel, token }: SignInAndUpInput): Promise<User> {
    const loginChannel = this.loginChannels.getLoginChannel(channel);
    const socialLoginResult = await loginChannel.verifyToken(token);

    // to check duplicated user
    await this.checkUserUsesOtherLoginChannel.call(channel, socialLoginResult.email);

    const user = await this.userRepository.create({
      email: socialLoginResult.email,
      profileImage: socialLoginResult.profileImage,
    });
    await loginChannel.saveCredential(user, socialLoginResult);
    return user;
  }
}
