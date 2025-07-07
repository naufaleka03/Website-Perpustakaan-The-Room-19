import { Resend } from 'resend';

const resend = new Resend('re_9xivgrhd_Q8PZxZNMjTwWtuvyoLRPFZN4');

export async function sendEmail({ to, subject, html }) {
  return resend.emails.send({
    from: 'onboarding@resend.dev', // Use your verified sender domain
    to,
    subject,
    html,
  });
}
