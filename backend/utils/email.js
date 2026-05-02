const nodemailer = require('nodemailer');

function createTransporter() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        throw new Error('SMTP email settings are not configured.');
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
    });
}

async function sendEmail({ to, subject, html, text }) {
    const transporter = createTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER;

    return transporter.sendMail({
        from,
        to,
        subject,
        html,
        text,
    });
}

function buildOtpEmail({ otp, purpose }) {
    const titleMap = {
        verify_email: 'Verify your Uniformity account',
        forgot_password: 'Reset your Uniformity password',
        change_password: 'Confirm your Uniformity password change',
    };

    const title = titleMap[purpose] || 'Your Uniformity verification code';

    return {
        subject: title,
        text: `Your Uniformity OTP is ${otp}. This code expires in 10 minutes.`,
        html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1a1a1a;">
                <h2 style="margin:0 0 12px;color:#2D6A4F;">${title}</h2>
                <p>Use the verification code below to continue:</p>
                <p style="font-size:28px;font-weight:700;letter-spacing:6px;margin:20px 0;color:#1B4332;">${otp}</p>
                <p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>
            </div>
        `,
    };
}

module.exports = {
    sendEmail,
    buildOtpEmail,
};
