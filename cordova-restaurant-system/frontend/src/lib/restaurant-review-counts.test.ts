import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {applyRestaurantCustomization,getAllStaticRestaurants} from '../data/restaurants';
import type {Restaurant} from './types';
test('customizations preserve actual database review aggregates',()=>{
 const input={...getAllStaticRestaurants().find(r=>r.slug==='entoys-bakasihan'),id:'77777777-7777-7777-a777-777777777771',slug:'entoys-bakasihan',review_count:27,avg_rating:3.25} as Restaurant;
 const result=applyRestaurantCustomization(input);
 assert.equal(result.review_count,27);assert.equal(result.avg_rating,3.25);
 const empty=applyRestaurantCustomization({...input,review_count:0,avg_rating:0});assert.equal(empty.review_count,0);assert.equal(empty.avg_rating,0);
});
test('static catalog never invents review counts or ratings',()=>{
 const list=getAllStaticRestaurants();assert.ok(list.length>0);
 assert.ok(list.every(r=>r.review_count===0 && Number(r.avg_rating)===0));
});
