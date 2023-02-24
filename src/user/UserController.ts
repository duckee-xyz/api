import { Route, Tags } from '@tsoa/runtime';
import { Service } from 'typedi';
import { UserRepository } from './UserRepository';

@Service()
@Tags('User')
@Route('/user/v1')
export class UserController {
  constructor(private userRepository: UserRepository) {}
}
