import test from 'node:test';
import assert from 'node:assert/strict';
import { validateAnalytics } from '../src/lib/analytics-contract';

const snapshot = { schemaVersion:2,asOf:'2026-10-18T00:00:00Z',trackingSince:'2026-10-17T00:00:00Z',totalViews:0,viewsFromRecommendation:0,timesRecommended:0,timesTopResult:0,favorites:0,visibleReviews:0,verifiedPayments:0,averageRating:null,activePaidSubscription:false,dailyViews:[] };
test('accepts database-confirmed zero rather than treating it as missing',()=>assert.equal(validateAnalytics(snapshot,'owner'),true));
test('rejects missing data, legacy responses, negative values, and numeric strings',()=>{
  for (const data of [null,{}, {...snapshot,schemaVersion:1},{...snapshot,totalViews:undefined},{...snapshot,timesRecommended:'4'},{...snapshot,totalViews:-1},{...snapshot,asOf:'invalid'}]) {
    assert.equal(validateAnalytics(data,'owner'),false);
  }
});
