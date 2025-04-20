import { resend } from './client';

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const data = await resend.emails.send({
      from: 'RollUp Ai <RollUpAi@rollupai.dev>',
      to: email,
      subject: 'Welcome to Our Service',
      html: `<p>Hello ${name}, welcome to our service!</p>`,
    });

    return { success: true, data };
  } catch (error) {
    return { success: false, error };
  }
};
