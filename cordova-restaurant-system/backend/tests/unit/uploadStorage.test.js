jest.mock('@vercel/blob', () => ({ put: jest.fn(), get: jest.fn() }));

const { ReadableStream } = require('node:stream/web');
const supertest = require('supertest');
const { put, get } = require('@vercel/blob');
const env = require('../../src/config/env');
const service = require('../../src/services/upload.service');
const { limitUploadRequest } = require('../../src/middleware/upload');
const { localSource } = require('../../src/scripts/migrate_local_uploads_to_blob');
const app = require('../../src/app');

const originalProduction = env.isProduction;
const originalPrivateToken = env.upload.privateBlobToken;
const originalPublicToken = env.upload.publicBlobToken;
const originalImageAccess = env.upload.imageAccess;

afterEach(() => {
  env.isProduction = originalProduction;
  env.upload.privateBlobToken = originalPrivateToken;
  env.upload.publicBlobToken = originalPublicToken;
  env.upload.imageAccess = originalImageAccess;
  jest.clearAllMocks();
});

test('production images and permits use separate public and private Blob storage', async () => {
  env.isProduction = true;
  env.upload.privateBlobToken = 'private-test-token';
  env.upload.publicBlobToken = 'public-test-token';
  const file = { buffer: Buffer.from('image'), mimetype: 'image/webp', originalname: 'cover.webp', fieldname: 'image' };
  put.mockResolvedValueOnce({ url: 'https://public.example/cover.webp' })
    .mockResolvedValueOnce({ url: 'https://store.private.blob.vercel-storage.com/business-permits/permit.pdf' });

  expect(await service.publicUrlFor(file)).toBe('https://public.example/cover.webp');
  expect(put.mock.calls[0][0]).toMatch(/^restaurant-images\/[a-f0-9-]+\.webp$/);
  expect(put.mock.calls[0][2]).toMatchObject({ access: 'public', contentType: 'image/webp' });
  expect(put.mock.calls[0][2].token).toBe('public-test-token');

  const permit = { buffer: Buffer.from('%PDF-test'), mimetype: 'application/pdf', originalname: 'permit.pdf' };
  await service.privateUrlFor(permit);
  expect(put.mock.calls[1][0]).toMatch(/^business-permits\/[a-f0-9-]+\.pdf$/);
  expect(put.mock.calls[1][2]).toMatchObject({ access: 'private', token: 'private-test-token' });
});

test('private permit download only accepts a private permit Blob URL', async () => {
  env.upload.privateBlobToken = 'private-test-token';
  await expect(service.openPrivatePermit('https://other.example/permit.pdf')).rejects.toMatchObject({ statusCode: 404 });
  await expect(service.openPrivatePermit('https://store.public.blob.vercel-storage.com/business-permits/a.pdf'))
    .rejects.toMatchObject({ statusCode: 404 });

  const stream = new ReadableStream({ start(controller) { controller.enqueue(Buffer.from('%PDF-')); controller.close(); } });
  get.mockResolvedValue({ statusCode: 200, stream, blob: { contentType: 'application/pdf' } });
  const reference = 'https://store.private.blob.vercel-storage.com/business-permits/a.pdf';
  const result = await service.openPrivatePermit(reference);
  expect(result.contentType).toBe('application/pdf');
  expect(get).toHaveBeenCalledWith(reference, { access: 'private', token: 'private-test-token' });
});

test.each(['/uploads/', '/api/uploads/'])('production reads legacy %s permits from private Blob storage', async (prefix) => {
  env.isProduction = true;
  env.upload.privateBlobToken = null;
  env.upload.publicBlobToken = 'legacy-private-store-token';
  get.mockResolvedValue({
    statusCode: 200,
    stream: new ReadableStream({ start(controller) { controller.enqueue(Buffer.from('%PDF-test')); controller.close(); } }),
    blob: { contentType: 'application/pdf' },
  });
  const result = await service.openPrivatePermit(`${prefix}business-permits/permit-123.pdf`);
  expect(get).toHaveBeenCalledWith('business-permits/permit-123.pdf', {
    access: 'private', token: 'legacy-private-store-token',
  });
  const chunks = [];
  for await (const chunk of result.stream) chunks.push(chunk);
  expect(Buffer.concat(chunks).toString()).toBe('%PDF-test');
});

