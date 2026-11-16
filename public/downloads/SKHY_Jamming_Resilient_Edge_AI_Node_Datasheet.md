# SKHY Jamming Resilient Edge AI & RF Fusion Node

## Technical Specifications

| Parameter | Specification |
|:---|:---|
| **CPU** | 8-core ARM® Cortex®-A78AE v8.2 64-bit |
| **GPU** | 1024-core NVIDIA Ampere™ with 32 Tensor Cores |
| **AI Performance** | Up to 70-100 TOPS (INT8) |
| **Memory** | 16GB 128-bit LPDDR5 (102.4 GB/s) |
| **Storage** | 64GB eMMC 5.1 + M.2 Key M (NVMe Gen 4 x4) |
| **Input Voltage** | 9V - 20V DC (Standard 12V) |
| **Power Draw** | 15W - 35W (Software Configurable) |

## System Overview
The SKHY Jamming Resilient Edge AI Node is a high-performance, ruggedized computing platform designed for advanced autonomous missions in contested environments. It integrates powerful GPU-accelerated computing with a specialized RF fusion layer to detect, classify, and mitigate electronic interference in real-time.

## Key Features

### 1. Advanced RF Fusion
The node features an integrated RF front-end capable of monitoring spectrum from 70MHz to 6GHz. Using deep learning models, it identifies jamming patterns and automatically shifts MANET radio frequencies or adjusts GNSS filtering parameters.

### 2. Contested Environment Navigation
Equipped with local SLAM (Simultaneous Localization and Mapping) capabilities, the node allows drones to navigate without GPS using visual-inertial odometry (VIO) processed entirely on the edge.

### 3. Ruggedized for Mission Critical Use
- **Cooling**: Passive heat-pipe technology with integrated active cooling option for high-ambient temperatures.
- **Housing**: CNC Machined 6061 Aluminum with chemical conversion coating.
- **Vibration**: Built to withstand MIL-STD-810H vibration and shock profiles.

## Connectivity & Interfaces

- **Ethernet**: Dual Gigabit Ethernet (1x M12 X-coded, 1x RJ45 internal)
- **Serial**: 4x UART (Up to 4Mbps) with hardware flow control
- **CAN Bus**: 2x CAN 2.0B / CAN FD
- **USB**: 1x USB 3.2 Gen 2, 2x USB 2.0
- **Digital I/O**: 8x Opto-isolated GPIO

## Operational Modes

### Stealth Mode
Minimizes electromagnetic signature by disabling non-essential RF emissions and optimizing internal bus frequencies.

### AI-Hunter Mode
Prioritizes GPU resources for real-time target identification and spectral analysis, enabling autonomous search-and-destroy or surveillance missions.
