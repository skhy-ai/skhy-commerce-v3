export const FIXED_WING_TEMPLATES = {
    "log_fw_04": {
        name: "Sky-Freight Talon (4kg Payload / 100km Range)",
        frame: "fixed_wing_talon",
        motor: "tm_mn4006",
        batt: "moli_6s3p",
        payload: 4,
        cruiseSpeedKmh: 65,
        motorCount: 1
    },
    "log_solar_06": {
        name: "Helios Surveyor (1kg Payload / 250km Range)",
        frame: "fixed_wing_surveyor",
        motor: "sunnysky_x2212",
        batt: "euclion_6s_22000",
        payload: 1,
        cruiseSpeedKmh: 45,
        motorCount: 1
    },
    "def_recon_02": {
        name: "Ghost-Recon FW (2kg Payload / 150km Range)",
        frame: "fixed_wing_composite_cruiser",
        motor: "tm_mn4006",
        batt: "moli_6s2p",
        payload: 2,
        cruiseSpeedKmh: 75,
        motorCount: 1
    },
    "def_loit_04": {
        name: "Vulture Loitering Munition (3kg Payload / 60km Range)",
        frame: "fixed_wing_delta",
        motor: "kde_4014xf",
        batt: "moli_6s3p",
        payload: 3,
        cruiseSpeedKmh: 90,
        motorCount: 1
    },
    "surv_map_01": {
        name: "MapMaster Surveyor (2.5kg Payload / 90km Range)",
        frame: "fixed_wing_surveyor",
        motor: "tm_mn4006",
        batt: "moli_6s3p",
        payload: 2.5,
        cruiseSpeedKmh: 60,
        motorCount: 1
    },
    "surv_marine_04": {
        name: "Ocean-Watch FW (3kg Payload / 180km Range)",
        frame: "fixed_wing_composite_cruiser",
        motor: "tm_mn4006",
        batt: "revogreen_12s_22000",
        payload: 3,
        cruiseSpeedKmh: 80,
        motorCount: 1
    }
};
