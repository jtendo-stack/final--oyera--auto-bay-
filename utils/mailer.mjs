import nodemailer from 'nodemailer';

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER) return null;
  const port = SMTP_PORT ? Number(SMTP_PORT) : 587;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined
  });
};

export async function sendMail({ to, subject, html, text, from }) {
  const transporter = getTransporter();
  const fromAddress = from || process.env.FROM_EMAIL || process.env.SMTP_USER;
  if (!transporter) {
    console.log('Mailer not configured. Would send to:', to, 'subject:', subject);
    console.log('Email HTML preview:\n', html);
    return false;
  }
  try {
    await transporter.sendMail({ from: fromAddress, to, subject, html, text });
    return true;
  } catch (err) {
    console.error('Error sending mail', err);
    return false;
  }
}

export default sendMail;
