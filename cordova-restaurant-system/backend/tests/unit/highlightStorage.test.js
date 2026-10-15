jest.mock('@vercel/blob', () => ({ put: jest.fn(), get: jest.fn(), del: jest.fn() }));

const sharp = require('sharp');
const { ReadableStream } = require('node:stream/web');
const { put, get, del } = require('@vercel/blob');
const env = require('../../src/config/env');
const storage = require('../../src/services/highlightImage.service');

const originalProduction = env.isProduction;
const originalToken = env.upload.privateBlobToken;

afterEach(() => {
  env.isProduction = originalProduction;
  env.upload.privateBlobToken = originalToken;
  jest.clearAllMocks();
});

test('highlight images use private Blob storage and controlled streaming', async () => {
  env.isProduction = true;
  env.upload.privateBlobToken = 'private-test-token';
  const ref = 'https://store.private.blob.vercel-storage.com/visit-highlights/photo.webp';
  put.mockResolvedValue({ url: ref });
  const png = await sharp({ create: { width: 4, height: 4, channels: 3, background: '#fff' } }).png().toBuffer();
  expect(await storage.save({ buffer: png })).toBe(ref);
  expect(put.mock.calls[0][0]).toMatch(/^visit-highlights\/[a-f0-9-]+\.webp$/);
  expect(put.mock.calls[0][2]).toMatchObject({ access: 'private', token: 'private-test-token', contentType: 'image/webp' });

  const stream = new ReadableStream({ start(controller) { controller.enqueue(Buffer.from('image')); controller.close(); } });
  get.mockResolvedValue({ statusCode: 200, stream });
  expect((await storage.open(ref)).contentType).toBe('image/webp');
  expect(get).toHaveBeenCalledWith(ref, { access: 'private', token: 'private-test-token' });
  await storage.remove(ref);
  expect(del).toHaveBeenCalledWith(ref, { token: 'private-test-token' });
  await expect(storage.open('https://other.example/photo.webp')).rejects.toMatchObject({ statusCode: 404 });
});

test('invalid image bytes are rejected before storage', async () => {
  await expect(storage.save({ buffer: Buffer.from('not an image') })).rejects.toMatchObject({ statusCode: 400 });
  expect(put).not.toHaveBeenCalled();
});
