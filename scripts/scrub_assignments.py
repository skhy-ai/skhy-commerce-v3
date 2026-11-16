import sys

file_path = r'c:\Projects\skhyai-website\skhy-ai-website-main\src\pages\Careers.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    "'Draft a security architecture document detailing how Vidur OS prevents model poisoning and ensures secure OTA updates in a zero-trust, cloud-denied mesh environment.'":
    "'Draft a security architecture document detailing how a sovereign edge operating system prevents model poisoning and ensures secure OTA updates in a zero-trust, cloud-denied mesh environment.'",

    "'Outline a C2 logic flowchart for the mid-flight retargeting of a 5-drone interceptor swarm based on real-time telemetry from a Surveyor Drone when the primary target employs evasive maneuvers.'":
    "'Outline a C2 logic flowchart for the mid-flight retargeting of a 5-drone interceptor swarm based on real-time telemetry from an aerial top-down radar drone when the primary target employs evasive maneuvers.'",

    "'Provide an architecture or C++ code sample for an RTOS-based network driver that dynamically switches between multiple MANET radio interfaces (e.g., AB20, AB40) based on Link Quality Indicator (LQI) to maintain OTA channels.'":
    "'Provide an architecture or C++ code sample for an RTOS-based network driver that dynamically switches between multiple MANET radio interfaces based on Link Quality Indicator (LQI) to maintain OTA channels.'",

    "'Develop a threat classification state machine for the autonomous APEX-24 USV to track, verify, and intercept a \"dark vessel\" using fused AIS data and onboard acoustic sensors.'":
    "'Develop a threat classification state machine for an autonomous surface vehicle (USV) to track, verify, and intercept a \"dark vessel\" using fused AIS data and onboard acoustic sensors.'",

    "'Map out a tiered 30-day go-to-market plan detailing how you would onboard 5 new private maritime security companies as distributors for our APEX-24 USV and Buoy-Mounted Nodes.'":
    "'Map out a tiered 30-day go-to-market plan detailing how you would onboard 5 new private maritime security companies as distributors for autonomous interception surface vessels and buoy-mounted sensor nodes.'"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('File updated successfully.')
