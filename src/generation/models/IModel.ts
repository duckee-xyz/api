import { Recipe } from '../../art';
import { User } from '../../user';
import { GenerateTaskStatus } from '../types';

export interface IModel {
  generate(user: User, recipe: Recipe): Promise<GenerateTaskStatus>;
}
