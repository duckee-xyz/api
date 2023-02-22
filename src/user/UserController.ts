import { Route, Tags } from '@tsoa/runtime';
import { injectable } from 'inversify';
import { UserRepository } from './UserRepository';

@injectable()
@Tags('User')
@Route('/user/v1')
export class UserController {
  constructor(private userRepository: UserRepository) {}
}
