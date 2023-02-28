import { User } from '../../user';
import { Recipe } from './Recipe';

export interface Art {
  tokenId: number;
  description?: string;
  liked: boolean;
  imageUrl: string;
  owner: User;
  priceInFlow: number;
  royaltyFee: number;

  /**
   * Indicates whether the art NFT is listed.
   * * If `forSale = false`, the art is considered as not for sale: only the owner can access its recipe.
   * * If `forSale = true` but `priceInFlow === 0`, the art is open-sourced: anyone can access its recipe.
   */
  forSale: boolean;
}

export interface ArtDetails extends Art {
  /** if opened */
  recipe: Recipe | null;
  recipeStatus?: 'bought' | 'listed-by-me' | 'open-source';

  parentToken?: Art;
  derivedTokens: Art[];
}

export type ArtCreation = Omit<Art, 'tokenId' | 'recipe'> & { recipe: Recipe; parentTokenId?: number };
