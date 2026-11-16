/**
 * SKHY AI Pitch Deck → PDF Capture Script
 *
 * Captures each slide of the pitch deck at full 1920×1080 resolution
 * using Puppeteer, then assembles them into a single PDF with pdf-lib.
 *
 * Usage:
 *   node scripts/capture-pitch-deck-pdf.mjs
 *
 * Requirements:
 *   - Dev server running: npm run dev (http://localhost:5173)
 *   - Packages: puppeteer, pdf-lib (already installed as devDependencies)
 */

import puppeteer from 'puppeteer';
import { PDFDocument, PDFName, PDFArray, PDFString } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── CONFIG ────────────────────────────────────────────────────────────────
const BASE_URL   = process.env.BASE_URL || 'http://localhost:5173';
const DECK_URL   = `${BASE_URL}/pitch-deck`;
const TOTAL_SLIDES = 14;
const VIEWPORT   = { width: 1920, height: 1080 };
const SLIDE_DELAY = 1200;   // ms to wait after navigating to each slide (for animations)
const OUTPUT_DIR  = path.join(__dirname, '..', 'dist-pdf');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'SKHY_AI_PitchDeck.pdf');

const SLIDE_NAMES = [
  '01_Title',
  '02_Problem',
  '03_Urgency',
  '04_Solution',
  '05_Product',
  '06_BusinessModel',
  '06B_PreSeed',
  '07_GoToMarket',
  '07B_UseCases',
  '08_Competition',
  '09_Traction',
  '10_Team',
  '11_Contact',
  '12_Appendix',
];

// ─── HELPERS ───────────────────────────────────────────────────────────────
async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper to add external links in the PDF using pdf-lib
async function addLinkToPdf(pdfDoc, page, x, y, width, height, url) {
  // 1. Create the Link Annotation
  const linkAnnotation = pdfDoc.context.obj({
    Type: 'Annot',
    Subtype: 'Link',
    Rect: [x, y, x + width, y + height], // Boundary of clickable area
    Border: [0, 0, 0], // Invisible border
    A: {
      Type: 'Action',
      S: 'URI',
      URI: PDFString.of(url),
    },
  });

  // 2. Register the annotation
  const linkAnnotationRef = pdfDoc.context.register(linkAnnotation);

  // 3. Add to the page's Annotations array
  const annotations = page.node.lookup(PDFName.of('Annots'), PDFArray);
  if (annotations) {
    annotations.push(linkAnnotationRef);
  } else {
    page.node.set(PDFName.of('Annots'), pdfDoc.context.obj([linkAnnotationRef]));
  }
}

