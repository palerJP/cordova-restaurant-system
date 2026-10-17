const count = (value: unknown) => typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

export function validateAnalytics(data: any, kind: 'owner' | 'admin'): boolean {
  if (!data || data.schemaVersion !== 2 || !Number.isFinite(Date.parse(data.asOf)) || !Number.isFinite(Date.parse(data.trackingSince))) return false;
  if (kind === 'owner') {
    return ['totalViews', 'viewsFromRecommendation', 'timesRecommended', 'timesTopResult', 'favorites', 'visibleReviews', 'verifiedPayments'].every((key) => count(data[key]))
      && typeof data.activePaidSubscription === 'boolean'
      && (data.averageRating === null || (typeof data.averageRating === 'number' && data.averageRating >= 1 && data.averageRating <= 5))
      && Array.isArray(data.dailyViews) && data.dailyViews.every((row: any) => typeof row.day === 'string' && count(row.views));
  }
  return [['users', ['customers', 'owners', 'new_last_30d']], ['restaurants', ['verified', 'pending', 'rejected', 'suspended']],
    ['reviews', ['flagged', 'visible']], ['promotions', ['active', 'expired', 'total']], ['subscriptions', ['activePaidBusinesses', 'pendingPayments']]]
    .every(([group, keys]) => (keys as string[]).every((key) => count(data[group as string]?.[key])))
    && Array.isArray(data.topCuisineDemand) && data.topCuisineDemand.every((row: any) => typeof row.name === 'string' && count(row.search_count))
    && Array.isArray(data.peakSearchHours) && data.peakSearchHours.every((row: any) => count(row.hour) && row.hour < 24 && count(row.searches));
}
