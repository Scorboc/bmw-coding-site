interface SnapshotVariant { series: string; body_type: string; [key: string]: unknown; }
interface SnapshotError { code: string; category: string; [key: string]: unknown; }
let cached: Promise<{ variants: SnapshotVariant[]; errors: SnapshotError[] }> | undefined;

export async function snapshotResponse(input: RequestInfo | URL): Promise<Response | undefined> {
  const url = new URL(String(input), location.href);
  if (url.searchParams.has('admin')) return;
  const action = url.searchParams.get('action');
  if (!['variants', 'bodies', 'engines', 'get_error', 'get_popular_errors'].includes(action ?? '')) return;
  if (!cached) cached = fetch(`${import.meta.env.BASE_URL}data/catalog-snapshot.json`, { signal: AbortSignal.timeout(15000) })
    .then(response => { if (!response.ok) throw new Error('Snapshot missing'); return response.json(); })
    .catch(error => { cached = undefined; throw error; });
  const data = await cached;
  let result: unknown;
  if (action === 'get_error') {
    const error = data.errors.find(item => item.code.toUpperCase() === url.searchParams.get('code')?.toUpperCase());
    result = { found: Boolean(error), error };
  } else if (action === 'get_popular_errors') result = data.errors;
  else if (action === 'variants') result = data.variants;
  else {
    const variants = data.variants.filter(item => item.series.toLowerCase() === url.searchParams.get('series')?.toLowerCase());
    result = action === 'bodies' ? [...new Set(variants.map(item => item.body_type))]
      : variants.filter(item => item.body_type === url.searchParams.get('body_type'));
  }
  return new Response(JSON.stringify(result), { headers: { 'Content-Type': 'application/json', 'X-Data-Source': 'repository-snapshot' } });
}
