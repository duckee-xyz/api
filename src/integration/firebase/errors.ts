import { ValidationError } from '~/errors';

export class InvalidIdToken extends ValidationError {
  constructor(details: string) {
    super(details);
  }
}
