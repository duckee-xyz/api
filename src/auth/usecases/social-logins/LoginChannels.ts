import { injectable } from 'inversify';
import { ValidationError } from '../../../api';
import { User } from '../../../user';
import { SocialLoginType } from '../../types';
import { AppleLogin } from './AppleLogin';
import { GoogleLogin } from './GoogleLogin';
import { SocialLoginChannel } from './types';

/**
 * Aggregates all available login channels.
 */
@injectable()
export class LoginChannels {
  private readonly loginChannels: { [channel in SocialLoginType]: SocialLoginChannel };

  constructor(private appleLogin: AppleLogin, private googleLogin: GoogleLogin) {
    this.loginChannels = {
      apple: appleLogin,
      google: googleLogin,
    };
  }

  getLoginChannel(channelType: SocialLoginType): SocialLoginChannel {
    const channel = this.loginChannels[channelType];
    if (!channel) {
      throw new ValidationError(`invalid channel type: ${channelType}`, { available: Object.keys(this.loginChannels) });
    }
    return channel;
  }

  findUserByEmail(email: string): Promise<{ user: User; channelType: SocialLoginType } | undefined> {
    return Promise.race(
      Object.entries(this.loginChannels).map(async ([channelType, channel]) => {
        const user = await channel.findUserByEmail(email);
        if (!user) {
          return;
        }
        return { user, channelType: channelType as SocialLoginType };
      }),
    );
  }
}
