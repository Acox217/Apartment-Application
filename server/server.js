import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';

import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();


// --- addition: support multiple recipients in TO_EMAIL env var ---
const notifyList = (process.env.NOTIFY_RECIPIENTS || process.env.TO_EMAIL || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);
// --- end addition ---

console.log("Loaded env:", {
  GMAIL_USER: process.env.GMAIL_USER,
  TO_EMAIL: process.env.TO_EMAIL,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
});


const app = express();
const PORT = process.env.PORT || 4000;

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS (safe for dev + same-origin)
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(express.json());
app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // same-origin or curl
    if (allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error('Not allowed by CORS'));
  },
}));

// Serve the client/
const clientDir = path.resolve(__dirname, '../client');
app.use(express.static(clientDir));

// now override the default apply.html for root
app.get('/', (req, res) => {
  res.sendFile(path.join(clientDir, 'landing.html'));
});

// Serve the application form when user clicks "Apply Now"
app.get('/apply', (req, res) => {
  res.sendFile(path.join(clientDir, 'apply.html'));
});

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// ====== ADD THE API ROUTE (must be BEFORE the catch-all) ======
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error('Nodemailer verify failed:', err.message);
  } else {
    console.log('Nodemailer ready:', success);
  }
});

app.post(
  '/api/applications',
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('phone').trim().notEmpty(),
  body('moveInDate').isISO8601(),
  body('unitType').trim().notEmpty(),
  body('notes').optional().trim().escape(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid input', details: errors.array() });
    }

    const submission = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      moveInDate: req.body.moveInDate,
      unitType: req.body.unitType,
      notes: req.body.notes || '',
      receivedAt: new Date().toISOString(),
    };

    try {
// 1) Notification to the leasing office (or whoever)
await transporter.sendMail({
  from: `"Apartment App" <${process.env.GMAIL_USER}>`,
  to: notifyList,   // ✅ accepts array or comma-separated string
  subject: `New Application: ${submission.firstName} ${submission.lastName} · ${submission.unitType}`,
  text:
`A new apartment application was submitted:

Name: ${submission.firstName} ${submission.lastName}
Email: ${submission.email}
Phone: ${submission.phone}
Move-In Date: ${submission.moveInDate}
Unit Type: ${submission.unitType}

Notes:
${submission.notes}

Received: ${submission.receivedAt}
`,
});

// 2) Confirmation to the applicant (copy yourself via BCC if you want)
await transporter.sendMail({
  from: `"Leasing Office" <${process.env.GMAIL_USER}>`,
  to: submission.email,                // ✅ whatever email they typed
  bcc: notifyList,                     // optional: see exactly what they get
  replyTo: `${submission.firstName} ${submission.lastName} <${submission.email}>`,
  subject: `We received your application — thank you!`,
  text:
`Hi ${submission.firstName},

Thanks for applying for an apartment (${submission.unitType}). We received your information and will be in touch soon.

Summary:
- Name: ${submission.firstName} ${submission.lastName}
- Email: ${submission.email}
- Phone: ${submission.phone}
- Move-In: ${submission.moveInDate}
- Unit Type: ${submission.unitType}
- Notes: ${submission.notes || '(none)'}

Best,
Leasing Office`,
});


      res.json({ ok: true, submission });
 } catch (err) {
  console.error('Email error:', err);            // full object in server logs
  res.status(500).json({
    error: 'Failed to send confirmation.',
    reason: err?.response || err?.message || 'unknown'
  });
}
    }
);        

// ====== END API ROUTE ======

// Serve static files
app.use(express.static(clientDir));

// Serve landing page for root
app.get('/', (req, res) => {
  res.sendFile(path.join(clientDir, 'landing.html'));
});

// Serve the application form for /apply
app.get('/apply', (req, res) => {
  res.sendFile(path.join(clientDir, 'apply.html'));
});

// Fallback for API or unknown routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found' });
  }
  // redirect anything else back to the homepage
  res.redirect('/');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
