import { User } from '~/user';

export interface FirebaseIntegration {
  user: User;
  email: string;
  uid: string;
}
