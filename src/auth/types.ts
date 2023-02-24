/**
 * [JWT](https://jwt.io)
 * @example "eyJhbGciOiJIUzI...Qedy-rosPJLzs3jArh6Vc"
 */
export type JWT = string;

export interface Credentials {
  accessToken: JWT;
  refreshToken: JWT;
}

export enum TokenType {
  ACCESS = 'access',
  REFRESH = 'refresh',
}

export interface JWTPayload {
  type: TokenType;
  sub?: string;
}

export enum SocialLoginType {
  FIREBASE = 'firebase',
}

/**
 * The common input payload used for both sign in and up.
 */
export interface SignInAndUpInput {
  /**
   * The social login channel the user is currently signing in/up.
   * @example "firebase"
   */
  channel: SocialLoginType;

  /**
   * The access token / ID token / redirect code retrieved as a result of OAuth 2.0 Sign In.
   * Server uses it to call the OAuth provider to verify that the client correctly finished OAuth flow,
   * and fetches users' basic profile information such as email.
   *
   * Its value differs by channel:
   *  - For `firebase`, it's the ID token returned after finishing the social login process from the client.
   *
   *  @example "eyJhbGciOiJIUzI...Qedy-rosPJLzs3jArh6Vc"
   */
  token: string;
}
