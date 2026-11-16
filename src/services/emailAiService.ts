import { EmailTemplates } from '../utils/EmailTemplates';

const MODEL_ID = 'google/gemini-2.0-flash-001';

export interface GeneratedEmail {
    subject: string;
    body: string;
    bestRequirements: string[];
}

export const generateEmailTemplate = async (
    prompt: string,
    context: string = ""
): Promise<GeneratedEmail> => {
    const systemPrompt = `
You are an expert defense industry copywriter for SKHY AI. 
Generate a professional email campaign template based on the user's request.

Identify exactly TWO "Best Requirements" from the request that align with SKHY AI's mission (Sovereignty, Defense, Edge AI, Acoustic Intelligence).

Return ONLY a valid JSON object:
{
  "subject": "The email subject line",
  "body": "The email body (can use [NAME], [LINK], [PRODUCTS] variables)",
  "bestRequirements": ["Req 1", "Req 2"]
}
`;

    const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: MODEL_ID,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `Context: ${context}\n\nRequest: ${prompt}` }
            ],
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Email AI Proxy Error:', errorData);
        
        if (response.status === 503) {
            throw new Error('AI service is currently unavailable. Please try again later.');
        }
        throw new Error(errorData.error?.message || errorData.error || `AI API returned status ${response.status}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    return result;
};
