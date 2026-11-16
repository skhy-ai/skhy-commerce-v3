import { EyeOff, ShieldAlert, Radio, Clock, Globe, Zap } from 'lucide-react';

export const defaultProblemStatements = [
    {
      title: 'Critical Blind Spots',
      description: 'Conventional surveillance fails to detect active threats like obscured weapons, hidden intruders, or low-signature drones, leaving perimeters vulnerable.',
      icon: <EyeOff className="h-6 w-6" />,
      bgColor: 'bg-red-900/20',
      textColor: 'text-red-400'
    },
    {
      title: 'Data Sovereignty Risks',
      description: 'Cloud-dependent security systems expose sensitive intelligence to foreign servers and latency. Secure, localized processing is non-negotiable for defense.',
      icon: <ShieldAlert className="h-6 w-6" />,
      bgColor: 'bg-orange-900/20',
      textColor: 'text-orange-400'
    },
    {
      title: 'Asymmetric Aerial Threats',
      description: 'Cheap, commercial drones can bypass millions in traditional air defense. Detecting these low-RCS threats requires specialized multi-modal acquisition.',
      icon: <Radio className="h-6 w-6" />,
      bgColor: 'bg-blue-900/20',
      textColor: 'text-blue-400'
    },
    {
      title: 'Human Reaction Latency',
      description: 'The "OODA Loop" gap. By the time a human operator verifies an alert, the threat has already acted. Autonomous AI verification is the only counter.',
      icon: <Clock className="h-6 w-6" />,
      bgColor: 'bg-purple-900/20',
      textColor: 'text-purple-400'
    },
    {
      title: 'Supply Chain Fragility',
      description: 'Dependence on single-source, non-sovereign components creates strategic vulnerability. Diversifying hardware origins is critical for long-term operational resilience.',
      icon: <Globe className="h-6 w-6" />,
      bgColor: 'bg-emerald-900/20',
      textColor: 'text-emerald-400'
    },
    {
      title: 'Mission Planning Complexity',
      description: 'Legacy hardware integration is slow and manual. Operators need AI-driven "Mission Architects" to optimize airframe, payload, and power profiles in seconds.',
      icon: <Zap className="h-6 w-6" />,
      bgColor: 'bg-yellow-900/20',
      textColor: 'text-yellow-400'
    }
];

export const defaultCoreApplications = [
    {
        id: '900130',
        name: 'Skhy Threat Awareness & Airspace System',
        description: 'Dual-purpose passive acoustic C2 platform. Secures military borders with silent sensor meshes — and repurposes as an urban UTM skyway grid to track cargo drones and eVTOL air taxis in real time.',
        videoId: 'gVbOFm-XE7U',
        bulletPoints: [
            'Multi-Modal Sensor Fusion (Acoustic + RF + Visual)',
            'Passive Tracking — Zero Active Emissions, Zero Detection Risk',
            'Dual-Use: Sovereign Border Shield & Civilian UTM Skyway Grid'
        ]
    },
    {
        id: '900027',
        name: 'Skhy Vidur Secure AI Platform',
        description: 'A micro-modular AI platform designed for secure, distributed, and agentic AI operations. Skhy Vidur Manager acts as the central AI Server & Hardware Guard, managing local models and routing inference tasks with strictly isolated intelligence.',
        videoId: 'Z_lzV_X4cis',
        bulletPoints: [
            'Secure, Local Model Management & Routing',
            'Hardware Guard: Real-time RAM/VRAM Monitoring',
            'Strictly Isolated Intelligence Client (No direct internet)'
        ]
    },
    {
        id: '800005',
        name: 'Pipeline Asset Management AI',
        description: 'Protect your strategic assets over vast area of network. Advanced AI-powered monitoring system combining acoustic sensing, GIS integration, and real-time analytics to ensure pipeline integrity and operational safety across distributed infrastructure.',
        videoId: 'Pa2i2aB3DZk',
        bulletPoints: [
            'Acoustic Leak Detection with Advanced AI',
            'GIS-Integrated Asset Management & Visualization',
            'Real-time Pressure & Flow Monitoring',
            'Predictive Maintenance & Compliance Reporting'
        ]
    }
];
