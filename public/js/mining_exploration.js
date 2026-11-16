// Refactored to use SKHY_UTILS for consistent initialization.

SKHY_UTILS.onReady(() => {
    let spectralChart;

    // --- CHART LOGIC ---
    const createOrUpdateChart = () => {
        const chartCanvas = document.getElementById('spectralChart');
        if (!chartCanvas) return;
        const ctx = chartCanvas.getContext('2d');
        if (spectralChart) spectralChart.destroy();

        const isPrinting = window.matchMedia('print').matches;
        const isDark = document.documentElement.classList.contains('dark') && !isPrinting;

        // Corrected annotation color logic
        const annotationColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const tickColor = isDark ? '#c7c7c7' : '#666';


        const labels = [400, 444, 468, 500, 521, 550, 579, 600, 624, 650, 676, 700, 741, 750, 796, 801, 850, 864, 889, 900, 951, 1000];
        const bastnaesiteData = [0.8, 0.65, 0.7, 0.8, 0.6, 0.75, 0.5, 0.7, 0.75, 0.8, 0.7, 0.8, 0.55, 0.7, 0.45, 0.6, 0.75, 0.5, 0.4, 0.6, 0.5, 0.6];
        const monaziteData = [0.6, 0.62, 0.65, 0.7, 0.72, 0.7, 0.58, 0.68, 0.7, 0.72, 0.75, 0.78, 0.6, 0.65, 0.7, 0.5, 0.6, 0.65, 0.7, 0.72, 0.75, 0.8];

        spectralChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Bastnaesite',
                    data: bastnaesiteData,
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#3b82f6'
                }, {
                    label: 'Monazite',
                    data: monaziteData,
                    borderColor: '#a855f7',
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    fill: false,
                    tension: 0.1,
                    pointRadius: 4,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#a855f7'
                }]
            },
            options: {
                responsive: true,
                animation: {
                    duration: isPrinting ? 0 : 1000
                },
                scales: {
                    y: { beginAtZero: false, title: { display: true, text: 'Reflectance (Offset)', color: tickColor }, grid: { color: gridColor }, ticks: { color: tickColor } },
                    x: { title: { display: true, text: 'Wavelength (nm)', color: tickColor }, grid: { color: gridColor }, ticks: { color: tickColor } }
                },
                plugins: {
                    legend: { labels: { color: tickColor } },
                    tooltip: {
                        callbacks: {
                            label: (c) => ` ${c.dataset.label}: ${c.parsed.y.toFixed(2)} @ ${c.label} nm`,
                        }
                    },
                    annotation: {
                        annotations: {
                            box1: { type: 'box', xMin: 570, xMax: 590, backgroundColor: annotationColor, borderColor: 'transparent' },
                            box2: { type: 'box', xMin: 730, xMax: 810, backgroundColor: annotationColor, borderColor: 'transparent' },
                            box3: { type: 'box', xMin: 860, xMax: 895, backgroundColor: annotationColor, borderColor: 'transparent' }
                        }
                    }
                },
                onClick: (e) => {
                    const points = spectralChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
                    if (points.length) {
                        const label = spectralChart.data.labels[points[0].index];
                        let message = `Wavelength: ${label}nm. This is a point on the spectral curve.`;
                        if (label >= 730 && label <= 810) {
                            message = `Wavelength: ${label}nm. This is within a key diagnostic region for Neodymium (Nd), showing strong absorption features around 741nm and 796-801nm.`;
                        } else if (label >= 860 && label <= 895) {
                             message = `Wavelength: ${label}nm. This region, with absorption features at 864nm and 889nm, is another critical indicator for Nd in Bastnaesite.`;
                        } else if (label >= 570 && label <= 590) {
                             message = `Wavelength: ${label}nm. The absorption feature around 579nm is also associated with Nd, but can be influenced by other factors.`;
                        }
                        alert(message);
                    }
                }
            }
        });
    };

    // --- THEME TOGGLE LOGIC ---
    const themeToggle = document.getElementById('theme-toggle');
    const applyTheme = (isDark) => {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (isDark) {
            document.documentElement.classList.add('dark');
            if (themeToggle) themeToggle.checked = true;
        } else {
            document.documentElement.classList.remove('dark');
            if (themeToggle) themeToggle.checked = false;
        }
        createOrUpdateChart();
    };
    if (themeToggle) {
        themeToggle.addEventListener('change', () => applyTheme(themeToggle.checked));
    }
    const savedTheme = localStorage.getItem('theme');
    applyTheme(savedTheme === 'dark' || (savedTheme === null && window.matchMedia('(prefers-color-scheme: dark)').matches));

    // --- ACCORDION LOGIC ---
    document.querySelectorAll('.accordion-button').forEach(button => {
        button.addEventListener('click', () => {
            const panel = button.nextElementSibling;
            const icon = button.querySelector('svg');
            if (panel.style.maxHeight) {
                panel.style.maxHeight = null;
                icon.style.transform = 'rotate(0deg)';
            } else {
                panel.style.maxHeight = panel.scrollHeight + 'px';
                icon.style.transform = 'rotate(180deg)';
            }
        });
    });

    // --- PRINT LOGIC ---
    const printButton = document.getElementById('print-button');
    if (printButton) {
        printButton.addEventListener('click', () => {
            const chartContainer = document.getElementById('chart-container');
            const canvas = document.getElementById('spectralChart');
            if (!spectralChart || !canvas) return;
            const img = document.createElement('img');
            img.src = spectralChart.toBase64Image();
            img.style.width = '100%';
            img.style.height = 'auto';
            img.id = 'chart-print-img';

            canvas.style.display = 'none';
            const pAfterCanvas = canvas.nextElementSibling;
            chartContainer.insertBefore(img, pAfterCanvas);

            window.print();
        });
    }

    window.addEventListener('afterprint', () => {
        const img = document.getElementById('chart-print-img');
        if (img) {
            img.remove();
        }
        const canvas = document.getElementById('spectralChart');
        if(canvas) {
            canvas.style.display = 'block';
        }
    });

});
