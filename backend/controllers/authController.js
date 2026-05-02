//Refactor auth controller for clarity and reuse
const User = require('../models/User');
const OtpToken = require('../models/OtpToken');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const {
    OTP_MAX_ATTEMPTS,
    generateOtp,
    hashOtp,
    compareOtp,
    getOtpExpiryDate,
    getResendAvailableDate,
} = require('../utils/otp');
const { sendEmail, buildOtpEmail } = require('../utils/email');

function signToken(userId, res) {
    const payload = {
        user: { id: userId }
    };

    jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: '1h' },
        (err, token) => {
            if (err) throw err;
            res.json({ token });
        }
    );
}

function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

function getResetTokenExpiryDate() {
    return new Date(Date.now() + 10 * 60 * 1000);
}

async function createOtpToken({ user, purpose }) {
    const email = String(user.email || '').trim().toLowerCase();
    const otp = generateOtp();
    const otpHash = await hashOtp(otp);

    await OtpToken.updateMany(
        { email, purpose, used: false },
        { used: true }
    );

    const token = await OtpToken.create({
        user_id: user._id,
        email,
        purpose,
        otp_hash: otpHash,
        expires_at: getOtpExpiryDate(),
        resend_available_at: getResendAvailableDate(),
    });

    return { token, otp, email };
}

async function sendOtpEmail({ token, otp, email, purpose }) {
    try {
        const emailContent = buildOtpEmail({ otp, purpose });
        await sendEmail({
            to: email,
            subject: emailContent.subject,
            text: emailContent.text,
            html: emailContent.html,
        });
    } catch (err) {
        token.used = true;
        await token.save();
        throw err;
    }
}

function sendOtpEmailInBackground(otpData) {
    sendOtpEmail(otpData).catch((err) => {
        console.error(`OTP email failed for ${otpData.email}:`, err.message);
    });
}

// @desc    Register a new user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    try {
        // 1. Check if user already exists
        let user = await User.findOne({ email: normalizedEmail });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        // 2. Create new user instance
        user = new User({
            name,
            email: normalizedEmail,
            password,
            is_verified: false,
        });

        // 3. Hash the password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();
        const otpData = await createOtpToken({ user, purpose: 'verify_email' });
        sendOtpEmailInBackground({ ...otpData, purpose: 'verify_email' });

        res.status(201).json({
            msg: 'Account created. Please verify your email using the OTP we sent.',
            email: user.email,
            verification_required: true,
        });
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
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // 2. Compare password with hashed password in DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        if (user.is_verified === false) {
            return res.status(403).json({
                msg: 'Please verify your email before logging in.',
                verification_required: true,
                email: user.email,
            });
        }

        signToken(user.id, res);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Verify email using OTP
