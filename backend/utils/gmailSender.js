const { google } = require('googleapis');

const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

function assertGmailConfig() {
    const required = [
        'GMAIL_CLIENT_ID',
        'GMAIL_CLIENT_SECRET',
        'GMAIL_REFRESH_TOKEN',
        'GMAIL_USER',
    ];

    const missing = required.filter((key) => !process.env[key]);
    if (missing.length > 0) {
        throw new Error(`Missing Gmail config: ${missing.join(', ')}`);
    }
}

function encodeMessage(message) {
    return Buffer.from(message)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function makeEmail({ to, subject, html, text }) {
    const message = [
        `From: Uniformity <${process.env.GMAIL_USER}>`,
        `To: ${to}`,
        `Subject: ${subject}`,
        'MIME-Version: 1.0',
        'Content-Type: text/html; charset=UTF-8',
        '',
        html || text,
    ].join('\n');

    return encodeMessage(message);
}

async function sendOtpEmail(to, otp) {
    assertGmailConfig();

    const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;">
            <h2 style="color:#2D6A4F;">Verify your email</h2>
            <p>Your Uniformity verification code is:</p>
            <p style="font-size:28px;font-weight:700;letter-spacing:4px;margin:16px 0;">${otp}</p>
            <p>This code expires in 10 minutes.</p>
            <p style="color:#6b7280;font-size:13px;">If you did not create a Uniformity account, you can ignore this email.</p>
        </div>
    `;

    const raw = makeEmail({
        to,
        subject: 'Your Uniformity verification code',
        html,
        text: `Your Uniformity verification code is ${otp}. This code expires in 10 minutes.`,
    });

    return gmail.users.messages.send({
        userId: 'me',
        requestBody: { raw },
    });
}

module.exports = {
    sendOtpEmail,
};
