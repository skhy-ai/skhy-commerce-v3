import React from 'react';
import PositioningPhase from './PositioningPhase';

interface RoverPositioningPhaseProps {
    droneCalcData: any;
    platform: 'rover';
}

/**
 * Rover (UGV) Positioning wrapper.
 * Passes rover platform context to PositioningPhase for
 * ground path defaults and rover-specific CRPA configuration.
 */
const RoverPositioningPhase: React.FC<RoverPositioningPhaseProps> = ({ droneCalcData }) => {
    return (
        <PositioningPhase
            droneCalcData={droneCalcData}
            platform="rover"
        />
    );
};

export default RoverPositioningPhase;
