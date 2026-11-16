// ============================================
    // INITIALIZATION
    // ============================================
    let currentChapter = 0;
    let mermaidReady = false;

    // Build sidebar navigation
    function buildNav() {
        const nav = document.getElementById('chapterNav');
        nav.innerHTML = chapters.map((ch, i) => `
            <li>
                <a class="chapter-link${i === 0 ? ' active' : ''}" data-index="${i}" onclick="loadChapter(${i})">
                    <span class="chapter-num">${ch.num}</span>
                    <span>${ch.title}</span>
                </a>
            </li>
        `).join('');
    }

    // Parse alert blocks from markdown
    function processAlertBlocks(html) {
        // Match blockquotes that contain [!NOTE], [!TIP], [!IMPORTANT], [!WARNING], [!CAUTION]
        const alertRegex = /<blockquote>\s*<p>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/gi;

        html = html.replace(/<blockquote>\s*([\s\S]*?)<\/blockquote>/g, (match, inner) => {
            const typeMatch = inner.match(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]/i);
            if (typeMatch) {
                const type = typeMatch[1].toUpperCase();
                const cleaned = inner.replace(/\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]\s*/i, '');
                const icons = {
                    NOTE: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
                    TIP: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>',
                    IMPORTANT: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
                    WARNING: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
                    CAUTION: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>'
                };
                return `<div class="alert-block"><div class="alert-title">${icons[type] || ''} ${type}</div>${cleaned}</div>`;
            }
            return match;
        });

        return html;
    }

    // Process SVG placeholders
    function processSVGPlaceholders(html) {
        return html.replace(/<!--SVG:(\w+)-->/g, (match, key) => {
            return svgIllustrations[key] || `<!-- SVG "${key}" not found -->`;
        });
    }

    // Process mermaid blocks
    function processMermaidBlocks(html) {
        // marked wraps ```mermaid blocks in <pre><code class="language-mermaid">...</code></pre>
        return html.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
            const decoded = code.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
            return `<div class="mermaid-container"><pre class="mermaid">${decoded}</pre></div>`;
        });
    }

    // Add Interactive Python Buttons
    function processPythonBlocks(html) {
        return html.replace(/<pre><code class="language-python">([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
            // Do not inject button if code contains torch (Lab 3)
            if (code.includes('import torch') || code.includes('import tensorflow')) {
                return match + `<div style="margin-top: -10px; margin-bottom: 20px; font-size: 12px; color: #94a3b8; font-style: italic;">(Execution not supported in browser for PyTorch)</div>`;
            }
            
            const decodedCode = unescape(encodeURIComponent(code.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")));
            
            // Reconstruct the block to be editable
            const editableBlock = `<pre><code class="language-python" contenteditable="true" spellcheck="false" style="outline: none; border-bottom: 1px dashed #334155; padding-bottom: 10px;">${code}</code></pre>`;
            
            let audioButton = '';
            if (code.includes('# REQUIRES_AUDIO')) {
                audioButton = `<button onclick="recordAudio(this)" style="background: #ef4444; width: auto; padding: 8px 16px; font-size: 14px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">🎙️ Record Audio (5s)</button>`;
            }
            
            return editableBlock + `
            <div class="pyodide-runner" style="margin-top: 0px; margin-bottom: 20px;">
                <button onclick="runPythonCode(this)" style="background: #22c55e; width: auto; padding: 8px 16px; font-size: 14px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); margin-right: 10px;">▶ Run Edited Code</button>
                ${audioButton}
                <div class="pyodide-console" style="display: none; background: #0f172a; border: 1px solid #334155; padding: 12px; margin-top: 10px; color: #f8fafc; font-family: monospace; border-radius: 6px; overflow-x: auto;"></div>
            </div>
            `;
        });
    }

    // Load and render a chapter
    async function loadChapter(index) {
        const wrapper = document.getElementById('contentWrapper');
        const chapter = chapters[index];
        currentChapter = index;

        // Fade out
        wrapper.classList.add('fading');

        // Update nav
        document.querySelectorAll('.chapter-link').forEach((link, i) => {
            link.classList.toggle('active', i === index);
        });

        // Close mobile sidebar
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('open');

        await new Promise(r => setTimeout(r, 250));

        let mdContent = chapter.content;
        
        // Process Quizzes
        let chapterHasQuiz = false;
        let globalQIdx = 0;
        mdContent = mdContent.replace(/\[QUIZ\]([\s\S]*?)\[\/QUIZ\]/g, (match, content) => {
            chapterHasQuiz = true;
            let html = '<div class="quiz-block">';
            const questions = content.trim().split(/\n(?=\*\*Q\d+)/);
            questions.forEach((qBlock) => {
                const lines = qBlock.trim().split('\n');
                const qText = lines[0];
                html += `<div class="quiz-question" style="margin-bottom: 24px;">`;
                html += `<div class="quiz-qtext" style="font-weight: 600; margin-bottom: 12px; font-size: 1.05em;">${qText.replace(/\*\*/g, '')}</div>`;
                html += `<div class="quiz-options">`;
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;
                    const isCorrect = line.startsWith('[*]');
                    const isOption = line.startsWith('[ ]') || line.startsWith('[*]');
                    if (isOption) {
                        const optText = line.substring(3).trim();
                        html += `
                        <label class="quiz-option" style="display: block; padding: 10px 14px; margin-bottom: 6px; cursor: pointer; border-radius: 6px; border: 1px solid var(--primaryBorderColor, #e2e8f0); transition: all 0.2s;">
                            <input type="radio" name="quiz_q${globalQIdx}" value="${isCorrect ? 'true' : 'false'}" style="margin-right: 10px; transform: scale(1.1);">
                            <span>${optText}</span>
                        </label>`;
                    }
                }
                html += `</div></div>`;
                globalQIdx++;
            });
            html += `</div>`;
            return html;
        });
        

        // Preserve Math blocks before marked parses them
        const mathBlocks = [];
        mdContent = mdContent.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
            mathBlocks.push(match);
            return `<!--MATH_BLOCK_${mathBlocks.length - 1}-->`;
        });
        mdContent = mdContent.replace(/(^|[^\\])\$([^\$]*?)\$/g, (match, p1, p2) => {
            mathBlocks.push(`$${p2}$`);
            return `${p1}<!--MATH_BLOCK_${mathBlocks.length - 1}-->`;
        });

        // Parse markdown
        let html = marked.parse(mdContent);

        // Restore Math blocks
        html = html.replace(/<!--MATH_BLOCK_(\d+)-->/g, (match, p1) => {
            return mathBlocks[parseInt(p1, 10)];
        });

        // Fix image paths
        html = html.replace(/src="\.\.\/images\//g, 'src="skhy_academy_course/images/');
        html = html.replace(/src="images\//g, 'src="skhy_academy_course/images/');

        // Process special blocks
        html = processAlertBlocks(html);
        html = processSVGPlaceholders(html);
        html = processMermaidBlocks(html);
        html = processPythonBlocks(html);

        wrapper.innerHTML = html;

        // Setup Quiz Interactivity
        if (chapterHasQuiz) {
            const submitBtn = document.createElement('button');
            submitBtn.className = 'quiz-submit-btn';
            submitBtn.textContent = 'Submit Assignment';
            submitBtn.style.cssText = 'display: block; margin: 40px auto; padding: 14px 28px; background: #3b82f6; color: white; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 16px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: background 0.3s;';
            submitBtn.onmouseover = () => submitBtn.style.background = '#2563eb';
            submitBtn.onmouseout = () => submitBtn.style.background = '#3b82f6';
            
            const scoreDisplay = document.createElement('div');
            scoreDisplay.className = 'quiz-score-display';
            scoreDisplay.style.cssText = 'display: none; margin: 30px auto; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; border-radius: 12px; background: rgba(59, 130, 246, 0.1); border: 2px solid #3b82f6; color: var(--primaryTextColor);';

            submitBtn.onclick = () => {
                let total = 0;
                let correct = 0;
                wrapper.querySelectorAll('.quiz-question').forEach(q => {
                    total++;
                    const selected = q.querySelector('input[type="radio"]:checked');
                    
                    q.querySelectorAll('.quiz-option').forEach(opt => {
                        const radio = opt.querySelector('input');
                        if (radio.value === 'true') {
                            opt.style.background = 'rgba(34, 197, 94, 0.15)'; // light green
                            opt.style.borderColor = '#22c55e';
                        }
                    });

                    if (selected && selected.value === 'true') {
                        correct++;
                    } else if (selected) {
                        const selectedOpt = selected.closest('.quiz-option');
                        selectedOpt.style.background = 'rgba(239, 68, 68, 0.15)'; // light red
                        selectedOpt.style.borderColor = '#ef4444';
                    }
                });
                
                const percentage = Math.round((correct / total) * 100);
                let scoreHtml = `Total Score: <strong>${correct} / ${total}</strong> (${percentage}%)`;
                
                if (percentage >= 80) {
                    scoreHtml += `
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid rgba(59, 130, 246, 0.3);">
                        <h3 style="color: #22c55e; margin-bottom: 10px;">🏆 Congratulations! You passed!</h3>
                        <p style="font-size: 16px; margin-bottom: 15px; font-weight: normal;">Enter your full name below to generate your official Skhy Physical AI Certification.</p>
                        <input type="text" id="cert-name" placeholder="Enter Your Full Name" style="padding: 10px; width: 80%; max-width: 300px; border-radius: 6px; border: 1px solid #475569; background: #0f172a; color: white; margin-bottom: 15px;">
                        <br>
                        <button onclick="generateCertificate()" style="padding: 12px 24px; background: #eab308; color: #000; border: none; border-radius: 6px; font-weight: bold; cursor: pointer;">Generate Certificate</button>
                    </div>`;
                } else {
                    scoreHtml += `<div style="margin-top: 15px; color: #ef4444; font-size: 16px; font-weight: normal;">You need 80% to pass. Please review the material and try again.</div>`;
                }

                scoreDisplay.innerHTML = scoreHtml;
                scoreDisplay.style.display = 'block';
                submitBtn.style.display = 'none';
                
                // Scroll to score
                scoreDisplay.scrollIntoView({ behavior: 'smooth', block: 'center' });
            };

            wrapper.appendChild(submitBtn);
            wrapper.appendChild(scoreDisplay);
        }


        // Render KaTeX math
        if (typeof renderMathInElement !== "undefined") {
            renderMathInElement(wrapper, {
              delimiters: [
                  {left: '$$', right: '$$', display: true},
                  {left: '$', right: '$', display: false}
              ]
            });
        }

        // Render mermaid diagrams
        if (mermaidReady) {
            try {
                await mermaid.run({ querySelector: '.mermaid' });
            } catch (e) {
                console.warn('Mermaid render warning:', e);
            }
        }

        // Fade in
        wrapper.classList.remove('fading');

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Theme management
    function getTheme() {
        return localStorage.getItem('sentryos-theme') || 'light';
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('sentryos-theme', theme);
        document.getElementById('lightBtn').classList.toggle('active', theme === 'light');
        document.getElementById('darkBtn').classList.toggle('active', theme === 'dark');

        // Reinitialize mermaid with correct theme
        if (mermaidReady) {
            mermaid.initialize({
                startOnLoad: false,
                theme: theme === 'dark' ? 'dark' : 'default',
                themeVariables: theme === 'dark' ? {
                    primaryColor: '#1e293b',
                    primaryTextColor: '#e2e8f0',
                    primaryBorderColor: '#475569',
                    lineColor: '#64748b',
                    secondaryColor: '#334155',
                    tertiaryColor: '#1e293b'
                } : {}
            });
            // Re-render current chapter to apply mermaid theme
            loadChapter(currentChapter);
        }
    }

    // Pyodide Execution Logic
    let pyodideInstance = null;
    let pyodideLoading = false;

    async function runPythonCode(btn) {
        const runnerDiv = btn.parentElement;
        const consoleDiv = runnerDiv.querySelector('.pyodide-console');
        const preElement = runnerDiv.previousElementSibling;
        let codeText = preElement.innerText || preElement.textContent;
        // Fix spaces that contenteditable might turn into non-breaking spaces
        codeText = codeText.replace(/\u00A0/g, ' ');
        
        consoleDiv.style.display = 'block';
        consoleDiv.innerHTML = '<span style="color:#94a3b8" class="status-msg">Initializing Python environment (this may take a few seconds)...</span><br>';
        
        try {
            if (!pyodideInstance) {
                if (pyodideLoading) {
                    consoleDiv.innerHTML += '<span style="color:#eab308">Waiting for environment to finish loading...</span>\\n';
                    while (pyodideLoading) await new Promise(r => setTimeout(r, 100));
                }
                
                if (!pyodideInstance) {
                    pyodideLoading = true;
                    // Execute the base64 pyodide.js if it hasn't been loaded yet
                    if (typeof loadPyodide === 'undefined' && window.OFFLINE_ASSETS && window.OFFLINE_ASSETS["pyodide.js"]) {
                        const script = document.createElement('script');
                        script.text = atob(window.OFFLINE_ASSETS["pyodide.js"]);
                        document.head.appendChild(script);
                    }
                    
                    pyodideInstance = await loadPyodide({
                        // indexURL doesn't matter because our fetch override intercepts everything
                        indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
                    });
                    
                    pyodideLoading = false;
                }
            }
            
            consoleDiv.innerHTML += '<span style="color:#94a3b8">Analyzing imports and loading dependencies...</span>\\n';
            
            // Automatically parse the code for imports and load required packages
            await pyodideInstance.loadPackagesFromImports(codeText);
            
            // Fallback explicit loading for native packages if loadPackagesFromImports misses them
            const packagesToLoad = [];
            if (codeText.includes("import pandas") || codeText.includes("from pandas")) packagesToLoad.push("pandas");
            if (codeText.includes("import scipy") || codeText.includes("from scipy")) packagesToLoad.push("scipy");
            if (codeText.includes("import matplotlib") || codeText.includes("from matplotlib")) packagesToLoad.push("matplotlib");
            if (codeText.includes("import networkx") || codeText.includes("from networkx")) packagesToLoad.push("networkx");
            if (codeText.includes("import numpy") || codeText.includes("from numpy")) packagesToLoad.push("numpy");
            
            if (packagesToLoad.length > 0) {
                consoleDiv.innerHTML += `<span style="color:#94a3b8">Verifying native packages: ${packagesToLoad.join(', ')}...</span>\\n`;
                await pyodideInstance.loadPackage(packagesToLoad);
            }
            
            if (codeText.includes("import folium")) {
                consoleDiv.innerHTML += '<span style="color:#94a3b8">Installing folium via micropip...</span>\\n';
                await pyodideInstance.loadPackage("micropip");
                const micropip = pyodideInstance.pyimport("micropip");
                await micropip.install("folium");
            }
            
            consoleDiv.innerHTML = '<span style="color:#22c55e">Running...</span>\\n';
            
            // Redirect stdout and stderr
            pyodideInstance.runPython(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
            `);
            
            // Set matplotlib target to this specific div
            document.pyodideMplTarget = consoleDiv;
            
            await pyodideInstance.runPythonAsync(codeText);
            
            const stdout = pyodideInstance.runPython("sys.stdout.getvalue()");
            const stderr = pyodideInstance.runPython("sys.stderr.getvalue()");
            
            let output = "";
            if (stdout) output += stdout.replace(/\\n/g, "<br>");
            if (stderr) output += `<span style="color:#ef4444">${stderr.replace(/\\n/g, "<br>")}</span>`;
            
            // Remove the running status message
            const statusMsg = consoleDiv.querySelector('.status-msg');
            if (statusMsg) {
                statusMsg.nextSibling?.remove(); // remove the <br>
                statusMsg.remove();
            }
            
            if (!output && consoleDiv.children.length === 0) {
                output = '<span style="color:#94a3b8">Code executed successfully (no output).</span>';
            }
            
            if (output) {
                const textOutput = document.createElement('div');
                textOutput.style.whiteSpace = 'pre-wrap';
                textOutput.style.marginBottom = '10px';
                textOutput.innerHTML = output;
                consoleDiv.insertBefore(textOutput, consoleDiv.firstChild);
            }
            
        } catch (err) {
            const errSpan = document.createElement('div');
            errSpan.style.color = '#ef4444';
            errSpan.innerHTML = String(err).replace(/\\n/g, "<br>");
            consoleDiv.appendChild(errSpan);
            pyodideLoading = false;
        }
    }
    
    // Audio Recording Logic
    async function recordAudio(btn) {
        btn.innerText = "🎙️ Recording...";
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const mediaRecorder = new MediaRecorder(stream);
            const audioChunks = [];
            
            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.start();
            
            setTimeout(async () => {
                mediaRecorder.stop();
                stream.getTracks().forEach(track => track.stop());
            }, 5000); // 5 seconds
            
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks);
                const arrayBuffer = await audioBlob.arrayBuffer();
                const audioContextToDecode = new (window.AudioContext || window.webkitAudioContext)();
                const audioBuffer = await audioContextToDecode.decodeAudioData(arrayBuffer);
                
                // Get Float32Array from the first channel
                window.recordedAudioBuffer = audioBuffer.getChannelData(0);
                window.recordedAudioSampleRate = audioBuffer.sampleRate;
                
                btn.innerText = "✅ Audio Recorded";
                btn.style.background = "#22c55e";
                
                // Create download link to send to others
                const audioUrl = URL.createObjectURL(audioBlob);
                const downloadBtn = document.createElement('a');
                downloadBtn.href = audioUrl;
                downloadBtn.download = "sentryos_recording.webm";
                downloadBtn.innerText = "💾 Save Audio to Share";
                downloadBtn.style.cssText = "display: inline-block; background: #3b82f6; color: white; padding: 8px 16px; font-size: 14px; border-radius: 4px; text-decoration: none; margin-left: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);";
                downloadBtn.className = "audio-download-btn";
                
                // Remove existing download button if it exists
                const existingBtn = btn.parentElement.querySelector('.audio-download-btn');
                if (existingBtn) {
                    existingBtn.remove();
                }
                btn.parentElement.insertBefore(downloadBtn, btn.nextSibling);

                setTimeout(() => {
                    btn.innerText = "🎙️ Record Audio (5s)";
                    btn.style.background = "#ef4444";
                }, 2000);
            };
        } catch (err) {
            console.error(err);
            btn.innerText = "❌ Mic Error (Check Permissions)";
            setTimeout(() => {
                btn.innerText = "🎙️ Record Audio (5s)";
                btn.style.background = "#ef4444";
            }, 2000);
        }
    }

    
    // Fullscreen Modal Logic
    document.addEventListener('click', (e) => {
        const container = e.target.closest('.mermaid-container');
        if (container && !container.closest('.modal-content')) {
            const modal = document.getElementById('mermaidModal');
            const modalBody = document.getElementById('mermaidModalBody');
            modalBody.innerHTML = container.innerHTML;
            modal.classList.add('open');
        }
    });
    
    function closeModal() {
        document.getElementById('mermaidModal').classList.remove('open');
    }

    // Event listeners
    document.getElementById('lightBtn').addEventListener('click', () => setTheme('light'));
    document.getElementById('darkBtn').addEventListener('click', () => setTheme('dark'));

    document.getElementById('hamburgerBtn').addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('open');
        document.getElementById('sidebarOverlay').classList.toggle('open');
    });

    document.getElementById('sidebarOverlay').addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('open');
        document.getElementById('sidebarOverlay').classList.remove('open');
    });

    // Generate Certificate Logic
    window.generateCertificate = function() {
        const nameInput = document.getElementById('cert-name').value.trim();
        if (!nameInput) {
            alert('Please enter your name to generate the certificate.');
            return;
        }

        const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        
        const certHtml = `
        <div id="certificate-modal" style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.9); display: flex; justify-content: center; align-items: center; z-index: 9999;">
            <div style="position: relative; width: 800px; max-width: 95%; background: #0f172a; padding: 40px; border: 4px solid #eab308; border-radius: 12px; text-align: center; color: white; box-shadow: 0 0 40px rgba(234, 179, 8, 0.4);">
                <button onclick="document.getElementById('certificate-modal').remove()" style="position: absolute; top: 15px; right: 15px; background: none; border: none; color: #94a3b8; font-size: 24px; cursor: pointer;">&times;</button>
                
                <h1 style="color: #eab308; font-family: serif; font-size: 42px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 2px;">Certificate of Completion</h1>
                <h3 style="color: #94a3b8; font-weight: normal; margin-bottom: 40px; font-size: 20px;">This certifies that</h3>
                
                <h2 style="font-size: 48px; margin-bottom: 40px; color: #fff; font-family: 'Brush Script MT', cursive, serif; border-bottom: 2px solid #334155; display: inline-block; padding: 0 40px; padding-bottom: 10px;">${nameInput}</h2>
                
                <p style="font-size: 18px; color: #cbd5e1; line-height: 1.6; margin-bottom: 40px;">
                    Has successfully completed the comprehensive training program for<br>
                    <strong style="color: #38bdf8; font-size: 22px;">Skhy Physical AI & SentryOS Operations</strong><br>
                    Demonstrating proficiency in Sensor Fusion, RF Analysis, and Edge AI Deployment.
                </p>
                
                <div style="display: flex; justify-content: space-between; margin-top: 50px; padding: 0 40px;">
                    <div style="text-align: center;">
                        <div style="border-bottom: 1px solid #94a3b8; padding-bottom: 5px; margin-bottom: 5px;">${date}</div>
                        <div style="color: #94a3b8; font-size: 14px;">Date of Certification</div>
                    </div>
                    <div style="text-align: center;">
                        <div style="border-bottom: 1px solid #94a3b8; padding-bottom: 5px; margin-bottom: 5px; font-family: signature, cursive, serif; font-size: 24px;">Skhy Academy</div>
                        <div style="color: #94a3b8; font-size: 14px;">Authorized Signature</div>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.body.insertAdjacentHTML('beforeend', certHtml);
    };

    // Initialize
    document.addEventListener('DOMContentLoaded', () => {
        // Apply saved theme
        const savedTheme = getTheme();
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.getElementById('lightBtn').classList.toggle('active', savedTheme === 'light');
        document.getElementById('darkBtn').classList.toggle('active', savedTheme === 'dark');

        // Configure marked
        marked.setOptions({
            gfm: true,
            breaks: false
        });

        // Initialize mermaid
        mermaid.initialize({
            startOnLoad: false,
            theme: savedTheme === 'dark' ? 'dark' : 'default',
            securityLevel: 'loose',
            themeVariables: savedTheme === 'dark' ? {
                primaryColor: '#1e293b',
                primaryTextColor: '#e2e8f0',
                primaryBorderColor: '#475569',
                lineColor: '#64748b',
                secondaryColor: '#334155',
                tertiaryColor: '#1e293b'
            } : {}
        });
        mermaidReady = true;

        // Build nav and load first chapter
        buildNav();
        loadChapter(0);
    });