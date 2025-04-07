const User = require('../models/User');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { sendVerificationEmail } = require('../utils/emailService');

// Register new user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    // Validate input
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check password strength
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }
    
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Create new user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      verificationToken
    });
    
    await user.save();
    
    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken, firstName);
    
    if (!emailSent) {
      console.warn(`Warning: Failed to send verification email to ${email}`);
      // Continue with registration but notify the user about email issue
    }
    
    res.status(201).json({ 
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user._id 
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Provide more specific error message based on the error type
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error during registration. Please try again later.' });
  }
};

// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }
    
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }
    
    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    res.status(200).json({ message: 'Email verification successful. You can now log in.' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ message: 'Server error during verification. Please try again later.' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Find user
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }
    
    // Check if email is verified
    if (!user.isVerified) {
      return res.status(403).json({ 
        message: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email
      });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login. Please try again later.' });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    // User is already added to req by auth middleware
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }
    
    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();
    
    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationToken, user.firstName);
    
    if (!emailSent) {
      return res.status(500).json({ message: 'Failed to send verification email. Please try again later.' });
    }
    
    res.status(200).json({ message: 'Verification email sent successfully' });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
}; 