# Skhy SentryOS: MVP1 Overview

> [!WARNING]
> **MVP Status**: The Cloud Core (`skhy-cloud-core`) is implemented with simulated logic. The Edge (`skhy-nexus-edge`) and Dashboard (`skhy-web-dashboard`) are currently scaffolds pending implementation.

**Version**: MVP 1.0 (Total Situational Awareness Edition)
**Target Audience**: Residential, Commercial (Retail), & Industrial (Light Factory)

## 1. Executive Summary

Skhy SentryOS is a comprehensive SaaS platform designed for Total Situational Awareness. It empowers property owners and facility managers with the right to know exactly who or what enters their premises—whether it's a person, a vehicle, or a drone.

The system utilizes **Sensor Fusion**—combining Audio, RF (Through-Wall Sensing), and Active Visual Tracking—to provide surveillance that eliminates blind spots. Unlike passive recording systems, Skhy SentryOS actively hunts for threats (intruders, industrial espionage drones, or machinery hazards) to ensure the user has full visibility of their domain.

## 2. MVP1 Feature List (Expanded)

| Feature ID | Feature Name | Description | Benefit to User |
| :--- | :--- | :--- | :--- |
| **F-01** | **Broad-Spectrum Audio Detection** | Auto-detects threat signatures: Glass break (shopfronts), footsteps, Drone/UAV Propellers, aggressive speech, or machinery alerts. | Identifies threats or malfunctions before they are seen. |
| **F-02** | **RF Stealth Sensing & Fingerprinting** | Uses WiFi Channel State Information (CSI) for presence and RF Whitelisting for drones. Logic: If signal matches known WiFi protocol = Normal. If signal is high-power but unrecognized (e.g., OcuSync/Lightbridge) = Drone Threat. | Detects intruders through walls and identifies unauthorized drones by their communication signals. |
| **F-03** | **Active Tilt Tracking** | Motorized camera automatically pans/tilts to the source of the Audio or RF disturbance. | Guarantees the subject is centered for identification, crucial for large factory floors. |
| **F-04** | **Visual Identification (Person, Drone, Vehicle)** | High-res capture triggered by sensors. Runs classification to identify "Person", "Drone", "Vehicle", or "Forklift". | Provides clear evidence of unauthorized access or safety violations. |
| **F-05** | **Sensor Fusion Verification** | Cross-references inputs to filter out false positives (e.g., shadows vs. actual mass). | Ensures alerts are genuine threats, not just environmental noise. |
| **F-06** | **Real-Time Intrusion Alerts** | Immediate push notification with "Proof of Presence" (Audio + Photo). | Gives the shop owner or security manager instant, actionable intelligence. |
| **F-07** | **Device Health Monitoring** | Live status of the edge device (Online/Offline/Low Battery). | Critical reliability assurance for unmanned facilities. |

## 3. Component Architecture & Implementation

The SentryOS platform ecosystem is powered by three distinct components.

### A. Skhy Nexus Edge
*The "Senses" of the Operation (Ears, Eyes, and Field)*

The Nexus Edge runs on standard hardware (e.g., Raspberry Pi 4 with Camera Module + WiFi card + Pan/Tilt Hat), making it scalable for multi-node deployment in larger facilities.

*   **Audio Module (`src/sensors/audio_stream.py`)**: Continuous monitoring. Tuned for high-frequency signatures (drone rotors), impact sounds (breaking glass), and industrial frequencies.
    *   *Implementation*: PyAudio stream processing with DoA (Direction of Arrival) estimation using GCC-PHAT.
*   **RF Module (`src/sensors/rf_sensing.py`)**: "Radar-like" monitoring of WiFi signals. It scans the 2.4GHz/5GHz spectrum.
    *   *Logic*: `if protocol == '802.11' (WiFi): status = SAFE`.
    *   *Logic*: `if protocol == 'UNKNOWN' and signal_strength > -40dBm: status = DRONE_THREAT`.
*   **Motor Control Module (`src/hardware/servo_control.py`)**: High-speed servo control to snap the camera toward detected sound/movement vectors.
*   **Visual Module (`main.py`)**: High-definition capture. Wakes immediately upon trigger to record the subject.
*   **Data Transmission (`src/encryptor.py`)**: Encrypts data to ensure Data Sovereignty—vital for businesses protecting trade secrets.

### B. Skhy Cloud Core
*The "Brain" of the Operation*

Processes multi-modal data to categorize the threat using specific Out-of-the-Box (OOTB) models to ensure rapid MVP deployment.

