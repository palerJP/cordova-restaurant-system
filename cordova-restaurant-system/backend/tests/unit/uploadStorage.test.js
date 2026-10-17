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

afterEach(() => {
  env.isProduction = originalProduction;
  env.upload.privateBlobToken = originalPrivateToken;
  env.upload.publicBlobToken = originalPublicToken;
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
  env.upload.privateBlobToken = null;
  await expect(service.privateUrlFor({ buffer: Buffer.from('test'), mimetype: 'application/pdf' })).rejects.toThrow('Private document storage is not configured');
  expect(put).not.toHaveBeenCalled();
});
