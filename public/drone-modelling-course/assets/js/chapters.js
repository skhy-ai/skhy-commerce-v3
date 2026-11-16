const chapters = [
    {
        id: 'fundamentals-of-drone-modelling',
        title: 'Fundamentals of Drone Modelling',
        num: '',
        content: `# Fundamentals of Drone Modelling

Welcome to the **Drone Modelling & Integration** course. In this first module, we will explore the foundational concepts of UAV (Unmanned Aerial Vehicle) design.

## 1.1 Understanding the Frame
The drone frame is the structural backbone of the UAV. It determines the aerodynamics, payload capacity, and flight characteristics. Common configurations include:
- **Quadcopters:** Stable, versatile, standard for most commercial applications.
- **Hexacopters / Octocopters:** Higher redundancy and payload capacity, often used in heavy-lift scenarios.
- **Fixed-Wing:** Superior endurance and speed, ideal for surveying and mapping.

## 1.2 Aerodynamics Basics
Lift, drag, weight, and thrust are the four fundamental forces of flight. We will cover how motor placement and propeller pitch affect these forces in multirotor systems.
`
    },
    {
        id: 'cad-design-principles',
        title: 'CAD Design Principles',
        num: '',
        content: `# CAD Design Principles

In this module, we transition from theory to digital design.

## 2.1 Parametric Modelling
Parametric design allows engineers to adjust dimensions dynamically without redrawing the entire model. We will use industry-standard tools (like SolidWorks or Fusion 360) to design drone arms and center plates.

## 2.2 Designing for Manufacturing (DFM)
When designing drone parts, we must consider how they will be manufactured.
- **3D Printing:** Great for rapid prototyping and complex geometries.
- **CNC Machining:** Required for high-stress components like motor mounts (typically Aluminum or Carbon Fiber).
`
    },
    {
        id: 'payload-integration',
        title: 'Payload Integration',
        num: '',
        content: `# Payload Integration

Integrating sensors and effectors without disrupting flight stability is a critical engineering challenge.

## 3.1 Sensor Mounting
- **Gimbals:** Active stabilization for optical and thermal cameras.
- **Hard Mounts:** Used for LiDAR, radar, and acoustic arrays where precise fixed geometry is required (such as in the Skhy SentryOS nodes).

## 3.2 Power Distribution
Sensors draw significant power. We will analyze how to integrate Power Distribution Boards (PDB) to supply stable voltage to flight controllers and secondary AI edge computing modules.
`
    },
    {
        id: 'weight-distribution-balance',
        title: 'Weight Distribution & Balance',
        num: '',
        content: `# Weight Distribution & Balance

An unbalanced drone will overwork its motors, leading to reduced flight time and potential failure.

## 4.1 Center of Gravity (CoG)
The CoG must align perfectly with the geometric center of the lift vectors. We will calculate the moments around the X and Y axes to ensure our payloads do not offset the CoG.

## 4.2 Thrust-to-Weight Ratio
A standard agile drone requires a minimum 2:1 thrust-to-weight ratio. For heavy-lift applications, we calculate the required motor KV and propeller size to maintain this ratio safely.
`
    },
    {
        id: 'structural-analysis',
        title: 'Structural Analysis',
        num: '',
        content: `# Structural Analysis

Ensuring the frame can withstand the stresses of flight and payload carrying.

## 5.1 Finite Element Analysis (FEA)
We will simulate stress tests on our CAD models to identify weak points in the frame. Pay special attention to the junction between the arms and the center body.

## 5.2 Vibration Dampening
Vibrations from motors can severely disrupt sensor readings, especially IMUs and acoustic arrays. We will explore the use of rubber dampeners and structural isolation techniques.
`
    },
    {
        id: 'capstone-design-project',
        title: 'Capstone Design Project',
        num: '',
        content: `# Capstone Design Project

## 6.1 Project Overview
In this final module, you will design a complete, flight-ready UAV optimized for a specific C-UAS (Counter-Unmanned Aerial System) payload. 

## 6.2 Requirements
1. Complete CAD assembly.
2. Verified CoG calculations.
3. FEA stress simulation report.
4. Detailed Bill of Materials (BOM).

Good luck, and welcome to the forefront of aerospace engineering.
`
    }
];
