import React, { useMemo, useCallback } from 'react';
import {
    ReactFlow,
    Background,
    Controls,
    MiniMap,
    useNodesState,
    useEdgesState,
    addEdge,
    Position,
    Handle,
    Node,
    Edge,
    Connection,
    BackgroundVariant,
    MarkerType,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useCart } from '../../../contexts/CartContext';
import { Zap, Info, History, Database, ShoppingCart } from 'lucide-react';
import { findWiringDiagram } from '../../../data/mermaid/wiringIndex';

// ─── Pin Rail Types ────────────────────────────────────────────────────────────
const RAIL_COLORS: Record<string, string> = {
    power: '#f59e0b',
    data: '#0ea5e9',
    control: '#10b981',
    rf: '#c084fc',
    video: '#60a5fa',
    gnd: '#6b7280',
    default: '#94a3b8',
};

function railColor(portName: string): string {
    const n = portName?.toLowerCase() || '';
    if (n.includes('power') || n.includes('vcc') || n.includes('+')) return RAIL_COLORS.power;
    if (n.includes('gnd') || n.includes('ground') || n.includes('-')) return RAIL_COLORS.gnd;
    if (n.includes('video') || n.includes('av') || n.includes('vtx')) return RAIL_COLORS.video;
    if (n.includes('rf') || n.includes('tx') || n.includes('rx') || n.includes('sma')) return RAIL_COLORS.rf;
    if (n.includes('data') || n.includes('uart') || n.includes('usb') || n.includes('spi')) return RAIL_COLORS.data;
    if (n.includes('ctl') || n.includes('pwm') || n.includes('sbus') || n.includes('crsf')) return RAIL_COLORS.control;
    return RAIL_COLORS.default;
}

