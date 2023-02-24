import { Buffer } from 'buffer';
import firebaseAdmin, { app } from 'firebase-admin';
import { Service } from 'typedi';
import { InvalidIdToken } from './errors';
import { FirebaseConfig } from './FirebaseConfig';

export interface FirebaseUserInfo {
  uid: string;
  profileImage?: string;
  email?: string;
}

@Service()
export class FirebaseService {
  private firebase: firebaseAdmin.app.App;

  constructor(private config: FirebaseConfig) {
    const serviceAccountJson = Buffer.from(config.firebaseAdminCredentialsJsonBase64, 'base64').toString('utf-8');
    const credential = firebaseAdmin.credential.cert(JSON.parse(serviceAccountJson));
    this.firebase = !firebaseAdmin.apps?.length ? firebaseAdmin.initializeApp({ credential }) : app();
  }

  async verifyIdToken(idToken: string): Promise<FirebaseUserInfo> {
    try {
      const verifyResult = await this.firebase.auth().verifyIdToken(idToken);
      return {
        profileImage: verifyResult.picture,
        uid: verifyResult.uid,
        email: verifyResult.email,
      };
    } catch (err) {
      throw new InvalidIdToken((err as Error).message);
    }
  }
}
