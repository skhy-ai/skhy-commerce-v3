
import type { Handler, HandlerEvent } from "@netlify/functions";

const handler: Handler = async (event: HandlerEvent) => {
    // Only allow POST
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { email, name, subject, message } = JSON.parse(event.body || "{}");

        // SEC-08: Always use server-side env vars — never accept API keys from the request body
        const apiKey = process.env.RESEND_API_KEY;
        const fromEmail = process.env.RESEND_FROM_EMAIL;
        const fromName = process.env.RESEND_FROM_NAME || "Skhy AI";

        if (!apiKey) {
            console.warn("⚠️ RESEND_API_KEY not configured server-side. Email not sent to:", email);
            return {
                statusCode: 503,
                body: JSON.stringify({ error: "Email service not configured" }),
            };
        }

        if (!fromEmail) {
            console.error("⚠️ RESEND_FROM_EMAIL not configured server-side.");
            return {
                statusCode: 503,
                body: JSON.stringify({ error: "Email sender not configured" }),
            };
        }

        // Basic input validation
        if (!email || !subject || !message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing required fields: email, subject, message" }),
            };
        }

        // Use Resend API
        const response = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                from: `${fromName} <${fromEmail}>`,
                to: [email],
                subject: subject,
                html: message.replace(/\n/g, '<br>'),
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Resend API Error:", data);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "Failed to send email via provider", details: data }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, id: data.id }),
        };

    } catch (error) {
        console.error("Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};

export { handler };
