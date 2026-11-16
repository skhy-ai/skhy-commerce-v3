import { PRE_GENERATED_CONFIGS } from '../data/preGeneratedConfigs';

/**
 * Marketplace Data Loader
 * Aggregates pre-generated blueprints for AI context.
 * Optimized to reduce token bloat for OpenRouter.
 */

export const loadMarketplaceContext = async () => {
    // We prioritize pre-validated blueprints from our standardized library
    const blueprints = PRE_GENERATED_CONFIGS.map(config => ({
        id: config.id,
        name: config.name,
        description: config.description,
        platform: config.platform,
        suitability: config.suitability.join(', '),
        specs: {
            payload: config.specs.maxPayload,
            endurance: config.specs.maxEndurance,
            range: config.specs.maxRange,
            twr: config.specs.twr
        }
    }));

    return {
        blueprints,
        timestamp: new Date().toISOString(),
        totalConfigs: blueprints.length
    };
};
