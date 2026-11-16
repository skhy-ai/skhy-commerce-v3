
export type RangeCategory = 'short' | 'mid' | 'long';
export type UserType = 'commercial' | 'tactical';

export interface PresetRecommendation {
    presetId: string;
    platform: 'multirotor' | 'fixed-wing';
    name: string;
    description: string;
}

/**
 * Identifies the best drone preset based on user requirements.
 */
export function identifyDronePreset(
    userType: UserType,
    range: RangeCategory,
    payloadWeight: number
): PresetRecommendation {
    // 1. Long Range always defaults to Fixed Wing Surveyor as per user request
    if (range === 'long') {
        return {
            presetId: 'fixed_wing_surveyor',
            platform: 'fixed-wing',
            name: 'SKHY Surveyor',
            description: 'Long-range VTOL fixed-wing optimized for extended mapping and surveillance missions (50km+ range).'
        };
    }

    // 2. Mid Range
    if (range === 'mid') {
        if (payloadWeight > 5) {
            return {
                presetId: 'heavy_10kg',
                platform: 'multirotor',
                name: 'Industrial Heavy Lift',
                description: 'Proprietary industrial quadcopter designed for heavy payloads up to 10kg and 20km range.'
            };
        }
        return {
            presetId: 'medium_5kg',
            platform: 'multirotor',
            name: 'Logistics Specialist',
            description: 'Versatile multi-rotor platform for medium-range logistics and tactical overwatch.'
        };
    }

    // 3. Short Range
    if (userType === 'tactical') {
        return {
            presetId: 'medium_2kg', // Defaulting to medium_2kg for now, could be skhy-fiber-optic
            platform: 'multirotor',
            name: 'Tactical Sentinel',
            description: 'Rapid-deployment tactical platform with high-resolution visual intelligence.'
        };
    }

    return {
        presetId: 'medium_2kg',
        platform: 'multirotor',
        name: 'Commercial Surveyor',
        description: 'Standard commercial configuration for short-range inspections and high-res photography.'
    };
}
