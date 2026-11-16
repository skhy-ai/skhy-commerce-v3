import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Camera } from '../data/droneComponents';
import { CAMERAS } from '../data/droneComponents';

export interface MultirotorConfig {
    frameId: string;
    motorId: string;
    propId: string;
    escId: string;
    battId: string;
    camera: Camera;
    telemetry: string;
    pipeMatId: string;
    payloadMass: number;
    templateId: string;
}

export interface FixedWingConfig {
    frameId: string;
    motorId: string;
    wingMotorId: string;
    thrusterType: 'propeller' | 'jet';
    battId: string;
    camera: Camera;
    payloadMass: number;
    cruiseSpeedKmh: number;
    motorCount: number;
    edgeDeviceId: string;
    noseSensor: 'plain' | 'acoustic_a7' | 'acoustic_a16';
    templateId: string;
}

export interface CompletedPhases {
    drone: { multirotor: boolean; 'fixed-wing': boolean; rover: boolean };
    transmission: { multirotor: boolean; 'fixed-wing': boolean; rover: boolean };
    positioning: { multirotor: boolean; 'fixed-wing': boolean; rover: boolean };
}

interface MissionStateContextType {
    multirotor: MultirotorConfig;
    fixedWing: FixedWingConfig;
    completedPhases: CompletedPhases;
    updateMultirotor: (updates: Partial<MultirotorConfig>) => void;
    updateFixedWing: (updates: Partial<FixedWingConfig>) => void;
    markPhaseComplete: (phase: keyof CompletedPhases, platform: 'multirotor' | 'fixed-wing' | 'rover') => void;
    resetPhase: (phase: keyof CompletedPhases, platform: 'multirotor' | 'fixed-wing' | 'rover') => void;
    resetAll: () => void;
}

const defaultMultirotor: MultirotorConfig = {
    frameId: "tarot_650",
    motorId: "tm_mn4006",
    propId: "p13_carbon",
    escId: "20a_generic",
    battId: "moli_6s3p",
    camera: CAMERAS[0],
    telemetry: "standard",
    pipeMatId: "pvc",
    payloadMass: 0,
    templateId: ""
};

const defaultFixedWing: FixedWingConfig = {
    frameId: "fixed_wing_surveyor",
    motorId: "tm_mn4006",
    wingMotorId: "tm_mn4006",
    thrusterType: "propeller",
    battId: "moli_6s3p",
    camera: CAMERAS[1],
    payloadMass: 0,
    cruiseSpeedKmh: 70,
    motorCount: 1,
    edgeDeviceId: "900009",
    noseSensor: "plain",
    templateId: ""
};

const defaultCompletedPhases: CompletedPhases = {
    drone: { multirotor: false, 'fixed-wing': false, rover: false },
    transmission: { multirotor: false, 'fixed-wing': false, rover: false },
    positioning: { multirotor: false, 'fixed-wing': false, rover: false }
};

const MissionStateContext = createContext<MissionStateContextType | undefined>(undefined);

export const MissionStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [multirotor, setMultirotor] = useState<MultirotorConfig>(defaultMultirotor);
    const [fixedWing, setFixedWing] = useState<FixedWingConfig>(defaultFixedWing);
    const [completedPhases, setCompletedPhases] = useState<CompletedPhases>(defaultCompletedPhases);

    const updateMultirotor = (updates: Partial<MultirotorConfig>) => {
        setMultirotor(prev => ({ ...prev, ...updates }));
    };

    const updateFixedWing = (updates: Partial<FixedWingConfig>) => {
        setFixedWing(prev => ({ ...prev, ...updates }));
    };

    const markPhaseComplete = (phase: keyof CompletedPhases, platform: 'multirotor' | 'fixed-wing' | 'rover') => {
        setCompletedPhases(prev => ({
            ...prev,
            [phase]: {
                ...prev[phase],
                [platform]: true
            }
        }));
    };

    const resetPhase = (phase: keyof CompletedPhases, platform: 'multirotor' | 'fixed-wing' | 'rover') => {
        setCompletedPhases(prev => ({
            ...prev,
            [phase]: {
                ...prev[phase],
                [platform]: false
            }
        }));
    };

    const resetAll = () => {
        setMultirotor(defaultMultirotor);
        setFixedWing(defaultFixedWing);
        setCompletedPhases(defaultCompletedPhases);
    };

    return (
        <MissionStateContext.Provider value={{
            multirotor,
            fixedWing,
            completedPhases,
            updateMultirotor,
            updateFixedWing,
            markPhaseComplete,
            resetPhase,
            resetAll
        }}>
            {children}
        </MissionStateContext.Provider>
    );
};

export const useMissionState = () => {
    const context = useContext(MissionStateContext);
    if (context === undefined) {
        throw new Error('useMissionState must be used within a MissionStateProvider');
    }
    return context;
};
