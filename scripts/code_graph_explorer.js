import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import ts from 'typescript';
import http from 'http';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const srcDir = path.join(projectRoot, 'src');
const publicDir = path.join(projectRoot, 'public');

const OUT_HTML = path.join(projectRoot, 'code-graph.html');

const nodes = new Map();
const edges = [];
const visitedFiles = new Set();
const allCodeFiles = new Set();
const allArtifacts = new Set();
const referencedArtifacts = new Set();

// Helpers
function isLocalImport(importPath) {
    return importPath.startsWith('.') || importPath.startsWith('/');
}

function resolveImportPath(baseFile, importPath) {
    if (!importPath.startsWith('.')) {
        // Alias like @/components or similar? Usually mapped to src/
        if (importPath.startsWith('@/')) {
            importPath = path.join(srcDir, importPath.slice(2));
        } else {
            return null; // External library
        }
    }
    
    let target = path.resolve(path.dirname(baseFile), importPath);
    
    // Try extensions
    const exts = ['.tsx', '.ts', '.jsx', '.js', '/index.tsx', '/index.ts'];
    for (const ext of exts) {
        if (fs.existsSync(target + ext)) {
            return target + ext;
        }
    }
    
    // Handle assets
    const assetExts = ['.json', '.png', '.jpg', '.svg', '.css'];
    for (const ext of assetExts) {
        if (target.endsWith(ext) && fs.existsSync(target)) return target;
    }

    if (fs.existsSync(target) && fs.statSync(target).isFile()) {
        return target;
    }
    
    return null;
}

function getRelativePath(absPath) {
    return path.relative(projectRoot, absPath).replace(/\\/g, '/');
}

const ignoreDirs = ['node_modules', 'dist', '.git', '.vscode', 'obsolete', '.netlify', 'playwright-report', 'dist-ssr'];

function walkProjectDir(dir, outSet) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!ignoreDirs.includes(file)) {
                walkProjectDir(fullPath, outSet);
            }
        } else {
            outSet.add(getRelativePath(fullPath));
        }
    }
}

// 1. Gather all files
const allProjectFiles = new Set();
const externalUrls = new Map();
walkProjectDir(projectRoot, allProjectFiles);

function ensureNode(nodePath, group) {
    if (!nodes.has(nodePath)) {
        nodes.set(nodePath, {
            id: nodePath,
            label: path.basename(nodePath),
            group: group,
            title: nodePath,
            description: 'No description'
        });
    }
    return nodes.get(nodePath);
}

