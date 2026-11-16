import type { Handler, HandlerEvent } from "@netlify/functions";

/**
 * SEC-02: AI Chat proxy — keeps OPENROUTER_KEY strictly server-side.
 * The frontend must never hold the OpenRouter API key (no VITE_ prefix).
 * All AI requests are routed through this function.
 */

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

// Simple in-memory rate limit (resets per function instance, ~1 min lifecycle)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;       // max requests
const RATE_WINDOW_MS = 60_000; // per 60 seconds

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = requestCounts.get(ip);
    if (!entry || now > entry.resetAt) {
        requestCounts.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
        return false;
    }
    entry.count += 1;
    return entry.count > RATE_LIMIT;
}

const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // Rate limiting by IP
    const clientIp = event.headers["x-forwarded-for"]?.split(",")[0]?.trim() || "unknown";
    if (isRateLimited(clientIp)) {
        return {
            statusCode: 429,
            body: JSON.stringify({ error: "Too many requests. Please wait and try again." }),
        };
    }

    // SEC-02: API key is strictly server-side — check both OPENROUTER_KEY and VITE_OPENROUTER_KEY
    const apiKey = process.env.OPENROUTER_KEY || process.env.VITE_OPENROUTER_KEY;
    if (!apiKey) {
        console.error("OPENROUTER_KEY / VITE_OPENROUTER_KEY not configured in server environment.");
        return {
            statusCode: 503,
            body: JSON.stringify({ error: "AI service not configured" }),
        };
    }

    try {
        const body = JSON.parse(event.body || "{}");

        // Only forward safe fields
        const { model, models, messages, temperature, max_tokens, stream, response_format } = body;

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "messages array is required" }),
            };
        }

        // Retain messages as provided (system prompt carries knowledge base context)
        const safeMessages = messages.map((m: any) => ({
            role: m.role,
            content: String(m.content || '')
        }));

        const fallbackModels = models && Array.isArray(models) && models.length > 0 
            ? models.slice(0, 3) 
            : [
                'openrouter/auto',
                'deepseek/deepseek-chat',
                'meta-llama/llama-3.3-70b-instruct'
              ];

        const requestBody: Record<string, any> = {
            models: fallbackModels,
            messages: safeMessages,
            temperature: Math.min(Math.max(temperature ?? 0.7, 0), 2),
            max_tokens: Math.min(max_tokens ?? 800, 4096),
            stream: stream ?? false,
        };

        if (model) {
            requestBody.model = model;
        }

        if (response_format && typeof response_format === 'object') {
            requestBody.response_format = response_format;
        }

        const response = await fetch(OPENROUTER_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
                "HTTP-Referer": "https://skhy.systems",
                "X-Title": "SKHY AI",
            },
            body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("OpenRouter API Error:", data);
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: "AI request failed", details: data }),
            };
        }

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        };

    } catch (error) {
        console.error("AI Chat Function Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal Server Error" }),
        };
    }
};

export { handler };
