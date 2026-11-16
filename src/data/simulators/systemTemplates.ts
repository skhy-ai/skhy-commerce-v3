import { CartItem } from '../../types/checkout';

export const generateMermaidDiagram = (items: CartItem[]): string | null => {
    if (!items || items.length === 0) return null;

    let mermaidStr = `graph TD\n`;
    
    // Grouping by segment
    const airItems = items.filter(i => i.product?.segment === 'air');
    const gcsItems = items.filter(i => i.product?.segment === 'gcs');
    const roverItems = items.filter(i => i.product?.segment === 'rover');

    const formatId = (id: string | number) => `NODE_${String(id).replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Helper to render nodes in a subgraph
    const renderSubgraph = (title: string, id: string, segmentItems: CartItem[], colorHex: string): { str: string, fcNode: string | null, commsNode: string | null } => {
        if (segmentItems.length === 0) return { str: '', fcNode: null, commsNode: null };
        let str = `  subgraph ${id}["${title}"]\n`;
        str += `    style ${id} fill:transparent,stroke:${colorHex},stroke-width:2px,stroke-dasharray: 5 5\n`;
        
        let batteryNode: string | null = null;
        let fcNode: string | null = null;
        let commsNode: string | null = null;

        segmentItems.forEach((item) => {
            if (!item.product) return;
            const nodeId = formatId(item.product.id);
            const rawName = item.product.name || 'Unknown Component';
            const name = rawName.replace(/["[\]();]/g, '');
            const pwr = item.product.power_draw_w || 0;
            const isBatt = item.product.category?.toLowerCase() === 'batteries' || name.toLowerCase().includes('battery') || name.toLowerCase().includes('lipo');
            const isFc = name.toLowerCase().includes('autopilot') || name.toLowerCase().includes('pixhawk') || name.toLowerCase().includes('cube');
            const isComms = name.toLowerCase().includes('telemetry') || name.toLowerCase().includes('radio') || name.toLowerCase().includes('video') || name.toLowerCase().includes('rfd900') || name.toLowerCase().includes('link');
            const isPlatform = item.product.category?.toLowerCase() === 'platforms' || name.toLowerCase().includes('chassis') || name.toLowerCase().includes('rover');

            if (isPlatform && item.product.image_url) {
                // If the user provided an image url, render it inside the SVG node!
                str += `    ${nodeId}["<img src='${item.product.image_url}' width='140' style='border-radius: 8px; margin-bottom: 5px;'/> <br/> <b>${name}</b>"]\n`;
                str += `    style ${nodeId} fill:#020617,stroke:#334155,stroke-width:2px,color:#fff\n`;
            } else if (isPlatform && !item.product.image_url) {
                str += `    ${nodeId}["🏎️ <b>${name}</b> <br/> <small>Base Platform</small>"]\n`;
                str += `    style ${nodeId} fill:#020617,stroke:#334155,stroke-width:2px,color:#fff\n`;
            } else if (isBatt) {
                batteryNode = nodeId;
                str += `    ${nodeId}([\"🔋 ${name} <br/> <small>Power Source</small>\"])\n`;
                str += `    style ${nodeId} fill:#1B4332,stroke:#2D6A4F,color:#fff\n`;
            } else if (isFc) {
                fcNode = nodeId;
                str += `    ${nodeId}{{\"🧠 ${name} <br/> <small>${pwr}W</small>\"}}\n`;
                str += `    style ${nodeId} fill:#1E3A8A,stroke:#3B82F6,color:#fff\n`;
            } else if (isComms) {
                commsNode = nodeId;
                str += `    ${nodeId}([\"📡 ${name} <br/> <small>${pwr}W</small>\"])\n`;
                str += `    style ${nodeId} fill:#7C2D12,stroke:#EA580C,color:#fff\n`;
            } else {
                str += `    ${nodeId}[\"${name} <br/> <small>${pwr}W</small>\"]\n`;
                str += `    style ${nodeId} fill:#1F2937,stroke:#4B5563,color:#a1a1aa\n`;
            }
        });

        // Add wiring inside subgraph
        segmentItems.forEach((item) => {
            if (!item.product) return;
            const nodeId = formatId(item.product.id);
            const isPlatform = item.product?.category?.toLowerCase() === 'platforms' || ['frame', 'chassis', 'rover', 'multirotor'].some(t => item.product?.name?.toLowerCase()?.includes(t) || item.product?.description?.toLowerCase()?.includes(t));
            const isBatt = item.product?.category?.toLowerCase() === 'batteries' || item.product?.name?.toLowerCase()?.includes('battery') || item.product?.name?.toLowerCase()?.includes('lipo');
            const isFc = ['autopilot', 'cube', 'pixhawk'].some(t => item.product?.name?.toLowerCase()?.includes(t));

            // Wire power from battery to components (except platform if self-powered)
            if (batteryNode && !isBatt && !isPlatform) {
                str += `    ${batteryNode} -- Power --> ${nodeId}\n`;
            }

            // Wire data from FC to components
            if (fcNode && !isFc && !isBatt && !isPlatform) {
                str += `    ${fcNode} -. Data .- ${nodeId}\n`;
            }

            // Wire FC to Platform
            if (fcNode && isPlatform) {
                str += `    ${fcNode} ==>| Motor PWM / CAN |== ${nodeId}\n`;
            }
        });

        str += `  end\n`;
        return { str, fcNode, commsNode };
    };

    const airResult = renderSubgraph('AIR SEGMENT (DRONE)', 'subAir', airItems, '#3B82F6');
    const gcsResult = renderSubgraph('GROUND CONTROL (GCS)', 'subGcs', gcsItems, '#10B981');
    const roverResult = renderSubgraph('RELAY / ROVER', 'subRover', roverItems, '#F59E0B');

    mermaidStr += airResult.str || '';
    mermaidStr += gcsResult.str || '';
    mermaidStr += roverResult.str || '';

    // Advanced Cross-segment RF links
    if (airResult.commsNode && gcsResult.commsNode && !roverResult.commsNode) {
        mermaidStr += `  ${gcsResult.commsNode} ===| RF LINK |=== ${airResult.commsNode}\n`;
    } else if (airResult.commsNode && gcsResult.commsNode && roverResult.commsNode) {
        mermaidStr += `  ${gcsResult.commsNode} ===| UPLINK |=== ${roverResult.commsNode}\n`;
        mermaidStr += `  ${roverResult.commsNode} ===| DOWNLINK |=== ${airResult.commsNode}\n`;
    }

    return mermaidStr;
};
