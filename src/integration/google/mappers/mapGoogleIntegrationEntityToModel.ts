import { GoogleIntegrationEntity } from '../entities';
import { GoogleIntegration } from '../models';

export const mapGoogleIntegrationEntityToModel = (entity: GoogleIntegrationEntity): GoogleIntegration => ({
  user: entity.user.toModel(),
  email: entity.email,
  isLoginChannel: entity.isLoginChannel,
  accessToken: entity.accessToken,
  refreshToken: entity.refreshToken,
  scope: entity.scope,
  expiry: entity.expiry,
});
