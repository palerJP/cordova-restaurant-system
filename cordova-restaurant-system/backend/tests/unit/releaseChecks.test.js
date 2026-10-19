const { checkPublicApi } = require('../../src/services/releaseChecks');
function transport(overrides = {}) {
  return jest.fn(async (url) => {
    const path = new URL(url).pathname;
    if (path.endsWith('/permit')) return { status: overrides.permitStatus || 401 };
    if (path.endsWith('/menu')) return { ok: true, json: async()=>({ data: { items: [{ name: 'Dish' }] } }) };
    if (path.endsWith('/highlights')) return { ok: !overrides.galleryFailure, status:500, json:async()=>({ data:[],meta:{ totalCount:0,totalPages:1 } }) };
    if (path === '/api/recommendations') return { ok: true, json: async()=>({ data: overrides.recommendations ?? [{}] }) };
    return { ok: true, json: async()=>({ data: overrides.directory ?? [{ id: 'restaurant' }], meta: { totalCount: overrides.count ?? 24 } }) };
  });
}
test('release blocks an empty public catalog', async () => {
  await expect(checkPublicApi('https://example.test',{ minimum:24, fetcher:transport({ directory:[],count:0 }) })).rejects.toThrow('public catalog');
});
test('release blocks empty recommendations', async () => {
  await expect(checkPublicApi('https://example.test',{ fetcher:transport({ recommendations:[] }) })).rejects.toThrow('recommendations');
});
test('release blocks loss of permit access control', async () => {
  await expect(checkPublicApi('https://example.test',{ fetcher:transport({ permitStatus:200 }) })).rejects.toThrow('authentication');
});
test('healthy API passes read-only release checks', async () => {
  expect(await checkPublicApi('https://example.test',{ fetcher:transport() })).toMatchObject({ listings:24,recommendations:1,sampledMenuItems:1 });
});
test('release blocks a missing or broken gallery schema', async () => {
  await expect(checkPublicApi('https://example.test',{ fetcher:transport({ galleryFailure:true }) })).rejects.toThrow('highlights');
});
