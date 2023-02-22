import { ObjectLiteral, Repository } from 'typeorm';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { assignWithoutNull } from '~/utils';

export interface PaginationOptions {
  skip?: number;
  limit?: number;
}

export interface PaginationOptionsWithDefault {
  skip?: number;
  limit: number;
}

export function paginationOptionsWithDefault(options: PaginationOptions = {}): PaginationOptionsWithDefault {
  return assignWithoutNull({ limit: 30 }, options);
}

export interface PaginatedResult<T> {
  hasNext: boolean;
  total: number;
  results: T[];
}

export async function paginateFindBy<T extends ObjectLiteral>(
  repository: Repository<T>,
  findOptions: FindOneOptions<T>,
  options?: PaginationOptions,
): Promise<PaginatedResult<T>> {
  const { skip, limit } = paginationOptionsWithDefault(options);

  const [results, total] = await repository.findAndCount({ ...findOptions, skip, take: limit });
  return {
    hasNext: results.length >= limit,
    total,
    results,
  };
}

export async function paginateQuery<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  options?: PaginationOptions,
): Promise<PaginatedResult<T>> {
  const { skip, limit } = paginationOptionsWithDefault(options);
  const [results, total] = await query.offset(skip).limit(limit).getManyAndCount();
  return {
    hasNext: results.length >= limit,
    total,
    results,
  };
}