function extractDescription(sourceFile) {
    // Basic extraction of the first comment
    const text = sourceFile.getFullText();
    const commentRanges = ts.getLeadingCommentRanges(text, 0);
    if (commentRanges && commentRanges.length > 0) {
        const firstComment = text.substring(commentRanges[0].pos, commentRanges[0].end);
        return firstComment.replace(/\/\*+|\*+\/|\/\//g, '').trim().slice(0, 100);
    }
    return 'Parsed code file.';
}

function addEdge(from, to, label = '') {
    // Avoid exact duplicates
    const exists = edges.find(e => e.from === from && e.to === to && e.label === label);
    if (!exists) {
        edges.push({ from, to, label });
    }
}

function parseFile(filePath) {
    const relPath = getRelativePath(filePath);
    if (visitedFiles.has(relPath)) return;
    visitedFiles.add(relPath);

    const sourceCode = fs.readFileSync(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);

    const nodeData = ensureNode(relPath, 'code');
    nodeData.description = extractDescription(sourceFile);

    const importedIdentifiers = new Map(); // module -> [identifiers]

    // Pass 1: Extract imports
    ts.forEachChild(sourceFile, function visit(node) {
        if (ts.isImportDeclaration(node) && node.moduleSpecifier) {
            const moduleName = node.moduleSpecifier.text;
            if (isLocalImport(moduleName)) {
                const resolved = resolveImportPath(filePath, moduleName);
                if (resolved) {
                    const resRel = getRelativePath(resolved);
                    
                    // Track imported names
                    const names = [];
                    if (node.importClause) {
                        if (node.importClause.name) names.push(node.importClause.name.text);
                        if (node.importClause.namedBindings) {
                            if (ts.isNamedImports(node.importClause.namedBindings)) {
                                node.importClause.namedBindings.elements.forEach(el => names.push(el.name.text));
                            }
                        }
                    }
                    importedIdentifiers.set(resRel, names);

                    if (resRel.endsWith('.json') || resRel.endsWith('.png') || resRel.endsWith('.svg')) {
                        ensureNode(resRel, 'artifact');
                        addEdge(relPath, resRel, 'imports');
                        referencedArtifacts.add(resRel);
                    } else {
                        ensureNode(resRel, 'code');
                        addEdge(relPath, resRel, 'imports');
                        parseFile(resolved);
                    }
                }
            }
        }
        
        // Dynamic imports
        if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
            if (node.arguments.length > 0 && ts.isStringLiteral(node.arguments[0])) {
                const moduleName = node.arguments[0].text;
                const resolved = resolveImportPath(filePath, moduleName);
                if (resolved) {
                    const resRel = getRelativePath(resolved);
                    ensureNode(resRel, 'code');
                    addEdge(relPath, resRel, 'lazy imports');
                    parseFile(resolved);
                }
            }
        }

        // Static asset references in strings (e.g., fetch, img src)
        if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
            const text = node.text;
            if (text.startsWith('http://') || text.startsWith('https://')) {
                if (!externalUrls.has(text)) externalUrls.set(text, []);
                externalUrls.get(text).push(relPath);
            }
            else if (text.startsWith('/images/') || text.endsWith('.json') || text.endsWith('.pdf')) {
                // Try to find in public or src
                let artifactPath = null;
                if (text.startsWith('/')) {
                    artifactPath = path.join(publicDir, text);
                } else {
                    artifactPath = path.resolve(path.dirname(filePath), text);
                }
                
                const relArt = getRelativePath(artifactPath);
                if (fs.existsSync(artifactPath) && fs.statSync(artifactPath).isFile()) {
                    ensureNode(relArt, 'artifact');
                    addEdge(relPath, relArt, 'references');
                    referencedArtifacts.add(relArt);
                } else {
                    ensureNode(relArt, 'missing_file');
                    addEdge(relPath, relArt, 'missing reference');
                    referencedArtifacts.add(relArt); // prevent it from being marked "isolated"
                }
            }
        }

        // Function Calls
        if (ts.isCallExpression(node)) {
            let funcName = null;
            if (ts.isIdentifier(node.expression)) {
                funcName = node.expression.text;
            } else if (ts.isPropertyAccessExpression(node.expression)) {
                funcName = node.expression.name.text;
            }

            if (funcName) {
                // Check if this function name matches any imported identifier
                for (const [moduleRel, names] of importedIdentifiers.entries()) {
                    if (names.includes(funcName)) {
                        addEdge(relPath, moduleRel, `calls ${funcName}()`);
                    }
                }
            }
        }

        ts.forEachChild(node, visit);
    });
}

// 1. Gather all files

function parseMarkdown(mdFile) {
    const fullPath = path.join(projectRoot, mdFile);
    try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const relPath = getRelativePath(fullPath);
        
        const n = ensureNode(relPath, 'documentation');
        n.description = 'Documentation Markdown File';
        
        // Find markdown links: [text](link)
        const regex = /\[.*?\]\((.*?)\)/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            let link = match[1].trim();
            // Remove hash fragments
            link = link.split('#')[0];
            if (!link) continue;
            
            if (link.startsWith('http://') || link.startsWith('https://')) {
                if (!externalUrls.has(link)) externalUrls.set(link, []);
                externalUrls.get(link).push(relPath);
            } else if (!link.startsWith('mailto:')) {
                // Try to resolve relative file
                let targetPath;
                if (link.startsWith('/')) {
                    targetPath = path.join(publicDir, link.substring(1)); // usually /images/... in markdown
                    if (!fs.existsSync(targetPath)) targetPath = path.join(projectRoot, link.substring(1));
                } else {
                    targetPath = path.resolve(path.dirname(fullPath), link);
                }
                
                if (fs.existsSync(targetPath)) {
                    const targetRel = getRelativePath(targetPath);
                    // Ensure the target node exists
                    ensureNode(targetRel, 'artifact'); 
                    addEdge(relPath, targetRel, 'references');
                    referencedArtifacts.add(targetRel);
                    visitedFiles.add(targetRel);
                }
            }
        }
    } catch(e) { }
}

