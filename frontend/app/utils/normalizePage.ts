import type { Paginated } from "~/types";

interface RawMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPage?: number;
  totalPages?: number;
}
interface RawPage<T> extends RawMeta {
  data?: T[];
  items?: T[];
  meta?: RawMeta;
}

/** Menerima beberapa bentuk response paginasi dan mengubahnya ke satu bentuk baku. */
export const normalizePage = <T>(
  raw: unknown,
  fallbackLimit: number,
): Paginated<T> => {
  const r: RawPage<T> = Array.isArray(raw)
    ? { data: raw as T[] }
    : ((raw ?? {}) as RawPage<T>);
  const data = r.data ?? r.items ?? [];
  const meta = r.meta ?? r;
  const limit = meta.limit ?? fallbackLimit;
  const total = meta.total ?? data.length;
  return {
    data,
    page: meta.page ?? 1,
    limit,
    total,
    totalPage:
      meta.totalPage ??
      meta.totalPages ??
      Math.max(Math.ceil(total / limit), 1),
  };
};
