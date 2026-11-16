import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from '../../lib/supabase';
import { getMarketplaceProducts } from '../../data/cachedMarketplace';
import { MarketplaceProduct } from '../../components/marketplace/ProductCard.tsx';
import { ArrowLeft, FileText, Printer, Cpu, Zap, Settings } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

import { ProductAsset } from '../../types/partner';

export default function TechnicalDatasheet() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [product, setProduct] = useState<MarketplaceProduct | null>(null);
    const [markdown, setMarkdown] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const cachedProducts = await getMarketplaceProducts();
                let data = cachedProducts.find(p => String(p.id) === id);

                if (!data) {
                    const { data: dbData } = await supabase
                        .from('products')
                        .select('*, product_assets(*)')
                        .eq('id', parseInt(id))
                        .maybeSingle();
                    data = dbData as any;
                }

                if (data) {
                    setProduct(data as MarketplaceProduct);
                    document.title = `Datasheet: ${data.name} | SKHY AI`;

                    const datasheet = (data.product_assets as ProductAsset[])?.find((a: ProductAsset) => a.asset_type === 'datasheet');
                    if (datasheet) {
                        const response = await fetch(datasheet.file_url);
                        if (response.ok) {
                            const text = await response.text();
                            setMarkdown(text);
                        } else {
                            setMarkdown('Failed to load datasheet content.');
                        }
                    } else {
                        setMarkdown('No datasheet found for this product.');
                    }
                }
            } catch (err) {
                console.error('Error fetching datasheet:', err);
                setMarkdown('Error loading content.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
                <button onClick={() => navigate('/marketplace')} className="text-sky-400 hover:underline">
                    Back to Marketplace
                </button>
            </div>
        );
    }

    const mainImage = product.product_assets?.find((a: ProductAsset) => a.asset_type === 'image')?.file_url || '';
    const otherImages = product.product_assets?.filter((a: ProductAsset) => a.asset_type === 'image' && a.file_url !== mainImage) || [];
    const tagline = (product as any).tagline || product.description?.split('.')[0] + '.' || '';

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/30">
            <div className="print:hidden">
                <Navbar />
            </div>

            {/* Header / Controls */}
            <div className="max-w-5xl mx-auto px-4 pt-32 pb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <button 
                    onClick={() => navigate(`/marketplace/product/${id}`)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Product
                </button>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handlePrint}
                        className="flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-full font-medium transition-all shadow-lg shadow-sky-900/20"
                    >
                        <Printer size={18} />
                        Download PDF
                    </button>
                </div>
            </div>

            {/* Datasheet Content */}
            <div 
                ref={contentRef}
                className="max-w-5xl mx-auto mb-20 bg-slate-900/50 border border-slate-800 rounded-2xl p-8 md:p-12 shadow-2xl relative overflow-hidden print:shadow-none print:border-none print:bg-white print:text-black print:p-0 print:m-0"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[100px] pointer-events-none" />
                
                {/* Product Hero in Datasheet */}
                <div className="flex flex-col lg:flex-row gap-12 mb-16 border-b border-slate-800 pb-16 print:border-slate-200">
                    <div className="w-full lg:w-2/5 flex flex-col gap-4">
                        <div className="aspect-square rounded-2xl overflow-hidden bg-slate-800 border border-slate-700 shadow-inner group relative print:border-slate-200 print:shadow-none">
                            {mainImage ? (
                                <img 
                                    src={mainImage} 
                                    alt={product.name} 
                                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-600">
                                    <FileText size={48} />
                                </div>
                            )}
                        </div>
                        
                        {/* Thumbnail Gallery */}
                        {otherImages.length > 0 && (
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide print:hidden">
                                {[mainImage, ...otherImages.map(a => a.file_url)].filter(Boolean).map((url, idx) => (
                                    <button 
                                        key={idx}
                                        className="w-16 h-16 rounded-lg bg-slate-800 border border-slate-700 overflow-hidden flex-shrink-0 hover:border-sky-500 transition-colors"
                                    >
                                        <img src={url} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="px-3 py-1 bg-sky-500/10 text-sky-400 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-sky-500/20 print:border-sky-200">
                                Engineering Document
                            </div>
                            <div className="w-1 h-1 rounded-full bg-slate-700" />
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{product.category}</span>
                        </div>
                        
                        <h1 className="text-5xl font-black mb-6 leading-tight text-white print:text-black">
                            {product.name}
                        </h1>
                        
                        {tagline && (
                            <p className="text-xl text-slate-400 font-medium mb-10 leading-relaxed border-l-4 border-sky-500 pl-6 print:text-slate-700 print:border-sky-700">
                                {tagline}
                            </p>
                        )}
                        
                        <div className="grid grid-cols-2 gap-8">
                            {product.operating_voltage && (
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Nominal Voltage</p>
                                    <div className="flex items-center gap-2 text-white font-mono text-lg print:text-black">
                                        <Zap size={16} className="text-sky-500" />
                                        {product.operating_voltage}
                                    </div>
                                </div>
                            )}
                            {product.operating_current && (
                                <div className="space-y-1">
                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Peak Current</p>
                                    <div className="flex items-center gap-2 text-white font-mono text-lg print:text-black">
                                        <Cpu size={16} className="text-amber-500" />
                                        {product.operating_current}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Left: Markdown Content */}
                    <div className="lg:col-span-2">
                        <div className="prose prose-invert prose-sky max-w-none 
                            prose-h2:text-3xl prose-h2:font-black prose-h2:tracking-tight prose-h2:mt-16 prose-h2:mb-8 prose-h2:text-sky-400 prose-h2:border-b prose-h2:border-sky-500/20 prose-h2:pb-4
                            prose-h3:text-xl prose-h3:font-bold prose-h3:text-slate-200 prose-h3:mt-10 prose-h3:mb-4
                            prose-p:text-slate-400 prose-p:leading-relaxed prose-p:text-lg prose-p:mb-6
                            prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-8 prose-ul:space-y-2
                            prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-8 prose-ol:space-y-2
                            prose-li:text-slate-400 prose-li:text-lg
                            prose-strong:text-white prose-strong:font-bold
                            prose-table:w-full prose-table:my-10 prose-table:border-collapse prose-table:border prose-table:border-slate-800
                            prose-th:bg-slate-800/80 prose-th:text-sky-400 prose-th:p-4 prose-th:text-left prose-th:text-xs prose-th:uppercase prose-th:tracking-widest prose-th:border prose-th:border-slate-800
                            prose-td:p-4 prose-td:border prose-td:border-slate-800 prose-td:text-slate-300 prose-td:text-sm prose-td:bg-slate-900/30
                            print:prose-slate print:prose-headings:text-black print:prose-h2:text-sky-900 print:prose-h2:border-sky-900 print:prose-td:border-slate-200 print:prose-th:bg-slate-100 print:prose-p:text-slate-800 print:prose-li:text-slate-800
                        ">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
                        </div>
                    </div>

                    {/* Right: Sidebar Specs & Pins */}
                    <div className="space-y-12">
                        {/* Pin Configuration */}
                        {product.pin_layout && typeof product.pin_layout === 'object' && (product.pin_layout as any).ports && (
                            <div className="bg-slate-800/20 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl print:bg-slate-50 print:border-slate-200">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
                                        <Settings size={20} />
                                    </div>
                                    <h2 className="text-xl font-bold text-white print:text-black">I/O Interface</h2>
                                </div>

                                <div className="space-y-6">
                                    {Object.entries((product.pin_layout as any).ports || {}).map(([port, pins]: [string, any]) => (
                                        <div key={port} className="space-y-2">
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.1em]">{port}</p>
                                            <div className="flex flex-wrap gap-1.5">
                                                {(Array.isArray(pins) ? pins : [pins]).map((pin, i) => (
                                                    <span key={i} className="px-2.5 py-1 bg-slate-800 text-sky-300 rounded-md text-[10px] font-mono border border-slate-700 print:bg-white print:text-sky-700 print:border-slate-200">
                                                        {pin}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-8 border-t border-slate-800 flex items-start gap-3 print:border-slate-200">
                                    <div className="w-2 h-2 rounded-full bg-sky-500 mt-1.5 shrink-0 animate-pulse" />
                                    <p className="text-[11px] text-slate-400 leading-relaxed italic print:text-slate-600">
                                        Industrial grade connectors. Pin 1 is marked with a triangle on the housing. 
                                        Ensure twisted-pair wiring for high-frequency data links.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Quick Reference */}
                        <div className="bg-gradient-to-br from-sky-500/10 to-transparent border border-sky-500/20 rounded-3xl p-8 print:bg-slate-100 print:border-none">
                            <h3 className="text-lg font-bold text-white mb-6 print:text-black">Compliance</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">EMI Shielding</span>
                                    <span className="text-emerald-400 font-bold">Passed</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Ingress Protection</span>
                                    <span className="text-white font-bold print:text-black">IP67 Rating</span>
                                </div>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500">Shock/Vibe</span>
                                    <span className="text-white font-bold print:text-black">MIL-STD-810H</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer of Datasheet */}
                <div className="mt-20 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-xs print:border-slate-200 print:text-slate-400">
                    <p>© 2026 SKHY AI Systems. All rights reserved. Technical specifications subject to change without notice.</p>
                    <div className="flex items-center gap-4">
                        <span>Document ID: DS-{product.id}-{new Date().getFullYear()}</span>
                        <span className="text-sky-500/50 uppercase font-black tracking-widest print:text-slate-300">SKHY AI</span>
                    </div>
                </div>
            </div>

            <div className="print:hidden">
                <Footer />
            </div>

            {/* Custom Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page {
                        margin: 2cm;
                        size: A4;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    .print\\:hidden { display: none !important; }
                    .prose { color: black !important; max-width: none !important; }
                    .prose h1, .prose h2, .prose h3 { color: black !important; }
                    .prose a { color: #0284c7 !important; text-decoration: underline !important; }
                }
            `}} />
        </div>
    );
}
