// api/verify-email.js
// Simple email verification endpoint for sending and confirming one-time codes.
// Note: This uses an in-memory store and is intended for demo/dev use.

import nodemailer from 'nodemailer';
import crypto from 'crypto';

const VERIFICATIONS = new Map();
const CODE_LENGTH = 6;
const CODE_TTL_MS = 1000 * 60 * 10; // 10 minutes

const requiredEnv = [
  'SMTP_HOST',
  'SMTP_PORT',
  'SMTP_USER',
  'SMTP_PASS',
  'EMAIL_FROM',
];

const getMissingEnv = () => requiredEnv.filter((k) => !process.env[k]);

const getTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const generateCode = () => {
  const num = Math.floor(Math.random() * 10 ** CODE_LENGTH).toString().padStart(CODE_LENGTH, '0');
  return num;
};

const sendVerificationEmail = async (email, code, purpose = 'verification') => {
  const transporter = getTransporter();

  const subject = `Your Altuvera verification code`;
  const text = `Your verification code for ${purpose} is: ${code}\n\n` +
    'This code expires in 10 minutes. If you did not request it, please ignore this email.';

  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject,
    text,
  });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const missingEnv = getMissingEnv();
  if (missingEnv.length) {
    return res.status(500).json({ error: `Missing SMTP config: ${missingEnv.join(', ')}` });
  }

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { action, email, purpose = 'verification', verificationId, code } = body || {};

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Invalid email' });
  }

  if (action === 'send') {
    const otp = generateCode();
    const id = crypto.randomUUID();
    const expiresAt = Date.now() + CODE_TTL_MS;

    VERIFICATIONS.set(id, { email, code: otp, purpose, expiresAt });

    try {
      await sendVerificationEmail(email, otp, purpose);
      return res.status(200).json({ ok: true, verificationId: id });
    } catch (err) {
      return res.status(500).json({ error: err.message || 'Failed to send email' });
    }
  }

  if (action === 'verify') {
    if (!verificationId || !code) {
      return res.status(400).json({ error: 'verificationId and code are required' });
    }

    const entry = VERIFICATIONS.get(verificationId);
    if (!entry) {
      return res.status(400).json({ error: 'Invalid verification ID' });
    }

    if (entry.email !== email) {
      return res.status(400).json({ error: 'Email mismatch' });
    }

    if (Date.now() > entry.expiresAt) {
      VERIFICATIONS.delete(verificationId);
      return res.status(400).json({ error: 'Verification code expired' });
    }

    if (entry.code !== String(code).trim()) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    VERIFICATIONS.delete(verificationId);
    return res.status(200).json({ ok: true });
  }

  return res.status(400).json({ error: 'Invalid action' });
}
