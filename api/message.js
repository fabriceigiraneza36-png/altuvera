// api/message.js (Vercel/Netlify/Express compatible)
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON body' });
    }
  }

  const { type, name, email, subject, message, ...rest } = body || {};

  const requiredEnv = [
    'SMTP_HOST',
    'SMTP_PORT',
    'SMTP_USER',
    'SMTP_PASS',
    'EMAIL_FROM',
    'ADMIN_EMAIL',
  ];
  const missingEnv = requiredEnv.filter((k) => !process.env[k]);
  if (missingEnv.length) {
    // In development, allow a graceful fallback so local testing works without SMTP.
    if (process.env.NODE_ENV === 'development') {
      console.warn('SMTP config missing, falling back to console log for development:', missingEnv);
      console.log('Simulated message payload:', { type, name, email, subject, message, rest });
      return res.status(200).json({ ok: true, note: 'development-fallback' });
    }

    return res
      .status(500)
      .json({ error: `Server email is not configured (missing: ${missingEnv.join(', ')})` });
  }

  // Compose admin email
  const adminHtml = `
    <h2>New ${type || 'Message'} Submission</h2>
    <p><b>Name:</b> ${name || ''}</p>
    <p><b>Email:</b> ${email || ''}</p>
    <p><b>Subject:</b> ${subject || ''}</p>
    <p><b>Message:</b><br>${(message || '').replace(/\n/g, '<br>')}</p>
    <hr>
    <pre>${JSON.stringify(rest, null, 2)}</pre>
  `;

  // SMTP config from env
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.ADMIN_EMAIL,
      subject: `[Altuvera] ${type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Message'} from ${name || email}`,
      html: adminHtml,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
