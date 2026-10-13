const request = require('supertest');
const express = require('express');
jest.mock('../../src/services/auth.service', () => ({register:jest.fn(),verifyEmail:jest.fn(),issueTokenPair:jest.fn()}));
const auth = require('../../src/services/auth.service');
const controller = require('../../src/controllers/auth.controller');
const env = require('../../src/config/env');
const app = express();app.use(express.json());app.post('/register',controller.register);app.post('/verify',controller.verifyEmail);
app.use((err,req,res,next)=>res.status(err.statusCode||500).json({message:err.message}));
const user = {id:'new-user',email:'new@example.invalid',role:'customer',is_active:true,email_verified:false,onboarding_required:true};
beforeEach(()=>{jest.clearAllMocks();auth.register.mockResolvedValue(user);auth.verifyEmail.mockResolvedValue({...user,email_verified:true,password_hash:'never-public'});auth.issueTokenPair.mockResolvedValue({accessToken:'access',refreshToken:'refresh'});});
test('signup establishes the unverified session without requiring another login', async()=>{
 const res=await request(app).post('/register').send({});expect(res.status).toBe(201);expect(res.body.data.accessToken).toBe('access');expect(res.body.data.user.email_verified).toBe(false);expect(res.headers['set-cookie'][0]).toMatch(/refreshToken=refresh.*HttpOnly/);expect(res.body.data.refreshToken).toBeUndefined();
});
test('verification establishes a session in a browser without an existing cookie',async()=>{
 const res=await request(app).post('/verify').send({token:'single-use'});expect(res.status).toBe(200);expect(auth.verifyEmail).toHaveBeenCalledWith('single-use');expect(res.body.data.user.onboarding_required).toBe(true);expect(res.body.data.user.password_hash).toBeUndefined();expect(res.body.data.accessToken).toBe('access');expect(res.headers['set-cookie'][0]).toContain('HttpOnly');
});
test('failed verification cannot create an authenticated session',async()=>{
 auth.verifyEmail.mockRejectedValueOnce({statusCode:400,message:'Expired verification token'});const res=await request(app).post('/verify').send({token:'expired'});expect(res.status).toBe(400);expect(auth.issueTokenPair).not.toHaveBeenCalled();expect(res.headers['set-cookie']).toBeUndefined();
});
