const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const model = require('../models/reservation.model');
const { UUID } = require('../services/reservationRules');
const { requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/apiError');

const createLimiter = rateLimit({ windowMs:3600000,max:process.env.NODE_ENV==='test'?1000:10,
  keyGenerator:(req)=>req.user.id,standardHeaders:true,legacyHeaders:false,
  message:{success:false,message:'You have reached the reservation request limit. Please try again later.'} });
const validIds = (req,res,next) => {
  if ([req.params.restaurantId,req.params.reservationId].filter(Boolean).some((id)=>!UUID.test(id))) return next(ApiError.badRequest('Invalid restaurant or reservation identifier.'));
  next();
};
const send = (res,data,status=200) => res.status(status).set('Cache-Control','private, no-store').json({success:true,data});
const statuses=['pending','confirmed','rejected','cancelled','completed','no_show'];
const listParams=(req)=>{
  const page=req.query.page===undefined?1:Number(req.query.page);
  if (!Number.isInteger(page)||page<1||page>10000) throw ApiError.badRequest('Invalid reservation page.');
  const status=req.query.status||undefined;
  if (status&&!statuses.includes(status)) throw ApiError.badRequest('Invalid reservation status.');
  const scope=req.query.scope||'all';
  if (!['all','upcoming','past'].includes(scope)) throw ApiError.badRequest('Invalid reservation date filter.');
  return {page,status,scope};
};

router.get('/restaurants/:restaurantId/reservations/options',validIds,asyncHandler(async(req,res)=>{
  send(res,await model.options(req.params.restaurantId,req.query.date,req.query.partySize===undefined?1:Number(req.query.partySize)));
}));
router.get('/restaurants/:restaurantId/reservations/settings',requireAuth,requireRole('owner','admin'),validIds,asyncHandler(async(req,res)=>{
  send(res,{settings:await model.getSettings(req.params.restaurantId,req.user)});
}));
router.patch('/restaurants/:restaurantId/reservations/settings',requireAuth,requireRole('owner','admin'),validIds,asyncHandler(async(req,res)=>{
  send(res,await model.saveSettings(req.params.restaurantId,req.user,req.body||{}));
}));
router.get('/restaurants/:restaurantId/reservations',requireAuth,requireRole('owner','admin'),validIds,asyncHandler(async(req,res)=>{
  send(res,await model.list({actor:req.user,restaurantId:req.params.restaurantId,...listParams(req)}));
}));
router.post('/restaurants/:restaurantId/reservations',requireAuth,requireRole('customer','owner'),validIds,createLimiter,asyncHandler(async(req,res)=>{
  const result=await model.create(req.params.restaurantId,req.user,req.body||{});
  send(res,result,result.created?201:200);
}));
router.get('/reservations/mine',requireAuth,asyncHandler(async(req,res)=>{
  send(res,await model.list({actor:req.user,...listParams(req)}));
}));
router.patch('/reservations/:reservationId/status',requireAuth,validIds,asyncHandler(async(req,res)=>{
  send(res,{reservation:await model.changeStatus(req.params.reservationId,req.user,req.body||{})});
}));

module.exports=router;