// @route   POST /api/auth/verify-email
exports.verifyEmail = async (req, res) => {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    try {
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid verification request.' });
        }

        if (user.is_verified) {
            return signToken(user.id, res);
        }

        const token = await OtpToken.findOne({
            email: normalizedEmail,
            purpose: 'verify_email',
            used: false,
        }).sort({ createdAt: -1 });

        if (!token) {
            return res.status(400).json({ msg: 'Verification code is invalid or expired.' });
        }

        if (token.expires_at < new Date()) {
            token.used = true;
            await token.save();
            return res.status(400).json({ msg: 'Verification code has expired.' });
        }

        if (token.attempts >= OTP_MAX_ATTEMPTS) {
            token.used = true;
            await token.save();
            return res.status(400).json({ msg: 'Too many incorrect attempts. Please request a new OTP.' });
        }

        const isMatch = await compareOtp(otp, token.otp_hash);
        if (!isMatch) {
            token.attempts += 1;
            await token.save();
            return res.status(400).json({ msg: 'Invalid verification code.' });
        }

        token.used = true;
        user.is_verified = true;
        await Promise.all([token.save(), user.save()]);

        signToken(user.id, res);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Resend email verification OTP
// @route   POST /api/auth/resend-verification-otp
exports.resendVerificationOtp = async (req, res) => {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    try {
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.json({ msg: 'If this email is registered and unverified, a new OTP will be sent.' });
        }

        if (user.is_verified) {
            return res.status(400).json({ msg: 'Email is already verified.' });
        }

        const latestToken = await OtpToken.findOne({
            email: normalizedEmail,
            purpose: 'verify_email',
            used: false,
        }).sort({ createdAt: -1 });

        if (latestToken?.resend_available_at > new Date()) {
            return res.status(429).json({ msg: 'Please wait before requesting another OTP.' });
        }

        const otpData = await createOtpToken({ user, purpose: 'verify_email' });
        sendOtpEmailInBackground({ ...otpData, purpose: 'verify_email' });
        res.json({ msg: 'Verification OTP sent.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Send forgot password OTP
// @route   POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    try {
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.json({ msg: 'If this email is registered, a reset OTP will be sent.' });
        }

        const latestToken = await OtpToken.findOne({
            email: normalizedEmail,
            purpose: 'forgot_password',
            used: false,
        }).sort({ createdAt: -1 });

        if (latestToken?.resend_available_at > new Date()) {
            return res.status(429).json({ msg: 'Please wait before requesting another OTP.' });
        }

        const otpData = await createOtpToken({ user, purpose: 'forgot_password' });
        sendOtpEmailInBackground({ ...otpData, purpose: 'forgot_password' });
        res.json({ msg: 'If this email is registered, a reset OTP will be sent.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Verify forgot password OTP
// @route   POST /api/auth/verify-reset-otp
exports.verifyResetOtp = async (req, res) => {
    const { email, otp } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    try {
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid reset request.' });
        }

        const token = await OtpToken.findOne({
            email: normalizedEmail,
            purpose: 'forgot_password',
            used: false,
        }).sort({ createdAt: -1 });

        if (!token) {
            return res.status(400).json({ msg: 'Reset code is invalid or expired.' });
        }

        if (token.expires_at < new Date()) {
            token.used = true;
            await token.save();
            return res.status(400).json({ msg: 'Reset code has expired.' });
        }

        if (token.attempts >= OTP_MAX_ATTEMPTS) {
            token.used = true;
            await token.save();
            return res.status(400).json({ msg: 'Too many incorrect attempts. Please request a new OTP.' });
        }

        const isMatch = await compareOtp(otp, token.otp_hash);
        if (!isMatch) {
            token.attempts += 1;
            await token.save();
            return res.status(400).json({ msg: 'Invalid reset code.' });
        }

        const resetToken = generateResetToken();
        token.reset_token_hash = await bcrypt.hash(resetToken, 10);
        token.reset_token_expires_at = getResetTokenExpiryDate();
        await token.save();

        res.json({
            msg: 'Reset OTP verified.',
            reset_token: resetToken,
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
    const { email, reset_token, password } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    try {
        if (!password || String(password).length < 8) {
            return res.status(400).json({ msg: 'Password must be at least 8 characters.' });
        }

        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid reset request.' });
        }

        const token = await OtpToken.findOne({
            email: normalizedEmail,
            purpose: 'forgot_password',
            used: false,
            reset_token_hash: { $ne: '' },
        }).sort({ updatedAt: -1 });

        if (!token || !token.reset_token_expires_at || token.reset_token_expires_at < new Date()) {
            return res.status(400).json({ msg: 'Password reset session has expired.' });
        }

        const tokenMatches = await bcrypt.compare(String(reset_token || ''), token.reset_token_hash);
        if (!tokenMatches) {
            return res.status(400).json({ msg: 'Invalid password reset session.' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.is_verified = true;
        token.used = true;
        await Promise.all([user.save(), token.save()]);

        res.json({ msg: 'Password reset successfully.' });
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
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
