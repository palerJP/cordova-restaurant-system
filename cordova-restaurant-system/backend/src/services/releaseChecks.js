async function checkPublicApi(base, { minimum = 1, fetcher = fetch } = {}) {
  async function json(path, options) {
    const response = await fetcher(`${base}${path}`, { ...options, signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`Release check failed: ${path} returned ${response.status}`);
    return response.json();
  }
  const directory = await json('/api/restaurants?limit=100');
  if (!Array.isArray(directory.data) || directory.data.length < Math.min(minimum,100)
      || Number(directory.meta?.totalCount || directory.data.length) < minimum) {
    throw new Error(`Release blocked: public catalog has fewer than ${minimum} listings`);
  }
  const recommendations = await json('/api/recommendations', {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{"limit":3}',
  });
  if (!Array.isArray(recommendations.data) || !recommendations.data.length) {
    throw new Error('Release blocked: recommendations are empty');
  }
  let menuItems = 0;
  for (const restaurant of directory.data.slice(0,3)) {
    const menu = await json(`/api/restaurants/${restaurant.id}/menu`);
    menuItems += menu.data?.items?.length || 0;
  }
  if (!menuItems) throw new Error('Release blocked: sampled restaurant menus are empty');
  const gallery = await json(`/api/restaurants/${directory.data[0].id}/highlights?limit=1`);
  if (!Array.isArray(gallery.data) || !gallery.meta) throw new Error('Release blocked: gallery response is invalid');
  const protectedResponse = await fetcher(`${base}/api/admin/restaurants/${directory.data[0].id}/permit`, { signal: AbortSignal.timeout(20000) });
  if (protectedResponse.status !== 401) throw new Error('Release blocked: permit authentication is not enforced');
  return { listings: Number(directory.meta?.totalCount || directory.data.length), recommendations: recommendations.data.length, sampledMenuItems: menuItems };
}

module.exports = { checkPublicApi };
