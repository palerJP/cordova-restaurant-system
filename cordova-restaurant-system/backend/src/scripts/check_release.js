// Executed by Vercel before production promotion. No emails or user records are created.
const { checkPublicApi } = require('../services/releaseChecks');

async function run() {
  if (process.env.VERCEL_ENV !== 'production' && !process.argv.includes('--production')) {
    console.log('Live production checks skipped for non-production build.');
    return;
  }
  const env = require('../config/env');
  const { pool } = require('../config/db');
  const app = require('../app');
  const { list } = require('@vercel/blob');
  const nodemailer = require('nodemailer');
  let server;
  let transporter;
  try {
    server = app.listen(0,'127.0.0.1');
    await new Promise((resolve,reject)=>{server.once('listening',resolve);server.once('error',reject);});
    const report = await checkPublicApi(`http://127.0.0.1:${server.address().port}`, {
      minimum: Number(process.env.MIN_PUBLIC_LISTINGS || 1),
    });
    const blobs = await list({ prefix: 'restaurant-images/', limit: 1, token: env.upload.publicBlobToken });
    if (blobs.blobs[0]) {
      const storedPrivate = new URL(blobs.blobs[0].url).hostname.endsWith('.private.blob.vercel-storage.com');
      if (storedPrivate !== (env.upload.imageAccess === 'private')) throw new Error('Release blocked: image storage access mode does not match the store');
      if (storedPrivate) {
        const { openPublicImage } = require('../services/upload.service');
        const photo = await openPublicImage('restaurant-images',blobs.blobs[0].pathname.split('/').pop());
        let bytes = 0;
        for await (const chunk of photo.stream) bytes += chunk.length;
        if (!bytes) throw new Error('Release blocked: stored image is empty');
      }
    }
    if (!env.upload.privateBlobToken && env.upload.imageAccess !== 'private') {
      throw new Error('Release blocked: private permit storage is not configured');
    }
    if (env.email.resendApiKey) {
      const response = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${env.email.resendApiKey}` }, signal: AbortSignal.timeout(15000),
      });
      // Restricted send-only keys cannot list domains; they still need a live send test after rotation.
      if (!response.ok && response.status !== 403) throw new Error('Release blocked: email provider authentication failed');
    } else {
      if (!env.email.smtpHost || !env.email.smtpUser || !env.email.smtpPass) throw new Error('Release blocked: signup email is not configured');
      transporter = nodemailer.createTransport({ host: env.email.smtpHost, port: env.email.smtpPort,
        secure: env.email.smtpSecure, auth: { user: env.email.smtpUser, pass: env.email.smtpPass },
        connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 20000 });
      await transporter.verify();
    }
    console.log(`Production release checks passed: ${JSON.stringify(report)}; image storage and email connection verified.`);
  } finally {
    if (transporter) transporter.close();
    if (server) await new Promise((resolve)=>server.close(resolve));
    await pool.end();
  }
}

if (require.main === module) run().catch((error)=>{ console.error(error.message); process.exitCode=1; });
module.exports = { run };
