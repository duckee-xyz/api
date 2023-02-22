import { injectable } from 'inversify';
import { log } from 'pine-log';
import { UseOtherLoginChannel } from '../errors';
import { SocialLoginType } from '../types';
import { LoginChannels } from './social-logins';

@injectable()
export class CheckUserUsesOtherLoginChannel {
  constructor(private loginChannels: LoginChannels) {}

  async call(channelType: SocialLoginType, email: string) {
    // try matching with email (to raise better error for UX)
    const userButDifferentChannel = await this.loginChannels.findUserByEmail(email);
    if (userButDifferentChannel) {
      // user signed up with other channel before
      // (e.g. alice@xyz.com signed up with FB before, but now trying to sign in with TW)
      log.error('use other login channel', {
        userId: userButDifferentChannel.user.id,
        email,
        tried: channelType,
        use: userButDifferentChannel.channelType,
      });
      throw new UseOtherLoginChannel(userButDifferentChannel.channelType);
    }
  }
}