// ─── MAIN ──────────────────────────────────────────────────────────────────
(async () => {
  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('🚀 Launching Puppeteer...');
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: VIEWPORT,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--window-size=1920,1080',
      '--disable-web-security',          // allow cross-origin fonts/images
      '--font-render-hinting=none',      // sharper font rendering
    ],
  });

  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  // Accept cookie policy automatically so the cookie consent banner is hidden
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('skhy_cookie_consent', 'true');
  });

  // Suppress any auth modals or cookie banners
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });

  console.log(`📡 Navigating to ${DECK_URL}...`);
  await page.goto(DECK_URL, { waitUntil: 'networkidle2', timeout: 60000 });

  // Wait for deck to fully render
  await wait(2000);

  // Dismiss any email modal if it appears
  await page.evaluate(() => {
    const overlay = document.querySelector('.pd-modal-overlay');
    if (overlay) overlay.style.display = 'none';
  });

  const screenshots = [];
  const allSlidesLinks = [];

  for (let slide = 1; slide <= TOTAL_SLIDES; slide++) {
    console.log(`📸 Capturing slide ${slide}/${TOTAL_SLIDES}: ${SLIDE_NAMES[slide - 1]}`);

    // Navigate to slide by pressing ArrowRight (except first slide which is already active)
    if (slide > 1) {
      await page.keyboard.press('ArrowRight');
      await wait(SLIDE_DELAY);
    }

    // Hide UI controls for clean capture
    await page.evaluate(() => {
      const controls = document.querySelector('.pd-controls-bar, .pd-nav-hint, [class*="controls"]');
      if (controls) controls.style.opacity = '0';
    });

    // On Slide 14, trigger the Red-Black architecture diagram reveal
    if (slide === 14) {
      await page.evaluate(() => {
        const paragraphs = Array.from(document.querySelectorAll('p'));
        const clickReveal = paragraphs.find(p => p.textContent.includes('Click to Reveal'));
        if (clickReveal) {
          clickReveal.click();
        }
      });
      await wait(1500); // wait for blur/opacity transition to complete
    } else {
      await wait(300); // let opacity transition settle
    }

    // Capture screenshot as PNG buffer
    const screenshotPath = path.join(OUTPUT_DIR, `slide_${String(slide).padStart(2, '0')}.png`);
    await page.screenshot({
      path: screenshotPath,
      type: 'png',
      clip: { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height },
    });

    screenshots.push(screenshotPath);
    console.log(`   ✅ Saved: ${path.basename(screenshotPath)}`);

    // Capture links and their bounding boxes for this slide
    const slideLinks = await page.evaluate(() => {
      const activeSlide = document.querySelector('.pd-slide.active');
      if (!activeSlide) return [];
      
      // Grab all anchors, iframes (for videos), and any element with a data-href attribute inside the active slide
      const elements = Array.from(activeSlide.querySelectorAll('a, iframe, [data-href]'));
      
      return elements.map(el => {
        const rect = el.getBoundingClientRect();
        
        let href = null;
        if (el.tagName.toLowerCase() === 'a') {
          href = el.getAttribute('href') || el.href;
        } else if (el.tagName.toLowerCase() === 'iframe') {
          href = el.getAttribute('src') || el.src;
          // Convert YouTube embed URLs to standard watch URLs for better behavior when clicked in PDF
          if (href && href.includes('youtube.com/embed/')) {
            const videoId = href.split('embed/')[1]?.split('?')[0];
            if (videoId) href = `https://www.youtube.com/watch?v=${videoId}`;
          }
        } else if (el.hasAttribute('data-href')) {
          href = el.getAttribute('data-href');
        }

        if (!href) return null;
        
        // Resolve relative links to production skhy.systems
        if (href.startsWith('/') || !href.startsWith('http')) {
          const path = href.startsWith('/') ? href : `/${href}`;
          href = `https://skhy.systems${path}`;
        }
        
        return {
          href,
          rect: {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
          }
        };
      }).filter(item => item !== null && item.rect.width > 0 && item.rect.height > 0 && item.href);
    });

    allSlidesLinks.push(slideLinks);
    if (slideLinks.length > 0) {
      console.log(`   🔗 Collected ${slideLinks.length} clickable links: ${slideLinks.map(l => l.href).join(', ')}`);
    }

    // Restore controls
    await page.evaluate(() => {
      const controls = document.querySelector('.pd-controls-bar, .pd-nav-hint, [class*="controls"]');
      if (controls) controls.style.opacity = '';
    });
  }

  await browser.close();
  console.log('\n📄 Assembling PDF...');

  // Build PDF from screenshots
  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle('SKHY AI — Sovereign Defense Systems Pitch Deck');
  pdfDoc.setAuthor('SKHY AI');
  pdfDoc.setSubject('Sovereign Defense Systems for the Post-Radar, Post-GPS Era');
  pdfDoc.setCreator('SKHY AI Pitch Deck Generator');
  pdfDoc.setKeywords(['defense', 'AI', 'sovereign', 'drone', 'sensor fusion', 'SKHY AI']);

  for (let i = 0; i < screenshots.length; i++) {
    const imgBytes = fs.readFileSync(screenshots[i]);
    const img = await pdfDoc.embedPng(imgBytes);
    const page = pdfDoc.addPage([VIEWPORT.width, VIEWPORT.height]);
    page.drawImage(img, {
      x: 0,
      y: 0,
      width: VIEWPORT.width,
      height: VIEWPORT.height,
    });
    console.log(`   📎 Added slide ${i + 1}: ${SLIDE_NAMES[i]}`);

    // Add clickable link annotations on top of the slide image
    const links = allSlidesLinks[i] || [];
    for (const link of links) {
      const { x, y, width, height } = link.rect;
      const pdfX = x;
      const pdfY = VIEWPORT.height - (y + height);
      const pdfWidth = width;
      const pdfHeight = height;
      
      await addLinkToPdf(pdfDoc, page, pdfX, pdfY, pdfWidth, pdfHeight, link.href);
    }
    if (links.length > 0) {
      console.log(`      🔗 Embedded ${links.length} clickable links`);
    }
  }

  const pdfBytes = await pdfDoc.save();
  let targetFile = OUTPUT_FILE;
  try {
    fs.writeFileSync(targetFile, pdfBytes);
  } catch (err) {
    if (err.code === 'EBUSY') {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      targetFile = OUTPUT_FILE.replace('.pdf', `_${timestamp}.pdf`);
      console.warn(`\n⚠️  Primary file was locked/busy. Saving to: ${targetFile}`);
      fs.writeFileSync(targetFile, pdfBytes);
    } else {
      throw err;
    }
  }

  const sizeMB = (fs.statSync(targetFile).size / 1024 / 1024).toFixed(1);
  console.log(`\n✅ PDF generated: ${targetFile}`);
  console.log(`   Size: ${sizeMB} MB | Slides: ${TOTAL_SLIDES}`);
  console.log(`\n📁 Individual PNGs saved to: ${OUTPUT_DIR}`);
  console.log('   (You can keep these for individual slide sharing)\n');
})();
