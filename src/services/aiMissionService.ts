import { PRE_GENERATED_CONFIGS } from '../data/preGeneratedConfigs';
import { loadMarketplaceContext } from '../utils/marketplaceLoader';

const MODEL_ID = 'openrouter/auto';

export interface AIMissionResponse {
    topOptions: {
        configId: string;
        name: string;
        platform: 'multirotor' | 'fixed-wing';
        updates: any;
        suitabilityScore: number;
    }[];
    bestRequirements: string[];
    explanation: string;
    timings?: {
        loader: number;
        ai: number;
        total: number;
    };
}

export const generateMissionConfig = async (description: string): Promise<AIMissionResponse> => {
    const startTime = Date.now();

    const loaderStart = Date.now();
    const marketplaceData = await loadMarketplaceContext();
    const loaderEnd = Date.now();

    const systemPrompt = `
You are the SKHY AI Tactical Matchmaker. Your goal is to select the BEST 2 drone configurations from our physics-validated blueprints based on a user's mission.

AVAILABLE BLUEPRINTS (Physics Validated):
${JSON.stringify(marketplaceData.blueprints, null, 2)}

TASK:
1. Analyze the user mission.
2. Select exactly TWO (2) blueprints from the list above.
3. Assign a suitabilityScore (0-100) based on how well the blueprint handles the mission (altitude, range, payload).
4. Return specific BOM updates (Partial configurations) for our simulator.

Rules:
- Primary option should be the absolute best fit.
- Secondary option should be a viable alternative (e.g., if Primary is multirotor, Secondary could be a high-performance fixed-wing).

Response Format:
Return ONLY a valid JSON object:
{
  "topOptions": [
    {
      "configId": "string", 
      "suitabilityScore": 95
    },
    {
      "configId": "string",
      "suitabilityScore": 82
    }
  ],
  "bestRequirements": ["Requirement 1", "Requirement 2"],
  "explanation": "Briefly explain why these two were chosen."
}
`;

    const aiStart = Date.now();
    const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: MODEL_ID,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: description }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Mission AI Proxy Error:', errorData);
        
        if (response.status === 503) {
            throw new Error('AI mission generator is currently unavailable. Please try again later.');
        }
        throw new Error(errorData.error?.message || errorData.error || `AI API returned status ${response.status}`);
    }

    const data = await response.json();
    const aiEnd = Date.now();
    
    const result: AIMissionResponse = JSON.parse(data.choices[0].message.content);

    // Map the selected configIds back to their full BOM data to ensure correctness
    result.topOptions = result.topOptions.map(option => {
        const blueprint = PRE_GENERATED_CONFIGS.find(c => c.id === option.configId);
        if (blueprint) {
            return {
                ...option,
                name: blueprint.name,
                platform: blueprint.platform,
                updates: {
                    frameId: blueprint.bom.frameId,
                    motorId: blueprint.bom.motorId,
                    battId: blueprint.bom.battId,
                    escId: blueprint.bom.escId,
                    propId: blueprint.bom.propId || (blueprint.platform === 'multirotor' ? 'p13_carbon' : undefined),
                    payloadMass: parseFloat(blueprint.specs.maxPayload) || 0,
                    templateId: blueprint.id
                }
            };
        }
        return option;
    });

    result.timings = {
        loader: loaderEnd - loaderStart,
        ai: aiEnd - aiStart,
        total: Date.now() - startTime
    };

    return result;
};