async function main() {
    // Traverse starting point
    parseFile(path.join(srcDir, 'App.tsx'));

    // Parse all .md files
    for (const file of allProjectFiles) {
        if (file.toLowerCase().endsWith('.md')) {
            parseMarkdown(file);
            visitedFiles.add(file); // Don't mark as isolated
        }
    }

    console.log("Testing external URLs...");
    const urlChecks = await Promise.all(Array.from(externalUrls.keys()).map(async url => {
        try {
            const res = await fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(3000) });
            return { url, ok: res.ok };
        } catch (e) {
            return { url, ok: false };
        }
    }));
    
    for (const { url, ok } of urlChecks) {
        const group = ok ? 'working_url' : 'broken_url';
        const n = ensureNode(url, group);
        n.description = ok ? 'Working External Link' : 'Broken External Link';
        
        const sources = externalUrls.get(url);
        for (const src of sources) {
            addEdge(src, url, 'links to');
        }
    }

    // Identify isolated code, scripts, configs, and artifacts
    for (const file of allProjectFiles) {
        if (visitedFiles.has(file) || referencedArtifacts.has(file)) continue;

        const lowerFile = file.toLowerCase();
        const ext = path.extname(lowerFile);
        let group = null;
        let desc = '';

    try {
        const fullPath = path.join(projectRoot, file);
        const stat = fs.statSync(fullPath);
        if (!stat.isFile()) continue;

        // Config & Build files
        if (lowerFile.match(/package.*\.json|tsconfig.*\.json|vite\.config|\.env|\.eslint|\.gitignore|rollup\.config/)) {
            group = 'config_build';
            desc = 'Build or Configuration File';
        }
        // Scripts
        else if (file.includes('scripts/') || file.includes('brain/') || lowerFile.endsWith('.py') || lowerFile.endsWith('.sh')) {
            group = 'utility_script';
            desc = 'Execution/Utility Script';
        }
        // Source Code
        else if (file.startsWith('src/') && (ext === '.ts' || ext === '.tsx' || ext === '.js' || ext === '.jsx')) {
            group = 'isolated_code';
            desc = 'Isolated/Unused Code';
        }
        // Artifacts
        else if (ext === '.png' || ext === '.jpg' || ext === '.svg' || ext === '.json' || ext === '.pdf') {
            group = 'isolated_artifact';
            desc = 'Unused Artifact';
        }

        if (group) {
            const n = ensureNode(file, group);
            n.description = desc;
        }
    } catch(e) {
        // Skip
    }
}

