import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ShieldCheck, 
    FileText, 
    LogIn, 
    Building2, 
    Globe, 
    CheckCircle2,
    Lock,
    ExternalLink,
    MapPin,
    Hash,
    Download,
    Loader2
} from 'lucide-react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const AcasomPage: React.FC = () => {
    const navigate = useNavigate();

    const skhyDetails = {
        name: "SKHY AI SOLUTIONS",
        reg: "202416822Z",
        addresses: [
            { label: "Malaysia", value: "52, Jalan LEP 6/29, Lestari Putra, 43300 Seri Kembangan, Selangor" }
        ]
    };

    const acasomDetails = {
        name: "ACASOM CO., LIMITED",
        reg: "2855577",
        address: "Room 603, 6/F, Hang Pont Commercial Building, 31 Tonkin Street, Kowloon, Hong Kong"
    };

    const [isDownloading, setIsDownloading] = React.useState(false);
    const printRef = React.useRef<HTMLDivElement>(null);
    const [agreementContent, setAgreementContent] = React.useState('');

    React.useEffect(() => {
        fetch('/agreements/ACASOM_Supplier_Agreement.md')
            .then(res => res.text())
            .then(text => setAgreementContent(text));
    }, []);

    const handleDownloadPDF = async () => {
        if (!printRef.current) return;
        setIsDownloading(true);
        try {
            const canvas = await (html2canvas as any)(printRef.current, {
                scale: 1.5,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 800
            });
            
            const imgData = canvas.toDataURL('image/jpeg', 0.8);
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
                compress: true
            });
            
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = pdfWidth / imgWidth;
            const canvasPageHeight = pdfHeight / ratio;
            
            let heightLeft = imgHeight;
            let position = 0;
            let page = 1;
            
            while (heightLeft > 0) {
                if (page > 1) pdf.addPage();
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight * ratio, undefined, 'FAST');
                heightLeft -= canvasPageHeight;
                position -= pdfHeight;
                page++;
            }
            
            pdf.save(`ACASOM_Agreement_Offline_Sign.pdf`);
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            <Navbar />
            
            {/* Hero Section */}
            <div className="relative pt-32 pb-20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-sky-500/10 to-transparent pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-24 h-24 bg-white rounded-2xl p-4 mb-8 shadow-2xl shadow-sky-500/20 flex items-center justify-center">
                            <img 
                                src="https://acasom.com/cdn/shop/files/logo_300x.png?v=1614316061" 
                                alt="ACASOM Logo" 
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.parentElement?.classList.add('bg-slate-800');
                                }}
                            />
                            <Building2 className="w-12 h-12 text-slate-400 absolute" style={{ zIndex: -1 }} />
                        </div>
                        
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-500/10 text-amber-400 rounded-full text-sm font-semibold border border-amber-500/20 mb-6">
                            <ShieldCheck className="w-4 h-4" />
                            Authorized Global Hardware Partner
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
                            ACASOM <span className="text-sky-400">Compliance</span>
                        </h1>
                        
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Official partnership portal for ACASOM CO., LIMITED. Managing global distribution, 
                            MSRP protection, and technical compliance for mission-critical RF hardware.
                        </p>

                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <button 
                                onClick={() => navigate('/login')}
                                className="px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-sky-500/25"
                            >
                                <LogIn className="w-5 h-5" /> Partner Sign In
                            </button>
                            <a 
                                href="/agreements/ACASOM_Supplier_Agreement.md" 
                                target="_blank"
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all flex items-center gap-2"
                            >
                                <FileText className="w-5 h-5" /> View Agreement
                            </a>
                            <button 
                                onClick={handleDownloadPDF}
                                disabled={isDownloading}
                                className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {isDownloading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Download className="w-5 h-5" />
                                )}
                                Download for Offline Signing
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Registration Details */}
            <div className="container mx-auto px-4 py-20 border-t border-white/5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* SKHY Side */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 bg-sky-500/20 rounded-lg flex items-center justify-center">
                                <Building2 className="w-6 h-6 text-sky-400" />
                            </div>
                            The Platform
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-slate-500"><Hash className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-semibold">Entity Name</div>
                                    <div className="text-lg font-medium">{skhyDetails.name}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-slate-500"><CheckCircle2 className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-semibold">Registration Number</div>
                                    <div className="text-lg font-mono text-sky-400">{skhyDetails.reg}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-slate-500"><MapPin className="w-5 h-5" /></div>
                                <div className="space-y-4">
                                    {skhyDetails.addresses.map((addr, idx) => (
                                        <div key={idx}>
                                            <div className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-semibold">{addr.label} Office</div>
                                            <div className="text-lg text-slate-300 leading-relaxed">{addr.value}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ACASOM Side */}
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 backdrop-blur-sm">
                        <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-amber-400" />
                            </div>
                            The Supplier
                        </h3>
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-slate-500"><Hash className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-semibold">Entity Name</div>
                                    <div className="text-lg font-medium">{acasomDetails.name}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-slate-500"><CheckCircle2 className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-semibold">Registration Number</div>
                                    <div className="text-lg font-mono text-amber-400">{acasomDetails.reg}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="mt-1 text-slate-500"><MapPin className="w-5 h-5" /></div>
                                <div>
                                    <div className="text-sm text-slate-500 mb-1 uppercase tracking-wider font-semibold">Registered Office</div>
                                    <div className="text-lg text-slate-300 leading-relaxed">{acasomDetails.address}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compliance Features */}
            <div className="container mx-auto px-4 py-20">
                <div className="bg-gradient-to-r from-sky-500/10 to-amber-500/10 rounded-[3rem] p-12 border border-white/5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-sky-500/20 rounded-2xl flex items-center justify-center">
                                <Lock className="w-6 h-6 text-sky-400" />
                            </div>
                            <h4 className="text-xl font-bold">MSP Protection</h4>
                            <p className="text-slate-400">Strict enforcement of Manufacturer Suggested Pricing to maintain market integrity and prevent unauthorized discounting.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-amber-500/20 rounded-2xl flex items-center justify-center">
                                <ShieldCheck className="w-6 h-6 text-amber-400" />
                            </div>
                            <h4 className="text-xl font-bold">Quality Assurance</h4>
                            <p className="text-slate-400">Every ACASOM module undergoes dual-stage verification before being listed in the SKHY AI Marketplace.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center">
                                <Globe className="w-6 h-6 text-purple-400" />
                            </div>
                            <h4 className="text-xl font-bold">Global Logistics</h4>
                            <p className="text-slate-400">Integrated shipping and customs handling for rapid deployment of RF systems to over 45 supported regions.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA */}
            <div className="container mx-auto px-4 py-20 text-center">
                <h2 className="text-3xl font-bold mb-6">Need technical support?</h2>
                <p className="text-slate-400 mb-8">Contact our dedicated partner support team for RF integration assistance.</p>
                <button 
                    onClick={() => navigate('/contact')}
                    className="inline-flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold text-lg"
                >
                    Contact Support <ExternalLink className="w-5 h-5" />
                </button>
            </div>

            <Footer />

            {/* Hidden Print Container */}
            <div className="fixed left-[-9999px] top-0 pointer-events-none">
                <div 
                    ref={printRef}
                    className="p-20 bg-white text-black font-serif prose prose-slate max-w-none"
                    style={{ width: '800px', minHeight: '1123px' }}
                >
                    <div className="text-center mb-16 pt-8">
                        <h1 className="text-4xl font-bold uppercase tracking-widest border-b-2 border-black pb-6 mb-4">Offline Signing Copy</h1>
                        <p className="text-sm font-semibold">SKHY AI SOLUTIONS & ACASOM CO., LIMITED</p>
                    </div>
                    <Markdown remarkPlugins={[remarkGfm]}>
                        {agreementContent}
                    </Markdown>

                    <div className="mt-16 grid grid-cols-2 gap-12 border-t-2 border-black pt-12">
                        {/* SKHY AI Side */}
                        <div className="space-y-8">
                            <h3 className="font-bold text-lg uppercase tracking-wider">For and on behalf of SKHY AI SOLUTIONS</h3>
                            <div className="pt-8 border-b border-black w-full h-12"></div>
                            <div className="space-y-1">
                                <p className="font-bold">Chow Cheah Hui</p>
                                <p className="text-sm">Chief Executive Officer</p>
                                <p className="text-sm text-gray-500 mt-4">Date: ________________</p>
                            </div>
                        </div>

                        {/* ACASOM Side */}
                        <div className="space-y-8">
                            <h3 className="font-bold text-lg uppercase tracking-wider">For and on behalf of ACASOM CO., LIMITED</h3>
                            <div className="pt-8 border-b border-black w-full h-12"></div>
                            <div className="space-y-1">
                                <p className="font-bold text-gray-400 italic">(Authorized Signatory)</p>
                                <p className="text-sm">Title: ________________</p>
                                <p className="text-sm text-gray-500 mt-4">Date: ________________</p>
                            </div>
                        </div>
                    </div>
                    <div className="mt-20 pt-12 border-t border-black/10">
                        <p className="text-xs text-gray-500 italic text-center">
                            This document is generated for physical signature purposes only. 
                            Original agreement hosted at skhy.systems/partner/acasom
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcasomPage;
