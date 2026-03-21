export function buildCacheKey(url: string, params: any): string {
  return `${url}::${JSON.stringify(params)}`;
}
