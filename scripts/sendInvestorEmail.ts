import * as dotenv from 'dotenv';
dotenv.config();

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = 'onboarding@resend.dev';
const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME || 'Skhy AI';

const sendInvestorEmail = async () => {
    if (!RESEND_API_KEY) {
        console.error("Error: RESEND_API_KEY is not defined in environment variables.");
        process.exit(1);
    }

    const emailHtml = `
        <p>Dear Jeff,</p>
        <p>Thank you for your valuable feedback regarding Skhy AI.</p>
        <p>We've successfully updated the Pitch Deck to include the $1.5M Seed ask, the expanded multi-sector use cases (Energy/Pipeline priority), and a detailed breakdown of Revenue Streams & TAM/SAM/SOM.</p>
        <p>Furthermore, we have implemented Tactical Access Restrictions and ID Verification in our marketplace and simulators as requested to mitigate legal and compliance risks.</p>
        <p>You can view the updated deck in our Investor Data Room at: <strong>https://skhy.ai/investors</strong> (Password: SKHY-SEED-2026).</p>
        <p>Best regards,<br/>Skhy AI Team</p>
    `;

    try {
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
                from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
                to: ['aiskhy7@gmail.com'], // Using aiskhy7@gmail.com due to Resend sandbox restrictions. Originally meant for suryasps.9@gmail.com
                subject: 'Update on Skhy AI Seed Round',
                html: emailHtml,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Resend API Error:", data);
            process.exit(1);
        }

        console.log("Successfully sent email:", data);
    } catch (error) {
        console.error("Failed to send email:", error);
        process.exit(1);
    }
};

sendInvestorEmail();
