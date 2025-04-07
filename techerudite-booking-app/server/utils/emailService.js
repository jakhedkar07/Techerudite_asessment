const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  // Check if email credentials are configured
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('Email credentials not configured in environment variables.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

/**
 * Send verification email to user
 * @param {string} email - User's email address
 * @param {string} token - Verification token
 * @param {string} firstName - User's first name
 */
const sendVerificationEmail = async (email, token, firstName) => {
  try {
    const transporter = createTransporter();
    
    // If email service is not configured, return success but log warning
    if (!transporter) {
      console.warn('Email service not configured, skipping email send.');
      return true; // Return true for development to allow registration flow to continue
    }

    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const verificationLink = `${clientUrl}/verify-email?token=${token}`;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Email Verification - Techerudite Booking System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <h2 style="color: #333;">Hello ${firstName},</h2>
          <p>Thank you for registering with the Techerudite Booking System. Please verify your email address to continue.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
          </div>
          <p>If the button above doesn't work, please copy and paste the following link into your browser:</p>
          <p>${verificationLink}</p>
          <p>This link will expire in 24 hours.</p>
          <p>Regards,<br>Techerudite Booking System Team</p>
        </div>
      `
    };
    
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

module.exports = {
  sendVerificationEmail
}; 