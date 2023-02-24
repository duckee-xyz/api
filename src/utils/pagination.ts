import { ObjectLiteral, Repository } from 'typeorm';
import { FindOneOptions } from 'typeorm/find-options/FindOneOptions';
import { SelectQueryBuilder } from 'typeorm/query-builder/SelectQueryBuilder';
import { assignWithoutNull } from '~/utils';

export interface PaginationOptions {
  startAfter?: string;
  limit?: number;
}

export interface PaginationOptionsWithDefault {
  startAfter?: string;
  limit: number;
}

export function paginationOptionsWithDefault(options: PaginationOptions = {}): PaginationOptionsWithDefault {
  return assignWithoutNull({ limit: 30 }, options);
}

export interface PaginatedResult<T> {
  hasNext: boolean;
  total?: number; // TODO: fixme optional
  nextStartAfter?: string;
  results: T[];
}

export async function paginatedFindBy<T extends ObjectLiteral>(
  repository: Repository<T>,
  findOptions: FindOneOptions<T>,
  options?: PaginationOptions,
): Promise<PaginatedResult<T>> {
  const { startAfter, limit } = paginationOptionsWithDefault(options);
  const offset = (startAfter ? Number(startAfter) : 0) || 0;

  const [results, total] = await repository.findAndCount({ ...findOptions, skip: offset, take: limit });
  const hasNext = results.length >= limit;
  return {
    hasNext,
    total,
    nextStartAfter: hasNext ? String(offset + results.length) : undefined,
    results,
  };
}

export async function paginateQuery<T extends ObjectLiteral>(
  query: SelectQueryBuilder<T>,
  options?: PaginationOptions,
): Promise<PaginatedResult<T>> {
  const { startAfter, limit } = paginationOptionsWithDefault(options);
  const offset = startAfter ? Number(startAfter) : 0;

  const results = await query.offset(offset).limit(limit).getMany();
  const hasNext = results.length >= limit;
  return {
    hasNext,
    nextStartAfter: hasNext ? String(offset + results.length) : undefined,
    results,
  };
}

export async function paginateGenerator<T>(
  generator: AsyncGenerator<T>,
  extractOffset: (item: T) => string,
  options?: PaginationOptions,
): Promise<PaginatedResult<T>> {
  const { limit } = paginationOptionsWithDefault(options);

  const results: T[] = [];
  let i = 0;
  for await (const item of generator) {
    results.push(item);
    i++;
    if (i >= limit) {
      break;
    }
  }
  const hasNext = results.length >= limit;
  return {
    hasNext,
    nextStartAfter: hasNext ? extractOffset(results[results.length - 1]) : undefined,
    results,
  };
}
