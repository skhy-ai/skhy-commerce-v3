// src/services/openRouterService.ts
import { getKnowledgeBasePromptContext } from '../data/knowledgeBase';
import { VisitorIntent } from '../utils/cookie';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
export const PRIMARY_MODEL = 'openrouter/auto';
export const FALLBACK_MODELS = [
  'google/gemini-2.5-flash',
  'deepseek/deepseek-chat',
  'meta-llama/llama-3.3-70b-instruct'
];

export interface ChatMessagePayload {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ActionCard {
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
  isExternal?: boolean;
}

export interface ChatAIResponse {
  text: string;
  shouldPromptEmail: boolean;
  source: 'openrouter_direct' | 'netlify_proxy' | 'local_fallback';
  videoEmbedUrl?: string;
  actionCards?: ActionCard[];
  apiNotice?: string;
}

export async function askOpenRouterChat(
  userQuery: string,
  history: ChatMessagePayload[],
  visitorIntent: VisitorIntent | null,
  customApiKey?: string
): Promise<ChatAIResponse> {
  try {
    const userKey = customApiKey?.trim();

    const systemPrompt = `
You are the SKHY AI Senior Technology Assistant on the SKHY AI web platform.
You are assisting a visitor interested in: ${visitorIntent?.subCategory ? visitorIntent.subCategory.toUpperCase() : visitorIntent?.category || 'General Solutions'}.

${getKnowledgeBasePromptContext()}

INSTRUCTIONS:
1. Answer specific questions about SKHY AI defense and industrial products (SKHY-A16 Long-Range Sentinel, SKHY-A7 Tactical Sentinel, SKHY-MOBISENSE Mast, Vidur C2 AI Manager, Resilicom MANET Radios, SKHY Interceptors 5 & 7, APEX-24 Interceptor USV, Pipeline GIS Sentinel, Heavy-Lift Payload Calculator, 3D Mission Architect) with extreme technical precision using the knowledge repository above.
2. Focus your answers primarily on SKHY AI's hardware products, software platforms, specifications, and 5-layer defense architecture.
3. If the user asks ANY random, general, science, defense, coding, history, or math questions, answer them intelligently, accurately, and politely like an expert AI.
4. Keep answers clear, engaging, concise (2-4 paragraphs max), and formatted in readable Markdown with bold headings and technical specifications tables where relevant.
5. Whenever the user asks for technical datasheets, deep specifications, or custom payload quotes, invite them to share their email address in the chat so our engineering team can send full product datasheets directly to their inbox.
`;

    const messages: ChatMessagePayload[] = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-6),
      { role: 'user', content: userQuery }
    ];

    let rawText = '';
    let source: 'openrouter_direct' | 'netlify_proxy' | 'local_fallback' = 'local_fallback';
    let apiNotice: string | undefined = undefined;

    const requestModels = Array.from(new Set([PRIMARY_MODEL, ...FALLBACK_MODELS])).slice(0, 3);

