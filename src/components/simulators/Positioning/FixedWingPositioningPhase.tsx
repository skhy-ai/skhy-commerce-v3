import React from 'react';
import PositioningPhase from './PositioningPhase';

interface FixedWingPositioningPhaseProps {
    droneCalcData: any;
    platform: 'fixed-wing';
}

/**
 * Fixed Wing Positioning wrapper.
 * Passes fixed-wing platform context to PositioningPhase for
 * longer mission leg defaults and aircraft-specific CRPA configuration.
 */
const FixedWingPositioningPhase: React.FC<FixedWingPositioningPhaseProps> = ({ droneCalcData }) => {
    return (
        <PositioningPhase
            droneCalcData={droneCalcData}
            platform="fixed-wing"
        />
    );
};

export default FixedWingPositioningPhase;