*   **Ingest Pipeline (`api/routes.py`)**: Unpacks the multi-modal payload.
*   **Processing Stack (OOTB Integration)**:
    *   **Audio Analysis (`core/sam_wrapper.py`)**:
        *   *Model*: SAM Audio (Segment Anything for Audio) or AudioMAE.
        *   *Ontology*: Security (Glass, Footsteps), Threat (Gunshot, Scream), Drone/Industrial (Propeller, Siren).
    *   **RF Analyzer (`core/rf_analyzer.py`)**:
        *   *Function*: Distinguishes Static Environment vs Human Motion vs Drone Signal.
    *   **Visual Verification (`core/vision_wrapper.py`)**:
        *   *Model*: YOLOv8 (Nano/Small).
        *   *Performance*: <100ms inference for rapid alerts.
    *   **Fusion Engine (`core/fusion_engine.py`)**: Weighted logic.
        *   *Scenario*: "Humming Sound" (Audio) + "Unknown RF Signal" (RF) = "Drone Intrusion Detected".

### C. Skhy Web Dashboard
*The "Face" of the Operation*

*   **Alert Feed**: Clearly labels "Person detected", "Drone detected", or "Vehicle detected".
*   **Snapshot Viewer**: Full resolution viewer for facial/object identification.
*   **Presence Graph**: Historical view of movement intensity in the facility.

## 4. User Flow & Data Pipeline (Drone Intrusion Example)

1.  **Listen**: Nexus Edge picks up a high-pitched whirring sound (Audio).
2.  **Scan**: RF sensors detect a strong signal that is not a known WiFi packet (RF Whitelist check fail).
3.  **Target**: Motor Control Module tilts the camera toward the signal source.
4.  **Capture**: Camera captures a small flying object entering the facility.
5.  **Process**: Cloud Core confirms "Propeller" sound and "Drone" visual object.
6.  **Alert**: Cloud Core sends "DRONE INTRUSION DETECTED" to the Facility Manager.
7.  **Notify**: Manager opens Dashboard to assess if it's a delivery drone or an unauthorized surveillance drone.

## 5. BDD Test Specifications

5.1. Audio & RF Detection (F-01 & F-02)

**Feature: Intelligent Event Detection**
As a Facility Manager, I want the system to ignore background noise but alert me to specific threats so that I am not disturbed by false alarms.

**Scenario: Detecting a drone propeller sound in a factory**
  *   Given the Nexus Edge is armed and monitoring audio
  *   And the background noise level is "High" (Factory Machinery)
  *   When a "Drone Propeller Whir" sound signature is detected above 60dB
  *   Then the system should classify the sound as "High Priority Threat"
  *   And the audio clip should be buffered for upload
  *   But the system should NOT trigger an alert for "HVAC Fan Noise"

**Scenario: RF Whitelist Check (Drone Detection)**
  *   Given the RF Module is scanning the 2.4GHz spectrum
  *   When a high-power signal (> -50dBm) is detected
  *   And the signal protocol is NOT recognized as standard 802.11 Wi-Fi
  *   Then the system should flag "RF Anomaly: Potential Drone Control Link"
  *   And trigger the camera to scan for visual confirmation

5.2. Active Tracking & Verification (F-03 & F-04)

**Feature: Active Visual Confirmation**
As a Shop Owner, I want the camera to look at the noise source so that I can see what broke the window.

**Scenario: Camera tracks glass breaking sound**
  *   Given the camera is currently facing "Center Aisle" (0 degrees)
  *   When a "Glass Break" audio event is detected at vector 45 degrees (Window Area)
  *   Then the Motor Control Module should rotate the camera to 45 degrees
  *   And the Camera should capture a burst of 5 high-resolution frames
  *   And the system should run Object Detection on the captured frames

**Scenario: Identifying a drone intruder**
  *   Given the camera has captured an image of the disturbance source
  *   When the Vision Transformer model analyzes the image
  *   And the image contains an object matching class "UAV/Drone" with >85% confidence
  *   Then the final alert type should be set to "Drone Intrusion"
  *   And the metadata should include "Object: Drone"

## 6. Project Structure

```bash
skhy-sentryos-platform/
├── start_sentry.sh          # Master Startup Script
├── skhy-nexus-edge/         # Edge Client (Python)
│   ├── main.py              # Entry Point
│   ├── src/
│   │   ├── sensors/         # RF and Audio Logic
│   │   ├── hardware/        # Servo Control (Mocked)
│   │   ├── logic/           # Fusion Logic
│   │   └── encryptor.py     # Data Sovereignty
├── skhy-cloud-core/         # Cloud Backend (FastAPI)
│   ├── app.py
│   ├── core/                # SAM, YOLO, RF Analysis
│   ├── models/              # Joblib & Weights
│   │   ├── audio/
│   │   ├── rf/
│   │   └── vision/
└── skhy-web-dashboard/      # Frontend (React)
    ├── src/components/LiveAlert.jsx
```

## 7. Running the System

You can start the entire stack using the helper script:

```bash
./start_sentry.sh
```