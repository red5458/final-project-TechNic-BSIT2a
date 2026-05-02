const bcrypt = require('bcryptjs');

const OTP_LENGTH = 6;
const OTP_EXPIRES_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;

function generateOtp(length = OTP_LENGTH) {
    const min = 10 ** (length - 1);
    const max = (10 ** length) - 1;
    return String(Math.floor(min + Math.random() * (max - min + 1)));
}

async function hashOtp(otp) {
    return bcrypt.hash(String(otp), 10);
}

async function compareOtp(otp, otpHash) {
    return bcrypt.compare(String(otp), otpHash);
}

function getOtpExpiryDate(minutes = OTP_EXPIRES_MINUTES) {
    return new Date(Date.now() + minutes * 60 * 1000);
}

function getResendAvailableDate(seconds = OTP_RESEND_COOLDOWN_SECONDS) {
    return new Date(Date.now() + seconds * 1000);
}

module.exports = {
    OTP_LENGTH,
    OTP_EXPIRES_MINUTES,
    OTP_RESEND_COOLDOWN_SECONDS,
    OTP_MAX_ATTEMPTS,
    generateOtp,
    hashOtp,
    compareOtp,
    getOtpExpiryDate,
    getResendAvailableDate,
};