// Generate HTML
const nodesArray = Array.from(nodes.values());

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code Graph Explorer</title>
    <script type="text/javascript" src="https://unpkg.com/vis-network/standalone/umd/vis-network.min.js"></script>
    <style type="text/css">
        #mynetwork {
            width: 100vw;
            height: 100vh;
            border: 1px solid lightgray;
            background-color: #f4f4f9;
        }
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        #infoPanel {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 300px;
            background: white;
            padding: 15px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            display: none;
            z-index: 10;
        }
        h3 { margin-top: 0; }
        .legend {
            position: absolute;
            bottom: 20px;
            left: 20px;
            background: white;
            padding: 10px;
            border-radius: 5px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 10;
        }
        .legend-item { display: flex; align-items: center; margin-bottom: 5px; cursor: pointer; user-select: none; transition: opacity 0.2s; }
        .legend-item:hover { opacity: 0.8; }
        .legend-item.hidden-group { opacity: 0.4; text-decoration: line-through; }
        .legend-color { width: 20px; height: 20px; margin-right: 10px; border-radius: 3px; }
        #selectionBox {
            position: absolute;
            border: 2px dashed #97C2FC;
            background-color: rgba(151, 194, 252, 0.3);
            display: none;
            pointer-events: none;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div id="selectionBox"></div>
    <div id="mynetwork"></div>
    
    <div id="infoPanel">
        <h3 id="nodeTitle">Node Info</h3>
        <p><strong>Path:</strong> <span id="nodePath"></span></p>
        <p><strong>Type:</strong> <span id="nodeGroup"></span></p>
        <p><strong>Description:</strong></p>
        <div id="nodeDesc" style="background:#eee; padding:10px; border-radius:4px; font-size:12px; white-space:pre-wrap; margin-bottom:10px;"></div>
        <button id="btnOpen" style="width:100%; margin-bottom:5px; padding:8px; cursor:pointer; background:#97C2FC; border:none; border-radius:4px;">Open in Explorer</button>
        <button id="btnObsolete" style="width:100%; padding:8px; cursor:pointer; background:#FF9999; border:none; border-radius:4px; display:none;">Move to Obsolete Folder</button>
    </div>

    <div class="legend">
        <h4>Legend</h4>
        <div class="legend-item" data-group="code"><div class="legend-color" style="background:#97C2FC;"></div> Connected Code</div>
        <div class="legend-item" data-group="isolated_code"><div class="legend-color" style="background:#FF9999;"></div> Isolated Code</div>
        <div class="legend-item" data-group="artifact"><div class="legend-color" style="background:#FFD700;"></div> Used Artifact</div>
        <div class="legend-item" data-group="isolated_artifact"><div class="legend-color" style="background:#D3D3D3;"></div> Isolated Artifact</div>
        <div class="legend-item" data-group="missing_file"><div class="legend-color" style="background:#FF4444;"></div> Missing File</div>
        <div class="legend-item" data-group="working_url"><div class="legend-color" style="background:#8BC34A;"></div> Working URL</div>
        <div class="legend-item" data-group="broken_url"><div class="legend-color" style="background:#FF5722;"></div> Broken URL</div>
        <div class="legend-item" data-group="config_build"><div class="legend-color" style="background:#B48EAD;"></div> Config / Build</div>
        <div class="legend-item" data-group="utility_script"><div class="legend-color" style="background:#D08770;"></div> Utility Script</div>
        <div class="legend-item" data-group="documentation"><div class="legend-color" style="background:#40E0D0;"></div> Documentation</div>
        <div style="margin-top: 10px; font-size: 11px; color: #666;">Hold <b>Shift</b> and drag to box-select multiple nodes.<br/>Click items to hide/show nodes.</div>
    </div>

    <script type="text/javascript">
        // Data generated by script
        const nodesData = ${JSON.stringify(nodesArray)};
        const edgesData = ${JSON.stringify(edges)};

        // Vis.js format mapping
        const colorMap = {
            'code': '#97C2FC',
            'isolated_code': '#FF9999',
            'artifact': '#FFD700',
            'isolated_artifact': '#D3D3D3',
            'missing_file': '#FF4444',
            'working_url': '#8BC34A',
            'broken_url': '#FF5722',
            'config_build': '#B48EAD',
            'utility_script': '#D08770',
            'documentation': '#40E0D0'
        };

        nodesData.forEach(n => {
            n.color = colorMap[n.group] || '#D3D3D3';
            if (n.group.includes('artifact') || n.group === 'config_build' || n.group === 'missing_file') n.shape = 'box';
            else if (n.group === 'utility_script') n.shape = 'diamond';
            else if (n.group === 'working_url') n.shape = 'star';
            else if (n.group === 'broken_url') n.shape = 'triangle';
            else if (n.group === 'documentation') n.shape = 'hexagon';
            else n.shape = 'dot';
            
            if (n.shape === 'dot' || n.shape === 'diamond') n.size = 15;
            // Shorten label for display
            n.label = n.label; 
        });

        const hiddenGroups = new Set();
        const nodesDataSet = new vis.DataSet(nodesData);
        const nodesView = new vis.DataView(nodesDataSet, {
            filter: function (item) {
                return !hiddenGroups.has(item.group);
            }
        });

        document.querySelectorAll('.legend-item').forEach(item => {
            item.addEventListener('click', () => {
                const group = item.getAttribute('data-group');
                if (!group) return;
                if (hiddenGroups.has(group)) {
                    hiddenGroups.delete(group);
                    item.classList.remove('hidden-group');
                } else {
                    hiddenGroups.add(group);
                    item.classList.add('hidden-group');
                }
                nodesView.refresh();
            });
        });

        const container = document.getElementById('mynetwork');
        const data = {
            nodes: nodesView,
            edges: new vis.DataSet(edgesData)
        };
        const options = {
            nodes: {
                font: { size: 12, face: 'Arial' }
            },
            edges: {
                arrows: 'to',
                font: { size: 10, align: 'middle' },
                color: { color: '#848484', highlight: '#848484', hover: '#848484', opacity: 0.6 },
                smooth: { type: 'continuous' }
            },
            physics: {
                stabilization: false,
                barnesHut: {
                    gravitationalConstant: -10000,
                    springConstant: 0.02,
                    springLength: 300
                }
            },
            interaction: {
                hover: true,
                navigationButtons: true,
                multiselect: true
            }
        };

        const network = new vis.Network(container, data, options);

        // Box selection implementation
        const selectionBox = document.getElementById('selectionBox');
        let dragStart = null;
        
        container.addEventListener('mousedown', function(e) {
            if (e.shiftKey || e.ctrlKey) {
                network.setOptions({ interaction: { dragView: false } });
                dragStart = { x: e.pageX, y: e.pageY };
                selectionBox.style.left = e.pageX + 'px';
                selectionBox.style.top = e.pageY + 'px';
                selectionBox.style.width = '0px';
                selectionBox.style.height = '0px';
                selectionBox.style.display = 'block';
            }
        });

        container.addEventListener('mousemove', function(e) {
            if (dragStart) {
                const currentX = e.pageX;
                const currentY = e.pageY;
                
                const left = Math.min(dragStart.x, currentX);
                const top = Math.min(dragStart.y, currentY);
                const width = Math.abs(dragStart.x - currentX);
                const height = Math.abs(dragStart.y - currentY);
                
                selectionBox.style.left = left + 'px';
                selectionBox.style.top = top + 'px';
                selectionBox.style.width = width + 'px';
                selectionBox.style.height = height + 'px';
            }
        });

        container.addEventListener('mouseup', function(e) {
            if (dragStart) {
                const currentX = e.pageX;
                const currentY = e.pageY;
                
                const left = Math.min(dragStart.x, currentX);
                const top = Math.min(dragStart.y, currentY);
                const width = Math.abs(dragStart.x - currentX);
                const height = Math.abs(dragStart.y - currentY);
                const right = left + width;
                const bottom = top + height;

                dragStart = null;
                selectionBox.style.display = 'none';
                network.setOptions({ interaction: { dragView: true } });

                const DOMRect = container.getBoundingClientRect();
                const toSelect = [];
                const nodePositions = network.getPositions();
                
                for (const nodeId in nodePositions) {
                    const pos = nodePositions[nodeId];
                    const domPos = network.canvasToDOM({ x: pos.x, y: pos.y });
                    const absX = domPos.x + window.scrollX + DOMRect.left;
                    const absY = domPos.y + window.scrollY + DOMRect.top;
                    
                    if (absX >= left && absX <= right && absY >= top && absY <= bottom) {
                        toSelect.push(nodeId);
                    }
                }
                
                if (toSelect.length > 0) {
                    network.selectNodes(toSelect);
                    network.emit("selectNode", { nodes: toSelect });
                }
            }
        });

        // Interaction events
        let selectedNodes = [];
        
        network.on("selectNode", function (params) {
            selectedNodes = params.nodes.map(id => nodesData.find(n => n.id === id)).filter(Boolean);
            if (selectedNodes.length === 1) {
                const node = selectedNodes[0];
                document.getElementById('infoPanel').style.display = 'block';
                document.getElementById('nodeTitle').innerText = node.label;
                document.getElementById('nodePath').innerText = node.id;
                document.getElementById('nodeGroup').innerText = node.group;
                document.getElementById('nodeDesc').innerText = node.description;

                const isIsolated = node.group === 'isolated_code' || node.group === 'isolated_artifact';
                document.getElementById('btnObsolete').style.display = isIsolated ? 'block' : 'none';
                document.getElementById('btnOpen').style.display = 'block';
            } else if (selectedNodes.length > 1) {
                document.getElementById('infoPanel').style.display = 'block';
                document.getElementById('nodeTitle').innerText = selectedNodes.length + " nodes selected";
                document.getElementById('nodePath').innerText = "Multiple paths";
                document.getElementById('nodeGroup').innerText = "Mixed";
                document.getElementById('nodeDesc').innerText = "Bulk selection";
                
                const allIsolated = selectedNodes.every(n => n.group === 'isolated_code' || n.group === 'isolated_artifact');
                document.getElementById('btnObsolete').style.display = allIsolated ? 'block' : 'none';
                document.getElementById('btnObsolete').innerText = "Bulk Move to Obsolete (" + selectedNodes.length + ")";
                document.getElementById('btnOpen').style.display = 'none';
            }
        });

        network.on("deselectNode", function (params) {
            selectedNodes = params.nodes.map(id => nodesData.find(n => n.id === id)).filter(Boolean);
            if (selectedNodes.length === 0) {
                document.getElementById('infoPanel').style.display = 'none';
                document.getElementById('btnObsolete').innerText = "Move to Obsolete Folder";
            } else {
                network.emit("selectNode", params);
            }
        });

        document.getElementById('btnOpen').addEventListener('click', () => {
            if (selectedNodes.length !== 1) return;
            fetch('/api/open?file=' + encodeURIComponent(selectedNodes[0].id))
                .then(r => r.text())
                .catch(console.error);
        });

        document.getElementById('btnObsolete').addEventListener('click', () => {
            if (selectedNodes.length === 0) return;
            if (confirm('Are you sure you want to move ' + selectedNodes.length + ' item(s) to the obsolete folder?')) {
                Promise.all(selectedNodes.map(node => 
                    fetch('/api/obsolete?file=' + encodeURIComponent(node.id), { method: 'POST' }).then(r => r.text())
                )).then(results => {
                    alert("Moved " + selectedNodes.length + " items successfully.");
                    // Remove nodes visually
                    selectedNodes.forEach(node => {
                        nodesData.splice(nodesData.findIndex(n => n.id === node.id), 1);
                        nodesDataSet.remove(node.id);
                    });
                    document.getElementById('infoPanel').style.display = 'none';
                    selectedNodes = [];
                }).catch(console.error);
            }
        });
    </script>