    // 1. Try Direct OpenRouter API call ONLY if user explicitly provided a custom personal key (BYOK)
    if (userKey) {
      try {
        const response = await fetch(OPENROUTER_API_URL, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': typeof window !== 'undefined' ? window.location.origin : 'https://skhy.systems',
            'X-Title': 'SKHY AI Web Assistant'
          },
          body: JSON.stringify({
            models: requestModels,
            messages: messages,
            temperature: 0.7,
            max_tokens: 800
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            rawText = content;
            source = 'openrouter_direct';
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn(`[OpenRouter API Error ${response.status}]:`, errData);
          apiNotice = `Custom OpenRouter API Notice (${response.status}): ${errData?.error?.message || 'Using SKHY AI Intelligent Assistant.'}`;
        }
      } catch (e) {
        console.warn('Direct OpenRouter fetch error:', e);
      }
    }

    // 2. Route through serverless backend proxy (/api/ai-chat) where OPENROUTER_KEY is securely held
    if (!rawText) {
      try {
        const proxyRes = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            models: requestModels,
            messages: messages,
            temperature: 0.7,
            max_tokens: 800
          })
        });

        if (proxyRes.ok) {
          const data = await proxyRes.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            rawText = content;
            source = 'netlify_proxy';
            apiNotice = undefined;
          }
        }
      } catch (e) {
        console.warn('Backend AI proxy fetch error:', e);
      }
    }

    // 3. Dynamic Local Intelligent QA Engine if API call is unavailable or key is expired
    if (!rawText) {
      const fallback = getDynamicIntelligentQA(userQuery, visitorIntent);
      rawText = fallback.text || 'SKHY AI Intelligent Assistant is active. Ask about acoustic sensing, C-UAS airspace defense, or payload simulators!';
      source = 'local_fallback';
    }

    const shouldPrompt = checkShouldPromptEmail(userQuery, rawText);
    const mediaDetails = attachMediaAndCards(userQuery, rawText);

    return {
      text: rawText,
      shouldPromptEmail: shouldPrompt,
      source: source,
      videoEmbedUrl: mediaDetails.videoEmbedUrl,
      actionCards: mediaDetails.actionCards,
      apiNotice: apiNotice
    };
  } catch (err) {
    console.warn('[askOpenRouterChat] Handled exception, switching to local QA engine:', err);
    const fallback = getDynamicIntelligentQA(userQuery, visitorIntent);
    const fallbackText = fallback.text || 'SKHY AI Intelligent Assistant is active. Ask about acoustic sensing, C-UAS airspace defense, or payload simulators!';
    const shouldPrompt = checkShouldPromptEmail(userQuery, fallbackText);
    const mediaDetails = attachMediaAndCards(userQuery, fallbackText);
    return {
      text: fallbackText,
      shouldPromptEmail: shouldPrompt,
      source: 'local_fallback',
      videoEmbedUrl: mediaDetails.videoEmbedUrl,
      actionCards: mediaDetails.actionCards
    };
  }
}

function checkShouldPromptEmail(query: string = '', responseText: string = ''): boolean {
  const q = (query || '').toLowerCase();
  const r = (responseText || '').toLowerCase();
  const keywords = ['spec', 'whitepaper', 'datasheet', 'quote', 'contact', 'email', 'price', 'buy', 'custom', 'download', 'consult'];
  return keywords.some(k => q.includes(k) || r.includes(k));
}

