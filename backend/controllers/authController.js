//Refactor auth controller for clarity and reuse
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOtpEmail, sendPasswordResetOtpEmail } = require('../utils/gmailSender');

const OTP_EXPIRES_IN_MINUTES = 10;

function signToken(userId, res) {
    const payload = {
        user: { id: userId }
    };

    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '7d' },
        (err, token) => {
            if (err) throw err;
            res.json({ token });
        }
    );
}

function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

async function setAndSendVerificationOtp(user) {
    const otp = generateOtp();
    const salt = await bcrypt.genSalt(10);

    user.emailVerificationOtpHash = await bcrypt.hash(otp, salt);
    user.emailVerificationOtpExpiresAt = new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60 * 1000);

    await user.save();
    await sendOtpEmail(user.email, otp);
}

async function setAndSendPasswordResetOtp(user) {
    const otp = generateOtp();
    const salt = await bcrypt.genSalt(10);

    user.passwordResetOtpHash = await bcrypt.hash(otp, salt);
    user.passwordResetOtpExpiresAt = new Date(Date.now() + OTP_EXPIRES_IN_MINUTES * 60 * 1000);

    await user.save();
    await sendPasswordResetOtpEmail(user.email, otp);
}

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    let user;
    let createdNewUser = false;

    try {
        // 1. Check if user already exists
        user = await User.findOne({ email: normalizedEmail });
        if (user) {
            if (user.isEmailVerified === false) {
                await setAndSendVerificationOtp(user);
                return res.status(200).json({
                    msg: 'Account already exists but is not verified. A new OTP code has been sent.',
                    email: user.email,
                    requiresVerification: true,
                });
            }

            return res.status(400).json({ msg: 'User already exists' });
        }

        // 2. Create new user instance
        user = new User({
            name,
            email: normalizedEmail,
            password,
        });
        createdNewUser = true;

        // 3. Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await setAndSendVerificationOtp(user);

        res.status(201).json({
            msg: 'Account created. Please check your email for the OTP code.',
            email: user.email,
            requiresVerification: true,
        });
    } catch (err) {
        console.error(err.message);
        if (createdNewUser && user?._id && !user.isEmailVerified) {
            await User.findByIdAndDelete(user._id).catch(() => {});
        }
        res.status(500).send('Server error');
    }
};

// @desc    Verify user email with OTP
// @route   POST /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedOtp = String(otp || '').trim();

    try {
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        if (user.isEmailVerified) {
            return signToken(user.id, res);
        }

        if (!user.emailVerificationOtpHash || !user.emailVerificationOtpExpiresAt) {
            return res.status(400).json({ msg: 'No active OTP found. Please request a new code.' });
        }

        if (user.emailVerificationOtpExpiresAt < new Date()) {
            return res.status(400).json({ msg: 'OTP has expired. Please request a new code.' });
        }

        const isMatch = await bcrypt.compare(normalizedOtp, user.emailVerificationOtpHash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid OTP code.' });
        }

        user.isEmailVerified = true;
        user.emailVerificationOtpHash = null;
        user.emailVerificationOtpExpiresAt = null;
        await user.save();

        signToken(user.id, res);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Resend email verification OTP
// @route   POST /api/auth/resend-otp
exports.resendOtp = async (req, res) => {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    try {
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({ msg: 'Email is already verified.' });
        }

        await setAndSendVerificationOtp(user);
        res.json({ msg: 'A new OTP code has been sent.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Authenticate user & get token (Login)
// @route   POST /api/auth/login
exports.login = async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    try {
        // 1. Check if user exists
        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ msg: 'Email is not registered.' });
        }

        if (user.status === 'disabled') {
            return res.status(403).json({ msg: 'This account has been disabled.' });
        }

        if (user.isEmailVerified === false) {
            return res.status(403).json({ msg: 'Please verify your email before logging in.' });
        }

        // 2. Compare password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Password is incorrect.' });
        }

        signToken(user.id, res);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Send password reset OTP
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    try {
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ msg: 'Email is not registered.' });
        }

        if (user.status === 'disabled') {
            return res.status(403).json({ msg: 'This account has been disabled.' });
        }

        await setAndSendPasswordResetOtp(user);
        res.json({
            msg: 'Password reset code sent. Please check your email.',
            email: user.email,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Reset password with OTP
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
    const { email, otp, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedOtp = String(otp || '').trim();

    try {
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(404).json({ msg: 'Email is not registered.' });
        }

        if (user.status === 'disabled') {
            return res.status(403).json({ msg: 'This account has been disabled.' });
        }

        if (!password || password.length < 8) {
            return res.status(400).json({ msg: 'Password must be at least 8 characters.' });
        }

        if (!user.passwordResetOtpHash || !user.passwordResetOtpExpiresAt) {
            return res.status(400).json({ msg: 'No active reset code found. Please request a new code.' });
        }

        if (user.passwordResetOtpExpiresAt < new Date()) {
            return res.status(400).json({ msg: 'Reset code has expired. Please request a new code.' });
        }

        const isMatch = await bcrypt.compare(normalizedOtp, user.passwordResetOtpHash);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid reset code.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.passwordResetOtpHash = null;
        user.passwordResetOtpExpiresAt = null;
        await user.save();

        res.json({ msg: 'Password reset successfully. You can now log in.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Get logged-in user profile
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        // req.user.id comes from the auth middleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user || user.status === 'disabled') {
            return res.status(403).json({ msg: 'This account has been disabled.' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