test('production rejects traversal and propagates missing legacy permits', async () => {
  env.isProduction = true;
  await expect(service.openPrivatePermit('/uploads/business-permits/../secret.pdf')).rejects.toMatchObject({ statusCode: 404 });
  expect(get).not.toHaveBeenCalled();
  get.mockResolvedValue(null);
  await expect(service.openPrivatePermit('/uploads/business-permits/missing.pdf')).rejects.toMatchObject({ statusCode: 404 });
});

test('permit files have no public static route and admin route requires authentication', async () => {
  await supertest(app).get('/uploads/business-permits/example.pdf').expect(404);
  await supertest(app).get('/api/uploads/business-permits/example.pdf').expect(404);
  await supertest(app).get('/api/admin/restaurants/00000000-0000-0000-0000-000000000000/permit').expect(401);
});

test('production rejects a multipart request before Vercel body limit', () => {
  env.isProduction = true;
  const next = jest.fn();
  limitUploadRequest({ headers: { 'content-length': String(5 * 1024 * 1024) } }, null, next);
  expect(next.mock.calls[0][0]).toMatchObject({ statusCode: 413 });
});

test('migration accepts only known upload folders and simple file names', () => {
  expect(localSource('/uploads/restaurant-images/photo.webp')).toMatchObject({
    pathname: 'restaurant-images/photo.webp', isPrivate: false,
  });
  expect(localSource('local-private:/business-permits/permit.pdf')).toMatchObject({
    pathname: 'business-permits/permit.pdf', isPrivate: true,
  });
  expect(localSource('/uploads/business-permits/../secret.txt')).toBeNull();
  expect(localSource('https://example.com/file.jpg')).toBeNull();
});

test('missing private storage never falls back to a public upload', async () => {
  env.isProduction = true;
  env.upload.imageAccess = 'public';
  env.upload.privateBlobToken = null;
  await expect(service.privateUrlFor({ buffer: Buffer.from('test'), mimetype: 'application/pdf' })).rejects.toThrow('Private document storage is not configured');
  expect(put).not.toHaveBeenCalled();
});

test('private-store photo uploads return a durable public image route and permits remain private', async () => {
  env.isProduction = true;
  env.upload.imageAccess = 'private';
  env.upload.privateBlobToken = null;
  env.upload.publicBlobToken = 'legacy-private-store-token';
  put.mockResolvedValue({ url: 'https://store.private.blob.vercel-storage.com/file' });
  const image = { buffer: Buffer.from('image'), mimetype: 'image/png', originalname: 'photo.png' };
  expect(await service.publicUrlFor(image)).toMatch(/^\/uploads\/restaurant-images\/[a-f0-9-]+\.png$/);
  expect(put.mock.calls[0][2]).toMatchObject({ access: 'private', token: 'legacy-private-store-token' });
  await service.privateUrlFor({ ...image, originalname: 'permit.png' });
  expect(put.mock.calls[1][0]).toMatch(/^business-permits\//);
  expect(put.mock.calls[1][2]).toMatchObject({ access: 'private', token: 'legacy-private-store-token' });
});

test.each(['/uploads', '/api/uploads'])('%s serves stored photos with correct bytes and caching', async (prefix) => {
  env.isProduction = true;
  get.mockResolvedValue({
    statusCode: 200,
    stream: new ReadableStream({ start(controller) { controller.enqueue(Buffer.from('photo-bytes')); controller.close(); } }),
    blob: { contentType: 'image/png' },
  });
  const response = await supertest(app).get(`${prefix}/restaurant-images/photo-123.png`).expect(200);
  expect(response.body.toString()).toBe('photo-bytes');
  expect(response.headers['content-type']).toMatch(/^image\/png/);
  expect(response.headers['cache-control']).toContain('immutable');
  expect(get).toHaveBeenCalledWith('restaurant-images/photo-123.png', expect.objectContaining({ access: 'private' }));
});

test('photo routes never expose permits, other folders, or executable files', async () => {
  env.isProduction = true;
  for (const path of ['/uploads/business-permits/permit.png', '/uploads/secrets/photo.png', '/uploads/restaurant-images/file.svg']) {
    await supertest(app).get(path).expect(404);
  }
  expect(get).not.toHaveBeenCalled();
});