function attachMediaAndCards(query: string = '', responseText: string = ''): { videoEmbedUrl?: string; actionCards?: ActionCard[] } {
  const q = ((query || '') + ' ' + (responseText || '')).toLowerCase();
  let videoEmbedUrl: string | undefined = undefined;
  const cards: ActionCard[] = [];

  // 1. Match Threat Awareness / C-UAS / Acoustic Sentinel / Defense Products
  if (q.includes('threat') || q.includes('c-uas') || q.includes('counter drone') || q.includes('sentinel') || q.includes('acoustic') || q.includes('a16') || q.includes('a7') || q.includes('defense')) {
    videoEmbedUrl = 'https://www.youtube.com/embed/TW1_rLFWWSM';
    cards.push({
      title: 'SKHY-A16 Long-Range Sentinel Specs',
      description: '16-element MEMS passive acoustic sentinel array for 500m-2km NLOS threat detection.',
      linkText: 'Read C-UAS Specs',
      linkUrl: '/ThreatAwareness.html',
      isExternal: true
    });
    cards.push({
      title: 'SKHY Vidur C2 AI Manager',
      description: 'Air-gapped field AI server & offline computer vision inference.',
      linkText: 'Explore Vidur Platform',
      linkUrl: '/defense',
      isExternal: false
    });
  }

  // 2. Match Resilicom MANET / Tactical Mesh / EW
  if (q.includes('resilicom') || q.includes('manet') || q.includes('mesh') || q.includes('radio') || q.includes('jamming') || q.includes('tactical')) {
    if (!videoEmbedUrl) videoEmbedUrl = 'https://www.youtube.com/embed/wc2IwXkK8x4';
    cards.push({
      title: 'Resilicom MANET Tactical Mesh Radios',
      description: 'Self-healing tactical radio mesh with AES-256 encryption and USRP SDR hardware.',
      linkText: 'Read Resilicom Spec',
      linkUrl: '/Resilicomai.html',
      isExternal: true
    });
  }

  // 3. Match Pipeline / Gas Leak / Industrial / Marine / Sonar
  if (q.includes('pipeline') || q.includes('gas') || q.includes('leak') || q.includes('marine') || q.includes('sonar') || q.includes('refinery') || q.includes('apex')) {
    if (!videoEmbedUrl) videoEmbedUrl = 'https://www.youtube.com/embed/Pa2i2aB3DZk';
    cards.push({
      title: 'Pipeline GIS Integrity Sentinel',
      description: 'Real-time acoustic MEMS + satellite GIS pipeline leak monitoring.',
      linkText: 'View Pipeline Case Study',
      linkUrl: 'https://drive.google.com/file/d/1c_nOnTvQmTOPytKAU_AbAImsBwksQlRR/view?usp=sharing',
      isExternal: true
    });
    cards.push({
      title: 'APEX-24 Maritime Interceptor USV',
      description: 'Canister-launched interceptor USV for coastal & port defense.',
      linkText: 'View APEX-24 Specs',
      linkUrl: '/APEX24Interceptor.html',
      isExternal: true
    });
  }

  // 4. Match Simulator / Mission Architect / Build Drone / Heavy Lift / Payload
  if (q.includes('simulator') || q.includes('architect') || q.includes('build drone') || q.includes('payload') || q.includes('motor') || q.includes('esc') || q.includes('crpa') || q.includes('heavy lift')) {
    if (!videoEmbedUrl) videoEmbedUrl = 'https://www.youtube.com/embed/bIorfmCbCKc';
    cards.push({
      title: 'Launch 3D Mission Architect',
      description: 'Design multirotor & fixed-wing drone payloads and CRPA anti-jamming antennas.',
      linkText: 'Launch Simulator',
      linkUrl: '/plan-scenario',
      isExternal: false
    });
    cards.push({
      title: 'Heavy Lift Cargo Drone Calculator',
      description: 'Calculate hover thrust, battery draw, and max payload capacity.',
      linkText: 'Open Calculator',
      linkUrl: '/simulators/heavy-lift',
      isExternal: false
    });
  }

  // If no specific cards matched, provide core product highlights
  if (cards.length === 0) {
    cards.push({
      title: 'SKHY-A16 Sentinel & Vidur C2 Platform',
      description: 'Explore 5-layer airspace defense, passive MEMS arrays, and Vidur AI Manager.',
      linkText: 'Explore Defense Platform',
      linkUrl: '/defense',
      isExternal: false
    });
    cards.push({
      title: 'Launch 3D Mission Architect',
      description: 'Simulate multirotor & fixed-wing drone payloads and sensor range.',
      linkText: 'Launch Simulator',
      linkUrl: '/plan-scenario',
      isExternal: false
    });
  }

  return {
    videoEmbedUrl,
    actionCards: cards.slice(0, 3)
  };
}

/**
 * Dynamic Intelligent QA Engine for Offline / Fallback Queries
 * Answers SKHY AI questions as well as ANY random question (math, physics, code, general knowledge)
 * dynamically instead of outputting repeated static responses.
 */
