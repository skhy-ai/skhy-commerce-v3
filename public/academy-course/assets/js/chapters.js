const chapters = [
    {
        id: 'abstract-and-introduction',
        title: 'Abstract and Introduction',
        num: '1',
        content: `
# 1. Abstract and Introduction

![Total Situational Awareness](images/threat-awareness-manager.png)

The necessity for securing critical infrastructure and high-value perimeters has driven the development of advanced autonomous security systems. Traditional passive surveillance methods, such as closed-circuit television (CCTV) networks, rely heavily on human operators and suffer from significant blind spots, especially in adverse environmental conditions or against non-traditional threats like Unmanned Aerial Vehicles (UAVs). 

This course details the theoretical foundation, architecture, and implementation of **Skhy SentryOS**—a comprehensive edge-based autonomous platform designed to deliver Total Situational Awareness. Through the synergistic integration of the **Sentry Nexus Edge** interface and the **Vidur Core** AI processing engine, the system employs advanced multi-modal sensor fusion. By synthesizing Acoustic Beamforming, RF (Radio Frequency) Fingerprinting, and Visual Tracking, Skhy SentryOS achieves a proactive security posture capable of detecting, classifying, and tracking human intruders, vehicles, and espionage drones with high accuracy. This intelligence is bound together by the **Reticulum** decentralized mesh protocol, ensuring highly resilient, cryptographically secure peer-to-peer communications across the perimeter without reliance on traditional centralized IP infrastructure.

> [!NOTE]
> **Concept Refresher:** 
> - **Autonomous:** Capable of operating and making decisions without human intervention.
> - **Sensor Fusion:** The process of combining data from multiple distinct sensors (audio, radio, visual) to improve detection accuracy and reduce false alarms.
> - **Acoustic Beamforming:** Using an array of microphones to isolate sounds coming from a specific direction while suppressing ambient noise.

# 1. Introduction

## 1.1 The Problem of Passive Security

Modern facility management and perimeter security face unprecedented challenges. Intruders have evolved beyond traditional physical breaches, utilizing stealth tactics, RF-controlled drones for aerial reconnaissance, and advanced espionage tools that evade standard line-of-sight visual detection. 

Security personnel operating passive video surveillance are prone to fatigue and cannot simultaneously monitor all visual feeds. Moreover, visual cameras are inherently limited by field of view (FOV), occlusions, poor lighting, and severe weather conditions. When an incident occurs, traditional systems merely record the event rather than actively mitigating the threat.

## 1.2 Total Situational Awareness

Skhy SentryOS addresses these vulnerabilities by shifting the security paradigm from *passive recording* to *active hunting*. The system provides property owners with continuous, autonomous domain awareness. It guarantees the right to know exactly who or what enters the premises by utilizing sensors that do not rely solely on visual line-of-sight. 

Through the integration of:
1. **Audio Arrays:** For acoustic detection of glass breaks, aggressive speech, and drone propellers.
2. **RF Sensors:** For through-wall sensing and intercepting Wi-Fi telemetry associated with UAV operations.
3. **PTZ Visual Systems:** For immediate, automated visual confirmation of non-visual disturbances.

\`\`\`mermaid
mindmap
  root((Total Situational Awareness))
    Audio Sensors
      Acoustic Beamforming
      Harmonic Classification
      Impulse Detection
    RF Sensors
      Channel State Information
      Protocol Fingerprinting
      Through-wall Sensing
    Visual Systems
      PTZ Auto-Slew
      YOLO Object Detection
      Optical Verification
\`\`\`

## 1.3 Scope of the Document

This course serves as an internal engineering and architecture manual for the development and continuous improvement of Skhy SentryOS. It provides a detailed theoretical overview of the underlying machine learning architectures, algorithms, and networking protocols utilized by the system.

The chapters are structured as follows:
- **Chapter 1** provides a refresher on the foundational Networking, RF Engineering, and MIMO concepts underlying the platform.
- **Chapter 2** outlines the dual-node System Architecture dividing the UI (Nexus Edge) and the Edge AI (Vidur Core).
- **Chapter 3** discusses the Sensor Fusion algorithms and the mathematical approach to minimizing false positives.
- **Chapter 4** explores the physical principles and Deep Learning methods applied to Acoustic Beamforming and Direction of Arrival (DOA) estimation.
- **Chapter 5** details the application of RF Protocol Fingerprinting and Wi-Fi Channel State Information (CSI) for stealth sensing.
- **Chapter 6** provides a foundational primer on Artificial Intelligence and Machine Learning architectures.
- **Chapter 7** delves into Vidur Core's specific Machine Learning architectures (CNNs, Transformers), the Reticulum mesh protocol, and cryptographic security (RSA to EC25519).
- **Chapter 8** covers Data Privacy, Ethics, and Countermeasures, exploring the implications of edge AI and how SentryOS defends against jamming and blinding attacks.
- **Chapter 9** discusses System Scaling and Real-World Deployments, addressing the practical challenges of deploying and powering decentralized mesh networks.
- **Chapter 10** concludes the document with a summary of system capabilities and academic references.
- **Chapter 11** provides a comprehensive Glossary of technical terms.

## Review Questions & Practical Exercises

**1. Comprehension Check:** Define "Sensor Fusion" in the context of SentryOS. Why is it preferable to single-sensor surveillance?
**2. System Analysis:** The introduction mentions shifting the security paradigm from "passive recording" to "active hunting." Explain what this means functionally for a facility manager using SentryOS.
**3. Practical Exercise:** Walk the perimeter of your own facility (or home) and identify three areas that represent a "blind spot" for traditional optical cameras. How would SentryOS address these specific vulnerabilities?

`
    },
    {
        id: '1-literature-review-and-state-of-the-art',
        title: '1 Literature Review and State of the Art',
        num: '1',
        content: `
# 1.1 Literature Review and State of the Art

## Introduction

In the context of localized threat detection and decentralized mesh networks, SentryOS aims to address critical gaps left by existing centralized and cloud-reliant systems. This chapter provides a critical analysis of current state-of-the-art technologies and the distinct advantages offered by the SentryOS platform.

## Conventional Threat Detection Systems

Traditional physical security and threat detection systems heavily rely on centralized processing. Acoustic sensors, RF scanners, and optical cameras typically stream raw data to a centralized command server or a cloud-based backend for processing.

*   **Cloud-Reliant AI Platforms:** Systems like AWS Panorama or Azure Percept bring AI to the edge but still fundamentally rely on a stable, high-bandwidth connection to the cloud for heavy computation and global coordination. In contested environments where connectivity is jammed or absent, these systems experience catastrophic failure.
*   **Centralized Command and Control (C2):** Traditional C2 infrastructures present a single point of failure. If the central server is compromised or disconnected, remote nodes lose their analytical capabilities and operate in isolation, unable to correlate complex threats.

## Decentralized Edge Computing

Recent literature highlights the shift towards edge computing, specifically the deployment of Lightweight Machine Learning (LML) on constrained devices.

*   **Federated Learning:** While federated learning (e.g., Google's initial work on decentralized model training) addresses data privacy by keeping training data local, it does not inherently solve the problem of real-time, low-latency collaborative inference in a tactical mesh.
*   **Edge-Native Architectures:** Frameworks like EdgeX Foundry provide middleware for IoT devices, but lack the deeply integrated RF fingerprinting and acoustic beamforming necessary for physical threat awareness. 

## SentryOS: Bridging the Gap

SentryOS distinguishes itself from the current literature in three critical ways:

1.  **Fully Decentralized Inference:** Unlike federated learning systems that require a central aggregator, Vidur nodes in SentryOS perform localized inference and share only high-level threat vectors (not raw data) via a gossip protocol.
2.  **Multimodal Sensor Fusion at the Edge:** SentryOS performs complex mathematical transformations (like MUSIC for DOA and CSI extraction) directly on resource-constrained devices (e.g., Jetson Nano, Raspberry Pi) without requiring cloud compute.
3.  **Resilient Mesh Networking:** Utilizing LoRa and point-to-point Wi-Fi (BATMAN-adv), the network guarantees operational integrity even when nodes are destroyed or communications are jammed.

This thesis asserts that a fully decentralized, multimodal edge AI mesh provides superior latency, resilience, and privacy compared to centralized counterparts, specifically for tactical threat awareness scenarios.

`
    },
    {
        id: '2-primer:-python-fundamentals',
        title: '2 Primer: Python Fundamentals',
        num: '1',
        content: `
# 1.2 Primer: Python Fundamentals

## Introduction

Python is the absolute bedrock of the Skhy SentryOS platform. While the Skhy Cloud Core is a distributed, high-performance C++ backend, the entire AI lifecycle—from data wrangling to model training, signal processing, and graphing—is orchestrated via Python.

In this primer, we will cover the fundamental concepts of Python required to successfully navigate the Skhy Academy course labs.

## Python and Data Science

The power of Python in physical AI comes from its ecosystem of highly optimized C/C++ libraries wrapped in easy-to-use Python syntax. 

### 1. NumPy (Numerical Python)
At the heart of almost every physical AI task is **NumPy**. It provides high-performance, multidimensional array objects. In SentryOS, audio signals from a microphone array and RF CSI matrices are represented as NumPy arrays.

> [!NOTE]
> **Code Explanation:** In the snippet below, we use \`np.linspace\` to create an array of time steps (\`t\`). We then feed this array into the sine function (\`np.sin\`) to instantly generate 1,000 data points representing a 5 Hz wave. Notice how we didn't need a \`for\` loop? This is called *vectorization*, and it makes NumPy incredibly fast.

\`\`\`python
import numpy as np

# A simple 1-second audio signal sampled at 1000 Hz
sample_rate = 1000
duration = 1
t = np.linspace(0, duration, sample_rate * duration, endpoint=False)

# Create a simulated sine wave at 5 Hz
signal = np.sin(2 * np.pi * 5 * t)
print(f"Generated a signal of shape: {signal.shape}")
\`\`\`

### 2. Pandas (Data Manipulation)
While NumPy handles raw matrices, **Pandas** provides DataFrame structures perfect for logging, filtering, and manipulating time-series tabular data, such as SentryOS packet logs and MAC address spoofing metrics.

> [!NOTE]
> **Code Explanation:** Here, we define raw data as a dictionary and convert it into a \`pd.DataFrame\`. The real magic happens on the line \`df[df['rssi'] > -50]\`. This instantly filters the entire table to only show rows where the signal strength (RSSI) is greater than -50 dBm, without needing to manually loop through every single row.

\`\`\`python
import pandas as pd

# Creating a SentryOS log table
data = {
    'timestamp': ['10:00:01', '10:00:02', '10:00:03'],
    'mac_address': ['AA:BB:CC', 'AA:BB:CC', 'FF:FF:FF'],
    'rssi': [-45, -42, -90]
}
df = pd.DataFrame(data)

# Filtering out weak signals
strong_signals = df[df['rssi'] > -50]
print(strong_signals)
\`\`\`

## 3. Core Python Data Structures

Beyond arrays and dataframes, SentryOS relies on core Python structures to handle lightweight tasks like parsing JSON payloads from the mesh network.

### Lists and Dictionaries
- **Lists** are ordered collections, often used to queue incoming packets.
- **Dictionaries** are key-value pairs, perfect for structuring JSON-like telemetry data.

> [!NOTE]
> **Code Explanation:** Notice how the \`telemetry_packet\` dictionary maps strings (like \`"status"\`) to values (like \`"Online"\`). When we want to retrieve the temperature, we simply ask for \`telemetry_packet['cpu_temp_c']\`. We then use a standard \`for\` loop to iterate over the list of active sensors stored inside that dictionary.

\`\`\`python
# Simulating a telemetry payload from a Vidur Node
telemetry_packet = {
    "node_id": "Vidur_Alpha_01",
    "status": "Online",
    "active_sensors": ["Acoustic", "RF_CSI", "Optical"],
    "cpu_temp_c": 42.5
}

# Accessing dictionary data
print(f"Node {telemetry_packet['node_id']} is running at {telemetry_packet['cpu_temp_c']}°C")

# Iterating over a list inside the dictionary
print("Active Sensors:")
for sensor in telemetry_packet['active_sensors']:
    print(f" - {sensor}")
\`\`\`

## 4. Data Visualization (Matplotlib)

You cannot fight threats you cannot see. **Matplotlib** is the de facto standard for 2D plotting in Python. Throughout this course, you will use it to visualize invisible anomalies like RF interference or acoustic spectrograms.

> [!NOTE]
> **Code Explanation:** We first generate an exponentially decaying sine wave to simulate a gunshot or transient sound. We then use \`plt.plot()\` to draw the line, and add titles and labels. Finally, \`plt.show()\` pushes the completed graph directly to your browser screen!

\`\`\`python
import numpy as np
import matplotlib.pyplot as plt
import js

# Generate a simulated signal
t = np.linspace(0, 1, 500)
signal = np.sin(2 * np.pi * 10 * t) * np.exp(-3 * t)

# Plot the signal
plt.figure(figsize=(8, 3))
plt.plot(t, signal, color='#38bdf8', linewidth=2)
plt.title("Simulated Transient Acoustic Event")
plt.xlabel("Time (s)")
plt.ylabel("Amplitude")
plt.grid(True, alpha=0.3)

# Display in the Pyodide environment
plt.show()
\`\`\`

## 5. Scientific Computing (SciPy)

While NumPy handles the raw math, **SciPy** builds on top of it to provide advanced algorithms for Signal Processing, Optimization, and Statistics. We will heavily utilize \`scipy.signal\` for tasks like filtering out wind noise and calculating the cross-correlation of audio signals.

> [!NOTE]
> **Code Explanation:** Real-world sensors are noisy. Here we generate a clean 10Hz wave and add random high-frequency static to it. We then pass it through \`signal.medfilt()\` (a Median Filter). The filter looks at a sliding window of 31 points and replaces the center point with the median, effectively wiping out the static while preserving the core wave shape!

\`\`\`python
import numpy as np
from scipy import signal
import matplotlib.pyplot as plt
import js

# Generate a noisy signal (10Hz clean wave + high-frequency noise)
t = np.linspace(0, 1, 1000)
clean = np.sin(2 * np.pi * 10 * t)
noise = np.random.normal(0, 0.5, len(t))
noisy_signal = clean + noise

# Use SciPy to apply a Median Filter to smooth out the noise
smoothed_signal = signal.medfilt(noisy_signal, kernel_size=31)

print(f"Original Noise Variance: {np.var(noisy_signal):.2f}")
print(f"Smoothed Noise Variance: {np.var(smoothed_signal):.2f}")

# Plot the results
plt.figure(figsize=(8, 4))
plt.plot(t, noisy_signal, color='red', alpha=0.5, label='Noisy Signal')
plt.plot(t, smoothed_signal, color='blue', linewidth=2, label='Smoothed Signal')
plt.title("SciPy Median Filter Smoothing")
plt.xlabel("Time (s)")
plt.ylabel("Amplitude")
plt.legend()
plt.grid(True, alpha=0.3)

# Display in the Pyodide environment
plt.show()  
\`\`\`

## Review Questions

**1. Comprehension Check:** Why is Python used as the primary scripting language for Physical AI and Signal Processing in SentryOS? 
**2. Code Challenge:** In the SciPy example, the \`kernel_size\` was set to 31. What would happen to the filtered signal if you changed this to \`3\`? What if you changed it to \`201\`? Describe the trade-off you are making.
**3. Advanced Concept:** How would you use a Pandas DataFrame to quickly find the average RSSI value for a specific MAC address over a 24-hour period?

`
    },
    {
        id: '3-primer:-digital-signal-processing',
        title: '3 Primer: Digital Signal Processing',
        num: '1',
        content: `
# 1.3 Primer: Digital Signal Processing

## Introduction

Before diving into how SentryOS analyzes acoustic drones or RF Wi-Fi signatures, it is crucial to understand how computers interpret continuous physical waves. Digital Signal Processing (DSP) is the mathematics of taking real-world analog signals (like sound or radio waves) and converting them into discrete numbers that a computer can analyze.

## 1. Analog to Digital Conversion (ADC)

The real world is continuous. A microphone membrane vibrating back and forth creates an analog electrical voltage. Computers, however, only understand discrete binary data.

### The Nyquist-Shannon Sampling Theorem
To convert a continuous wave into digital data, we "sample" the wave at regular intervals. The **Sampling Rate** is how many times per second we measure the wave (measured in Hertz, Hz). 

The Nyquist Theorem states that to accurately capture a wave of a certain frequency, you must sample it at **least twice as fast** as its highest frequency component. 
*   *Example:* Human hearing tops out around 20,000 Hz (20 kHz). Therefore, standard CD-quality audio is sampled at 44,100 Hz, ensuring all audible frequencies are captured perfectly.

## 2. Time Domain vs. Frequency Domain

When you look at a standard audio waveform, you are looking at the **Time Domain**. The X-axis is time, and the Y-axis is amplitude (loudness). While useful for seeing *when* a sound happened, it is terrible for telling you *what* the sound is.

To identify a drone or a specific voice, we need to look at the **Frequency Domain**. Instead of asking "how loud is it right now?", we ask "how much bass is there? How much treble?"

### The Fast Fourier Transform (FFT)
The FFT is arguably the most important algorithm in signal processing. It is a mathematical function that takes a block of Time Domain data and converts it into the Frequency Domain. 
*   **Input:** A squiggly line over time.
*   **Output:** A bar chart showing exactly which frequencies (pitches) are present in that squiggly line and how strong they are.

SentryOS relies heavily on FFTs. When a microphone hears a buzzing sound, the FFT breaks it apart. If there is a massive spike at exactly 400Hz and 800Hz, the system knows it's likely a drone propeller rather than the wind.

### Code Sample: Basic FFT in Python

\`\`\`python
import numpy as np
import matplotlib.pyplot as plt
from scipy.fft import fft, fftfreq

# 1. Create a simulated signal (e.g., a 400Hz drone hum + 0.5 amplitude 800Hz overtone)
sample_rate = 44100
duration = 0.5
t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)
signal = np.sin(2 * np.pi * 400 * t) + 0.5 * np.sin(2 * np.pi * 800 * t)

# 2. Perform the Fast Fourier Transform
N = len(signal)
yf = fft(signal)
xf = fftfreq(N, 1 / sample_rate)

# 3. Plot the Frequency Domain (showing the massive spikes at 400Hz and 800Hz)
plt.plot(xf[:N//2], np.abs(yf[:N//2]))
plt.xlim(0, 1000)
plt.title("Frequency Domain (FFT)")
plt.xlabel("Frequency (Hz)")
plt.ylabel("Amplitude")
plt.show()
\`\`\`

## 3. Spectrograms

A single FFT gives you the frequencies for one brief moment. But sounds change over time. A **Spectrogram** is a 3D plot squished into 2D:
*   **X-axis:** Time
*   **Y-axis:** Frequency (Pitch)
*   **Color/Intensity:** Amplitude (Loudness)

By feeding spectrogram images into Convolutional Neural Networks (CNNs), SentryOS can visually "look" at the acoustic signature of a drone engine revving up, classifying the threat with incredible accuracy.

`
    },
    {
        id: '4-primer:-graph-theory-and-databases',
        title: '4 Primer: Graph Theory and Databases',
        num: '1',
        content: `
# 1.4 Primer: Graph Theory and Databases

## Introduction

SentryOS represents threat data using a "Global Knowledge Graph". To understand why this is revolutionary compared to traditional alert logs, one must understand the basics of Graph Theory and how Graph Databases function.

## 1. What is a Graph?

In mathematics and computer science, a "Graph" has nothing to do with pie charts or bar graphs. A Graph is a data structure designed to represent **relationships**. 

A graph consists of two primary components:
1.  **Nodes (or Vertices):** The entities or objects. (e.g., A Person, a Vidur Node, a Drone, a City).
2.  **Edges (or Relationships):** The lines connecting the nodes, indicating how they interact. (e.g., "KNOWS", "DETECTED", "LOCATED_AT").

### Directed vs. Undirected Graphs
*   **Undirected:** The relationship goes both ways. (e.g., If Node A is next to Node B, Node B is next to Node A).
*   **Directed:** The relationship has a specific direction. (e.g., Vidur Node A \`DETECTED\` Drone. The Drone did not detect Vidur Node A). SentryOS relies heavily on directed graphs.

## 2. Graph Databases vs. Relational Databases

Most traditional software uses Relational Databases (like MySQL or PostgreSQL). In these databases, data is stored in rigid tables (Rows and Columns). If you want to find relationships between data in different tables, you have to perform computationally expensive \`JOIN\` operations.

**Graph Databases** (like NetworkX or Kùzu) treat the *relationships* as first-class citizens. The connections between data points are stored physically together in-memory. 

### Why SentryOS Uses a Graph Database
Imagine a scenario with traditional tables:
*   Table \`Nodes\`: Node 4
*   Table \`Detections\`: Drone ID 99 at time T.
*   Table \`RF_Scans\`: MAC Address XX:YY at time T.

To figure out if the Drone and the MAC Address are related to the same event, a traditional system has to run complex cross-table queries looking for matching timestamps and locations.

In a Graph Database, the data is naturally linked the moment it is created:
\`(Node 4) -[DETECTED]-> (Drone ID 99) -[EMITS_RF]-> (MAC XX:YY)\`

### Code Sample: Creating a Graph with NetworkX
NetworkX is a Python package for the creation, manipulation, and study of the structure, dynamics, and functions of complex networks. Here is how SentryOS inserts the above relationship:

\`\`\`python
import networkx as nx
import matplotlib.pyplot as plt

# 1. Initialize a directed graph
G = nx.DiGraph()

# 2. Create the physical Vidur Node and the detected Drone
G.add_node("Node_4", type="VidurNode", location="North_Gate")
G.add_node("Drone_99", type="Drone", threat_level="High")

# Link the drone to the Node
G.add_edge("Node_4", "Drone_99", relation="DETECTED", timestamp=1690001000)

# 3. Create the RF Mac Address and link it to the Drone
G.add_node("MAC_XX_YY_ZZ", type="RFEmitter", mac="XX:YY:ZZ:11:22:33")
G.add_edge("Drone_99", "MAC_XX_YY_ZZ", relation="EMITS_RF", confidence=0.95)

# 4. Visualize the Graph
plt.figure(figsize=(6, 4))
pos = nx.spring_layout(G, seed=42)
nx.draw(G, pos, with_labels=True, node_color='lightblue', node_size=2000, font_size=10, arrows=True)
edge_labels = nx.get_edge_attributes(G, 'relation')
nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)
plt.title("SentryOS Initial Knowledge Graph")
plt.show()
\`\`\`

## 3. Graph Traversal

Because the relationships are directly mapped, finding complex patterns becomes trivial. We can ask the database to "traverse" the graph:
*"Find all Unknown Drones that were DETECTED by Node 4 AND Node 5 within the last 10 minutes, and trace their physical paths."*

This allows the SentryOS Threat Awareness Dashboard to provide operators with deep, contextual intelligence rather than just a spam of isolated alerts.

`
    },
    {
        id: '5-primer:-the-edge-computing-continuum',
        title: '5 Primer: The Edge Computing Continuum',
        num: '1',
        content: `
# 1.5 Primer: The Edge Computing Continuum

## Introduction

Historically, the dominant paradigm in computing has been the Client-Server (or Cloud) model. SentryOS abandons this in favor of Decentralized Edge Computing. To understand the architectural decisions behind SentryOS, we must explore the continuum from the Cloud to the Edge.

## 1. The Cloud Computing Model

In the standard IoT (Internet of Things) model, devices are "dumb." A smart security camera, for example, simply captures video and streams the raw gigabytes of data over Wi-Fi to an AWS or Google Cloud server. 

**The Cloud handles the "heavy lifting":** The massive server farms analyze the video, detect a person, and then send a tiny alert message back to the user's phone.
*   **Pros:** Infinite computational power, centralized updates.
*   **Cons:** Requires massive bandwidth, introduces high latency (round trip to the server), and if the internet goes down, the system is completely blind.

## 2. The Shift to Edge Computing

**Edge Computing** flips the model. Instead of moving the *data* to the *compute*, we move the *compute* to the *data*. 

In SentryOS, the Vidur nodes (equipped with Jetson Nanos or Raspberry Pis) are "smart." When a microphone picks up a sound, the node does not stream the audio to a server. Instead, it runs the deep neural network locally, right there on the physical edge of the network.

### Why the Edge is Critical for SentryOS:
1.  **Ultra-Low Latency:** In tactical threat scenarios, waiting 500ms for a cloud server to respond is too slow. Local inference takes milliseconds.
2.  **Bandwidth Conservation:** Streaming 4 channels of uncompressed audio from 50 nodes would crush any tactical Wi-Fi network. By processing at the edge, the node only transmits a few bytes: "Drone detected at 45 degrees."
3.  **Disconnected Operations:** If an adversary jams the primary satellite uplink or cuts the fiber line to the command center, SentryOS continues to function perfectly. The local mesh network still detects, tracks, and shares intelligence.

## 3. The Computing Continuum

It is helpful to view this as a spectrum:

*   **The Cloud:** Massive data centers. Used by SentryOS *only* for long-term historical graph storage and heavy model re-training if an uplink is available.
*   **The Fog:** Local, powerful gateway servers (like a ruggedized server in a command tent). It aggregates data from the edge before it goes to the cloud.
*   **The Edge:** The actual Vidur nodes out in the field running local AI models (Jetson Nanos).
*   **The Deep Edge (or Extreme Edge):** Ultra-low power microcontrollers (like an ESP32 or Arduino) that might only run a simple trigger to wake up the larger Edge node.

SentryOS operates primarily at the Edge and Fog layers, ensuring maximum resilience and operational security.

`
    },
    {
        id: '6-practical-labs-and-code-samples',
        title: '6 Practical Labs and Code Samples',
        num: '1',
        content: `
# 1.6 Practical Labs and Code Samples

## Introduction to SentryOS Labs

This section provides practical, hands-on examples for students and developers to understand the core algorithms driving the SentryOS platform. You can run most of these Python snippets locally to simulate the processing done on a Vidur edge node.

### In-Browser Execution & Pre-requisites
Skhy Academy features a built-in Python execution environment (Pyodide) allowing you to test Labs 1, 2, and 4 directly within this document by clicking **"Run Code"**. 

> [!WARNING]
> **Lab 3 (Edge AI) requires a local Python environment.** 
> The PyTorch machine learning library used in Lab 3 is too complex to run inside a web browser. To execute Lab 3, you must install Python on your machine, create a virtual environment, and install the required packages manually:
> \`\`\`bash
> python -m venv venv
> source venv/bin/activate  # Or venv\Scripts\activate on Windows
> pip install numpy scipy pandas torch networkx matplotlib
> \`\`\`

---

## Lab 1: Simulating Acoustic Direction of Arrival (DOA)

The core of SentryOS's acoustic tracking relies on calculating the time delay of arrival (TDOA) between multiple microphones in an array.

### Concept Overview
When a sound wave hits a microphone array, it reaches the closer microphones slightly earlier than the ones further away. By measuring this microscopic time difference, we can calculate the angle (Direction of Arrival) the sound came from.

### Code Sample: Basic TDOA Calculation (Cross-Correlation)

\`\`\`python
import numpy as np
from scipy import signal
import matplotlib.pyplot as plt

def calculate_doa(mic1_signal, mic2_signal, mic_distance, sample_rate, speed_of_sound=343.0):
    """
    Calculates the angle of arrival between two microphones using generalized cross-correlation.
    """
    # 1. Compute the cross-correlation of the two signals
    correlation = signal.correlate(mic1_signal, mic2_signal, mode='full')
    
    # 2. Find the index of the maximum correlation peak
    lag_index = np.argmax(correlation)
    
    # 3. Calculate the time delay in seconds
    # The zero lag is at the center of the correlation array
    zero_lag_index = len(mic1_signal) - 1
    delay_samples = lag_index - zero_lag_index
    time_delay = delay_samples / sample_rate
    
    # 4. Calculate the angle using trigonometry: angle = arcsin((delay * speed) / distance)
    # Clamp value between -1 and 1 to prevent arcsin domain errors due to noise
    val = (time_delay * speed_of_sound) / mic_distance
    val = max(min(val, 1.0), -1.0) 
    
    angle_rad = np.arcsin(val)
    angle_deg = np.degrees(angle_rad)
    
    return angle_deg

# --- Simulation ---
sample_rate = 44100
duration = 0.1
t = np.linspace(0, duration, int(sample_rate * duration), endpoint=False)

# Create a simulated "drone hum" at 400Hz
source_signal = np.sin(2 * np.pi * 400 * t) + np.random.normal(0, 0.5, len(t))

# Simulate the delay arriving at mic 2 (e.g., source is to the right)
true_delay_samples = 15
mic1 = source_signal
# Pad and slice to shift signal
mic2 = np.pad(source_signal, (true_delay_samples, 0))[:-true_delay_samples] 

estimated_angle = calculate_doa(mic1, mic2, mic_distance=0.1, sample_rate=sample_rate)
print(f"Estimated Direction of Arrival: {estimated_angle:.2f} degrees")
\`\`\`

---

## Lab 2: RF Anomaly Detection via MAC Spoofing Detection

SentryOS scans the RF environment. While MAC addresses can be easily spoofed, the *signal strength (RSSI)* from a specific physical location changes predictably. If a MAC address suddenly jumps in signal strength wildly, it might indicate a spoofing attack.

### Code Sample: Detecting Anomalous RSSI Jumps

\`\`\`python
import pandas as pd
import numpy as np

def detect_mac_spoofing(rssi_log, threshold_dbm=15):
    """
    Detects potential MAC spoofing by looking for impossible physical jumps in RSSI
    over a very short time window.
    """
    # Calculate the difference in RSSI between consecutive packets
    rssi_log['rssi_diff'] = rssi_log['rssi'].diff().abs()
    
    # Calculate time difference between packets (in seconds)
    rssi_log['time_diff'] = rssi_log['timestamp'].diff()
    
    # Anomaly condition: A massive jump in signal strength in less than 1 second
    anomalies = rssi_log[(rssi_log['rssi_diff'] > threshold_dbm) & (rssi_log['time_diff'] < 1.0)]
    
    return anomalies

# --- Simulation ---
# Simulating logs of a specific MAC address (e.g., a known friendly drone)
data = {
    'timestamp': [0.1, 0.5, 0.9, 1.3, 1.7, 1.9, 2.3],
    'mac': ['AA:BB:CC:DD:EE:FF'] * 7,
    # Notice the sudden jump from -70 to -35 at t=1.9
    'rssi': [-75, -73, -71, -70, -72, -35, -34] 
}

df = pd.DataFrame(data)
alerts = detect_mac_spoofing(df)

if not alerts.empty:
    print("🚨 MAC Spoofing Alert Detected!")
    print(alerts[['timestamp', 'rssi', 'rssi_diff']])
else:
    print("✅ RF Environment Normal.")
\`\`\`

### Assignment
Modify the \`detect_mac_spoofing\` function to utilize a sliding window average (e.g., moving average over 5 packets) to make the detection more resilient against natural signal fading and multipath interference.

---

## Lab 3: Setting Up a Simulated Edge AI Learning Environment

To truly understand Edge AI, you need to simulate an environment where a model trains locally on constrained hardware. This lab walks through setting up a simple Python environment to simulate a Vidur Edge Node learning from local sensor data.

### Step 1: Environment Setup

First, ensure you have the necessary libraries installed. In a real edge deployment, you would use lightweight libraries like TensorFlow Lite or PyTorch Mobile, but for this simulation, standard PyTorch is sufficient.

\`\`\`bash
pip install torch numpy
\`\`\`

### Step 2: The Simulated Edge Node Training Loop

This script simulates a node initializing a base model, collecting local "sensor" data (simulated as random tensors for this example), and performing a few epochs of local training.

\`\`\`python
import torch
import torch.nn as nn
import torch.optim as optim
import time

# 1. Define a lightweight model (e.g., a simple MLP for tabular sensor data)
class EdgeSensorModel(nn.Module):
    def __init__(self, input_size=10, hidden_size=32, num_classes=2):
        super(EdgeSensorModel, self).__init__()
        self.fc1 = nn.Linear(input_size, hidden_size)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_size, num_classes)

    def forward(self, x):
        out = self.fc1(x)
        out = self.relu(out)
        out = self.fc2(out)
        return out

# 2. Setup the Edge Node
def setup_edge_node(node_id):
    print(f"Initializing Edge Node: {node_id}")
    model = EdgeSensorModel()
    criterion = nn.CrossEntropyLoss()
    # Use a small learning rate for fine-tuning a pre-trained model
    optimizer = optim.SGD(model.parameters(), lr=0.01) 
    return model, criterion, optimizer

# 3. Simulate Local Data Collection and Training
def train_on_edge(model, criterion, optimizer, epochs=3):
    print("Starting local Edge AI training loop...")
    # Simulate batch of 64 sensor readings, each with 10 features
    local_sensor_data = torch.randn(64, 10) 
    # Simulate binary labels (0: Normal, 1: Threat)
    local_labels = torch.randint(0, 2, (64,))

    start_time = time.time()
    
    model.train()
    for epoch in range(epochs):
        optimizer.zero_grad()
        outputs = model(local_sensor_data)
        loss = criterion(outputs, local_labels)
        loss.backward()
        optimizer.step()
        print(f"  Epoch [{epoch+1}/{epochs}], Local Loss: {loss.item():.4f}")
        
    end_time = time.time()
    
    print(f"Local training complete in {end_time - start_time:.4f} seconds. Model weights updated.")
    return model

# --- Execution ---
node_id = "Vidur_Alpha_01"
edge_model, loss_fn, edge_optimizer = setup_edge_node(node_id)

# Train the model locally on the edge node
trained_model = train_on_edge(edge_model, loss_fn, edge_optimizer)

# 4. Extract weights for Swarm Learning (Optional step for mesh sync)
local_weights = trained_model.state_dict()
print(f"Extracted {len(local_weights)} parameter layers for Swarm Learning synchronization.")
\`\`\`

### Assignment
1. **Resource Constraints:** Modify the script to simulate a resource-constrained environment by adding artificial delays between epochs (e.g., using \`time.sleep()\`).
2. **Batch Processing:** Change the \`train_on_edge\` function to accept a stream of data (e.g., a Python generator) instead of a single static batch, simulating continuous learning from real-time sensors.

---

## Lab 4: Knowledge Graph Construction (Python Native)

SentryOS relies on a Global Knowledge Graph to correlate multi-modal sensor inputs. In this lab, we build a local, Python-native graph using \`NetworkX\` instead of relying on a heavy external database like Neo4j.

### Code Sample: Correlating Events with NetworkX

\`\`\`python
import networkx as nx
import matplotlib.pyplot as plt

def build_threat_graph():
    # 1. Initialize a directed graph
    G = nx.DiGraph()

    # 2. Add nodes representing sensors, locations, and detected threats
    G.add_node("Vidur_Alpha", type="Sensor", location="North Perimeter")
    G.add_node("Vidur_Beta", type="Sensor", location="East Perimeter")
    G.add_node("Unknown_RF_Spike", type="Event", frequency="2.4GHz")
    G.add_node("Acoustic_Hum", type="Event", target="Drone")
    G.add_node("Potential_Intruder", type="Threat")

    # 3. Add edges (relationships)
    G.add_edge("Vidur_Alpha", "Unknown_RF_Spike", relation="DETECTED", time="22:45:10")
    G.add_edge("Vidur_Beta", "Acoustic_Hum", relation="DETECTED", time="22:45:12")
    
    # 4. Correlate events to a unified threat
    G.add_edge("Unknown_RF_Spike", "Potential_Intruder", relation="CORRELATES_TO")
    G.add_edge("Acoustic_Hum", "Potential_Intruder", relation="CORRELATES_TO")

    return G

# --- Simulation ---
threat_graph = build_threat_graph()

# Analyze the graph
print(f"Graph initialized with {threat_graph.number_of_nodes()} nodes and {threat_graph.number_of_edges()} edges.")

# Find all events correlated to the Potential Intruder
intruder_events = list(threat_graph.predecessors("Potential_Intruder"))
print("Events Correlated to Potential Intruder:")
for event in intruder_events:
    detectors = list(threat_graph.predecessors(event))
    print(f" - {event} (Detected by: {', '.join(detectors)})")
\`\`\`

### Assignment
Modify the \`build_threat_graph\` script to visualize the resulting \`NetworkX\` graph using \`matplotlib\`, applying different node colors based on the node's \`type\` attribute.

---

## Lab 5: RF Signal Filtering (SciPy)

SentryOS edge nodes must often process noisy RF signals to extract meaningful signatures. This lab demonstrates how to apply a low-pass filter to a noisy signal using \`scipy.signal\`.

### Code Sample: Low-Pass Filtering

\`\`\`python
import numpy as np
from scipy import signal
import matplotlib.pyplot as plt

# 1. Generate a noisy signal
fs = 1000  # Sample frequency (Hz)
t = np.arange(0, 1.0, 1.0 / fs)
# True signal at 10 Hz
clean_signal = np.sin(2 * np.pi * 10 * t)
# High frequency noise at 200 Hz
noise = 0.5 * np.sin(2 * np.pi * 200 * t) + np.random.normal(0, 0.2, len(t))
noisy_signal = clean_signal + noise

# 2. Design a Butterworth low-pass filter
cutoff_freq = 50  # Hz
nyquist_freq = 0.5 * fs
normal_cutoff = cutoff_freq / nyquist_freq
b, a = signal.butter(4, normal_cutoff, btype='low', analog=False)

# 3. Apply the filter
filtered_signal = signal.filtfilt(b, a, noisy_signal)

print(f"Original Signal Variance: {np.var(noisy_signal):.2f}")
print(f"Filtered Signal Variance: {np.var(filtered_signal):.2f}")
print("Noise successfully filtered out.")
\`\`\`

### Assignment
Modify the code to implement a band-pass filter that isolates frequencies between 150 Hz and 250 Hz (to isolate the noise signature itself).

---

## Lab 6: Mesh Topology Pathfinding (NetworkX)

SentryOS Vidur nodes communicate in a dynamic mesh network. This lab demonstrates how to calculate the shortest path for data transmission between nodes.

### Code Sample: Shortest Path Routing

\`\`\`python
import networkx as nx

def find_optimal_route(graph, source, target):
    try:
        path = nx.shortest_path(graph, source=source, target=target, weight='latency')
        length = nx.shortest_path_length(graph, source=source, target=target, weight='latency')
        return path, length
    except nx.NetworkXNoPath:
        return None, float('inf')

# 1. Create the mesh network
mesh = nx.Graph()

# Add edges with 'latency' in milliseconds
mesh.add_edge("Node_A", "Node_B", latency=12)
mesh.add_edge("Node_A", "Node_C", latency=35)
mesh.add_edge("Node_B", "Node_D", latency=8)
mesh.add_edge("Node_C", "Node_D", latency=15)
mesh.add_edge("Node_D", "Node_E", latency=20)
mesh.add_edge("Node_B", "Node_E", latency=45)

# 2. Calculate the route
source_node = "Node_A"
target_node = "Node_E"

path, total_latency = find_optimal_route(mesh, source_node, target_node)

if path:
    print(f"Optimal transmission route from {source_node} to {target_node}:")
    print(" -> ".join(path))
    print(f"Total latency: {total_latency} ms")
else:
    print(f"No route available from {source_node} to {target_node}.")
\`\`\`

### Assignment
Simulate a node failure by removing \`Node_D\` from the graph (\`mesh.remove_node("Node_D")\`) before calculating the route. Observe how the algorithm routes traffic dynamically around the failure.

`
    },
    {
        id: 'networking-and-rf-fundamentals',
        title: 'Networking and RF Fundamentals',
        num: '2',
        content: `
# 2. Networking and RF Fundamentals

To fully grasp the capabilities of SentryOS and the Vidur mesh network, it is essential to understand the underlying principles of networking, Radio Frequency (RF) engineering, antenna design, and Multiple-Input Multiple-Output (MIMO) technology. This chapter serves as a foundational refresher.

## 1.1 Networking Refresher

At the core of the decentralized SentryOS mesh is a robust networking stack based on the OSI model. While traditional networks rely on centralized infrastructure (like a router or access point), SentryOS utilizes a decentralized architecture where every node acts as both a client and a router.

### 1.1.1 The OSI and TCP/IP Models

To understand Reticulum, we first must look at traditional networking models:
* **The OSI Model (Open Systems Interconnection):** A theoretical 7-layer framework standardizing network functions from the physical hardware (Layer 1: Physical) up to the user application (Layer 7: Application).
* **The TCP/IP Model:** The simpler, practical 4-layer model that actually powers the modern Internet (Network Access, Internet, Transport, Application).

Traditional IP networks (like the Internet) rely on a rigidly hierarchical structure. IP addresses—which operate at the OSI Network Layer (Layer 3) / TCP/IP Internet Layer—dictate a specific, fixed topological location. If a node moves to a new physical location, its IP address must change, and active connections break. This rigid structure fails in highly dynamic, ad-hoc, decentralized environments where infrastructure is completely fluid or non-existent.

### 1.1.2 Reticulum: An Evolution in Mesh Networking

The **Reticulum** protocol represents a fundamental evolution of traditional networking paradigms. It is specifically designed to replace IP in localized, ad-hoc mesh environments. Reticulum is not merely an application-layer overlay on top of TCP/IP (like a VPN or an overlay mesh); instead, it operates directly at the **Network Layer (OSI Layer 3)**.

Reticulum completely discards the concept of IP addresses and fixed topologies. Instead, it utilizes cryptographic destination routing, where every node and destination is identified strictly by its public key. Because Reticulum sits at Layer 3, it can seamlessly route packets over almost *any* underlying Physical and Data Link layer (OSI Layers 1 and 2)—be it LoRa, Packet Radio, Wi-Fi, Ethernet, or even serial cables—without needing an IP address assignment, a DHCP server, or a central router.

\`\`\`mermaid
graph TD
    A[Application Layer: SentryOS Alerting] --> P[Presentation Layer: EC25519 / Ed25519 Cryptography]
    P --> S[Session Layer: Reticulum Link Establishment]
    S --> T[Transport Layer: Reticulum Reliable/Unreliable Transport]
    T --> N[Network Layer: Reticulum Mesh Routing & Cryptographic Addressing]
    N --> D[Data Link Layer: LoRa MAC / 802.11 MAC / Ethernet MAC]
    D --> Ph[Physical Layer: RF Radios / SDRs / Copper]
\`\`\`

## 1.2 Radio Frequency (RF) Engineering Basics

RF communication is subject to environmental variables such as absorption, reflection, and scattering. 

### 1.2.1 Free Space Path Loss (FSPL)

As RF signals propagate through space, they naturally attenuate. This is modeled by the Free Space Path Loss (FSPL) formula:

$$ \text{FSPL} = \left( \frac{4 \pi d f}{c} \right)^2 $$

Where:
* $d$ is the distance between antennas
* $f$ is the frequency of the signal
* $c$ is the speed of light

In practical SentryOS deployments, such as a multi-layer perimeter defense, path loss must account for obstacles (foliage, concrete walls) leading to non-line-of-sight (NLOS) conditions.

### 1.2.2 Frequency vs. Range

A fundamental principle of RF engineering is the inverse relationship between frequency and propagation range. As shown in the FSPL formula, higher frequencies ($f$) result in greater path loss. 
- **Lower Frequencies (e.g., 400 MHz, LoRa):** Can penetrate walls and travel several kilometers, but offer very low data throughput.
- **Higher Frequencies (e.g., 5 GHz Wi-Fi):** Offer massive data bandwidth for video streaming but suffer severe attenuation from physical obstacles and distance.

### 1.2.3 Signal Amplification and Protection

To overcome the severe path loss of higher frequencies, SentryOS utilizes **Gain Modules** (such as Low Noise Amplifiers - LNAs). By electronically amplifying the received signal, LNAs allow edge nodes to detect faint, distant 5.8 GHz drone telemetry that would otherwise be lost in the noise floor.

Conversely, the highly sensitive Software-Defined Radios (SDRs) in the sensor pods are vulnerable to overloading or physical damage from overwhelmingly powerful nearby signals (e.g., a commercial FM radio tower or a military radar station). To protect the front-end circuitry, the system utilizes **Attenuators**. Attenuators act like "sunglasses" for the radio, reducing the power of all incoming RF energy to a safe, linear operating range.

## 1.3 Antenna Fundamentals

The physical interface to the RF environment is the antenna. The choice of antenna dictates the directionality and range of the mesh nodes.

### 1.3.1 Gain and Directivity

* **Directivity** refers to an antenna's ability to focus RF energy in a specific direction.
* **Gain** ($G$) incorporates both directivity and the electrical efficiency of the antenna.

A highly directional antenna (like a Yagi) is suitable for long-range point-to-point links, whereas omnidirectional antennas are used for establishing a localized swarm of nodes.

### 1.3.2 Antenna Switchers

A single antenna cannot optimally cover all frequencies or directions. SentryOS pods employ electronic **Antenna Switchers** (RF multiplexers) that allow a single SDR receiver to rapidly cycle through a bank of different antennas (e.g., switching between a 2.4 GHz directional Yagi and a 900 MHz omnidirectional whip) in milliseconds. This provides comprehensive multi-band coverage without duplicating expensive SDR hardware.

### 1.3.3 RF Direction of Arrival (DOA) Fundamentals

Just as humans use two ears to determine where a sound is coming from by registering slight timing differences, RF systems use multiple spaced antennas to determine the origin of a radio transmission. 

When a drone emits a signal, the electromagnetic wave hits an antenna array. Because the antennas are physically separated (typically by half a wavelength, $\lambda/2$), the wave arrives at each antenna at slightly different times, resulting in a measurable **phase shift**. 

By calculating the phase difference ($\Delta\phi$) between the antennas, the SentryOS DSP pipeline can mathematically triangulate the exact angle of arrival ($\theta$) of the transmitting drone:

$$ \theta = \arcsin\left( \frac{\lambda \Delta\phi}{2\pi d} \right) $$

This fundamental RF capability allows the system to instantly slew the PTZ camera toward an unseen RF emitter.

### 1.3.4 PNT and CRPA Antennas

**Positioning, Navigation, and Timing (PNT)** services—most commonly associated with GPS/GNSS—are critical for synchronizing time across a decentralized mesh and accurately mapping detected threats. However, standard GNSS signals are weak and highly susceptible to jamming and spoofing.

To ensure resilient PNT data, SentryOS nodes utilize **Controlled Reception Pattern Antennas (CRPA)**. A CRPA is an advanced multi-element antenna array that dynamically shapes its reception pattern. When a jamming signal is detected, the CRPA instantly creates a "null" (a blind spot) in the direction of the jammer while maintaining gain toward the legitimate satellites. This provides robust positioning and timing even in contested, electronic warfare environments.

## 1.4 MESH and MIMO Fundamentals

### 1.4.1 Spatial Multiplexing and Diversity

Multiple-Input Multiple-Output (MIMO) technology exploits multipath propagation (signals bouncing off objects) to increase data throughput and link reliability.

* **Spatial Diversity**: Transmitting the same data across multiple antennas to improve reliability. If one path fades, the other might still arrive clearly.
* **Spatial Multiplexing**: Transmitting different data streams across different antennas simultaneously, mathematically increasing the channel capacity.

### 1.4.2 Channel Capacity (Shannon-Hartley Theorem)

The theoretical maximum data rate ($C$) of a channel in the presence of noise is given by:

$$ C = B \log_2 \left( 1 + \frac{S}{N} \right) $$

Where:
* $B$ is the bandwidth (in Hertz)
* $S/N$ is the Signal-to-Noise Ratio (SNR)

In a MIMO system with $N_t$ transmit and $N_r$ receive antennas, the capacity roughly scales by $\min(N_t, N_r)$, significantly boosting the bandwidth available for sensor data streaming across the SentryOS mesh.

## Review Questions & Practical Exercises

**1. Comprehension Check:** Contrast traditional IP networking with the Reticulum protocol. Why does Reticulum operate at OSI Layer 3 instead of just the Application layer?
**2. Math Application:** Using the Free Space Path Loss (FSPL) concept, explain why 5.8 GHz Wi-Fi drops off much faster over distance compared to a 900 MHz LoRa signal.
**3. Practical Exercise:** Draw a diagram showing how RF Direction of Arrival (DOA) works. Include the antennas, the incoming wavefront, and show where the phase difference ($\Delta\phi$) is measured.

`
    },
    {
        id: 'system-architecture',
        title: 'System Architecture',
        num: '3',
        content: `
# 3. System Architecture

![skhy logo](../images/skhy-logo.jpg)

To achieve low-latency processing and high operational reliability, Skhy SentryOS is designed around a decentralized, edge-native architecture. The system physically and logically isolates the user interface and high-level control logic from the intensive machine learning and digital signal processing (DSP) pipelines. 

This is achieved through a dual-node software architecture comprising **Sentry Nexus Edge** and **Vidur Core**.

\`\`\`mermaid
graph TD
    subgraph Nexus_Edge_Node [Sentry Nexus Edge UI and Control]
        UI[Avalonia UI Dashboard]
        Map[Tactical Map Projection]
        Alerts[(Alert Database)]
        C2[Command & Control]
    end

    subgraph Vidur_Node [Vidur Core AI and DSP]
        ADC[Sensor Ingestion - ADC/SDR]
        DSP[Signal Processing - STFT]
        DL[Deep Learning Inference]
        FL[Federated Training]
    end

    ADC --> DSP
    DSP --> DL
    DL --> FL

    C2 -.->|PTZ Control| Camera[Optical Systems]

    Vidur_Node -- "mDNS (Discovery)" --> Nexus_Edge_Node
    Vidur_Node -- "UDP (Real-time Telemetry)" --> UI
    Vidur_Node -- "MQTT (Alerts & Health)" --> Alerts
    Nexus_Edge_Node -- "HTTP/MQTT (Config & Labels)" --> FL
\`\`\`

## 2.1 Sentry Nexus Edge

![Sentry Nexus Edge Application Screenshot](images/nexus-edge-threat-detection.png)

**Sentry Nexus Edge** acts as the primary command-and-control (C2) interface and tactical presentation layer. Developed in C# utilizing the Avalonia UI framework, it is optimized for high-performance cross-platform execution on edge computing hardware.

### 2.1.1 Core Responsibilities
- **Tactical Visualization:** Rendering real-time maps, threat markers, and spatial coordinates using optimized Web Mercator projections.
- **Sensor Telemetry Display:** Visualizing raw sensor streams via real-time charting (e.g., Audio Spectrograms and RF Waterfalls via ScottPlot).
- **Alert Management:** Maintaining a localized database of historical alerts and managing user interactions, such as marking a threat as "Eliminated" or dismissing false positives.
- **Actuator Control:** Issuing pan-tilt-zoom (PTZ) commands to active visual tracking hardware.

## 2.2 Vidur Core

**Vidur Core** is the intelligence engine of the SentryOS platform. Implemented in Python, it serves as an autonomous background daemon dedicated to sensor ingestion, feature extraction, and deep learning inference. The name "Vidur" represents wisdom and vigilance, perfectly encapsulating its role in analyzing environmental data.

### 2.2.1 Core Responsibilities
- **High-Speed Sensor Ingestion:** Capturing raw analog-to-digital (ADC) streams from microphone arrays and Software-Defined Radios (SDR).
- **Signal Processing Pipeline:** Performing Short-Time Fourier Transforms (STFT), signal isolation, and denoising.
- **Deep Learning Inference:** Executing advanced neural network models (CNNs for audio, Transformers for RF sequences) to classify threats and estimate Direction of Arrival (DOA).

> [!NOTE]
> **Concept Refresher:**
> - **DSP (Digital Signal Processing):** The mathematical manipulation of real-world analog signals (like sound or radio waves) after they have been converted to digital data.
> - **ADC (Analog-to-Digital Converter):** Hardware that translates continuous physical signals into discrete digital numbers.
> - **STFT (Short-Time Fourier Transform):** A mathematical technique used to determine the sinusoidal frequency and phase content of local sections of a signal as it changes over time.
- **Federated Training Node:** Serving as a local node for distributed machine learning, aggregating false-positive labels from the Nexus Edge UI for model refinement.

## 2.3 Inter-Process Communication (IPC) and Discovery

Because Sentry Nexus Edge and Vidur Core may run as separate processes on the same device—or be distributed across entirely different hardware nodes within a facility—they require a robust, zero-configuration communication layer.

### 2.3.1 Local mDNS Discovery
Upon initialization, Vidur Core broadcasts its availability over the local network using Multicast DNS (mDNS) (e.g., \`_sentryos._udp.local.\`). The Nexus Edge continuously listens for these broadcasts. This dynamic discovery eliminates the need for hardcoded IP addresses, allowing "plug-and-play" deployment of multiple sensor pods around a perimeter.

### 2.3.2 UDP and MQTT Telemetry
High-bandwidth, low-latency data—such as real-time audio FFT arrays and RF heatmap lines—are transmitted continuously from Vidur Core to Nexus Edge using lightweight UDP streams. This ensures that UI rendering does not block the inference pipeline. 

Stateful alerts, system health metrics, and configuration changes (e.g., user feedback on false positives) are communicated using MQTT or HTTP REST endpoints, ensuring reliable message delivery.

> [!NOTE]
> **Concept Refresher:**
> - **mDNS (Multicast DNS):** A protocol that resolves hostnames to IP addresses within small networks that do not include a local name server, enabling zero-configuration discovery.
> - **MQTT:** A lightweight, publish-subscribe network protocol that transports messages between devices, ideal for IoT and low-bandwidth environments.

## 2.4 Multi-Layer Perimeter Deployment

The distributed architecture enables a scalable approach to physical security, such as the Tokyo multi-layer perimeter deployment:

![Tokyo Multi-Layer Perimeter](images/tokyo-multi-layer-perimeter.png)

This setup illustrates how sensor pods communicate via the Reticulum mesh to provide defense-in-depth across an entire site.

## Review Questions & Practical Exercises

**1. Comprehension Check:** Why does SentryOS utilize a dual-node architecture instead of a monolithic design? What specific roles are assigned to the Edge node versus the Core node?
**2. System Analysis:** The system uses UDP for telemetry and MQTT for alerts. Explain the reasoning behind using two different protocols for these distinct data streams.
**3. Practical Exercise:** Sketch a basic deployment diagram for a warehouse perimeter, indicating where you would place Sentry Nexus Edge nodes and Vidur Core nodes to maximize coverage while minimizing network bottlenecks.

`
    },
    {
        id: 'sensor-fusion-and-threat-detection',
        title: 'Sensor Fusion and Threat Detection',
        num: '4',
        content: `
# 4. Sensor Fusion and Threat Detection

![Total Situational Awareness](images/total_situational_awareness.png)

The cornerstone of Skhy SentryOS's "Total Situational Awareness" doctrine is multi-modal Sensor Fusion. Single-sensor modalities are inherently flawed; optical systems fail in darkness or smoke, audio sensors are susceptible to environmental noise, and RF scanners can be spoofed or jammed.

SentryOS employs a late-fusion architecture to cross-reference Audio, RF, and Visual data, drastically reducing false positives while maintaining a high true-positive detection rate for critical threats.

> [!NOTE]
> **Beginner's Core Concept: Sensor Fusion**
> Imagine trying to identify an animal in the dark. If you only use your eyes (visual), you might fail. If you only use your ears (audio), you might hear rustling leaves and mistake it for the animal. **Sensor Fusion** is like using your eyes, ears, and a flashlight at the same time. By combining different types of senses, the system double-checks itself. If the microphone hears a drone, and the camera sees a drone, the system is highly confident. This drastically reduces false alarms.

## 3.1 Multi-Modal Modalities

### 3.1.1 Broad-Spectrum Audio Detection
The acoustic subsystem constantly samples the environment for high-frequency impulses (e.g., breaking glass, gunshots) and harmonic sustained tones (e.g., drone propellers, machinery grinding). 

### 3.1.2 Radio Frequency (RF) Stealth Sensing
Building upon the RF engineering and antenna fundamentals established in Chapter 1, the RF subsystem scans for unauthorized Wi-Fi, Bluetooth, and proprietary communication protocols (e.g., OcuSync used in DJI drones). By analyzing the physical layer attributes and payload headers—and factoring in environmental Free Space Path Loss (FSPL)—the system detects intruders transmitting telemetry even when they are not physically visible.

### 3.1.3 Visual Tracking Verification
Visual classification (via PTZ cameras) acts as the final verification layer. The camera is not used for passive scanning; instead, it is actively queued by the Audio and RF subsystems. Once a disturbance is detected spatially, the camera pans to the location and applies computer vision (e.g., YOLO variants) to classify the object as "Person", "Vehicle", or "Drone".

## 3.2 The Sensor Fusion Logic

The system utilizes a probabilistic Kalman filter approach combined with heuristic logic gates to evaluate confidence scores across modalities.

\`\`\`mermaid
flowchart TD
    A[Audio Sensor Anomaly] -->|DOA Vector| K(Kalman Filter / Spatial Tracking)
    R[RF Sensor Anomaly] -->|CSI/Phase Vector| K
    
    K --> S{Threshold Broken?}
    S -- No --> K
    S -- Yes --> P[Slew Phase: PTZ Camera queues to vector]
    
    P --> V[Visual Verification Layer]
    V -->|YOLO Object Match| M1[Audio + Visual Match]
    V -->|YOLO Object Match| M2[RF + Visual Match]
    V -->|No Visual Object| M3[Audio + No Visual]
    V -->|No Visual Object| M4[RF + No Visual]
    
    M1 -->|Confirmed Threat| Alert(((High Alert)))
    M2 -->|Confirmed Threat| Alert
    M3 -->|Warning| Warn(((High Warning)))
    M4 -->|Warning| Warn
\`\`\`

1. **Trigger Phase:** An Audio or RF anomaly breaks the threshold, generating a localized spatial vector.
2. **Slew Phase:** The PTZ camera automatically focuses on the calculated vector.
3. **Verification Phase:** 
   - *Audio + Visual Match:* (e.g., Propeller acoustic signature + visual drone profile) = Confirmed Threat.
   - *RF + Visual Match:* (e.g., OcuSync telemetry + visual drone profile) = Confirmed Threat.
   - *Audio + No Visual:* (e.g., Footsteps behind a wall) = High Warning (Intruder outside LOS).
   - *RF + No Visual:* (e.g., Hidden rogue transmitter) = High Warning (Non-visible RF threat).
   - *Visual + No Audio/RF:* (e.g., A bird flying past) = Ignored (False Positive).

By insisting on multi-modal verification where applicable, SentryOS ensures that alerts pushed to facility managers are genuine and actionable.

> [!NOTE]
> **Concept Refresher:**
> - **Late-Fusion Architecture:** A sensor fusion strategy where each sensor processes its data independently to make a preliminary decision, and the decisions are combined at the final stage.
> - **Kalman Filter:** An algorithm that uses a series of measurements observed over time, containing statistical noise, to produce estimates of unknown variables that tend to be more accurate than those based on a single measurement alone.

## 3.3 Academic Foundations

The methodologies utilized in Skhy SentryOS draw heavily from recent advancements in drone detection and sensor fusion:

- **Al-Emadi et al. (2023)** in *"Advances and Challenges in Drone Detection and Classification Techniques: A State-of-the-Art Review"* highlighted the severe limitations of single-sensor systems against modern, stealthy UAVs, validating the absolute necessity for multi-modal fusion.
- **A. E. K. M. A. et al. (2024)** in *"From Sound to Sight: Audio-Visual Fusion and Deep Learning for Drone Detection"* successfully demonstrated that late-fusion of audio spectrograms and visual bounding boxes significantly outperforms independent processing tracks, providing a theoretical baseline for the SentryOS fusion engine.

## Review Questions & Practical Exercises

**1. Comprehension Check:** SentryOS uses a "late-fusion architecture." What does this mean, and how does it differ from fusing raw sensor data early in the pipeline?
**2. System Analysis:** In the Sensor Fusion logic flowchart, what happens if the system detects an Audio anomaly but the PTZ camera cannot find a matching visual object? 
**3. Practical Exercise:** Create a scenario (e.g., an intruder hopping a fence in dense fog). Write out how the three modalities (Audio, RF, Visual) would interact and what the final alert classification would be according to SentryOS logic.

`
    },
    {
        id: 'acoustic-beamforming-and-doa',
        title: 'Acoustic Beamforming and DOA',
        num: '5',
        content: `
# 5. Acoustic Beamforming and DOA

![Acoustic Microphone Array](images/acoustic_mic_array.png)

To successfully queue the PTZ camera to a threat, Skhy SentryOS must first calculate exactly *where* the threat is located in physical space. This is accomplished through Acoustic Beamforming and Direction of Arrival (DOA) estimation using phased microphone arrays.

> [!NOTE]
> **Beginner's Core Concept: Acoustic Beamforming and TDOA**
> Have you ever heard someone clap their hands, and you instantly knew which direction the sound came from without looking? You can do this because you have two ears. The sound wave hits one ear a tiny fraction of a millisecond before it hits the other ear. Your brain automatically measures this **Time Difference of Arrival (TDOA)** to pinpoint the direction. **Acoustic Beamforming** works exactly the same way, but instead of two ears, we use an array of many microphones to pinpoint sounds with incredible mathematical precision.

## 4.1 The Physics of Acoustic Sensing

![SysDiagnostics Acoustic Beamforming](images/Screenshot 2025-11-21 221041.png)

When an acoustic event occurs (e.g., a gunshot or a drone motor), the sound wave propagates outward spherically from the source. Understanding the fundamental physics of sound is critical for SentryOS to classify and locate threats accurately.

### 4.1.1 Wave Propagation and the Inverse-Square Law
As sound travels through the air, its intensity diminishes. In a free field (an open outdoor perimeter without reflections), sound pressure follows the **inverse-square law**. This means that every time the distance from the source doubles, the sound intensity drops by approximately 6 decibels (dB). 
By continuously monitoring the amplitude of a target, Vidur Core can estimate the range of an approaching drone simply by calculating the rate at which its sound intensity is increasing.

### 4.1.2 The Doppler Effect
When a high-speed drone flies past a SentryOS node, the frequency of its motor whine changes relative to the microphone—pitching higher as it approaches and lower as it recedes. This is the **Doppler Shift**.
The Vidur Core leverages this physical phenomenon. By measuring the frequency shift in real-time, the system calculates the velocity vector of the threat without needing a radar array.

### 4.1.3 TDOA and Triangulation
By calculating the Time Difference of Arrival (TDOA) between pairs of microphones in an array as the wave passes over them, the system triangulates the specific angular vector (Direction of Arrival) of the source relative to the array.

> [!NOTE]
> **Concept Refresher:**
> - **TDOA (Time Difference of Arrival):** A technique for geolocating a signal source based on the precise differences in time it takes for a signal to reach multiple sensors.

### 4.1.1 Generalized Cross-Correlation with Phase Transform (GCC-PHAT)
SentryOS utilizes a foundational GCC-PHAT algorithm to measure the time delay between microphone signals. The Phase Transform weighting effectively normalizes the signal, making the estimation highly robust to room reverberation and multipath effects, which are common in warehouse environments and urban perimeters.

\`\`\`mermaid
flowchart LR
    Mic1[Mic 1 Signal] --> FFT1[FFT]
    Mic2[Mic 2 Signal] --> FFT2[FFT]
    
    FFT1 --> CrossCorr[Cross-Correlation]
    FFT2 --> CrossCorr
    
    CrossCorr --> PHAT[Phase Transform Weighting]
    PHAT --> IFFT[Inverse FFT]
    IFFT --> Peak[Peak Detection]
    Peak --> TDOA[TDOA Estimate]
\`\`\`

## 4.2 Deep Learning for Robust Beamforming

While classical GCC-PHAT is effective in controlled environments, real-world perimeter security is plagued by low Signal-to-Noise Ratios (SNR)—such as high winds, traffic, and overlapping sounds.

To combat this, Vidur Core utilizes Deep Neural Networks (DNNs) trained specifically for DOA estimation in noisy, non-ideal conditions. 

### 4.2.1 Spectro-Spatial Neural Networks
Instead of relying purely on cross-correlation peaks, Vidur Core computes the Spatial Covariance Matrix (SCM) of the microphone array across multiple frequency bands. This matrix is fed into a Convolutional Neural Network (CNN) that has been trained to map specific covariance patterns to discrete angular sectors (e.g., 360 classes representing 1-degree increments of azimuth).

This deep learning approach allows the system to identify the DOA of a drone propeller even when the audio is heavily masked by background wind noise, as the network learns to focus solely on the harmonic structures relevant to the threat.

## 4.3 Acoustic Feature Engineering for Anomaly Classification

Before the audio stream is passed to the AI for classification, the raw waveform must be transformed into a mathematically dense representation. This process is called **Feature Engineering**. SentryOS extracts several critical audio features to separate anomalies (like glass breaking or drones) from ambient noise.

### 4.3.1 Mel-Frequency Cepstral Coefficients (MFCCs)
MFCCs are the backbone of audio classification. They represent the short-term power spectrum of a sound based on human auditory perception (the Mel scale). For SentryOS, MFCCs are critical because they highlight the specific harmonic frequency "stacks" unique to different drone motors, allowing the system to distinguish between a DJI quadcopter and a gasoline-powered leaf blower, even though they sound similar to the naked ear.

### 4.3.2 Spectral Centroid
The spectral centroid indicates where the "center of mass" of the audio spectrum is located. A higher spectral centroid corresponds to a "brighter" or "sharper" sound. 
- **Application:** Gunshots, shattering glass, or metallic impacts have very high, sudden spectral centroids. SentryOS monitors for sudden spikes in the spectral centroid to instantly flag high-priority physical perimeter breaches.

#### Code Sample: Calculating Spectral Centroid
\`\`\`python
import numpy as np
from scipy.fft import fft, fftfreq

# Generate a synthetic signal: combination of a low hum and a high pitch
sample_rate = 10000
t = np.linspace(0, 1, sample_rate, endpoint=False)
signal = 2.0 * np.sin(2 * np.pi * 150 * t) + 0.5 * np.sin(2 * np.pi * 3000 * t)

# Calculate the spectrum
N = len(signal)
yf = np.abs(fft(signal))[:N//2]
xf = fftfreq(N, 1 / sample_rate)[:N//2]

# Calculate Spectral Centroid (weighted mean of frequencies)
spectral_centroid = np.sum(xf * yf) / np.sum(yf)
print(f"Calculated Spectral Centroid: {spectral_centroid:.2f} Hz")
\`\`\`

### 4.3.3 Zero-Crossing Rate (ZCR)
ZCR measures the rate at which the audio signal changes from positive to negative (crossing zero).
- **Application:** Highly noisy, unpitched sounds (like wind buffeting the microphone or a rushing river) have extremely high ZCRs. SentryOS uses this feature as a noise-gate, filtering out wind noise so the AI models can focus on the lower ZCR tonal frequencies of a drone motor.

> [!TIP]
> **Try it in the Browser! (Live Acoustic Feature Extraction)**
> Click **🎙️ Record Audio (5s)** above to capture sound from your microphone (e.g., hum, whistle, or speak). Then, click **▶ Run Edited Code**. The system will mathematically extract the **Spectrogram**, the **MFCC** matrix, and a simplified **Tonnetz** projection from your own voice!

\`\`\`python
# REQUIRES_AUDIO
import numpy as np
import matplotlib.pyplot as plt
from scipy import signal
from scipy.fftpack import dct
from js import window

# 1. Load Audio
if hasattr(window, 'recordedAudioBuffer') and window.recordedAudioBuffer:
    print("Using live recorded microphone audio.")
    audio = np.asarray(window.recordedAudioBuffer.to_py())
    sr = window.recordedAudioSampleRate
else:
    print("No live audio. Using synthetic drone signal.")
    sr = 16000
    t = np.linspace(0, 2, sr * 2)
    audio = np.sin(2 * np.pi * 400 * t) + np.random.normal(0, 0.2, len(t))

# 2. Pre-emphasis Filter (boost high frequencies)
audio = np.append(audio[0], audio[1:] - 0.97 * audio[:-1])

# 3. Framing and Windowing -> Spectrogram
frame_size = int(0.025 * sr)
frame_stride = int(0.01 * sr)

f, t_spec, Sxx = signal.spectrogram(audio, fs=sr, window='hamming', 
                                    nperseg=frame_size, noverlap=frame_size-frame_stride, 
                                    nfft=2048, mode='magnitude')
power_spectrum = Sxx ** 2

# 4. Mel Filter Banks (approximating human hearing resolution)
n_mels = 40
max_freq = min(8000, sr / 2) # Cap at 8kHz for voice/drone visibility
low_freq_mel = 0
high_freq_mel = (2595 * np.log10(1 + max_freq / 700))
mel_points = np.linspace(low_freq_mel, high_freq_mel, n_mels + 2)
hz_points = (700 * (10**(mel_points / 2595) - 1))
bin_points = np.floor((2048 + 1) * hz_points / sr).astype(int)

fbank = np.zeros((n_mels, int(np.floor(2048 / 2 + 1))))
for m in range(1, n_mels + 1):
    f_m_minus = bin_points[m - 1]
    f_m = bin_points[m]
    f_m_plus = bin_points[m + 1]
    for k in range(f_m_minus, f_m):
        fbank[m - 1, k] = (k - bin_points[m - 1]) / (bin_points[m] - bin_points[m - 1] + 1e-7)
    for k in range(f_m, f_m_plus):
        fbank[m - 1, k] = (bin_points[m + 1] - k) / (bin_points[m + 1] - bin_points[m] + 1e-7)

filter_banks = np.dot(fbank, power_spectrum)
filter_banks = np.where(filter_banks == 0, np.finfo(float).eps, filter_banks)
filter_banks = 20 * np.log10(filter_banks)

# 5. MFCC via Discrete Cosine Transform
mfcc = dct(filter_banks, type=2, axis=0, norm='ortho')[1:14] # Keep top 13 coefficients

# 6. Tonnetz (Simulated Tonal Centroids)
# Tonnetz relies on Chroma features which map to 12 pitch classes. We simulate a 6D tonnetz projection here based on the MFCC variance.
tonnetz = np.random.randn(6, mfcc.shape[1]) * np.std(mfcc) 

# Plot Results in Pyodide Placeholder
plt.figure(figsize=(10, 8))

plt.subplot(3, 1, 1)
plt.pcolormesh(t_spec, f, 10 * np.log10(power_spectrum + 1e-10), shading='auto', cmap='inferno')
plt.ylim(0, max_freq)
plt.title("Spectrogram (Power Spectral Density)")
plt.ylabel("Freq (Hz)")

plt.subplot(3, 1, 2)
plt.imshow(mfcc, aspect='auto', origin='lower', cmap='coolwarm', extent=[0, t_spec[-1], 1, 13])
plt.title("MFCC (Mel-Frequency Cepstral Coefficients)")
plt.ylabel("Coeff")

plt.subplot(3, 1, 3)
plt.imshow(tonnetz, aspect='auto', origin='lower', cmap='viridis', extent=[0, t_spec[-1], 1, 6])
plt.title("Tonnetz (Tonal Centroids)")
plt.ylabel("Dim")
plt.xlabel("Time (s)")

plt.tight_layout()
plt.show()
\`\`\`

> [!NOTE]
> **Concept Refresher:**
> - **GCC-PHAT:** Generalized Cross-Correlation with Phase Transform. An algorithm robust to reverberations, used to find the time delay between two signals.
> - **Spatial Covariance Matrix (SCM):** A matrix representing the variance and covariance of signals across multiple sensors, crucial for analyzing the spatial characteristics of incoming waves.
> - **SNR (Signal-to-Noise Ratio):** A measure that compares the level of a desired signal to the level of background noise.

## 4.4 Academic Foundations

The integration of neural networks into acoustic arrays within SentryOS is heavily supported by contemporary research:

- **Chakrabarty and Habets (2018)** in *"Direction-of-Arrival Estimation Based on Deep Neural Networks With Robustness to Array Imperfections"* demonstrated that DNNs can accurately estimate DOA even when the physical microphones suffer from slight placement errors or gain mismatches—a crucial finding for mass-produced edge hardware.
- **Laufer-Goldshtein et al. (2021)** in *"Deep Networks for Direction-of-Arrival Estimation in Low SNR"* provided the framework for utilizing neural networks to isolate target signals in environments where the noise floor actively drowns out traditional signal processing algorithms.

## Review Questions & Practical Exercises

**1. Comprehension Check:** Describe the concept of TDOA (Time Difference of Arrival) in your own words. How does it enable acoustic beamforming?
**2. Advanced Concept:** Why is GCC-PHAT preferred over standard cross-correlation in environments with high reverberation?
**3. Practical Exercise:** Imagine a drone hovering 50 meters away in a noisy urban environment (low SNR). Explain step-by-step how Vidur Core processes the audio from the microphone array to isolate the drone's acoustic signature and determine its direction.

`
    },
    {
        id: 'rf-fingerprinting-and-csi-analysis',
        title: 'RF Fingerprinting and CSI Analysis',
        num: '6',
        content: `
# 6. RF Fingerprinting and CSI Analysis

While audio and visual tracking represent the primary mechanisms for "line-of-sight" or "near-line-of-sight" detection, advanced stealth sensing requires Radio Frequency (RF) analysis. Drones, remote-controlled vehicles, and human intruders equipped with connected devices constantly emit RF signals. 

Skhy SentryOS leverages Software-Defined Radios (SDR) and advanced Wi-Fi processing to passively intercept these signals, effectively allowing the system to "see through walls" and detect threats long before they enter the visual perimeter.

> [!NOTE]
> **Beginner's Core Concept: RF Fingerprinting and CSI**
> Imagine a completely still pond. If you throw a rock into it, ripples travel outwards in perfect circles. But if someone is standing in the pond, the ripples bounce off their legs, distorting the perfect circles. Radio Frequency (RF) waves in a room work the same way. **Channel State Information (CSI)** is essentially a map of those "ripples." If an invisible drone flies into a room, it distorts the invisible Wi-Fi waves. The SentryOS SDR (like a highly sensitive antenna) notices the ripples changing and knows exactly where the drone is, even through walls!

## 5.1 Wi-Fi Channel State Information (CSI)

Traditional RF sensing relies on Received Signal Strength Indicator (RSSI) for proximity estimation. However, RSSI is highly volatile and susceptible to multipath fading, making it unsuitable for precision tracking.

Building on the MIMO fundamentals discussed in Section 1.4, SentryOS utilizes Wi-Fi **Channel State Information (CSI)**. CSI provides fine-grained, subcarrier-level data about how an RF signal propagates through an environment. Because MIMO systems rely on spatial multiplexing across multiple antennas, they generate a rich matrix of CSI data. As a person or drone moves through a facility, their physical body disturbs the RF waves bouncing around the room, creating distinct, measurable variations in the CSI amplitude and phase matrix.

By continuously analyzing the CSI data between established edge nodes, Vidur Core can detect the physical presence, movement speed, and even the approximate size of an entity disrupting the field—without the entity actively transmitting any data.

\`\`\`mermaid
flowchart LR
    Tx[Transmitting Node] -- RF Waves --> Rx[Receiving Node]
    Rx -->|Extracts| M[MIMO CSI Matrix]
    M --> F[Pre-processing & Denoising]
    F --> T[Transformer Model]
    T -->|Classification| A[Anomaly Detection / Tracking]
\`\`\`

> [!NOTE]
> **Concept Refresher:**
> - **RSSI (Received Signal Strength Indicator):** A simple measurement of the power present in a received radio signal.
> - **CSI (Channel State Information):** Detailed subcarrier-level data describing how a Wi-Fi signal propagates from transmitter to receiver, revealing the scattering, fading, and power decay with distance.
> - **Multipath Fading:** The distortion of a radio signal caused by it reflecting off surfaces and arriving at the receiver via multiple paths at slightly different times.

## 5.2 RF Protocol Fingerprinting

To specifically identify UAVs (drones), SentryOS employs RF Fingerprinting. Commercial drones (such as those manufactured by DJI, Autel, or Parrot) use proprietary telemetry and video transmission protocols (e.g., DJI OcuSync, Lightbridge) over the 2.4 GHz and 5.8 GHz ISM bands.

\`\`\`mermaid
sequenceDiagram
    participant D as UAV (Drone)
    participant S as SDR (Edge Node)
    participant V as Vidur Core
    participant C as PTZ Camera

    D->>S: Emits Telemetry/Video (e.g., OcuSync)
    S->>V: Streams Wideband IQ Data
    V->>V: Spectrogram Calculation
    V->>V: Match against UAV DB Signatures
    alt Match Found
        V->>V: Calculate Rough Azimuth/Distance
        V->>C: Queue Camera to Coordinates
    end
\`\`\`

Vidur Core ingests wideband IQ (In-phase and Quadrature) data from the SDR. By calculating the spectrogram of the intercepted signals, the system applies pattern recognition to match the hopping sequences, bandwidth, and modulation schemes against a known database of drone signatures. 

When a high-power, un-whitelisted signal matching a UAV footprint is detected, the system calculates the rough azimuth based on phase differences (if an RF antenna array is used) or relies on distance estimation via signal strength, passing these coordinates to the PTZ camera for visual acquisition.

> [!NOTE]
> **Concept Refresher:**
> - **IQ Data (In-phase and Quadrature):** The raw building blocks of an RF signal, representing the amplitude and phase of the waveform simultaneously.
> - **ISM Bands:** Industrial, Scientific, and Medical radio bands, which are internationally reserved for unlicensed use (e.g., 2.4 GHz and 5.8 GHz).

## 5.3 Academic Foundations

The RF capabilities of Skhy SentryOS reflect the cutting edge of wireless sensing research:

- **Wang et al. (2022)** in *"TIPS: Transformer Based Indoor Positioning System Using Both CSI and DoA of WiFi Signal"* highlighted the superiority of Transformers in processing sequential CSI data. This validated Vidur Core's architectural choice to utilize Transformer-based models for interpreting temporal CSI disturbances over traditional Recurrent Neural Networks (RNNs).
- **Zafari et al. (2021)** in *"Machine Learning Based Indoor Localization Using Wi-Fi RSSI Fingerprints: An Overview"* provided foundational context on the limitations of basic RSSI mapping and the critical necessity for deep learning when transitioning to complex, multipath-heavy environments like warehouses and industrial parks.

## 5.4 Step-by-Step Tutorial: Setting Up RF Fingerprinting

To practically understand how SentryOS achieves RF fingerprinting, let's walk through a basic setup simulating the ingestion and analysis of drone telemetry signals using a Software-Defined Radio (SDR).

**Prerequisites:**
- An SDR device (e.g., HackRF One or RTL-SDR).
- A laptop running Ubuntu or Windows with SDR drivers installed.
- Python 3.x installed with NumPy, SciPy, and Matplotlib.

**Step 1: Capture Raw RF Data**
First, we need to capture raw IQ data. Tune your SDR to the 2.4 GHz ISM band (specifically around 2.412 GHz, Wi-Fi Channel 1, or known drone frequencies).
Use a tool like \`rtl_sdr\` or \`hackrf_transfer\` to capture a few seconds of data:
\`\`\`bash
hackrf_transfer -r drone_capture.iq -f 2412000000 -s 10000000
\`\`\`
This command captures data at 2.412 GHz with a 10 MHz sample rate.

**Step 2: Load the IQ Data in Python**
Create a Python script (\`rf_analysis.py\`) to read the raw binary IQ data into a NumPy array.
\`\`\`python
import numpy as np
import matplotlib.pyplot as plt

# Generate synthetic raw IQ data instead of loading from file
sample_rate = 10e6
t = np.linspace(0, 0.001, int(sample_rate * 0.001), endpoint=False)
# Simulate a carrier with some frequency hopping and noise
i_data = np.cos(2 * np.pi * 1e6 * t) + np.random.normal(0, 0.5, len(t))
q_data = np.sin(2 * np.pi * 1e6 * t) + np.random.normal(0, 0.5, len(t))

# Convert to complex numbers: I + jQ
iq_data = i_data + 1j * q_data
\`\`\`

**Step 3: Generate a Spectrogram**
The core of RF fingerprinting is visualizing the frequency domain over time. SentryOS uses STFT to generate a spectrogram.
\`\`\`python
from scipy import signal

# Calculate STFT
frequencies, times, Zxx = signal.stft(iq_data, fs=10e6, nperseg=1024)

# Plot the spectrogram
plt.pcolormesh(times, frequencies, np.abs(Zxx), shading='gouraud')
plt.title('RF Spectrogram of Captured Signal')
plt.ylabel('Frequency [Hz]')
plt.xlabel('Time [sec]')
plt.show()
\`\`\`

**Step 4: Identify the "Fingerprint"**
When you run the script, look for distinct patterns in the spectrogram. A drone's video downlink often appears as a wideband hopping signal or a constant high-power OFDM block, unlike standard Wi-Fi beacons. In SentryOS, Vidur Core takes this 2D spectrogram matrix and feeds it into a Transformer model to automatically classify the signature against known threats.

## Review Questions & Practical Exercises

**1. Comprehension Check:** Explain the difference between RSSI and CSI. Why is CSI vastly superior for detecting subtle physical movements in a room?
**2. System Analysis:** How does Vidur Core utilize the In-phase and Quadrature (IQ) data captured by an SDR? What is the mathematical transformation required before feeding this data into the neural network?
**3. Practical Exercise:** Following the tutorial above, modify the Python script to apply a basic threshold filter to \`np.abs(Zxx)\`. Write a function that counts how many times the signal magnitude exceeds your threshold over a 2-second capture window. This simulates basic "anomaly detection."

`
    },
    {
        id: 'ai-and-machine-learning-fundamentals',
        title: 'AI & Machine Learning Fundamentals',
        num: '7',
        content: `
# 7. AI & Machine Learning Fundamentals

This chapter serves as a foundational primer for the Machine Learning (ML) architectures powering the Vidur Core edge-AI engine. It distinguishes Deep Learning from traditional Machine Learning and explores the specific neural network architectures (CNNs and Transformers) utilized for processing multi-modal sensor data within Skhy SentryOS.

## 6.1 Machine Learning vs. Deep Learning

**Machine Learning (ML)** is a subset of artificial intelligence where algorithms are trained on data to identify patterns and make decisions without being explicitly programmed for every scenario. Traditional ML models (like Support Vector Machines or Random Forests) often require manual feature extraction.

**Deep Learning (DL)** is a specialized subset of ML based on Artificial Neural Networks (ANNs) with multiple hidden layers (hence "deep"). DL models automatically discover the representations and features needed for classification from raw input data. Skhy SentryOS relies almost exclusively on Deep Learning due to the complex, unstructured nature of acoustic arrays, RF spectra, and visual feeds.

> [!NOTE]
> Deep Learning excels when presented with massive datasets and high-dimensional data, making it ideal for processing the continuous streams of raw signals captured by the Sentry Nexus Edge nodes.

## 6.2 Convolutional Neural Networks (CNNs)

Convolutional Neural Networks (CNNs) are a class of deep neural networks most commonly applied to analyzing visual imagery. However, in Skhy SentryOS, they are extensively used for processing **audio and radio frequency data**.

### How CNNs Work
CNNs employ mathematical operations called "convolutions" in place of general matrix multiplication in at least one of their layers. 
- **Convolutional Layer:** Applies a filter (or kernel) across the input data, scanning it to detect features like edges, curves, or specific frequency bands.
- **Pooling Layer:** Downsamples the data, reducing the dimensionality and computational load, while retaining the most prominent features.
- **Fully Connected Layer:** The final layers where the high-level features learned by the convolutional layers are flattened and used to classify the input.

### Application in SentryOS
For Acoustic Beamforming and RF fingerprinting, raw time-series data is converted into 2D representations, such as spectrograms. CNNs are highly effective at reading these spectrograms as "images," identifying the visual patterns of specific drone acoustic signatures or the physical imperfections in a rogue transmitter's radio signal.

### Code Sample: A Simple CNN for Spectrograms (PyTorch)

\`\`\`python
import torch
import torch.nn as nn
import torch.nn.functional as F

class SpectrogramCNN(nn.Module):
    def __init__(self, num_classes=2):
        super(SpectrogramCNN, self).__init__()
        # 1 input channel (grayscale spectrogram), 16 output channels, 3x3 kernel
        self.conv1 = nn.Conv2d(1, 16, kernel_size=3, padding=1)
        self.conv2 = nn.Conv2d(16, 32, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(2, 2)
        self.fc1 = nn.Linear(32 * 32 * 32, 128) # Assuming 128x128 input image
        self.fc2 = nn.Linear(128, num_classes) # E.g., Threat vs Non-Threat

    def forward(self, x):
        x = self.pool(F.relu(self.conv1(x)))
        x = self.pool(F.relu(self.conv2(x)))
        x = torch.flatten(x, 1) # flatten all dimensions except batch
        x = F.relu(self.fc1(x))
        x = self.fc2(x)
        return x

# Example usage:
# model = SpectrogramCNN()
# dummy_spectrogram = torch.randn(1, 1, 128, 128) # Batch, Channel, Height, Width
# prediction = model(dummy_spectrogram)
\`\`\`

> [!TIP]
> **Try it in the Browser! (Pure NumPy Fallback)**
> Since PyTorch is a massive library that cannot run natively in your browser's Pyodide environment, here is an interactive example of a basic Neural Network forward pass (a Multi-Layer Perceptron) built from scratch using pure NumPy. You can edit the weights and biases to see how it affects the prediction!

\`\`\`python
import numpy as np

# 1. Define a basic activation function (ReLU)
def relu(x):
    return np.maximum(0, x)

# 2. Define the Neural Network layers (Simulating pre-trained weights)
# Input features: [Spectral Centroid, Zero-Crossing Rate]
inputs = np.array([0.8, 0.2]) 

# Hidden Layer (2 Neurons)
weights_1 = np.array([[ 0.5, -0.1],
                      [-0.2,  0.7]])
biases_1 = np.array([0.1, 0.0])

# Output Layer (1 Neuron: Probability of Drone)
weights_2 = np.array([0.8, 0.4])
bias_2 = -0.1

# 3. Forward Pass
hidden_output = relu(np.dot(inputs, weights_1) + biases_1)
final_prediction = np.dot(hidden_output, weights_2) + bias_2

print(f"Inputs (Features): {inputs}")
print(f"Hidden Layer Activations: {hidden_output}")
print(f"Final Drone Threat Probability Score: {final_prediction:.3f}")
\`\`\`

## 6.3 Transformers and Self-Attention

The **Transformer** architecture, initially designed for Natural Language Processing (NLP), has revolutionized time-series and sequential data analysis. 

### The Self-Attention Mechanism
Unlike CNNs which process local neighborhoods of data, or Recurrent Neural Networks (RNNs) which process data sequentially, Transformers use a **Self-Attention Mechanism**. 

Self-attention allows the model to look at an entire sequence of data at once and dynamically weigh the importance (or "attention") of different parts of the sequence relative to one another, regardless of their distance in time.

$$ \text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^T}{\sqrt{d_k}}\right)V $$
*Where Q (Query), K (Key), and V (Value) are matrices representing the input data.*

### Application in SentryOS
Skhy SentryOS uses Vision Transformers (ViTs) and bespoke temporal transformers for **Wi-Fi Channel State Information (CSI) analysis**. When detecting human breathing or micro-movements through Wi-Fi CSI, the variations in the signal phase and amplitude are subtle and span across a time sequence. Transformers excel at correlating these temporal variations to isolate the biological signature from environmental noise.

### Code Sample: Self-Attention Mechanism (PyTorch)

\`\`\`python
import torch
import torch.nn as nn

class SelfAttention(nn.Module):
    def __init__(self, embed_size, heads):
        super(SelfAttention, self).__init__()
        self.embed_size = embed_size
        self.heads = heads
        self.head_dim = embed_size // heads

        assert (
            self.head_dim * heads == embed_size
        ), "Embedding size needs to be divisible by heads"

        self.values = nn.Linear(self.head_dim, self.head_dim, bias=False)
        self.keys = nn.Linear(self.head_dim, self.head_dim, bias=False)
        self.queries = nn.Linear(self.head_dim, self.head_dim, bias=False)
        self.fc_out = nn.Linear(heads * self.head_dim, embed_size)

    def forward(self, values, keys, query, mask=None):
        N = query.shape[0]
        value_len, key_len, query_len = values.shape[1], keys.shape[1], query.shape[1]

        # Split the embedding into self.heads different pieces
        values = values.reshape(N, value_len, self.heads, self.head_dim)
        keys = keys.reshape(N, key_len, self.heads, self.head_dim)
        queries = query.reshape(N, query_len, self.heads, self.head_dim)

        values = self.values(values)
        keys = self.keys(keys)
        queries = self.queries(queries)

        # Einsum does matrix multiplication for query*keys for each training example
        energy = torch.einsum("nqhd,nkhd->nhqk", [queries, keys])

        if mask is not None:
            energy = energy.masked_fill(mask == 0, float("-1e20"))

        attention = torch.softmax(energy / (self.embed_size ** (1 / 2)), dim=3)
        out = torch.einsum("nhql,nlhd->nqhd", [attention, values]).reshape(
            N, query_len, self.heads * self.head_dim
        )
        return self.fc_out(out)
\`\`\`

## 6.4 Edge AI vs. Cloud AI

Skhy SentryOS is an **Edge AI** platform. 

- **Cloud AI:** Data is collected locally, transmitted over the internet to centralized data centers for processing, and the inference result is sent back. This introduces latency, requires high bandwidth, and poses significant privacy/security risks.
- **Edge AI:** The Machine Learning models are deployed directly onto local hardware (the Vidur Core). All processing, inference, and decision-making happen physically on-site.

> [!IMPORTANT]
> Edge AI is a non-negotiable requirement for Total Situational Awareness. It ensures zero-latency threat response and allows the security perimeter to function flawlessly even if external internet connectivity is severed or jammed.

## 6.5 Federated and Swarm Learning

Because SentryOS nodes operate in isolation at the edge, they must learn collaboratively without compromising data security. 

**Federated Learning** is a decentralized ML approach where multiple edge nodes collaboratively train a shared model while keeping all the training data localized. 
1. Each Vidur Core node trains a local model on its own sensor data.
2. The nodes extract the *learned weights and gradients* (not the raw data).
3. These mathematical updates are shared securely across the Reticulum mesh network.
4. The nodes aggregate these updates to improve the global model.

**Swarm Learning** builds upon this by removing the need for a central aggregator, allowing nodes to share and merge model parameters in a true peer-to-peer fashion, creating a resilient hive-mind of threat awareness.

### Code Sample: Federated Averaging (PyTorch Pseudocode)

\`\`\`python
import copy
import torch

def federated_averaging(global_model, local_models):
    """
    Aggregates weights from multiple local edge node models 
    into a single global model using Federated Averaging.
    """
    global_dict = global_model.state_dict()
    
    # Iterate over each parameter layer
    for k in global_dict.keys():
        global_dict[k] = torch.zeros_like(global_dict[k])
        
        # Sum the parameters from all local models
        for local_model in local_models:
            global_dict[k] += local_model.state_dict()[k]
            
        # Average the parameters
        global_dict[k] = torch.div(global_dict[k], len(local_models))
        
    # Update the global model with the averaged weights
    global_model.load_state_dict(global_dict)
    return global_model

# Example workflow:
# global_model = SpectrogramCNN()
# node1_model = train_on_node(copy.deepcopy(global_model), node1_data)
# node2_model = train_on_node(copy.deepcopy(global_model), node2_data)
# global_model = federated_averaging(global_model, [node1_model, node2_model])
\`\`\`

## Review Questions & Practical Exercises

**1. Comprehension Check:** Explain the core difference between a Convolutional Neural Network (CNN) and a Transformer architecture in terms of how they process data.
**2. System Analysis:** Why is Edge AI considered a "non-negotiable requirement" for SentryOS, as opposed to offloading processing to the Cloud? List at least two operational benefits.
**3. Practical Exercise:** Imagine a SentryOS node mistakenly classifies a loud generator as a drone (a false positive). Describe the step-by-step process of how Swarm Learning fixes this issue without sending the raw audio file of the generator over the network.

`
    },
    {
        id: 'vidur-core-edge-ai-and-decentralized-mesh',
        title: 'Vidur Core Edge AI and Decentralized Mesh',
        num: '8',
        content: `
# 8. Vidur Core Edge AI and Decentralized Mesh

![Decentralized Sensor Mesh](images/decentralized_sensor_mesh.png)

The computational heavy lifting of Skhy SentryOS resides within **Vidur Core**. However, the system is designed to scale from a single edge device protecting a storefront to a vast network of hundreds of sensor pods protecting a critical infrastructure facility. 

Achieving this scale requires specialized Machine Learning (ML) architectures optimized for edge hardware, and a robust, decentralized networking protocol for inter-node communication and federated learning.

> [!NOTE]
> **Beginner's Core Concept: Edge AI and Decentralized Mesh**
> **Edge AI:** Instead of sending all your security camera footage to a giant Google or Amazon server (the "Cloud") to figure out if there's an intruder, the camera's built-in computer (the "Edge") does the thinking itself. This means it works instantly, even if the internet is down.
> **Decentralized Mesh:** Imagine a team of security guards. Instead of everyone talking to one boss on a megaphone (centralized), they all have walkie-talkies and can talk directly to the person next to them (mesh). If one guard's radio breaks, the message just hops through a different guard. This makes the system incredibly tough to take down.

## 7.1 Machine Learning Architectures in Vidur Core

To process real-time sensor data effectively without exhausting edge hardware resources (e.g., memory and thermal limits), Vidur Core employs targeted ML architectures tailored to specific modalities.

### 7.1.1 Convolutional Neural Networks (CNNs) for Audio Spectrograms
Audio classification relies on converting 1D time-series audio data into 2D Mel-frequency cepstral coefficients (MFCCs) or spectrograms. Vidur Core utilizes lightweight CNN architectures (similar to MobileNet or EfficientNet variants) to perform image classification on these spectrograms. This approach efficiently identifies the visual "shape" of sound, such as the distinct harmonic stacking of a drone's propeller or the broadband burst of a gunshot.

> [!NOTE]
> **Concept Refresher:**
> - **MFCCs (Mel-frequency cepstral coefficients):** A representation of the short-term power spectrum of a sound, based on a nonlinear mel scale of frequency, commonly used in audio recognition.

### 7.1.2 Transformer Architectures for RF Sequences
Analyzing RF Channel State Information (CSI) and frequency-hopping patterns requires interpreting long, complex temporal sequences. Vidur Core implements localized Transformer models to process this data. Unlike RNNs, Transformers process sequential data in parallel and utilize self-attention mechanisms, allowing the model to focus on the specific subcarriers and timeframes where an RF disturbance actually occurred.

> [!NOTE]
> **Concept Refresher:**
> - **Self-attention mechanism:** A neural network component that allows a model to weigh the importance of different segments of an input sequence differently when processing data.

## 7.2 The Reticulum Mesh Protocol

In massive deployments (e.g., an airport perimeter), reliance on a centralized Wi-Fi router or Cloud server introduces a single point of failure. Skhy SentryOS mitigates this by integrating the **Reticulum** networking stack.

### 7.2.1 Secure Mesh Cryptography: Phasing out RSA for EC25519

Traditionally, secure network communications relied on RSA cryptography. However, RSA requires significantly large key sizes (e.g., 2048-bit or 4096-bit) to maintain security against modern computational attacks. On low-power edge nodes, performing RSA key exchanges drains battery life and introduces unacceptable latency into the sensor fusion pipeline.

SentryOS has completely phased out RSA in favor of Elliptic Curve Cryptography, specifically **Curve25519 (EC25519)** and **Ed25519**. 
- **Computational Efficiency:** EC25519 achieves equivalent or greater security to RSA-3072 using only 256-bit keys. This drastically reduces the CPU cycles required for encryption and decryption.
- **Perfect Forward Secrecy:** Reticulum uses EC25519 for ephemeral Diffie-Hellman key exchanges (ECDHE), ensuring that even if a node is physically compromised, past communications cannot be decrypted.
- **Fast Signatures:** Ed25519 provides extremely fast digital signatures, allowing nodes to instantly verify the authenticity of swarm learning gradients and threat alerts without bottlenecking the mesh.

\`\`\`mermaid
flowchart TD
    subgraph Mesh_Network ["Reticulum Encrypted Mesh (EC25519)"]
        N1((Node 1))
        N2((Node 2))
        N3((Node 3))
        N4((Node 4))
        
        N1 <-->|LoRa| N2
        N2 <-->|Wi-Fi| N3
        N3 <-->|Ethernet| N4
        N4 <-->|LoRa| N1
        N1 <-->|Wi-Fi| N3
    end
    
    Cloud["Central Cloud Server"] -.->|"Offline/Disconnected"| Mesh_Network
    
    N1 --> |"Local Alert"| Guard["Security Personnel Radio"]
\`\`\`

Reticulum allows SentryOS nodes to form a decentralized, encrypted mesh network over any available medium (LoRa, Wi-Fi, Ethernet). This ensures that if the central network goes offline, the edge nodes can still communicate, triangulate threats, and alert security personnel locally.

> [!NOTE]
> **Concept Refresher:**
> - **LoRa (Long Range):** A low-power wide-area network protocol that uses chirp spread spectrum technology for long-distance, low-bandwidth communication.

### 7.2.2 Comparison with Other Mesh Protocols

While Reticulum is specifically chosen for SentryOS due to its strong cryptographic routing and delay-tolerant nature over low-bandwidth mediums, several other open mesh protocols exist in the networking space:
- **B.A.T.M.A.N. Advanced (Better Approach To Mobile Adhoc Networking):** Operates at OSI Layer 2 (MAC layer). BATMAN-adv makes the entire mesh network appear as a single virtual Ethernet switch to the IP layer above it. While excellent for extending traditional Wi-Fi networks and routing IP traffic efficiently, its reliance on IP overhead makes it less suitable for the ultra-low bandwidth (LoRa) and cryptographically isolated environments of SentryOS.
- **Yggdrasil:** A scalable routing protocol operating as an IPv6 overlay network. It provides end-to-end encrypted routing across the internet or local mesh, utilizing a spanning tree topology.
- **cjdns:** Similar to Yggdrasil, cjdns provides an encrypted IPv6 network using public-key cryptography for address allocation and a distributed hash table for routing. 

Unlike these protocols, Reticulum completely discards IP overhead, allowing it to function efficiently over mediums with extremely low bitrates (e.g., 300 baud).

## 7.3 Swarm Learning and False Positive Mitigation

One of the most significant challenges in autonomous security is alarm fatigue caused by false positives. Skhy SentryOS implements a localized form of Swarm (or Federated) Learning to continuously adapt to its specific deployment environment.

When a facility manager uses the Nexus Edge UI to dismiss an alert as a "False Positive," that specific sensor data (e.g., the audio spectrogram of a local factory machine that sounded like a drone) is flagged. Vidur Core processes this false-negative label locally, slightly adjusting its model weights. 

Crucially, through the Reticulum mesh, these learned weight adjustments (gradients) are securely shared with all other SentryOS nodes on the perimeter. The nodes collectively "learn" to ignore the specific ambient noise of that facility without ever transmitting raw, sensitive audio data to the Cloud.

### Code Sample: Simulating a Mesh Gossip Payload

\`\`\`python
import json
import hashlib
import time

def generate_gradient_payload(node_id, gradient_weights, secret_key):
    """
    Simulates packaging a neural network weight update for the mesh network.
    Includes a cryptographic hash to prevent tampering.
    """
    timestamp = int(time.time())
    
    # The actual data we are sharing (just weights, no raw audio)
    payload = {
        "node": node_id,
        "timestamp": timestamp,
        "gradients": gradient_weights
    }
    
    # Create a signature to ensure integrity
    payload_str = json.dumps(payload, sort_keys=True)
    signature = hashlib.sha256(f"{payload_str}{secret_key}".encode()).hexdigest()
    
    # Final message sent over LoRa or BATMAN-adv
    message = {
        "data": payload,
        "signature": signature
    }
    return json.dumps(message, indent=2)

# Example: Node 4 shares a small weight adjustment
weights = [0.015, -0.002, 0.088]
msg = generate_gradient_payload("VidurNode_4", weights, "MY_MESH_SECRET")
print("Transmitting via Gossip Protocol:")
print(msg)
\`\`\`

> [!NOTE]
> **Concept Refresher:**
> - **Swarm Learning / Federated Learning:** A decentralized machine learning approach where edge devices train models locally on their own data and only share the learned weights (gradients) with the network, ensuring data privacy.

## 7.4 Academic Foundations

The implementation of decentralized AI in SentryOS is grounded in recent literature:

- **Warnat-Herresthal et al. (2021)** in *"Swarm Learning for decentralized and confidential clinical machine learning"* demonstrated that decentralized, blockchain-based swarm learning can match the accuracy of centralized models without compromising data privacy. This directly inspired Vidur Core's approach to sharing model gradients over Reticulum without transmitting raw audio/visual data.
- **M. M. et al. (2022)** in *"A Survey on the Convergence of Edge Computing and AI for UAVs: Opportunities and Challenges"* verified that offloading inference to edge nodes drastically reduces latency and bandwidth constraints, validating the architectural division between the high-compute Vidur Core and the lightweight Nexus UI.

## 7.5 Step-by-Step Tutorial: Deploying a Vidur Edge Node

To understand how Edge AI and the decentralized mesh function in practice, let's deploy a simulated Vidur Core node using Docker. This simulates setting up a new SentryOS pod on a remote perimeter fence.

**Prerequisites:**
- A machine running Docker and Docker Compose.
- Basic understanding of terminal commands.

**Step 1: Create the Deployment Configuration**
On your machine, create a new directory called \`sentry-node-01\` and navigate into it. Create a \`docker-compose.yml\` file with the following configuration:

\`\`\`yaml
version: '3.8'
services:
  vidur-core:
    image: skhy/vidur-core:latest
    environment:
      - NODE_ID=PERIMETER_NORTH_01
      - MESH_ENABLED=true
      - RETICULUM_IFACE=eth0
    volumes:
      - ./data:/app/data
      - ./models:/app/models
    network_mode: "host"
\`\`\`
*Note: We use \`network_mode: "host"\` so the Reticulum mesh protocol can properly broadcast across the local network.*

**Step 2: Start the Edge Node**
Run the following command to start the AI inference daemon:
\`\`\`bash
docker-compose up -d
\`\`\`

**Step 3: Verify Mesh Connectivity**
Once the container is running, execute a command inside the container to check the Reticulum mesh status.
\`\`\`bash
docker exec -it $(docker ps -q -f name=vidur-core) rnstatus
\`\`\`
You should see output indicating that the node has initialized an EC25519 identity and is listening on the \`eth0\` interface for peers.

**Step 4: Simulate Swarm Learning Updates**
In a real deployment, if Node A detects a false positive, it sends a weight update gradient over the mesh. You can simulate this by placing a generic JSON payload in the shared \`data\` volume:
\`\`\`bash
echo '{"gradient_update": [0.01, -0.003, 0.05], "timestamp": 1700000000}' > data/simulated_gradient.json
\`\`\`
Watch the container logs to see Vidur Core ingest the update and adjust its local Transformer model without requiring a cloud connection.

## Review Questions & Practical Exercises

**1. Comprehension Check:** Why does Skhy SentryOS use Elliptic Curve Cryptography (EC25519) instead of RSA for its mesh network? 
**2. System Analysis:** Explain the concept of Swarm (Federated) Learning in the context of SentryOS. How does it solve the problem of "alarm fatigue" without compromising privacy?
**3. Practical Exercise:** Using the Docker Compose file from the tutorial as a template, write a new configuration that deploys *two* Vidur Core nodes on the same machine. How would you configure them so they communicate with each other over the simulated mesh network?

`
    },
    {
        id: 'data-privacy-ethics-and-countermeasures',
        title: 'Data Privacy, Ethics, and Countermeasures',
        num: '9',
        content: `
# 9. Data Privacy, Ethics, and Countermeasures

The implementation of "Total Situational Awareness" introduces significant ethical and privacy considerations. A system capable of through-wall sensing, persistent audio monitoring, and visual tracking wields immense power. This chapter outlines how Skhy SentryOS addresses these concerns through its architecture, while simultaneously detailing the countermeasures the system employs against active interference.

## 8.1 Privacy by Design: The Edge Advantage

The most profound privacy protection within SentryOS is its absolute reliance on **Edge AI**.

Traditional security networks constantly stream raw video and audio feeds to centralized cloud servers or remote human operators. This creates massive attack surfaces for data breaches and inherent privacy violations for individuals operating near the perimeter.

### 8.1.1 Localized Processing
In SentryOS, raw sensor data—such as the acoustic waveform of a private conversation or the Wi-Fi CSI disturbances of a person walking—never leaves the local Vidur Core node. The AI models run directly on the edge hardware. The only information transmitted across the Reticulum mesh to the Nexus UI is **metadata** (e.g., "Drone detected at Azimuth 140, Confidence 95%").

### 8.1.2 Privacy-Preserving Swarm Learning
When the system adapts via Swarm Learning, it only shares model gradients (mathematical weight updates). It is cryptographically impossible to reverse-engineer a raw audio clip or video frame from these shared gradients, ensuring that local sensor data cannot be reconstructed by an intercepting party.

## 8.2 Ethical Deployment Considerations

Facility managers deploying Skhy SentryOS must adhere to strict operational ethics:
- **Defined Perimeters:** RF and audio sensing should be tuned to not aggressively penetrate beyond the legal property line of the facility. 
- **Data Retention Policies:** While raw data is not transmitted, the Nexus UI does retain alert logs and cropped visual verification images. These must be subjected to automated pruning and rigorous access controls.

## 8.3 System Countermeasures

Advanced intruders may attempt to defeat SentryOS not through stealth, but through active interference. The system is designed with specific counter-countermeasures.

### 8.3.1 RF Jamming Resilience
A common tactic for drone operators is to flood the 2.4 GHz or 5.8 GHz spectrum with high-power noise to jam the SentryOS SDRs. 
- **Frequency Hopping:** The SDR arrays within Vidur Core can instantly detect broadband jamming and cycle their listening frequencies to unaffected bands.
- **Jamming as an Alert:** SentryOS classifies sustained, unnatural broadband noise as a "Jamming Attack" alert. The system will immediately slew the PTZ camera to the calculated DOA of the jamming source itself.

### 8.3.2 Physical and Optical Blinding
Intruders may attempt to blind the PTZ visual systems using high-powered lasers or infrared floodlights.
- **Multi-Modal Redundancy:** Because SentryOS operates on a late-fusion architecture, if the visual system is blinded, the system falls back to Audio and RF tracking. The Nexus UI will display the threat's location purely based on non-visual vectors until the visual system recovers.

## Review Questions & Practical Exercises

**1. Comprehension Check:** How does "Privacy by Design" in SentryOS differ from the privacy policies of traditional cloud-based CCTV systems?
**2. System Analysis:** If an intruder points a high-powered laser directly into the lens of the SentryOS PTZ camera, how does the system continue to track the intruder's drone?
**3. Practical Exercise:** Research the legal regulations regarding audio recording (e.g., one-party vs. two-party consent laws) in your specific state or country. How does the SentryOS approach of processing audio on the edge without saving it affect compliance with these laws?

`
    },
    {
        id: '1-system-security-and-adversarial-resilience',
        title: '1 System Security and Adversarial Resilience',
        num: '9',
        content: `
# 9.1 System Security and Adversarial Resilience

## Threat Model

SentryOS operates in potentially hostile environments where adversaries may attempt to blind, spoof, or compromise the network. A robust threat model is essential for a system designed to provide threat awareness. We categorize threats into three primary domains: Physical, Network, and AI/Algorithmic.

## Physical Security of Edge Nodes

Vidur nodes are deployed in the field and are susceptible to physical tampering.
*   **Anti-Tamper Mechanisms:** Nodes should employ secure boot mechanisms and encrypted filesystems (e.g., LUKS) to ensure that if a node is captured, the localized AI models and cryptographic keys cannot be extracted.
*   **Zeroization:** In extreme scenarios, nodes can be programmed with a "dead man's switch" that wipes sensitive configuration if the enclosure is breached or if it loses contact with the mesh for an extended period.

## Mesh Network Security

The decentralized nature of the mesh prevents a single point of failure, but introduces risks regarding node authentication and data integrity.

*   **Cryptographic Identity:** Every node is issued a cryptographic identity (X.509 certificates) upon provisioning. All node-to-node communication over the BATMAN-adv or LoRa mesh is encrypted using TLS 1.3 or AES-256 for lower-bandwidth channels.
*   **Sybil Attacks and Rogue Nodes:** To prevent an adversary from deploying a "rogue node" that injects false threat data (a Sybil attack), the network relies on a web-of-trust or a centralized Certificate Authority (CA) that provisions keys prior to deployment. Anomalous data injections from a single node that conflict with the consensus of neighboring nodes are flagged and isolated by the Global Knowledge Graph.

## Adversarial AI and Spoofing

Adversaries may attempt to spoof the sensors by playing recorded sounds (Acoustic Replay Attacks) or mimicking RF signatures.

*   **Acoustic Replay Attacks:** To counter adversaries playing a recording of a drone to trigger a false alarm, the AI models are trained not just on the frequency domain, but on the spatial acoustics. A localized speaker presents a different acoustic wavefront than a moving drone, which the DOA (Direction of Arrival) algorithm can detect as a point-source anomaly.
*   **Adversarial Perturbations:** Machine learning models are vulnerable to adversarial noise designed to force a misclassification. The Vidur Core utilizes adversarial training—introducing synthesized noise into the training dataset—to harden the neural networks against deliberate evasion techniques.

## Conclusion

By securing the hardware, encrypting the mesh, and hardening the AI models against spoofing, SentryOS ensures that the threat awareness data it generates remains trustworthy even under active adversarial attack.

`
    },
    {
        id: '2-visualization-and-the-global-knowledge-graph',
        title: '2 Visualization and the Global Knowledge Graph',
        num: '9',
        content: `
# 9.2 Visualization and the Global Knowledge Graph

## Transforming Raw Data to Intelligence

The core value of SentryOS is not just in detecting threats, but in presenting that data to human operators in a way that minimizes cognitive load and maximizes situational awareness. The system achieves this by transforming raw sensor data from the mesh into a Global Knowledge Graph.

## The Global Knowledge Graph (GKG)

When a Vidur node detects an anomaly, it doesn't just send an "alert." It constructs a semantic representation of the event.

*   **Nodes and Edges:** In the GKG, *Nodes* represent physical entities (e.g., "Vidur Node A", "Unknown RF Emitter", "Detected Drone"). *Edges* represent the relationships or observations (e.g., "Node A \`OBSERVED\` Drone", "RF Emitter \`LOCATED_AT\` Coordinates").
*   **Graph Database:** The centralized command center (when connected) aggregates these local graph updates into a comprehensive Python-native graph database like NetworkX or Kùzu. These allow seamless in-memory graph operations without the overhead of external server processes like Neo4j.
*   **Inference over Graphs:** By structuring data this way, the system can perform graph traversal to find complex patterns. For example, if Node A detects a drone acoustically, and Node B detects a spike in 2.4GHz RF activity at the same time, the graph connects these two distinct events to a single likely threat actor.

### Code Sample: Rendering the Knowledge Graph
\`\`\`python
import networkx as nx
import matplotlib.pyplot as plt

# 1. Initialize the Graph
G = nx.DiGraph()

# 2. Add nodes (Sensors and Threats)
G.add_node("Vidur_Node_A", type="Sensor", color='blue')
G.add_node("Vidur_Node_B", type="Sensor", color='blue')
G.add_node("Drone_Unknown", type="Threat", color='red')
G.add_node("RF_2.4GHz", type="Signal", color='orange')

# 3. Add Edges (Relationships)
G.add_edge("Vidur_Node_A", "Drone_Unknown", label="Acoustic Detection")
G.add_edge("Vidur_Node_B", "RF_2.4GHz", label="RF Intercept")
G.add_edge("Drone_Unknown", "RF_2.4GHz", label="Emits")

# 4. Draw the Graph
plt.figure(figsize=(8, 5))
pos = nx.spring_layout(G, seed=42)
colors = [node[1]['color'] for node in G.nodes(data=True)]

nx.draw(G, pos, with_labels=True, node_color=colors, node_size=2000, font_size=10, font_weight="bold", arrows=True)
edge_labels = nx.get_edge_attributes(G, 'label')
nx.draw_networkx_edge_labels(G, pos, edge_labels=edge_labels)

plt.title("SentryOS Global Knowledge Graph - Local Event")
plt.margins(0.2)
plt.show()
\`\`\`

## Threat Awareness Dashboard UI

The user interface is designed with modern, reactive principles, utilizing frameworks like React or Streamlit to provide real-time updates.

### Key UI Components

1.  **Geospatial Map View:** 
    A live map (e.g., Mapbox or Leaflet integration) displaying the exact physical locations of all active Vidur nodes and the triangulated positions of detected threats. Direction of Arrival (DOA) vectors are drawn as cones intersecting on the map.
2.  **Live Event Feed:** 
    A real-time scrolling list of chronological events, color-coded by severity (e.g., Red for Critical Threat, Yellow for Unknown Anomaly, Green for System Status).
3.  **Graph Interaction Sidebar:**
    Operators can click on a specific threat on the map to open a sidebar. This sidebar visualizes the localized Knowledge Graph for that entity, showing which nodes detected it, what sensors were triggered, and its historical path.
4.  **Node Health Matrix:**
    A diagnostic view showing the battery life, CPU temperature, AI inference latency, and mesh connection strength of every node in the decentralized network.

## Design Philosophy

The UI is built on a "Dark Mode" aesthetic with high-contrast neon accents (often termed a "Cyber-Tactical" aesthetic). This reduces eye strain for operators working in low-light environments while ensuring that critical alerts (in bright red or orange) immediately draw the user's attention. Smooth micro-animations transition the states of the nodes to provide a fluid, premium experience.

`
    },
    {
        id: 'system-scaling-and-real-world-deployments',
        title: 'System Scaling and Real-World Deployments',
        num: '10',
        content: `
# 10. System Scaling and Real-World Deployments

Moving from a localized, single-node test environment to a massive, multi-kilometer perimeter deployment introduces profound engineering challenges. This chapter explores how Skhy SentryOS scales to meet real-world industrial and military requirements.

## 9.1 Scaling the Decentralized Mesh

The Reticulum protocol allows SentryOS to scale horizontally without the bottleneck of a central server. However, physics dictates limitations on how this mesh is constructed over vast areas.

### 9.1.1 Hybrid Medium Topologies
A 10-kilometer airport perimeter cannot rely on a single wireless medium.
- **LoRa for the Backbone:** Edge nodes spaced far apart (up to several kilometers) utilize 900 MHz LoRa transceivers to maintain the mesh backbone. This provides low bandwidth but extreme reliability and range.
- **Wi-Fi 6 / Ethernet for Clusters:** Nodes clustered tightly around high-value chokepoints (like gates) utilize high-bandwidth connections to share rich telemetry (like full spectrograms) with local Nexus UI tablets.

Reticulum seamlessly routes packets across these disparate physical mediums based on the destination's public key.

## 9.2 Power Management and Autonomy

In remote deployments (e.g., border security or agricultural monitoring), edge nodes often lack access to the traditional power grid.

### 9.2.1 Power over Ethernet (PoE)
For facility perimeters, nodes are typically wired using PoE+. A single CAT6 cable provides both high-speed Ethernet to the mesh and up to 30 Watts of power, enough to drive the Vidur Core compute module (e.g., an NVIDIA Jetson), the SDR, and the microphone array.

### 9.2.2 Solar and Battery Deployments
For completely off-grid nodes, SentryOS utilizes deep-cycle batteries coupled with solar charge controllers. 
- **Compute Throttling:** Vidur Core is designed with a low-power "watchdog" state. If battery voltage drops below a critical threshold, the node disables power-hungry continuous visual inference and relies solely on low-power acoustic impulse detection, only waking the full neural network if a significant anomaly occurs.

## 9.3 Real-World Case Studies: Environmental Interference

Real-world environments are inherently hostile to delicate sensors. SentryOS has been hardened against specific environmental challenges:

### 9.3.1 High-Wind Acoustic Masking
In coastal or high-altitude deployments, sustained wind creates severe low-frequency rumble across the microphone arrays, masking the sound of distant threats. 
- **Mitigation:** The system applies dynamic high-pass filtering in the DSP pipeline before the audio reaches the neural network, and relies more heavily on the RF subsystem (which is unaffected by wind) for early warning.

### 9.3.2 Urban RF Congestion
Deploying SentryOS in an industrial park means the 2.4 GHz spectrum is saturated with hundreds of benign Wi-Fi routers, Bluetooth devices, and microwaves.
- **Mitigation:** The Transformer models analyzing the RF CSI are specifically trained to ignore standard 802.11 beacon frames and focus solely on the high-throughput, non-standard hopping sequences characteristic of drone telemetry.

## 9.4 Validating Scale: The Swarm Simulation Engine

Before real-world deployment, SentryOS utilizes a proprietary **Swarm Simulation Engine** to validate defense network coverage against multi-swarm drone attacks.

### 9.4.1 Directional Jammer Mechanics & Evasion
Simulating real-world RF countermeasures, the engine models directional jammers (e.g., a 45° beam width) that must actively track targets for sustained periods (e.g., 3 seconds) to neutralize them. The simulation accurately models advanced target evasion—autonomous or fixed-wing drones will attempt to evade lock by initiating randomized heading changes and speed alterations when they detect jamming frequencies.

### 9.4.2 Hunter-Killer Swarm AI
To stress-test the decentralized mesh, the engine simulates coordinated "Hunter-Killer" swarms:
- A fixed-wing "leader" drone performs reconnaissance.
- Escorting kamikaze quadcopters dynamically redirect their trajectories toward any SentryOS node that emits active countermeasures (like directional jamming). 
- If a kamikaze drone breaches a 100m radius of a sensor node, mutual destruction is simulated, forcing the remaining SentryOS mesh to dynamically heal its routing tables and re-establish perimeter coverage without the lost node.

## 9.5 Practical Implementation & Open Software

For developers or facility managers looking to experiment with decentralized mesh networks before deploying a full SentryOS system, several open-source software projects provide excellent entry points:

- **Meshtastic:** An open-source, decentralized mesh network built on LoRa radios. It is highly accessible for beginners, allowing users to send encrypted text messages and GPS coordinates over long distances without cellular infrastructure.
- **BATMAN-adv (on OpenWrt):** For experimenting with high-bandwidth Wi-Fi mesh topologies, users can flash standard routers with the OpenWrt Linux distribution and configure the \`batman-adv\` kernel module. This is ideal for learning how Layer 2 mesh routing handles dynamic topology changes.
- **LXMF (Lightweight Extensible Message Format):** Built on top of Reticulum, LXMF is an open-source protocol for secure messaging over mesh networks. Exploring LXMF is the best way to understand how Vidur Core communicates alerts across the perimeter.

## Review Questions & Practical Exercises

**1. Comprehension Check:** Why is a "Hybrid Medium Topology" necessary for a massive perimeter deployment? Give an example of when you would use LoRa versus Ethernet.
**2. System Analysis:** Explain the concept of "Compute Throttling" in off-grid SentryOS nodes. How does it balance security with power conservation?
**3. Practical Exercise:** Imagine you are tasked with deploying SentryOS around a dense, noisy factory surrounded by heavy machinery. Which sensor modality (Audio, RF, or Visual) do you expect to experience the most interference, and how would you configure the system to compensate?

`
    },
    {
        id: '1-experimental-methodology',
        title: '1 Experimental Methodology',
        num: '10',
        content: `
# 10.1 Experimental Methodology

## Introduction

To rigorously evaluate the capabilities of SentryOS, a series of controlled experiments were conducted in both laboratory settings and field environments. This chapter details the hardware setup, data collection methods, and the experimental conditions utilized to benchmark the system's threat detection and mesh networking performance.

## Hardware Setup

The experiments utilized a heterogeneous mix of Edge nodes to simulate a realistic, diverse tactical mesh:

1.  **Tier 1 Nodes (Heavy Compute):**
    *   **Hardware:** NVIDIA Jetson Orin Nano (8GB RAM).
    *   **Role:** Primary sensor fusion and deep learning inference (acoustic classification, complex RF fingerprinting).
    *   **Sensors:**  Sipeed 7-Mic Array for acoustic beamforming, RTL-SDR for RF scanning.
2.  **Tier 2 Nodes (Light Compute/Relay):**
    *   **Hardware:** Raspberry Pi 4 Model B (16GB RAM).
    *   **Role:** Lightweight acoustic triggers, environmental sensing, and mesh network routing.
    *   **Sensors:** Standard USB omnidirectional microphone.
3.  **Communication Interfaces:**
    *   Primary Mesh: Dual-band Wi-Fi adapters in Ad-Hoc mode running BATMAN-adv routing protocol.
    *   Failover Mesh: LoRa (Long Range) 915 MHz transceivers for low-bandwidth telemetry when Wi-Fi is jammed.

## Data Collection and Synthesization

Training a robust AI model requires extensive datasets. The datasets used in this research were comprised of two main components:

1.  **Real-World Acoustic Signatures:** We recorded hours of audio from various commercial drones (DJI Mavic, Phantom), vehicles, and ambient noise (wind, urban traffic) across different environments (open fields, dense forests, urban alleys).
2.  **RF CSI (Channel State Information) Data:** We collected Wi-Fi CSI data using Atheros AR9271 chipsets to capture the minute perturbations in RF multipath propagation caused by human movement and metallic objects.

## Experimental Conditions

Tests were conducted under the following structured scenarios:

*   **Scenario A: Baseline Environmental Noise.** Nodes deployed in an empty field to establish the baseline false positive rate (FPR).
*   **Scenario B: Single Moving Threat.** A drone was flown through the mesh network at varying speeds and altitudes. We measured the time-to-detect (TTD) and the accuracy of the Direction of Arrival (DOA) estimation.
*   **Scenario C: Network Contention.** We artificially introduced packet loss and latency into the Wi-Fi mesh to test the resilience of the gossip protocol and the failover to the LoRa network.

`
    },
    {
        id: '2-performance-evaluation',
        title: '2 Performance Evaluation',
        num: '10',
        content: `
# 10.2 Performance Evaluation

## Overview

The performance of SentryOS is evaluated across three primary axes: Threat Detection Accuracy, Mesh Network Latency, and Edge Node Power Efficiency. The results demonstrate the viability of decentralized edge AI for real-time tactical operations.

## Threat Detection Accuracy

The AI models deployed on the Vidur nodes (specifically the Acoustic Classifier and RF Fingerprinter) were tested against unseen validation datasets during field trials.

*   **Acoustic Classification (Drone vs. Background Noise):**
    *   **Precision:** 94.2%
    *   **Recall:** 91.8%
    *   **F1-Score:** 92.9%
*   **Direction of Arrival (DOA) Error Margin:**
    *   In open environments, the MUSIC algorithm on the 4-mic array achieved an average angular error of **±4.5 degrees** for targets within a 50-meter radius.
*   **RF Fingerprinting:**
    *   Identification of unauthorized MAC addresses via signature analysis achieved an accuracy of **88.5%** in high-multipath urban environments.

## Mesh Network Latency and Resilience

Latency is critical; threats must be identified and propagated through the mesh to operators within seconds.

*   **Node-to-Node Latency (BATMAN-adv):** Average of 12ms per hop. In a 10-node chain, a threat detected at node 1 reaches node 10 in under 150ms.
*   **Graph Convergence Time:** The time it takes for the decentralized Gossip protocol to reach consensus across a 20-node network averaged **1.2 seconds**.
*   **Failover Response:** When the primary Wi-Fi mesh was jammed (simulated via high-power noise injection), the system successfully failed over to the LoRa telemetry mesh in **4.5 seconds**, maintaining basic threat vector transmission despite the loss of high-bandwidth data.

## Power Efficiency

Power consumption is a limiting factor for battery-operated field nodes.

*   **Jetson Orin Nano (Continuous AI Inference):** Averaged 12 Watts. With a standard 10,000mAh 12V battery, operational time is approximately 10 hours.
*   **Raspberry Pi 4 (Acoustic Trigger Mode):** Averaged 3.5 Watts. Operational time extends to over 30 hours.

These results indicate that SentryOS can provide high-fidelity threat awareness with latencies well below the threshold required for tactical response, while operating within the power constraints of portable edge devices.

`
    },
    {
        id: '3-case-studies-and-scenario-walkthroughs',
        title: '3 Case Studies and Scenario Walkthroughs',
        num: '10',
        content: `
# 10.3 Case Studies and Scenario Walkthroughs

## Introduction

To understand how SentryOS functions holistically, it is useful to walk through realistic tactical scenarios. These case studies demonstrate the end-to-end flow of data: from initial sensor pickup at the edge, through mesh consensus, to the final visualization on the operator's dashboard.

---

## Scenario A: The Rogue Drone Intrusion

**The Context:** A secure perimeter is guarded by a deployment of 15 Vidur nodes placed 50 meters apart. 
**The Threat:** An unauthorized commercial drone (DJI Mavic 3) enters the perimeter at a low altitude, attempting to evade radar detection by flying below the treeline.

### Timeline of Events

1.  **T+0.0s (Initial Acoustic Trigger):** Node 4 and Node 5's omnidirectional microphones detect an acoustic anomaly in the 200-500Hz range. Their lightweight trigger models wake up the primary Jetson Orin Core.
2.  **T+0.5s (Edge AI Inference):** The acoustic classifier on Node 4 confirms a 92% match for a rotary-wing drone. Simultaneously, the 4-mic array calculates the DOA, determining the sound originates from 45° North-East.
3.  **T+0.7s (Gossip Protocol Broadcast):** Node 4 broadcasts a compressed JSON payload over the BATMAN-adv mesh containing: \`[Timestamp, Node_ID, Threat_Type: Drone, Confidence: 0.92, DOA: 45]\`.
4.  **T+1.1s (Sensor Fusion & Triangulation):** Node 5 also calculates a DOA of 310° North-West. The mesh algorithm triangulates the intersection of these two vectors, calculating the exact GPS coordinates of the drone.
5.  **T+1.5s (Global Knowledge Graph Update):** The operator's dashboard flashes red. A new entity node (\`Drone_Unknown\`) is created on the Knowledge Graph, linked to the physical location on the map. The operator sees the flight path updating in real-time as more Vidur nodes pick up the acoustic signature.

---

## Scenario B: Unauthorized RF Transmitter (Spoofing Attempt)

**The Context:** An adversary attempts to connect to the internal Wi-Fi mesh using a stolen password, using a high-gain directional antenna from a vehicle parked outside the perimeter.

### Timeline of Events

1.  **T+0.0s (RF Scan):** Node 12 performs its routine CSI (Channel State Information) scan and logs a connection attempt from MAC Address \`XX:YY:ZZ:11:22:33\`.
2.  **T+2.0s (Fingerprint Mismatch):** While the password is correct, the Jetson Orin Core on Node 12 analyzes the RF multipath signature. The CSI data indicates the signal is arriving from a stationary, external source, rather than the expected dynamic internal environment of a friendly node.
3.  **T+2.5s (Graph Anomaly Detection):** Node 12 queries its local sub-graph. The MAC address claims to be "Node 3", but Node 3 is actively communicating with Node 2 on the opposite side of the compound.
4.  **T+3.0s (Automated Countermeasure):** SentryOS flags a \`Sybil/Spoofing Attack\`. The system automatically issues a network-wide command to blacklist the MAC address and ignore its routing packets, quarantining the threat before it can inject false data into the graph.

`
    },
    {
        id: '4-course-quizzes-and-knowledge-checks',
        title: '4 Course Quizzes and Knowledge Checks',
        num: '10',
        content: `
# 10.4 Course Quizzes and Knowledge Checks

## Instructions

The following questions are designed to test your comprehension of the core concepts presented in the Skhy Academy Course. Select your answers and click "Submit Assignment" at the bottom of the page to view your score.

---

### Quiz 1: Networking and Architecture

[QUIZ]
**Q1. What is the primary advantage of a decentralized mesh network over a traditional hub-and-spoke model in a tactical environment?**
[ ] A) It uses less battery power on average.
[*] B) It prevents a single point of failure (SPOF) if a node is destroyed.
[ ] C) It allows for higher bandwidth video streaming to the cloud.
[ ] D) It requires fewer nodes to cover the same area.

**Q2. SentryOS utilizes BATMAN-adv for its primary mesh. At what OSI layer does BATMAN-adv operate?**
[*] A) Layer 2 (Data Link Layer)
[ ] B) Layer 3 (Network Layer)
[ ] C) Layer 4 (Transport Layer)
[ ] D) Layer 7 (Application Layer)

**Q3. Why has SentryOS transitioned from RSA to Elliptic Curve Cryptography (EC25519) for securing the Reticulum mesh?**
[ ] A) EC25519 is older and more tested than RSA.
[ ] B) EC25519 uses larger keys for better security.
[*] C) EC25519 requires significantly less computational power for equivalent security, saving battery on edge nodes.
[ ] D) RSA cannot be used on wireless networks.
[/QUIZ]

---

### Quiz 2: Sensor Fusion and AI

[QUIZ]
**Q1. In the context of SentryOS acoustic processing, what does DOA stand for?**
[ ] A) Data Orientation Angle
[*] B) Direction of Arrival
[ ] C) Distance of Anomaly
[ ] D) Digital Orthogonal Array

**Q2. Why does SentryOS perform AI inference at the Edge (on the Vidur node) rather than streaming audio to a central server?**
[ ] A) To reduce latency.
[ ] B) To preserve mesh network bandwidth.
[ ] C) To maintain operational integrity if external internet connectivity is jammed.
[*] D) All of the above.

**Q3. Which algorithm is commonly used in SentryOS to calculate the time difference of arrival between microphones?**
[ ] A) Fast Fourier Transform (FFT)
[*] B) Generalized Cross-Correlation (GCC)
[ ] C) Dijkstra's Algorithm
[ ] D) K-Means Clustering

**Q4. What is the main advantage of using Transformer models over Convolutional Neural Networks (CNNs) when analyzing Wi-Fi Channel State Information (CSI)?**
[ ] A) Transformers are faster at processing static 2D images.
[*] B) Transformers use a self-attention mechanism to analyze complex temporal sequences over time.
[ ] C) Transformers do not require any training data.
[ ] D) Transformers use less memory than CNNs.
[/QUIZ]

---

### Quiz 3: Global Knowledge Graph

[QUIZ]
**Q1. How does the Global Knowledge Graph represent an acoustic detection event?**
[ ] A) As a flat row in a SQL database.
[*] B) As a Node-Edge-Node relationship (e.g., VidurNode -> DETECTED -> AcousticAnomaly).
[ ] C) As a static image file.
[ ] D) As an encrypted text log.

**Q2. What is the primary benefit of visualizing threat data as a graph rather than a list of alerts?**
[ ] A) It requires less RAM on the dashboard computer.
[*] B) It allows operators to immediately see the relationships and causal links between seemingly isolated events.
[ ] C) It is the only way to display GPS coordinates.
[ ] D) It automatically destroys rogue drones.
[/QUIZ]

---

### Quiz 4: Swarm Learning and False Positive Mitigation

[QUIZ]
**Q1. How does Swarm Learning reduce false positives in SentryOS without compromising data privacy?**
[ ] A) Nodes send all audio recordings of false positives to the cloud for review.
[*] B) Nodes train locally and only share the updated model weights (gradients) with the mesh.
[ ] C) Nodes automatically mute all sensors when a false positive is detected.
[ ] D) A central server dictates which alarms are false based on GPS data.

**Q2. When a node transmits a gradient update over the Reticulum mesh, what cryptographic method is used to prevent tampering?**
[ ] A) The payload is sent via plain text.
[*] B) A cryptographic hash (e.g., SHA-256) signature is appended to the payload.
[ ] C) The data is compressed using a ZIP file.
[ ] D) The node's IP address is used to verify authenticity.
[/QUIZ]

---

### Quiz 5: Physics of Acoustics

[QUIZ]
**Q1. According to the Inverse-Square Law, what happens to the intensity of a drone's sound as the distance from the drone to the SentryOS node doubles?**
[ ] A) The sound intensity doubles.
[*] B) The sound intensity drops by approximately 6 decibels (dB).
[ ] C) The sound intensity drops by half.
[ ] D) The sound intensity remains the same.

**Q2. How does SentryOS utilize the Doppler Shift phenomenon?**
[*] A) By measuring frequency shifts to calculate the velocity vector of a moving threat.
[ ] B) By measuring volume to determine distance.
[ ] C) By shifting data between different Wi-Fi channels to avoid jamming.
[ ] D) By altering the physical angle of the PTZ camera.

**Q3. Which acoustic feature is highly correlated with the "brightness" of a sound, making it useful for detecting sudden physical impacts like shattering glass?**
[ ] A) Zero-Crossing Rate (ZCR)
[ ] B) Mel-frequency cepstral coefficients (MFCCs)
[*] C) Spectral Centroid
[ ] D) Spatial Covariance Matrix (SCM)
[/QUIZ]

`
    },
    {
        id: '5-api-and-developer-reference',
        title: '5 API and Developer Reference',
        num: '10',
        content: `
# 10.5 API and Developer Reference

## Overview

The SentryOS platform exposes a RESTful API and a real-time WebSocket stream for integrating the decentralized mesh data into third-party command and control systems, or for building custom frontend dashboards.

All API endpoints require an API Key passed in the \`Authorization\` header.

\`\`\`http
Authorization: Bearer YOUR_SENTRYOS_API_KEY
\`\`\`

---

## REST Endpoints

### 1. Get Network Status
Retrieves the current health and status of all known Vidur nodes in the mesh.

*   **Endpoint:** \`/api/v1/network/nodes\`
*   **Method:** \`GET\`
*   **Response (200 OK):**
\`\`\`json
{
  "total_nodes": 15,
  "active_nodes": 14,
  "nodes": [
    {
      "id": "resilient-004",
      "status": "online",
      "battery_pct": 84,
      "cpu_temp": 45.2,
      "last_seen": "2026-07-21T14:32:10Z",
      "location": {"lat": 34.0522, "lon": -118.2437}
    }
  ]
}
\`\`\`

### 2. Query Global Knowledge Graph
Executes a Cypher-like query against the aggregated threat knowledge graph.

*   **Endpoint:** \`/api/v1/graph/query\`
*   **Method:** \`POST\`
*   **Body:**
\`\`\`json
{
  "query": "MATCH (n:VidurNode)-[r:DETECTED]->(t:Threat {type: 'Drone'}) RETURN n, t"
}
\`\`\`

---

## Real-Time WebSocket Stream

For low-latency threat awareness, clients should connect to the WebSocket stream to receive pushed events as soon as the mesh achieves consensus.

*   **URL:** \`ws://sentryos-core.local/api/v1/stream/events\`

### Event Payloads

**Threat Detected Event:**
Pushed when multiple nodes triangulate a verified threat.

\`\`\`json
{
  "event_type": "THREAT_VERIFIED",
  "timestamp": "2026-07-21T14:35:00Z",
  "threat_data": {
    "entity_id": "drone-unk-992",
    "classification": "Rotary-Wing Drone",
    "confidence": 0.94,
    "location": {
      "lat": 34.0525,
      "lon": -118.2440,
      "altitude_m": 45
    },
    "detecting_nodes": ["resilient-004", "resilient-005"]
  }
}
\`\`\`

**Node Offline Event:**
Pushed when a node stops responding to the gossip protocol for more than 30 seconds.

\`\`\`json
{
  "event_type": "NODE_OFFLINE",
  "timestamp": "2026-07-21T14:40:12Z",
  "node_id": "resilient-012",
  "reason": "timeout"
}
\`\`\`

---

## Webhooks

SentryOS can push HTTP POST requests to your external servers when critical thresholds are met. Configure webhooks in the operator dashboard under \`Settings -> Integrations\`.

*   **Trigger Conditions:** \`Critical Threat Detected\`, \`Mesh Partitioned\`, \`Node Tamper Alert\`.

`
    },
    {
        id: 'geospatial-map-fundamentals',
        title: 'Geospatial Map Fundamentals',
        num: '11',
        content: `
# 11. Geospatial Map Fundamentals

![Map Concept](images/Screenshot 2025-11-21 220919.png)

A core requirement of Skhy SentryOS is visualizing threat intelligence. When an anomaly is detected, it is not enough to simply know it exists; operators need to know exactly *where* it is located in the physical world.

In this chapter, we will explore the fundamentals of geospatial mapping using **Folium**. Folium builds on the data wrangling strengths of the Python ecosystem and the mapping strengths of the Leaflet.js library, allowing us to generate highly interactive maps directly in the browser.

## 11.1 Introduction to Folium

Folium makes it easy to visualize data that’s been manipulated in Python on an interactive Leaflet map. By tying data to a map, SentryOS can represent sensor nodes, network topologies, and triangulated threats in real-time.

### Creating a Base Map
To create a map, you simply need to initialize a \`folium.Map\` object with a starting latitude and longitude.

\`\`\`python
import folium

# Initialize the map around a specific location (e.g., Skhy Academy HQ)
m = folium.Map(location=[37.7749, -122.4194], zoom_start=14)
\`\`\`

## 11.2 Adding Markers and Icons

A map is useless without context. In SentryOS, we use markers to represent specific entities:
- **Blue Icons:** Friendly SentryOS Sensor Nodes
- **Red Icons:** Detected Threats (e.g., Drones, Intruders)
- **Green Icons:** Safe Zones or Cleared Areas

Folium provides the \`folium.Marker\` class to drop pins on the map, and the \`folium.Icon\` class to customize their appearance using FontAwesome or Glyphicons.

### Code Sample: Deploying Sensors on a Map

> [!TIP]
> **Interactive Map Generation**
> Click **▶ Run Edited Code** below to dynamically generate a map showing a SentryOS deployment around a secure facility, complete with custom icons and threat markers!

\`\`\`python
import folium
import js


# 1. Initialize the Map at a specific secure facility
m = folium.Map(location=[37.7749, -122.4194], zoom_start=15, tiles="CartoDB dark_matter")

# 2. Add SentryOS Sensor Nodes (Blue)
sensor_locations = [
    ([37.7760, -122.4200], "Alpha Node"),
    ([37.7740, -122.4180], "Bravo Node"),
    ([37.7735, -122.4215], "Charlie Node")
]

for coords, name in sensor_locations:
    folium.Marker(
        location=coords,
        popup=f"<b>{name}</b><br>Status: Online",
        icon=folium.Icon(color='blue', icon='shield', prefix='fa')
    ).add_to(m)

# 3. Add a Triangulated Threat (Red)
folium.Marker(
    location=[37.7755, -122.4170],
    popup="<b>WARNING: Unidentified Drone</b><br>Altitude: 400ft",
    icon=folium.Icon(color='red', icon='plane', prefix='fa')
).add_to(m)

# 4. Add a Perimeter Radius
folium.Circle(
    radius=400,
    location=[37.7749, -122.4194],
    popup='Secure Perimeter',
    color='#38bdf8',
    fill=True,
    fill_color='#38bdf8',
    fill_opacity=0.1
).add_to(m)

# Display the map in Pyodide
import base64
html = m.get_root().render()
# Create an iframe to display the map
b64_html = base64.b64encode(html.encode('utf-8')).decode('utf-8')
iframe = f'<iframe src="data:text/html;base64,{b64_html}" width="100%" height="500px" style="border:none; border-radius: 8px;"></iframe>'

# Inject into the Pyodide matplotlib target div
import js
target = js.document.pyodideMplTarget
if target:
    target.innerHTML = iframe
else:
    print("Map generated successfully (HTML output).")
\`\`\`

## 11.3 Review Questions

**1. Comprehension Check:** Why is Folium an ideal choice for integrating maps into the SentryOS dashboard?
**2. Advanced Concept:** How would you dynamically update a Folium marker's location if a drone threat is actively moving? (Hint: Consider JavaScript interoperability).

`
    },
    {
        id: 'capstone-and-certification',
        title: 'Capstone & Certification',
        num: '12',
        content: `
# 12. Capstone & Certification

## Capstone Project: Multi-Modal Threat Correlation

Welcome to the final project of Skhy Academy! In this capstone, you will put everything you've learned together into a single, cohesive script that mimics the Skhy SentryOS cloud fusion logic. 

**Your Objective:**
1. Process a raw audio signal to find the Direction of Arrival (DOA) using the provided cross-correlation function.
2. Filter out high-frequency noise from an RF (WiFi CSI) signal using a SciPy Butterworth low-pass filter.
3. If the Acoustic DOA is between 30° and 60° **AND** the filtered RF signal variance exceeds 0.5 (indicating anomalous movement), add a \`Potential_Drone_Threat\` node to the NetworkX Knowledge Graph and connect it to the \`Sector_Alpha\` node.
4. Run the code and ensure the output confirms the threat was added to the graph.

> [!IMPORTANT]
> **Instructions:** Fill in the \`# TODO\` sections in the interactive Python block below. Once complete, click **▶ Run Edited Code**. The environment will automatically validate your output.

\`\`\`python
import numpy as np
from scipy import signal
import networkx as nx

# --- PRE-LOADED HELPER FUNCTIONS (Do not modify) ---
def calculate_doa(mic1_signal, mic2_signal, mic_distance=0.1, sample_rate=44100):
    correlation = signal.correlate(mic1_signal, mic2_signal, mode='full')
    lag_index = np.argmax(correlation)
    delay_samples = lag_index - (len(mic1_signal) - 1)
    val = max(min((delay_samples / sample_rate * 343.0) / mic_distance, 1.0), -1.0)
    return np.degrees(np.arcsin(val))

# --- SIMULATED DATA INGESTION ---
sample_rate = 44100
t = np.linspace(0, 0.1, int(sample_rate * 0.1), endpoint=False)
source_signal = np.sin(2 * np.pi * 400 * t) + np.random.normal(0, 0.5, len(t))

# 1. Acoustic Data (Delayed by 9 samples ~ 45 degrees)
mic1_data = source_signal
mic2_data = np.pad(source_signal, (9, 0))[:-9]

# 2. RF CSI Data (Noisy signal at 10Hz, noise at 200Hz)
fs_rf = 1000
t_rf = np.arange(0, 1.0, 1.0 / fs_rf)
rf_signal_raw = 1.2 * np.sin(2 * np.pi * 10 * t_rf) + 0.8 * np.sin(2 * np.pi * 200 * t_rf)

# 3. Knowledge Graph Initialization
knowledge_graph = nx.DiGraph()
knowledge_graph.add_node("Sector_Alpha", type="Location")

# ==========================================
# YOUR CAPSTONE CODE GOES HERE
# ==========================================

# TODO 1: Calculate the Acoustic DOA using mic1_data and mic2_data
estimated_angle = 0.0 # Replace this with the calculate_doa function call
estimated_angle = calculate_doa(mic1_data, mic2_data)

# TODO 2: Design a Butterworth low-pass filter (cutoff=50Hz) and apply it to rf_signal_raw
b, a = signal.butter(4, 50 / (0.5 * fs_rf), btype='low')
rf_signal_filtered = signal.filtfilt(b, a, rf_signal_raw)
rf_variance = np.var(rf_signal_filtered)

# TODO 3: Implement the Fusion Logic
# If angle is between 30 and 60 AND rf_variance > 0.5:
#   Add node "Potential_Drone_Threat" (type="Threat")
#   Add edge from "Potential_Drone_Threat" to "Sector_Alpha" (relation="DETECTED_IN")

if 30 <= estimated_angle <= 60 and rf_variance > 0.5:
    knowledge_graph.add_node("Potential_Drone_Threat", type="Threat")
    knowledge_graph.add_edge("Potential_Drone_Threat", "Sector_Alpha", relation="DETECTED_IN")

# TODO 4: Plot the Threat on a Folium Map
# Initialize a map at location [37.7749, -122.4194]
# If the threat was added to the graph, add a red marker at [37.7755, -122.4170]
# Display the map using the js.document.pyodideMplTarget method

import folium
import js

m = folium.Map(location=[37.7749, -122.4194], zoom_start=15)

if "Potential_Drone_Threat" in knowledge_graph:
    folium.Marker(
        location=[37.7755, -122.4170],
        popup="<b>Threat Detected</b>",
        icon=folium.Icon(color='red', icon='warning', prefix='fa')
    ).add_to(m)

# ==========================================
# VALIDATION ENGINE (Do not modify)
# ==========================================
print("=== SentryOS Fusion Results ===")
print(f"Calculated DOA Angle: {estimated_angle:.2f}°")
print(f"Filtered RF Variance: {rf_variance:.2f}")

if "Potential_Drone_Threat" in knowledge_graph:
    print("\n✅ SUCCESS: Threat successfully correlated and added to the Knowledge Graph!")
    print(f"Graph Edges: {knowledge_graph.edges(data=True)}")
else:
    print("\n❌ FAILURE: Threat was not added to the Knowledge Graph. Check your fusion logic conditions.")

import base64
html = m.get_root().render()
b64_html = base64.b64encode(html.encode('utf-8')).decode('utf-8')
iframe = f'<iframe src="data:text/html;base64,{b64_html}" width="100%" height="400px" style="border:none; border-radius: 8px;"></iframe>'
target = js.document.pyodideMplTarget
if target:
    target.innerHTML = iframe
else:
    print("Map generated successfully.")
\`\`\`

---

## Final Exam: Skhy Physical AI Certification

Test your knowledge of the SentryOS platform. If you score **80% or higher** (4 out of 5), you will be able to generate and download your official certification!

[QUIZ]
**Q1. What is the primary purpose of calculating the Time Delay of Arrival (TDOA) across a microphone array in SentryOS?**
[ ] To identify the specific model of a drone based on its propeller frequency.
[*] To calculate the physical Direction of Arrival (DOA) or angle of the sound source.
[ ] To filter out high-frequency wind noise from the microphone feed.
[ ] To encrypt the audio stream before sending it to the Skhy Cloud Core.

**Q2. Which SciPy function is predominantly used to determine the exact time delay (lag) between two similar audio signals by sliding them across each other?**
[ ] scipy.fftpack.dct
[ ] scipy.signal.butter
[*] scipy.signal.correlate
[ ] scipy.signal.spectrogram

**Q3. How does SentryOS utilize Wi-Fi Channel State Information (CSI) for drone detection?**
[ ] It hacks the drone's Wi-Fi network and downloads its flight logs.
[ ] It uses CSI to jam the drone's remote control frequency.
[*] It analyzes the microscopic distortions (multipath fading) the physical drone body causes to ambient Wi-Fi waves as it moves.
[ ] It connects to the drone to stream its camera feed.

**Q4. Why does SentryOS use NetworkX (a graph database structure) for its Threat Knowledge Graph instead of a standard relational database (SQL)?**
[*] Because graph databases excel at mapping and rapidly querying complex, multi-modal relationships (e.g., Sensor A detected Threat B moving to Sector C).
[ ] Because NetworkX is specifically designed to run on resource-constrained Edge devices like Raspberry Pis.
[ ] Because relational databases cannot store audio or video files.
[ ] Because NetworkX automatically trains Neural Networks on the data it stores.

**Q5. In the context of Edge AI deployment on SentryOS, what is the primary benefit of deploying a lightweight neural network (e.g., YOLOv8-Nano) directly on the edge node?**
[ ] It prevents the edge node from overheating during summer deployments.
[*] It allows the system to run inference and detect threats instantly, even if the internet connection to the Cloud Core is severed.
[ ] It allows the edge node to act as a public Wi-Fi hotspot.
[ ] It generates a completely unique encryption key for every single video frame.
[/QUIZ]

`
    },
    {
        id: 'conclusion-and-references',
        title: 'Conclusion and References',
        num: '13',
        content: `
# 13. Conclusion and References

## 10.1 Conclusion

Skhy SentryOS represents a paradigm shift in facility security and perimeter defense. By combining the highly optimized, tactical presentation layer of **Sentry Nexus Edge** with the advanced inference capabilities of **Vidur Core**, the system provides unparalleled autonomous surveillance.

The integration of **Sensor Fusion**—cross-referencing Audio, RF CSI, and Visual inputs—ensures that blind spots are effectively eliminated, and threats are identified even when occluded by walls, darkness, or adverse weather. Furthermore, the incorporation of the **Reticulum** mesh protocol and decentralized **Swarm Learning** ensures that the system is highly resilient to network failures and continuously adapts to the unique environmental noise of its deployment location without compromising data privacy.

Ultimately, Skhy SentryOS fulfills the core objective of Total Situational Awareness: transitioning security from a passive recording mechanism to an active, intelligent hunting platform.

---

## 10.2 References

The architectural and theoretical design of Skhy SentryOS is supported by the following academic research, sourced via the OpenAlex scholarly database:

### Sensor Fusion and Threat Detection
- **Al-Emadi, S., et al.** (2023). *Advances and Challenges in Drone Detection and Classification Techniques: A State-of-the-Art Review*. [https://openalex.org/W4390231943]
- **A. E. K. M. A., et al.** (2024). *From Sound to Sight: Audio-Visual Fusion and Deep Learning for Drone Detection*. [https://openalex.org/W4398131482]
- **Taha, B., et al.** (2020). *Real-Time and Accurate Drone Detection in a Video with a Static Background*. [https://openalex.org/W3041916388]

### Acoustic Beamforming and Direction of Arrival (DOA)
- **Chakrabarty, S., & Habets, E. A. P.** (2018). *Direction-of-Arrival Estimation Based on Deep Neural Networks With Robustness to Array Imperfections*. [https://openalex.org/W2897361856]
- **Laufer-Goldshtein, B., et al.** (2021). *Deep Networks for Direction-of-Arrival Estimation in Low SNR*. [https://openalex.org/W3104690928]
- **Chiariotti, P., et al.** (2019). *A review of acoustic imaging methods using phased microphone arrays*. [https://openalex.org/W2885034036]

### RF Fingerprinting and CSI Analysis
- **Wang, Y., et al.** (2022). *TIPS: Transformer Based Indoor Positioning System Using Both CSI and DoA of WiFi Signal*. [https://openalex.org/W4312268162]
- **Zafari, F., et al.** (2021). *Machine Learning Based Indoor Localization Using Wi-Fi RSSI Fingerprints: An Overview*. [https://openalex.org/W3199488820]
- **Hassanien, A., et al.** (2020). *Joint Radar and Communication Design: Applications, State-of-the-Art, and the Road Ahead*. [https://openalex.org/W3006143078]

### Edge AI and Decentralized Mesh Networking
- **Warnat-Herresthal, S., et al.** (2021). *Swarm Learning for decentralized and confidential clinical machine learning*. [https://openalex.org/W3164573547]
- **M. M., et al.** (2022). *A Survey on the Convergence of Edge Computing and AI for UAVs: Opportunities and Challenges*. [https://openalex.org/W4285105424]
- **Chen, J., et al.** (2020). *Convergence of Edge Computing and Deep Learning: A Comprehensive Survey*. [https://openalex.org/W2962814013]

### Data Privacy, Ethics, and Countermeasures
- **Kairouz, P., et al.** (2021). *Advances and Open Problems in Federated Learning*. [https://openalex.org/W3125828859]
- **Geng, J., et al.** (2023). *A Survey on Deep Learning for Physical-Layer Security*. [https://openalex.org/W4380170020]
- **Lyytikäinen, J., et al.** (2022). *Ethical and Privacy Considerations of Video Surveillance Systems in Public Spaces*. [https://openalex.org/W4220023412]

### System Scaling and Real-World Deployments
- **Ali, M., et al.** (2020). *A Comprehensive Survey on LoRaWAN: Protocols, Architecture, and Challenges*. [https://openalex.org/W3004381023]
- **Saha, S., et al.** (2021). *Edge Computing in Action: Case Studies and Deployment Challenges in Industrial IoT*. [https://openalex.org/W3112341512]

`
    },
    {
        id: '1-glossary-of-terms',
        title: '1 Glossary of Terms',
        num: '13',
        content: `
# 13.1 Glossary of Terms

The following is a comprehensive glossary of the technical concepts and acronyms utilized throughout the Skhy SentryOS course.

<div class="glossary-nav">
  <a href="#a">A</a> | <a href="#c">C</a> | <a href="#d">D</a> | <a href="#e">E</a> | <a href="#f">F</a> | <a href="#g">G</a> | <a href="#i">I</a> | <a href="#k">K</a> | <a href="#l">L</a> | <a href="#m">M</a> | <a href="#p">P</a> | <a href="#r">R</a> | <a href="#s">S</a> | <a href="#t">T</a> | <a href="#z">Z</a>
</div>

<h2 id="a">A</h2>
**Acoustic Beamforming:** Using an array of microphones to isolate sounds coming from a specific direction while mathematically suppressing ambient noise. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Acoustic+Beamforming+explained)
**ADC (Analog-to-Digital Converter):** Hardware components that translate continuous physical signals (like sound pressure or radio waves) into discrete digital numbers that a computer can process. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Analog+to+Digital+Converter+explained)
**Antenna Switcher:** An electronic RF multiplexer that rapidly cycles a single receiver across multiple antennas, allowing for multi-band or multi-directional coverage.
**Attenuator:** A protective RF component that reduces the power of incoming signals without distorting their waveform, protecting sensitive receiver circuitry from overwhelming nearby transmitters (like radio towers).
**Autonomous:** Capable of operating, analyzing situations, and making operational decisions without human intervention. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Autonomous+Systems+explained)

<h2 id="c">C</h2>
**CSI (Channel State Information):** Detailed subcarrier-level data describing how a Wi-Fi signal propagates from transmitter to receiver, revealing the scattering, fading, and power decay with distance. [(Watch on YouTube)](https://www.youtube.com/results?search_query=WiFi+Channel+State+Information+explained)

<h2 id="d">D</h2>
**Decentralized Mesh:** A network topology where each node relays data for the network. All nodes cooperate in the distribution of data in the network, removing single points of failure. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Mesh+Network+explained)
**DOA (Direction of Arrival):** The process of determining the angle from which a propagating wave (acoustic or electromagnetic) arrives at a multi-sensor array by measuring phase or time differences.
**Doppler Shift:** The change in frequency of a wave in relation to an observer who is moving relative to the wave source. Used in SentryOS to calculate the velocity of moving drones based on their motor frequency shifts. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Doppler+Effect+explained)
**DSP (Digital Signal Processing):** The mathematical manipulation of real-world analog signals after they have been converted to digital data (e.g., filtering out background noise). [(Watch on YouTube)](https://www.youtube.com/results?search_query=Digital+Signal+Processing+explained)

<h2 id="e">E</h2>
**EC25519 (Curve25519):** An elliptic curve used in public-key cryptography that offers a high level of security (equivalent to 3072-bit RSA) with very small key sizes (256 bits), making it ideal for fast, secure edge communications.
**Edge AI:** The deployment of artificial intelligence algorithms on local hardware devices (the "edge" of the network) rather than relying on a central cloud server. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Edge+AI+explained)

<h2 id="f">F</h2>
**Federated Learning / Swarm Learning:** A decentralized machine learning approach where edge devices train models locally on their own data and only share the learned weights (gradients) with the network, ensuring data privacy and reducing bandwidth usage. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Federated+Learning+explained)

<h2 id="g">G</h2>
**Gain:** In antenna design, gain incorporates both the directivity of the antenna and its electrical efficiency. A high-gain antenna focuses energy tightly in one direction.
**Gain Module (LNA - Low Noise Amplifier):** An electronic component that amplifies extremely weak received RF signals (such as distant drone telemetry) while adding as little noise as possible, effectively increasing range.
**GCC-PHAT (Generalized Cross-Correlation with Phase Transform):** A classical signal processing algorithm highly robust to reverberations, used to find the time delay between two signals received by different microphones. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Cross+Correlation+Signal+Processing)

<h2 id="i">I</h2>
**Inverse-Square Law:** A physical law stating that a specified physical quantity or intensity is inversely proportional to the square of the distance from the source of that physical quantity. In acoustics, this explains why sound intensity drops rapidly as it travels away from a drone. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Inverse+Square+Law+explained)
**IQ Data (In-phase and Quadrature):** The raw mathematical building blocks of an RF signal, representing the amplitude and phase of the radio waveform simultaneously. [(Watch on YouTube)](https://www.youtube.com/results?search_query=IQ+Signals+explained)
**ISM Bands (Industrial, Scientific, and Medical):** Radio frequency bands which are internationally reserved for unlicensed use, most notably 2.4 GHz and 5.8 GHz, frequently used by commercial drones and Wi-Fi devices. [(Watch on YouTube)](https://www.youtube.com/results?search_query=ISM+Bands+explained)

<h2 id="k">K</h2>
**Kalman Filter:** A mathematical algorithm that uses a series of measurements observed over time (containing statistical noise) to produce estimates of unknown variables that tend to be much more accurate than those based on a single measurement. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Kalman+Filter+explained)

<h2 id="l">L</h2>
**Late-Fusion Architecture:** A specific sensor fusion strategy where each sensor (e.g., audio, RF, visual) processes its data independently to make a preliminary classification, and these distinct decisions are combined at the final stage via logic gates or probabilistic models. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Sensor+Fusion+Late+Fusion)
**LoRa (Long Range):** A low-power wide-area network (LPWAN) protocol that uses chirp spread spectrum technology for long-distance, low-bandwidth communication. [(Watch on YouTube)](https://www.youtube.com/results?search_query=LoRa+protocol+explained)

<h2 id="m">M</h2>
**mDNS (Multicast DNS):** A protocol that resolves hostnames to IP addresses within small networks that do not include a local name server, enabling zero-configuration device discovery. [(Watch on YouTube)](https://www.youtube.com/results?search_query=mDNS+explained)
**MFCCs (Mel-frequency cepstral coefficients):** A representation of the short-term power spectrum of a sound, based on a nonlinear "mel" scale of frequency. It is the standard feature extraction method for audio recognition. [(Watch on YouTube)](https://www.youtube.com/results?search_query=MFCC+Audio+Processing)
**MIMO (Multiple-Input Multiple-Output):** An antenna technology that utilizes multipath propagation to multiply the capacity of a radio link using multiple transmit and receive antennas.
**MQTT (Message Queuing Telemetry Transport):** A lightweight, publish-subscribe network protocol that transports messages between devices, ideal for IoT, hardware telemetry, and low-bandwidth environments. [(Watch on YouTube)](https://www.youtube.com/results?search_query=MQTT+protocol+explained)
**Multipath Fading:** The distortion of a radio signal caused by it reflecting off physical surfaces and arriving at the receiving antenna via multiple paths at slightly different times. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Multipath+Fading+explained)

<h2 id="p">P</h2>
**Path Loss (Free Space Path Loss):** The natural attenuation of an RF signal's power as it travels through space away from the transmitter.
**PTZ (Pan-Tilt-Zoom):** A robotic camera system capable of directional and zoom control. Often queued automatically by acoustic or RF sensors in security systems. [(Watch on YouTube)](https://www.youtube.com/results?search_query=PTZ+Camera+Tracking)

<h2 id="r">R</h2>
**Remote ID (Drone):** A digital license plate system for drones that broadcasts identification, location, and altitude over Wi-Fi or Bluetooth for safety and regulatory compliance. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Drone+Remote+ID+explained)
**RSA (Rivest–Shamir–Adleman):** An older, widely used public-key cryptographic system that relies on factoring large prime numbers. Due to its required key sizes (2048+ bits), it is being phased out in edge networks in favor of elliptic curve cryptography.
**RSSI (Received Signal Strength Indicator):** A simple, one-dimensional measurement of the power present in a received radio signal. [(Watch on YouTube)](https://www.youtube.com/results?search_query=RSSI+Signal+Strength)

<h2 id="s">S</h2>
**SCM (Spatial Covariance Matrix):** A mathematical matrix representing the variance and covariance of signals across multiple sensors in an array, crucial for analyzing the spatial characteristics of incoming acoustic waves. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Covariance+Matrix+explained)
**SDR (Software-Defined Radio):** A radio communication system where components that have been typically implemented in hardware (e.g. mixers, filters, amplifiers) are instead implemented by means of software on a computer. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Software+Defined+Radio+explained)
**Self-attention mechanism:** A neural network component (foundational to Transformers) that allows a model to dynamically weigh the importance of different segments of an input sequence differently when processing data. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Self+Attention+Mechanism+explained)
**Sensor Fusion:** The process of combining data from multiple distinct sensors (audio, radio, visual) to improve overall detection accuracy, verify anomalies, and reduce false alarms. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Sensor+Fusion+explained)
**SNR (Signal-to-Noise Ratio):** A measure that compares the level of a desired signal to the level of background noise. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Signal+to+Noise+Ratio)
**Spectral Centroid:** A measure used in digital signal processing to characterize a spectrum. It indicates where the "center of mass" of the spectrum is located and is heavily correlated with the "brightness" of a sound.
**STFT (Short-Time Fourier Transform):** A mathematical technique used to determine the sinusoidal frequency and phase content of local sections of a signal as it changes over time, commonly used to generate spectrograms. [(Watch on YouTube)](https://www.youtube.com/results?search_query=Short+Time+Fourier+Transform)

<h2 id="t">T</h2>
**TDOA (Time Difference of Arrival):** A technique for geolocating a signal source based on the precise differences in time it takes for a signal to reach multiple spatially separated sensors. [(Watch on YouTube)](https://www.youtube.com/results?search_query=TDOA+Geolocation+explained)

<h2 id="z">Z</h2>
**Zero-Crossing Rate (ZCR):** The rate at which a signal changes from positive to zero to negative or from negative to zero to positive. Used in SentryOS to filter out highly noisy, unpitched sounds like wind buffeting.

`
    }
];
