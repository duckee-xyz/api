import { DallE, DALLE_METADATA } from './DallE';
import { STABLE_DIFFUSION_METADATA, StableDiffusion } from './StableDiffusion';
import { WAIFU_DIFFUSION_METADATA, WaifuDiffusion } from './WaifuDiffusion';

export const SERVED_MODELS = [DallE, StableDiffusion, WaifuDiffusion];

export const SERVED_MODEL_METADATA = [STABLE_DIFFUSION_METADATA, DALLE_METADATA, WAIFU_DIFFUSION_METADATA];

export * from './IModel';
export * from './DallE';
export * from './StableDiffusion';
export * from './WaifuDiffusion';
