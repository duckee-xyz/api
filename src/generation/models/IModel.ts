import { Recipe } from '../../art';
import { User } from '../../user';

export interface IModel {
  generate(user: User, recipe: Recipe): Promise<string>;
}
