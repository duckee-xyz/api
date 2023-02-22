import { FirebaseIntegrationEntity } from '../entities';
import { FirebaseIntegration } from '../models';

export const mapFirebaseIntegrationEntityToModel = (entity: FirebaseIntegrationEntity): FirebaseIntegration => ({
  user: entity.user.toModel(),
  email: entity.email,
  uid: entity.uid,
});