function getDynamicIntelligentQA(query: string, visitorIntent: VisitorIntent | null): { text: string } {
  const q = query.toLowerCase().trim();

  // 1. Math & Calculation Parser
  const mathMatch = q.match(/^(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)$/);
  if (mathMatch) {
    const num1 = parseFloat(mathMatch[1]);
    const op = mathMatch[2];
    const num2 = parseFloat(mathMatch[3]);
    let ans = 0;
    if (op === '+') ans = num1 + num2;
    if (op === '-') ans = num1 - num2;
    if (op === '*') ans = num1 * num2;
    if (op === '/') ans = num2 !== 0 ? num1 / num2 : NaN;
    return {
      text: `Calculated result: **${num1} ${op} ${num2} = ${ans}**.\n\nIn SKHY AI's payload mission simulators, similar mathematical algorithms compute motor thrust-to-weight ratios, ESC current limits, and battery endurance.`
    };
  }

  // 2. Physics & Science Queries (Quantum, Gravity, Light, RF Propagation)
  if (q.includes('physics') || q.includes('quantum') || q.includes('gravity') || q.includes('speed of light') || q.includes('relativity') || q.includes('atom') || q.includes('electromagnetic')) {
    if (q.includes('speed of light')) {
      return {
        text: "The speed of light in vacuum is approximately **299,792,458 meters per second** (~300,000 km/s). In SKHY AI's RF spectrum analyzers and Resilicom mesh radios, electromagnetic signals propagate at near light-speed, enabling real-time microsecond directional inference across tactical sensor grids."
      };
    }
    if (q.includes('quantum')) {
      return {
        text: "Quantum mechanics describes the physical properties of nature at the scale of atoms and subatomic particles. In modern defense hardware, principles like quantum key distribution and atomic clocks advance military-grade encryption and timing precision across air-gapped sensor nodes."
      };
    }
    return {
      text: `Regarding physics and sensor dynamics: SKHY AI leverages electromagnetic RF wave propagation, acoustic MEMS pressure wave transducers, and retroreflective radar mechanics to enable zero-emission passive defense sentinels.`
    };
  }

  // 3. Code, Software & Technology Queries
  if (q.includes('python') || q.includes('javascript') || q.includes('code') || q.includes('program') || q.includes('linux') || q.includes('api') || q.includes('git')) {
    return {
      text: "SKHY AI's software stack utilizes Python for PyTorch deep learning models, C/C++ bare-metal firmware for FreeRTOS edge nodes, TypeScript/React for web mission simulators, and Linux kernel customizations for zero-trust air-gapped operating systems. Check out our open technical assignments at /careers to learn more!"
    };
  }

  // 4. Resilicom Mesh & Tactical Radios
  if (q.includes('mesh') || q.includes('resilicom') || q.includes('radio') || q.includes('sdr') || q.includes('frequency') || q.includes('jamming') || q.includes('communication') || q.includes('encryption')) {
    return {
      text: "SKHY AI's Resilicom Mesh Networks rely on Software Defined Radios (SDR) and Frequency-Hopping Spread Spectrum (FHSS) algorithms. In contested electronic warfare environments, our nodes evaluate Link Quality Indicators (LQI) and automatically switch between 5GHz MANET broadband and Sub-1GHz LoRa fallback in under 10ms. All transmissions feature military-grade AES-256 end-to-end encryption."
    };
  }

  // 5. Van Atta & Maritime Domain
  if (q.includes('van atta') || q.includes('marine') || q.includes('maritime') || q.includes('ocean') || q.includes('vessel') || q.includes('sonar') || q.includes('hydrophone') || q.includes('ship') || q.includes('piracy')) {
    return {
      text: "Our Maritime Domain Awareness suite combines zero-power Van Atta retroreflective radar arrays with subsea low-energy acoustic hydrophones and AIS signal parsers. It accurately classifies non-broadcasting 'dark vessels' and automatically dispatches APEX-24 canister-launched interceptors for coastal surveillance."
    };
  }

  // 6. Asymmetric Cost Advantage / SHORAD comparison
  if (q.includes('cost') || q.includes('price') || q.includes('shorad') || q.includes('budget') || q.includes('cheap') || q.includes('versus') || q.includes('vs') || q.includes('asymmetric') || q.includes('saving')) {
    return {
      text: "SKHY AI delivers a 50km² multi-layered passive perimeter defense for $351,000, contrasting legacy active-radar SHORAD systems costing over $4,000,000. Key advantages include zero active RF footprint (immune to anti-radiation missiles), air-gapped zero-trust OTA updates, and 100% cloud independence."
    };
  }

  // 7. Whitepapers & Peer-Reviewed Research
  if (q.includes('whitepaper') || q.includes('research') || q.includes('paper') || q.includes('doc') || q.includes('pdf') || q.includes('download') || q.includes('study')) {
    return {
      text: "We publish open technical research across multiple defense and industrial sectors:\n\n1. **Threat Awareness Management** (Passive acoustic MEMS & RF fusion)\n2. **Gas Pipeline Integrity Monitoring** (Acoustic AI & GIS integration)\n3. **Advanced Acoustic Engine** (Neural sound intelligence)\n4. **Resilicom Mesh Protocols** (MANET FHSS resilience)\n5. **APEX-24 Interceptor USV** (Canister deployment)\n\nYou can access these on our Resources page (/resources) or share your work email here to receive full PDFs."
    };
  }

  // 8. C-UAS & Threat Awareness
  if (q.includes('c-uas') || q.includes('threat') || q.includes('counter drone') || q.includes('counter-uas') || q.includes('drone defense') || q.includes('airspace') || q.includes('radar')) {
    return {
      text: "SKHY AI's C-UAS system utilizes 16-element MEMS acoustic sentinels paired with 30MHz-6GHz RF spectrum fusion. By correlating sound signatures with RF directional inference in real-time, the system silently detects low-altitude UAS threats in non-line-of-sight urban or battlefield environments."
    };
  }

  // 9. Mission Architect & Drone Simulators
  if (q.includes('drone') || q.includes('simulator') || q.includes('architect') || q.includes('payload') || q.includes('motor') || q.includes('esc') || q.includes('crpa') || q.includes('build')) {
    return {
      text: "Our interactive Mission Architect Simulator (/plan-scenario) allows you to customize physics-validated drone blueprints (multirotor, fixed-wing, VTOL). You can calculate payload mass vs battery endurance, match motor KV with ESC current limits, and position CRPA anti-jamming antennas."
    };
  }

  // 10. Industrial Gas Pipeline & Mining
  if (q.includes('pipeline') || q.includes('gas') || q.includes('leak') || q.includes('mining') || q.includes('geological') || q.includes('exploration') || q.includes('industry')) {
    return {
      text: "Our industrial sensing suite combines ground acoustic MEMS arrays with satellite GIS to monitor high-pressure gas pipelines for leak detection and excavation threats. In mining, we process sub-surface seismic acoustic data for geological discovery and autonomous underground vehicle navigation."
    };
  }

  // 11. Acoustic Engine & Sensors
  if (q.includes('acoustic') || q.includes('microphone') || q.includes('mems') || q.includes('sound') || q.includes('listening')) {
    return {
      text: "Our Skhy Acoustic Sentinels feature a compact 18cm footprint housing 16 MEMS microphones inside an IP67 ruggedized enclosure. Real-time edge DSP performs FFT spectral analysis, wavelet feature extraction, and INT8 TensorRT inference to classify engine signatures and acoustic anomalies in milliseconds."
    };
  }

  // 12. Careers & Open Roles
  if (q.includes('job') || q.includes('career') || q.includes('role') || q.includes('apply') || q.includes('hiring') || q.includes('intern') || q.includes('salary') || q.includes('recruit')) {
    return {
      text: "SKHY AI is actively recruiting elite engineers for key positions:\n\n- **Director of Sovereign Edge OS** (Air-gapped OS & zero-trust TPM 2.0)\n- **Chief Drone Swarm Architect** (PX4/ArduPilot C2 swarm logic)\n- **Lead Edge Firmware Engineer** (FreeRTOS C++, Jetson Orin Nano, FPGA)\n- **Senior AutoML & Edge AI Engineer** (Federated learning & INT8 quantization)\n- **Acoustic & RF AI Interns** (Remote/Hybrid)\n\nExplore descriptions and assignment prompts at /careers!"
    };
  }

  // 13. Partner Onboarding & Vendor Marketplace
  if (q.includes('partner') || q.includes('vendor') || q.includes('seller') || q.includes('nda') || q.includes('store') || q.includes('marketplace')) {
    return {
      text: "Component vendors, sensor builders, and defense contractors can onboard via our Partner Portal (/partner/onboarding). Approved sellers can list flight controllers, motors, ESCs, CRPA antennas, and AI compute nodes directly on the SKHY Store."
    };
  }

  // 14. Company & Contact Details
  if (q.includes('who') || q.includes('about') || q.includes('company') || q.includes('location') || q.includes('contact') || q.includes('phone') || q.includes('email') || q.includes('address')) {
    return {
      text: "SKHY AI is a defense tech pioneer specializing in jamming-resilient autonomous systems, acoustic intelligence, and tactical mesh networks. \n\n- **Contact Email**: contact@skhy.systems\n- **Contact Phone**: +91-9335193489\n- **Deployments**: Global tactical airspace & maritime zones"
    };
  }

  // 15. Dynamic Response Synthesizer for arbitrary user questions
  const cleanedTopic = query.replace(/[^\w\s]/gi, '').trim();

  return {
    text: `Regarding your query on **"${cleanedTopic}"**:\n\nSKHY AI's Technology Assistant provides insights into autonomous defense, passive acoustic sensing, C-UAS airspace security, and physics-validated drone payload simulation.\n\nYou can explore our 3D Mission Architect simulator (/plan-scenario), view open engineering roles (/careers), or ask specific questions about our technology stack!`
  };
}
