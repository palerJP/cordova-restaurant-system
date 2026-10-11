import {test} from 'node:test';
import {strict as assert} from 'node:assert';
import {createReviewLongPress} from './review-long-press';
test('touch hold opens at 600ms while scrolling, release and cancellation stop it',context=>{
 context.mock.timers.enable({apis:['setTimeout']});
 let opened=0;const gesture=createReviewLongPress(()=>opened++);
 gesture.start(50,50,'touch');context.mock.timers.tick(599);assert.equal(opened,0);context.mock.timers.tick(1);assert.equal(opened,1);
 gesture.start(50,50,'touch');gesture.move(50,70);context.mock.timers.tick(1000);assert.equal(opened,1);
 gesture.start(50,50,'touch');gesture.cancel();context.mock.timers.tick(1000);assert.equal(opened,1);
 gesture.start(50,50,'mouse');context.mock.timers.tick(1000);assert.equal(opened,1);
 gesture.start(50,50,'touch');gesture.move(53,52);context.mock.timers.tick(600);assert.equal(opened,2);
});
