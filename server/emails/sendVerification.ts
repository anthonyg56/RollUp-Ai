import { OTPType } from '@server/lib/constants';
import { resend } from './client';

/**
 * Sends an email verification OTP to a user during signup
 */
export async function sendVerifyEmailOTP({ email, code }: { email: string; code: string }) {
  try {
    const data = await resend.emails.send({
      from: 'RollUp Ai <RollUpAi@rollupai.dev>',
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Email Address</h2>
          <p>Thank you for signing up! Please use the following verification code to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 12px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this verification, you can safely ignore this email.</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error };
  }
}

/**
 * Sends a password reset OTP to a user
 */
export async function sendPasswordResetOTP({ email, code }: { email: string; code: string }) {
  try {
    const data = await resend.emails.send({
      from: 'RollUp Ai <RollUpAi@rollupai.dev>',
      to: email,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Please use the following code to reset your password:</p>
          <div style="background-color: #f4f4f4; padding: 12px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request a password reset, you can safely ignore this email.</p>
        </div>
      `,
    });

    return { success: true, data };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error };
  }
}

/**
 * Resends an OTP code if the user didn't receive it the first time
 */
export async function resendOTPCode({ email, code, type }: { email: string; code: string; type: OTPType }) {
  try {
    if (type === 'email-verification') {
      return await sendVerifyEmailOTP({ email, code });
    } else if (type === 'forget-password') {
      return await sendPasswordResetOTP({ email, code });
    }
  } catch (error) {
    console.error('Error resending OTP code:', error);
    return { success: false, error };
  }
} 