import { Service } from 'typedi';
import { ValidationError } from '~/errors';
import { User } from '../../../user';
import { SocialLoginType } from '../../types';
import { FirebaseLogin } from './FirebaseLogin';
import { SocialLoginChannel } from './types';

/**
 * Aggregates all available login channels.
 */
@Service()
export class LoginChannels {
  private readonly loginChannels: { [channel in SocialLoginType]: SocialLoginChannel };

  constructor(private firebaseLogin: FirebaseLogin) {
    this.loginChannels = {
      firebase: firebaseLogin,
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
