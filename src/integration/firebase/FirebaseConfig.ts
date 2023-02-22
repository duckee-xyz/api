import { ConfigKey } from '~/utils';

export class FirebaseConfig {
  @ConfigKey({ env: 'FIREBASE_ADMIN_CREDENTIALS', warnIfNotGiven: true })
  firebaseAdminCredentialsJsonBase64: string;
}