// ─── Hardware Node Component ──────────────────────────────────────────────────
function HardwareNode({ data }: { data: any }) {
    const layout = data.pin_layout;
    
    // Default pins based on segment if layout is missing
    const defaultPins: Record<string, string[]> = {
        air: ['VCC', 'GND', 'RF_OUT', 'UART_TX', 'UART_RX', 'PWM_1'],
        gcs: ['VCC', 'GND', 'RF_IN', 'USB_D+', 'USB_D-', 'HDMI'],
        ground: ['VCC', 'GND', 'RF_IN', 'USB_D+', 'USB_D-', 'HDMI'],
        rover: ['VCC', 'GND', 'CAN_H', 'CAN_L', 'PWM_1', 'PWM_2'],
        general: ['VCC', 'GND', 'SIGNAL_IN', 'SIGNAL_OUT'],
    };

    const isJsonObject = layout && typeof layout === 'object' && !Array.isArray(layout);
    let pins: string[] = (Array.isArray(layout) && layout.length > 0) ? layout : (isJsonObject ? [] : (defaultPins[data.segment] || defaultPins.general));
    
    // Group ports if it's a rich JSON object
    const ports = isJsonObject ? layout.ports : null;
    const portEntries = ports ? Object.entries(ports) : null;

    const segColor: Record<string, string> = {
        air: '#0ea5e9',
        gcs: '#10b981',
        ground: '#10b981',
        rover: '#f59e0b',
        general: '#a78bfa',
    };
    const borderColor = segColor[data.segment || 'general'] || '#475569';

    return (
        <div
            className="group"
            style={{
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                border: `2px solid ${borderColor}`,
                borderRadius: 12,
                minWidth: 240,
                maxWidth: 300,
                boxShadow: `0 0 25px ${borderColor}33`,
                fontFamily: 'Inter, system-ui, sans-serif',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <div style={{ background: `${borderColor}20`, borderBottom: `1px solid ${borderColor}44`, padding: '12px 14px' }}>
                <div className="flex justify-between items-start">
                    <div>
                        <div style={{ color: borderColor, fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 4 }}>
                            {data.segment || 'Component'}
                        </div>
                        <div style={{ color: '#f8fafc', fontSize: 13, fontWeight: 800, lineHeight: 1.2 }}>{data.label}</div>
                    </div>
                    {isJsonObject && <Database className="w-4 h-4 text-sky-400 opacity-70" />}
                </div>
                <div className="flex items-center gap-4 mt-3">
                    {data.power_draw_w != null && (
                        <div style={{ color: '#f59e0b', fontSize: 10, fontWeight: 700 }} className="flex items-center gap-1.5">
                            <Zap size={11} className="fill-current" /> {Number(data.power_draw_w).toFixed(1)} W
                        </div>
                    )}
                    {data.price > 0 && (
                        <div style={{ color: '#94a3b8', fontSize: 10, fontWeight: 500 }}>${Number(data.price).toLocaleString()}</div>
                    )}
                </div>
            </div>

            {/* Ports & Pins Area */}
            <div style={{ padding: '12px 0', minHeight: 60, position: 'relative' }}>
                {portEntries ? (
                    // Rich JSON Port Rendering
                    <div className="flex flex-col gap-4 px-4">
                        {portEntries.map(([portName, pinList]: [string, any]) => (
                            <div key={portName} className="relative">
                                <div className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                    <div className="h-px flex-1 bg-slate-800" />
                                    {portName}
                                    <div className="h-px flex-1 bg-slate-800" />
                                </div>
                                <div className="flex flex-wrap gap-y-3">
                                    {(pinList as string[]).map((pin, i) => (
                                        <div key={i} className="flex flex-col items-center w-1/4 gap-1.5 relative">
                                            <div className="relative w-[10px] h-[10px] mx-auto">
                                                <Handle
                                                    type="source"
                                                    position={Position.Bottom}
                                                    id={`${portName}-${pin}`}
                                                    style={{ position: 'absolute', background: railColor(pin), width: 10, height: 10, borderRadius: '50%', border: '2px solid #0f172a', top: 0, left: 0, margin: 0, transform: 'none' }}
                                                />
                                                <Handle
                                                    type="target"
                                                    position={Position.Top}
                                                    id={`${portName}-${pin}`}
                                                    style={{ position: 'absolute', background: railColor(pin), width: 10, height: 10, borderRadius: '50%', border: '2px solid #0f172a', top: 0, left: 0, margin: 0, transform: 'none' }}
                                                />
                                            </div>
                                            <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>{pin}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Legacy Array-based or Generic Handles
                    // Each pin gets BOTH a target handle (left) and source handle (right)
                    // IDs: tgt-{PIN} and src-{PIN} so buildEdges can reference them unambiguously
                    <div className="flex justify-between px-4 py-2">
                        <div className="flex flex-col gap-4">
                            {pins.map((pin, i) => (
                                <div key={i} className="flex items-center gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="w-1.5 h-3 bg-slate-600 rounded-t-sm" />
                                        <Handle 
                                            type="target" 
                                            position={Position.Left} 
                                            id={`tgt-${pin}`} 
                                            style={{ position: 'static', background: railColor(pin), width: 12, height: 12, border: '2px solid #0f172a', borderRadius: 3 }} 
                                        />
                                    </div>
                                    <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 600 }}>{pin}</span>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-col gap-4 items-end">
                            {pins.map((pin, i) => (
                                <div key={i} className="flex items-center gap-3 flex-row-reverse">
                                    <div className="flex flex-col items-center">
                                        <div className="w-1.5 h-3 bg-slate-600 rounded-t-sm" />
                                        <Handle 
                                            type="source" 
                                            position={Position.Right} 
                                            id={`src-${pin}`} 
                                            style={{ position: 'static', background: railColor(pin), width: 12, height: 12, border: '2px solid #0f172a', borderRadius: 3 }} 
                                        />
                                    </div>
                                    <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 600 }}>{pin}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const NODE_TYPES = { hardware: HardwareNode };

// ─── Edge legend ──────────────────────────────────────────────────────────────
const LEGEND = [
    { color: RAIL_COLORS.power, label: 'Power Rail' },
    { color: RAIL_COLORS.data, label: 'Data / UART' },
    { color: RAIL_COLORS.control, label: 'Control / PWM' },
    { color: RAIL_COLORS.rf, label: 'RF / Antenna' },
    { color: RAIL_COLORS.video, label: 'Video Link' },
    { color: RAIL_COLORS.gnd, label: 'Ground' },
];

// ─── Build initial edges from segment adjacency ───────────────────────────────
// Handle ID contract:
//   Rich JSON port nodes  → source & target handles share id `${portName}-${pin}`
//                           (both source + target rendered on same pin circle)
//   Legacy/null layout    → source handles: `src-${pin}`, target handles: `tgt-${pin}`
function buildEdges(nodes: Node[]): Edge[] {
    const edges: Edge[] = [];

    // Returns { pin, srcHandle, tgtHandle } for each pin on a node
    const getPinsInfo = (node: Node) => {
        const layout = node.data.pin_layout;
        const isJsonObject = layout && typeof layout === 'object' && !Array.isArray(layout);
        
        if (isJsonObject && (layout as any).ports) {
            const list: { pin: string, srcHandle: string, tgtHandle: string }[] = [];
            Object.entries((layout as any).ports).forEach(([portName, pins]: [string, any]) => {
                (pins as string[]).forEach(pin => {
                    // Rich nodes use the same handle id for both source and target
                    const h = `${portName}-${pin}`;
                    list.push({ pin, srcHandle: h, tgtHandle: h });
                });
            });
            return list;
        }

        const defaultPins: Record<string, string[]> = {
            air: ['VCC', 'GND', 'RF_OUT', 'UART_TX', 'UART_RX', 'PWM_1'],
            gcs: ['VCC', 'GND', 'RF_IN', 'USB_D+', 'USB_D-', 'HDMI'],
            ground: ['VCC', 'GND', 'RF_IN', 'USB_D+', 'USB_D-', 'HDMI'],
            rover: ['VCC', 'GND', 'CAN_H', 'CAN_L', 'PWM_1', 'PWM_2'],
            general: ['VCC', 'GND', 'SIGNAL_IN', 'SIGNAL_OUT'],
        };
        const pins: string[] = (Array.isArray(layout) && layout.length > 0)
            ? layout
            : (defaultPins[node.data.segment as string] || defaultPins.general);

        // Legacy nodes: src-{PIN} for source, tgt-{PIN} for target
        return pins.map(pin => ({ pin, srcHandle: `src-${pin}`, tgtHandle: `tgt-${pin}` }));
    };

    // 1. Cross-segment RF Link (Air <-> GCS)
    const airNodes = nodes.filter(n => n.data.segment === 'air');
    const gcsNodes = nodes.filter(n => n.data.segment === 'gcs' || n.data.segment === 'ground');

    airNodes.forEach(a => {
        gcsNodes.forEach(g => {
            const aPins = getPinsInfo(a);
            const gPins = getPinsInfo(g);
            
            // Air node is the source → use srcHandle; GCS node is the target → use tgtHandle
            const aRf = aPins.find(p => p.pin.includes('RF') || p.pin.includes('SMA')) || aPins[0];
            const gRf = gPins.find(p => p.pin.includes('RF') || p.pin.includes('SMA')) || gPins[0];

            if (!aRf || !gRf) return;

            edges.push({
                id: `e-rf-${a.id}-${g.id}`,
                source: a.id, sourceHandle: aRf.srcHandle,
                target: g.id, targetHandle: gRf.tgtHandle,
                animated: true,
                style: { stroke: RAIL_COLORS.rf, strokeWidth: 2, strokeDasharray: '5 5' },
                markerEnd: { type: MarkerType.ArrowClosed, color: RAIL_COLORS.rf },
                label: 'RF Uplink/Downlink',
                labelStyle: { fill: '#c084fc', fontSize: 9, fontFamily: 'monospace' },
            });
        });
    });

    // 2. Intra-segment component interconnects (pin-based)
    const segGroups: Record<string, Node[]> = {};
    nodes.forEach(n => {
        const seg = String(n.data.segment || 'general');
        if (!segGroups[seg]) segGroups[seg] = [];
        segGroups[seg].push(n);
    });

    Object.values(segGroups).forEach(group => {
        group.forEach((srcNode, srcIdx) => {
            const srcPins = getPinsInfo(srcNode);

            group.forEach((tgtNode, tgtIdx) => {
                if (srcIdx >= tgtIdx) return;
                const tgtPins = getPinsInfo(tgtNode);

                srcPins.forEach((sp, sIdx) => {
                    tgtPins.forEach((tp, tIdx) => {
                        const isSmaOut = sp.pin.includes('SMA') || sp.pin.includes('RF_OUT') || sp.pin.includes('VTX');
                        const isRfIn = tp.pin.includes('RF_IN') || tp.pin.includes('ANT') || tp.pin.includes('SMA');
                        if (isSmaOut && isRfIn) {
                            edges.push({
                                id: `e-sma-${srcNode.id}-${tgtNode.id}-${sIdx}-${tIdx}`,
                                source: srcNode.id, sourceHandle: sp.srcHandle,
                                target: tgtNode.id, targetHandle: tp.tgtHandle,
                                style: { stroke: RAIL_COLORS.rf, strokeWidth: 1.5 },
                                animated: true
                            });
                        }

                        const isPwrOut = sp.pin.includes('VCC') || sp.pin.includes('PWR') || sp.pin.includes('BATT');
                        const isPwrIn = tp.pin.includes('VCC') || tp.pin.includes('PWR') || tp.pin.includes('VIN');
                        if (isPwrOut && isPwrIn) {
                            edges.push({
                                id: `e-pwr-${srcNode.id}-${tgtNode.id}-${sIdx}-${tIdx}`,
                                source: srcNode.id, sourceHandle: sp.srcHandle,
                                target: tgtNode.id, targetHandle: tp.tgtHandle,
                                style: { stroke: RAIL_COLORS.power, strokeWidth: 1, strokeDasharray: '4 2' },
                            });
                        }
                    });
                });
            });
        });
    });

    return edges;
}

// ─── Build nodes from cart items ──────────────────────────────────────────────
function buildNodes(items: any[]): Node[] {
    const SEGMENT_COLUMNS: Record<string, number> = {
        air: 0,
        ground: 1,
        gcs: 1,
        rover: 2,
        general: 2,
    };
    const segCounters: Record<string, number> = {};

    return items.map((item, idx) => {
        const product = item.product || {};
        const seg = product.segment || item.segment || 'general';
        const col = SEGMENT_COLUMNS[seg] ?? 2;
        const rowIdx = segCounters[seg] ?? 0;
        segCounters[seg] = rowIdx + 1;

        return {
            id: String(item.id || item.product_id || `node-${idx}`),
            type: 'hardware',
            position: { x: col * 350 + 40, y: rowIdx * 240 + 60 },
            data: {
                label: product.name || item.name || `Component ${idx + 1}`,
                segment: seg,
                pin_layout: product.pin_layout, // Passing full layout object/array
                power_draw_w: product.power_draw_w ?? item.power_draw_w ?? 0,
                price: product.base_price ?? item.price ?? 0,
                product_id: product.id || item.product_id
            },
        };
    });
}

// ─── Power HUD ────────────────────────────────────────────────────────────────
function PowerHUD({ items }: { items: any[] }) {
    const totals = useMemo(() => {
        const seg = { air: 0, gcs: 0, ground: 0, rover: 0, total: 0 };
        items.forEach(item => {
            const w = Number(item.product?.power_draw_w ?? item.power_draw_w ?? 0);
            const s = item.product?.segment || item.segment || 'general';
            if (s === 'air') seg.air += w;
            else if (s === 'gcs' || s === 'ground') seg.gcs += w;
            else if (s === 'rover') seg.rover += w;
            seg.total += w;
        });
        return seg;
    }, [items]);

    return (
        <div className="flex gap-4 p-4 bg-slate-900 border-b border-slate-700/60 shrink-0 overflow-x-auto no-scrollbar">
            {[
                { label: 'Air Segment (Bus)', value: totals.air, color: 'text-sky-400', sub: 'Onboard Lipo/Fuel' },
                { label: 'GCS Base Power', value: totals.gcs, color: 'text-emerald-400', sub: 'External DC/AC' },
                { label: 'Rover Core Load', value: totals.rover, color: 'text-amber-400', sub: 'Mobile 12S/24V' },
                { label: 'Total Mission Load', value: totals.total, color: 'text-white', sub: 'Aggregate Watts' },
            ].map(hud => (
                <div key={hud.label} className="min-w-[160px] flex-1 bg-slate-950/40 rounded-xl px-5 py-3 border border-slate-800/60 shadow-lg">
                    <div className="text-[8px] uppercase tracking-[2px] text-slate-500 mb-1 font-black">{hud.label}</div>
                    <div className={`text-xl font-bold font-mono ${hud.color}`}>{hud.value.toFixed(1)}W</div>
                    <div className="text-[9px] text-slate-600 mt-1 font-medium">{hud.sub}</div>
                </div>
            ))}
        </div>
    );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export const MissionWiringViewer: React.FC<{ platform?: string }> = ({ platform }) => {
    const { items: allItems, setIsOpen } = useCart();
    const { zoomIn, zoomOut, fitView } = useReactFlow();

    const items = useMemo(() => {
        if (!platform) return allItems;
        return allItems.filter(item => item.platform_pill === platform);
    }, [allItems, platform]);

    const initialNodes = useMemo(() => buildNodes(items), [items]);
    const initialEdges = useMemo(() => buildEdges(initialNodes), [initialNodes]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    // Sync nodes/edges when cart items change
    React.useEffect(() => {
        const next = buildNodes(items);
        setNodes(next);
        setEdges(buildEdges(next));
    }, [items]);

    const onConnect = useCallback((params: Connection) => {
        setEdges(eds => addEdge({
            ...params,
            animated: true,
            style: { stroke: RAIL_COLORS.data, strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: RAIL_COLORS.data },
        }, eds));
    }, [setEdges]);

    const mermaidPath = useMemo(() => {
        const productIds = items.map(i => String(i.product_id || i.product?.id));
        return findWiringDiagram(productIds);
    }, [items]);

    const openLegacyBlueprint = () => {
        if (!mermaidPath) return;
        window.open(`/mermaid-editor.html?file=/data/mermaid/${mermaidPath}`, '_blank');
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 overflow-hidden relative">
            <PowerHUD items={items} />

            {/* Toolbar */}
            <div className="flex items-center gap-4 px-5 py-3 bg-slate-900/80 backdrop-blur border-b border-slate-800 shrink-0 z-10">
                <div className="flex gap-4">
                    {LEGEND.map(l => (
                        <div key={l.label} className="flex items-center gap-2">
                            <div className="w-4 h-1 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" style={{ background: l.color }} />
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{l.label}</span>
                        </div>
                    ))}
                </div>

                <div className="h-4 w-px bg-slate-800 mx-2" />

                <div className="flex items-center gap-2">
                    <button 
                        onClick={openLegacyBlueprint}
                        disabled={!mermaidPath}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all border ${mermaidPath ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' : 'bg-slate-800/50 border-slate-700 text-slate-600 cursor-not-allowed opacity-50'}`}
                    >
                        <History size={12} />
                        Legacy Blueprint
                    </button>
                    {!mermaidPath && (
                        <span className="text-[9px] text-slate-600 italic">No legacy mapping found for this config</span>
                    )}

                    <div className="h-4 w-px bg-slate-800 mx-2" />

                    <button
                        onClick={() => setIsOpen(true)}
                        disabled={items.length === 0}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all border ${items.length > 0 ? 'bg-cyan-600 border-cyan-400 text-white hover:bg-cyan-500 shadow-[0_0_15px_rgba(8,145,178,0.4)]' : 'bg-slate-800/50 border-slate-700 text-slate-600 cursor-not-allowed opacity-50'}`}
                    >
                        <ShoppingCart size={14} />
                        Add Build to Cart
                    </button>
                </div>

                <div className="ml-auto flex items-center gap-3">
                    <div className="flex bg-slate-950/50 rounded-lg border border-slate-800 overflow-hidden">
                        <button onClick={() => zoomIn()} className="p-2 hover:bg-slate-800 text-slate-400 transition-colors border-r border-slate-800" title="Zoom In">+</button>
                        <button onClick={() => zoomOut()} className="p-2 hover:bg-slate-800 text-slate-400 transition-colors border-r border-slate-800" title="Zoom Out">-</button>
                        <button onClick={() => fitView()} className="p-2 hover:bg-slate-800 text-slate-400 transition-colors" title="Fit View">⟲</button>
                    </div>
                    <div className="h-4 w-px bg-slate-800 mx-1" />
                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-2">
                        <Info size={12} className="text-sky-400" />
                        Manual Overrides Enabled: Drag between handles to connect
                    </span>
                </div>
            </div>

            {/* React Flow Canvas */}
            <div className="flex-1 relative min-h-0">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    nodeTypes={NODE_TYPES}
                    fitView
                    fitViewOptions={{ padding: 0.3 }}
                    minZoom={0.3}
                    maxZoom={2}
                    style={{ background: 'transparent' }}
                    proOptions={{ hideAttribution: true }}
                >
                    <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#1e293b" />
                    <Controls style={{ background: '#0f172a', border: '1px solid #334155' }} />
                    <MiniMap
                        style={{ background: '#0f172a', border: '1px solid #334155' }}
                        nodeColor={(n) => {
                            const seg = String(n.data?.segment || 'general');
                            return { air: '#0ea5e9', gcs: '#10b981', ground: '#10b981', rover: '#f59e0b' }[seg] || '#475569';
                        }}
                        maskColor="#0f172a99"
                    />
                </ReactFlow>

                {items.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="text-center">
                            <div className="text-4xl mb-3 opacity-30">🔌</div>
                            <p className="text-slate-600 text-sm">No components added yet.</p>
                            <p className="text-slate-700 text-xs mt-1">Complete Phases 1–3 and add hardware to BOM.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
