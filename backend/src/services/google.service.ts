import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import { logger } from '../config/logger';

// ─── Google OAuth2 Client (lazy-initialized) ────────────────
let googleClient: OAuth2Client | null = null;

function getGoogleClient(): OAuth2Client {
  if (!googleClient) {
    googleClient = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_CALLBACK_URL
    );
  }
  return googleClient;
}

// ─── Google User Info Interface ─────────────────────────────
export interface GoogleUserInfo {
  email: string;
  name: string;
  googleId: string;
  avatar?: string;
}

// ─── Google OAuth Service ───────────────────────────────────
export const googleService = {
  /**
   * Verify a Google ID token and extract user information.
   * Used when the frontend sends a Google credential (ID token) after
   * the user completes the Google Sign-In popup flow.
   */
  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    const client = getGoogleClient();

    const ticket = await client.verifyIdToken({
      idToken,
      audience: env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google ID token: no payload');
    }

    if (!payload.email || !payload.email_verified) {
      throw new Error('Google account email is not verified');
    }

    logger.info(`[GoogleOAuth] Token verified for: ${payload.email}`);

    return {
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      googleId: payload.sub,
      avatar: payload.picture,
    };
  },

  /**
   * Exchange an authorization code for tokens, then extract user info.
   * Used when Google redirects back to our callback URL with a code.
   */
  async exchangeCode(code: string): Promise<GoogleUserInfo> {
    const client = getGoogleClient();

    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
      throw new Error('No ID token received from Google');
    }

    return this.verifyIdToken(tokens.id_token);
  },

  /**
   * Generate the Google OAuth2 authorization URL.
   * The frontend can redirect the user here to start the OAuth flow.
   */
  getAuthUrl(): string {
    const client = getGoogleClient();

    return client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      prompt: 'consent',
    });
  },
};
