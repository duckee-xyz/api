import { Credentials, OAuth2Client } from 'google-auth-library';
import { log } from 'pine-log';
import { Service } from 'typedi';
import { UserRepository } from '~/user';
import { clearNullish } from '~/utils';
import { ValidationError } from '../../errors';
import { GoogleConfig } from './GoogleConfig';
import { GoogleIntegrationRepository } from './GoogleIntegrationRepository';
import { GoogleIntegration } from './models';

interface GoogleAuthenticateOutput {
  email: string;
  auth: OAuth2Client;
}

// for inversion of control (i.e. make easier to inject OAuth2Client mock)
type OAuth2ClientFactory = (clientId: string) => OAuth2Client;

@Service()
export class GoogleService {
  constructor(
    private config: GoogleConfig,
    public googleIntegrationRepository: GoogleIntegrationRepository,
    private userRepository: UserRepository,
    private oauth2Client: OAuth2ClientFactory = (clientId: string) => new OAuth2Client({ clientId }),
  ) {}

  async verifyIdToken(accessToken: string) {
    const ticket = await this.oauth2Client(this.config.googleClientId).verifyIdToken({
      idToken: accessToken,
      audience: this.config.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new ValidationError('google ID token does not have payload');
    }
    const { sub: userId, email, picture: profileUrl } = payload;
    if (!email) {
      throw new ValidationError('"profile" and "email" should be included to OAuth scopes');
    }
    return { email, userId, profileUrl };
  }

  async authenticate(integration: GoogleIntegration): Promise<GoogleAuthenticateOutput> {
    const { user, email, accessToken, refreshToken, expiry, scope } = integration;

    const auth = this.oauth2Client(this.config.googleClientId);
    auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: +expiry,
      scope,
    });
    auth.on('tokens', (tokens) => {
      // access / refresh token is being reissued
      // TODO: clear credential on revoke
      this.googleIntegrationRepository
        .save(user, email, this.credentialsFrom(tokens))
        .catch((err) =>
          log.warn('failed to store updated Google integration. will try later', { error: err, userId: user.id }),
        );
    });
    return { auth, email };
  }

  credentialsFrom(credentials: Credentials) {
    return clearNullish({
      idToken: credentials.id_token,
      accessToken: credentials.access_token,
      refreshToken: credentials.refresh_token,
      scope: credentials.scope,
      expiry: credentials.expiry_date ? new Date(credentials.expiry_date) : null,
    }) as Omit<GoogleIntegration, 'user' | 'email'> & { idToken: string };
  }

  async getCredentialsFromRedirectCode(code: string) {
    const { tokens } = await this.oauth2Client(this.config.googleClientId).getToken(code);
    return this.credentialsFrom(tokens);
  }
}
