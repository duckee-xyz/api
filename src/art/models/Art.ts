import { User } from '../../user';
import { Recipe } from './Recipe';

export interface Art {
  tokenId: number;
  imageUrl: string;
  owner: User;
  priceInFlow: number;
  royaltyFee: number;
}

export interface ArtDetails extends Art {
  /** if opened */
  recipe: Recipe | null;

  parentToken?: Art;
  derivedTokens: Art[];
}

export type ArtCreation = Omit<Art, 'tokenId' | 'recipe'> & { recipe: Recipe; parentTokenId?: number };