</body>
</html>
`;

fs.writeFileSync(OUT_HTML, htmlContent, 'utf-8');
console.log("Graph generated successfully at " + OUT_HTML);

const server = http.createServer((req, res) => {
    const url = new URL(req.url, "http://" + req.headers.host);
    
    if (url.pathname === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(htmlContent);
    } 
    else if (url.pathname === '/api/open') {
        const fileRel = url.searchParams.get('file');
        const fullPath = path.join(projectRoot, fileRel);
        const winPath = fullPath.replace(/\//g, '\\\\');
        exec('explorer.exe /select,"' + winPath + '"', (err) => {
            res.writeHead(200);
            res.end("Opened " + fileRel + " in Explorer");
        });
    }
    else if (url.pathname === '/api/obsolete' && req.method === 'POST') {
        const fileRel = url.searchParams.get('file');
        const fullPath = path.join(projectRoot, fileRel);
        const obsoleteDir = path.join(projectRoot, 'obsolete');
        const destPath = path.join(obsoleteDir, fileRel);
        
        try {
            if (!fs.existsSync(path.dirname(destPath))) {
                fs.mkdirSync(path.dirname(destPath), { recursive: true });
            }
            if (fs.existsSync(fullPath)) {
                fs.renameSync(fullPath, destPath);
                res.writeHead(200);
                res.end("Moved " + fileRel + " to obsolete folder.");
            } else {
                res.writeHead(404);
                res.end("File not found: " + fileRel);
            }
        } catch (e) {
            res.writeHead(500);
            res.end("Error moving file: " + e.message);
        }
    }
    else {
        res.writeHead(404);
        res.end('Not found');
    }
});

    server.listen(3009, () => {
        console.log("=========================================");
        console.log("🚀 Server running at http://localhost:3009");
        console.log("Open this URL in your browser to view and manage nodes.");
        console.log("=========================================");
    });
}

main().catch(console.error);
