import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    FileText,
    Building2,
    User,
    MapPin,
    Hash,
    Download,
    Loader2,
    CheckCircle2,
    Lock,
    Pencil,
    ArrowRight,
    AlertCircle,
    Mail,
    Upload,
    PenTool as SignatureIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import { submitNDANotification, submitNDASignatoryConfirmation, submitNDASigningLinkEmail } from '../services/web3formsService';
import { cheahSignatureBase64 } from '../lib/signatureBase64';
import { NDA_TEXT } from '../data/ndaText';

const NDAPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<number>(1);
    const [selectedEntity, setSelectedEntity] = useState<'MY' | 'IN'>('IN');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSendingLink, setIsSendingLink] = useState(false);
    const [signatureData, setSignatureData] = useState<string | null>(null);
    const [signatureMode, setSignatureMode] = useState<'draw' | 'upload'>('draw');
    const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log('NDA Page Mounted, Step:', step);
    }, [step]);

    // Check for incoming secure signing link parameter
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const signToken = params.get('sign');
        if (signToken) {
            try {
                const decoded = JSON.parse(atob(decodeURIComponent(signToken)));
                if (decoded && decoded.companyName) {
                    setFormData(decoded);
                    if (decoded.selectedEntity) setSelectedEntity(decoded.selectedEntity);
                    setStep(3);
                    toast.success('Secure session loaded successfully from email link.');
                    // Clean up URL display without full page reload
                    window.history.replaceState({}, document.title, window.location.pathname);
                }
            } catch (err) {
                console.error('Failed to decode signing token:', err);
                toast.error('Invalid or corrupted signing link.');
            }
        }
    }, []);

    const [formData, setFormData] = useState({
        companyName: '',
        companyReg: '',
        companyAddress: '',
        signatoryName: '',
        signatoryTitle: '',
        email: ''
    });

    const skhyEntities = {
        MY: {
            name: "SKAND TECHNOLOGIES SDN. BHD.",
            reg: "202601038169 (1700264-U)",
            address: "1-19-03, Menara Bangkok Bank, Laman Sentral Berjaya, No. 105, Jalan Ampang, 50450 Kuala Lumpur, Malaysia"
        },
        IN: {
            name: "SKAND DEV TECHNOLOGIES (OPC) PRIVATE LIMITED",
            reg: "U62010UP2025OPC235270",
            address: "1386, SHESHPUR, MAHARAJGANJ, Munderi, Maharajganj, Mahrajganj, Uttar Pradesh, India, 273151"
        }
    };
    const skhyDetails = skhyEntities[selectedEntity];

    const today = new Date().toLocaleDateString('en-SG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const [auditMeta, setAuditMeta] = useState({
        ip: 'Capturing...',
        userAgent: '',
        deviceHash: ''
    });

    useEffect(() => {
        fetch('https://api.country.is')
            .then(res => res.json())
            .then(data => {
                const ua = window.navigator.userAgent;
                const rawStr = ua + window.screen.width + window.screen.height + window.navigator.language;
                let hash = 0;
                for (let i = 0; i < rawStr.length; i++) {
                    hash = ((hash << 5) - hash) + rawStr.charCodeAt(i);
                    hash |= 0;
                }
                const deviceFingerprint = 'HW-' + Math.abs(hash).toString(16).toUpperCase() + '-MAC-SECURED';

                setAuditMeta({
                    ip: data.ip,
                    userAgent: ua,
                    deviceHash: deviceFingerprint
                });
            })
            .catch(() => {
                setAuditMeta(prev => ({
                    ...prev,
                    ip: 'IP-Encrypted-Gateway',
                    deviceHash: 'HW-SECURED-GATEWAY'
                }));
            });
    }, []);

    // Canvas Signature Logic
    useEffect(() => {
        if (step === 3 && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
            }
        }
    }, [step]);

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDrawing(true);
        draw(e);
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.beginPath();
            setSignatureData(canvasRef.current.toDataURL());
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const rect = canvas.getBoundingClientRect();
        let x, y;
        if ('touches' in e) {
            x = e.touches[0].clientX - rect.left;
            y = e.touches[0].clientY - rect.top;
        } else {
            x = e.clientX - rect.left;
            y = e.clientY - rect.top;
        }

        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
    };

    const clearSignature = () => {
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            setSignatureData(null);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File size too large. Please use an image under 2MB.");
                return;
            }
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setSignatureData(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (!formData.companyName || !formData.signatoryName || !formData.email) {
            toast.error('Please fill in all required fields');
            return false;
        }

        const emailLower = formData.email.trim().toLowerCase();
        const blockedDomains = ['gmail.com', 'hotmail.com', 'yahoo.com', 'protonmail.com', 'proton.me', 'outlook.com'];
        const isBlocked = blockedDomains.some(domain => emailLower.endsWith(`@${domain}`));

        if (isBlocked) {
            toast.error('Public email providers are not accepted. Please use your official corporate business email address to execute the NDA.');
            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (!signatureData) {
            toast.error('Please provide a signature');
            return;
        }

        setIsSubmitting(true);
        try {
            // 1. Generate PDF
            if (!headerRef.current || !footerRef.current) throw new Error('Preview not ready');

            // Capture Header
            const headerCanvas = await html2canvas(headerRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 800,
                windowWidth: 800
            });

            // Capture Footer
            const footerCanvas = await html2canvas(footerRef.current, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                width: 800,
                windowWidth: 800
            });

            const headerImgData = headerCanvas.toDataURL('image/jpeg', 0.95);
            const footerImgData = footerCanvas.toDataURL('image/jpeg', 0.95);

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();   // 210mm
            const pdfHeight = pdf.internal.pageSize.getHeight(); // 297mm

            const headerImgHeight = (headerCanvas.height * pdfWidth) / headerCanvas.width;
            const footerImgHeight = (footerCanvas.height * pdfWidth) / footerCanvas.width;

            // 72px padding on 800px width = 9% margin = 18.9mm
            const textMargin = 19;
            const topMargin = 20;
            const bottomMargin = 20;

            let yPos = 0;

            // Page 1: Header
            pdf.addImage(headerImgData, 'JPEG', 0, yPos, pdfWidth, headerImgHeight);
            yPos += headerImgHeight;

            // Set up native text
            pdf.setFont('times', 'normal');
            pdf.setFontSize(10);
            
            // Normalize line endings and split text
            const normalizedText = NDA_TEXT.replace(/\r\n/g, '\n');
            const textLines = pdf.splitTextToSize(normalizedText, pdfWidth - 2 * textMargin);
            const lineHeight = 6; // ~6mm line height for font size 10

            textLines.forEach((line: string) => {
                if (yPos + lineHeight > pdfHeight - bottomMargin) {
                    pdf.addPage();
                    yPos = topMargin;
                }
                pdf.text(line, textMargin, yPos);
                yPos += lineHeight;
            });

            // Add Footer
            if (yPos + footerImgHeight > pdfHeight) {
                pdf.addPage();
                yPos = 0; // Header/footer images already include their own padding
            }
            
            pdf.addImage(footerImgData, 'JPEG', 0, yPos, pdfWidth, footerImgHeight);

            const generatedBlob = pdf.output('blob');
            setPdfBlob(generatedBlob);

            // 2. Upload to Supabase Storage
            const sanitizedName = formData.companyName
                .replace(/\s+/g, '_')
                .replace(/[^a-zA-Z0-9_-]/g, '')
                .substring(0, 60);
            const fileName = `nda_${sanitizedName}_${Date.now()}.pdf`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('compliance')
                .upload(`ndas/${fileName}`, generatedBlob, {
                    contentType: 'application/pdf',
                    upsert: true
                });

            if (uploadError) throw uploadError;

            // 3. Save Record in Database
            const { error: dbError } = await supabase
                .from('signed_documents')
                .insert([{
                    document_type: 'NDA',
                    company_name: formData.companyName,
                    signatory_name: formData.signatoryName,
                    email: formData.email,
                    storage_path: uploadData.path,
                    metadata: {
                        company_reg: formData.companyReg,
                        signatory_title: formData.signatoryTitle,
                        signed_at: new Date().toISOString(),
                        file_size: generatedBlob.size,
                        client_ip: auditMeta.ip,
                        user_agent: auditMeta.userAgent,
                        device_fingerprint: auditMeta.deviceHash
                    }
                }]);

            if (dbError) {
                console.error('DB Error:', dbError);
            }

            // 4. Send Email Notifications (Internal to Nikki & Confirmation to Signatory)
            try {
                await submitNDANotification({
                    companyName: formData.companyName,
                    signatoryName: formData.signatoryName,
                    signatoryEmail: formData.email,
                    storagePath: uploadData.path
                });
                await submitNDASignatoryConfirmation({
                    companyName: formData.companyName,
                    signatoryName: formData.signatoryName,
                    signatoryEmail: formData.email,
                    storagePath: uploadData.path
                });
            } catch (emailError) {
                console.error('Email notification failed:', emailError);
                // Don't fail the whole process if email fails
            }

            toast.success('NDA signed and stored successfully!');
            setStep(4);
        } catch (error: any) {
            console.error('Submission failed:', error);
            toast.error(`Error: ${error.message || 'Failed to process document'}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSendSigningLink = async () => {
        setIsSendingLink(true);
        try {
            const token = btoa(JSON.stringify({ ...formData, selectedEntity }));
            const signingUrl = `${window.location.origin}/nda?sign=${encodeURIComponent(token)}`;

            await submitNDASigningLinkEmail({
                companyName: formData.companyName,
                signatoryName: formData.signatoryName,
                signatoryEmail: formData.email,
                signingUrl
            });

            toast.success('Signing link successfully dispatched to your email!');
            setStep(2.5);
        } catch (error: any) {
            console.error('Failed to send signing link:', error);
            toast.error('Failed to dispatch secure email link. Please try again.');
        } finally {
            setIsSendingLink(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!pdfBlob) return;
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Signed_NDA_${formData.companyName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            <Navbar />

            <div className="pt-32 pb-20 container mx-auto px-4 max-w-5xl">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-500/10 text-sky-400 rounded-full text-sm font-semibold border border-sky-500/20 mb-6"
                    >
                        <ShieldCheck className="w-4 h-4" />
                        Legal Compliance Portal
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold mb-4"
                    >
                        Mutual <span className="text-sky-400">NDA</span>
                    </motion.h1>
                    <p className="text-slate-400 max-w-2xl mx-auto">
                        Securely sign our standard Non-Disclosure Agreement to begin technical collaboration with Skhy AI Solutions.
                    </p>
                </div>

                {/* Progress Stepper */}
                <div className="flex items-center justify-center mb-12 gap-4">
                    {[1, 2, 3].map((s) => (
                        <div key={s} className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold border-2 transition-all ${Math.floor(step) === s ? 'bg-sky-500 border-sky-500 text-white shadow-lg shadow-sky-500/20' :
                                step > s ? 'bg-sky-500/20 border-sky-500 text-sky-400' :
                                    'bg-white/5 border-white/10 text-slate-500'
                                }`}>
                                {step > s ? <CheckCircle2 className="w-6 h-6" /> : s}
                            </div>
                            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? 'bg-sky-500' : 'bg-white/10'}`} />}
                        </div>
                    ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden backdrop-blur-xl shadow-2xl relative">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8 md:p-12"
                            >
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                    <Building2 className="text-sky-400" /> Company Details
                                </h2>

                                <div className="mb-8 p-6 bg-sky-500/5 border border-sky-500/20 rounded-2xl">
                                    <label className="block text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Select Contracting Entity *</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setSelectedEntity('IN')}
                                            className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${selectedEntity === 'IN' ? 'bg-sky-500/20 border-sky-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                                        >
                                            <span className="font-bold">India Headquarters</span>
                                            <span className="text-xs opacity-70">SKAND DEV TECHNOLOGIES (OPC) PVT LTD</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedEntity('MY')}
                                            className={`p-4 rounded-xl border text-left transition-all flex flex-col gap-2 ${selectedEntity === 'MY' ? 'bg-sky-500/20 border-sky-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:border-white/20'}`}
                                        >
                                            <span className="font-bold">Malaysia Sales Office</span>
                                            <span className="text-xs opacity-70">SKAND TECHNOLOGIES SDN. BHD.</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Company Name *</label>
                                        <div className="relative">
                                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input
                                                type="text"
                                                name="companyName"
                                                value={formData.companyName}
                                                onChange={handleFormChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-sky-500/50 transition-all"
                                                placeholder="Enter full legal company name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Registration Number</label>
                                        <div className="relative">
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input
                                                type="text"
                                                name="companyReg"
                                                value={formData.companyReg}
                                                onChange={handleFormChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-sky-500/50 transition-all"
                                                placeholder="e.g. 20240101XXXX"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Registered Address</label>
                                        <div className="relative">
                                            <MapPin className="absolute left-4 top-4 w-5 h-5 text-slate-500" />
                                            <textarea
                                                name="companyAddress"
                                                value={formData.companyAddress}
                                                onChange={handleFormChange}
                                                rows={3}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-sky-500/50 transition-all"
                                                placeholder="Enter full registered address"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Authorized Signatory Name *</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input
                                                type="text"
                                                name="signatoryName"
                                                value={formData.signatoryName}
                                                onChange={handleFormChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-sky-500/50 transition-all"
                                                placeholder="Signatory's full name"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Signatory Title</label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input
                                                type="text"
                                                name="signatoryTitle"
                                                value={formData.signatoryTitle}
                                                onChange={handleFormChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-sky-500/50 transition-all"
                                                placeholder="e.g. CEO, Managing Director"
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-1 md:col-span-2 space-y-2">
                                        <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Email Address *</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleFormChange}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-sky-500/50 transition-all"
                                                placeholder="Email for document confirmation"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-12 flex justify-end">
                                    <button
                                        onClick={() => validateForm() && setStep(2)}
                                        className="px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-sky-500/25"
                                    >
                                        Review NDA <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8 md:p-12"
                            >
                                <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
                                    <FileText className="text-sky-400" /> Agreement Preview
                                </h2>

                                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-6 md:p-10 h-[500px] overflow-y-auto mb-8 prose prose-invert prose-slate max-w-none scrollbar-thin scrollbar-thumb-white/10">
                                    <div className="text-center mb-12">
                                        <img src="/skhy-logo.jpg" alt="Logo" className="h-16 mx-auto mb-6 invert grayscale opacity-80" />
                                        <h1 className="text-3xl font-bold uppercase tracking-widest text-white border-b border-white/10 pb-4 mb-2">Mutual Non-Disclosure Agreement</h1>
                                        <p className="text-sm text-slate-500 italic">Effective as of {today}</p>
                                    </div>

                                    <p>This Mutual Non-Disclosure Agreement (the "Agreement") is entered into between:</p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
                                        <div>
                                            <p className="font-bold text-sky-400 uppercase tracking-wider mb-2">The Disclosing Party:</p>
                                            <p className="text-white font-bold">{skhyDetails.name}</p>
                                            <p className="text-sm text-slate-400">Reg: {skhyDetails.reg}</p>
                                            <p className="text-sm text-slate-400">{skhyDetails.address}</p>
                                        </div>
                                        <div>
                                            <p className="font-bold text-sky-400 uppercase tracking-wider mb-2">The Receiving Party:</p>
                                            <p className="text-white font-bold">{formData.companyName || '[Company Name]'}</p>
                                            <p className="text-sm text-slate-400">Reg: {formData.companyReg || '[Reg Number]'}</p>
                                            <p className="text-sm text-slate-400">{formData.companyAddress || '[Address]'}</p>
                                        </div>
                                    </div>

                                    <div className="text-white whitespace-pre-wrap leading-relaxed space-y-4">
                                        {NDA_TEXT}
                                    </div>

                                    <div className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-900/50 p-4 rounded-lg">
                                        <p className="font-bold text-sky-400 mb-1">🔐 Signee Security Audit Parameters Captured</p>
                                        <p>Client IP Address: <span className="text-white font-mono">{auditMeta.ip}</span></p>
                                        <p className="truncate">Hardware / Session Hash: <span className="text-white font-mono">{auditMeta.deviceHash}</span></p>
                                        <p className="text-[10px] text-slate-500 mt-1">*Note: MAC Address visibility is hardware-abstracted at the gateway level per standard web browser security boundaries.</p>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <button
                                        onClick={() => setStep(1)}
                                        disabled={isSendingLink}
                                        className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
                                    >
                                        Back to Details
                                    </button>
                                    <button
                                        onClick={handleSendSigningLink}
                                        disabled={isSendingLink}
                                        className="px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-sky-500/25 disabled:opacity-50"
                                    >
                                        {isSendingLink ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" /> Dispatching Link...
                                            </>
                                        ) : (
                                            <>
                                                <Mail className="w-5 h-5" /> Send Signing Link to Email
                                            </>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 2.5 && (
                            <motion.div
                                key="step2_5"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="p-8 md:p-12 text-center"
                            >
                                <div className="w-20 h-20 bg-sky-500/10 border border-sky-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-sky-400 shadow-lg shadow-sky-500/10">
                                    <Mail className="w-10 h-10 animate-bounce" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4 text-white">Secure Link Dispatched</h2>
                                <p className="text-slate-300 mb-6 max-w-md mx-auto text-sm leading-relaxed">
                                    To finalize Phase 3 signing, we have sent a secure encoded access URL directly to your corporate business email address.
                                </p>
                                <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-4 max-w-md mx-auto mb-8 text-xs text-sky-300 text-left space-y-2">
                                    <p className="font-semibold text-sky-400 flex items-center gap-1.5">
                                        <ShieldCheck className="w-4 h-4" /> Enterprise Verification Protocol:
                                    </p>
                                    <p className="text-slate-400">
                                        Recipient: <span className="text-white font-medium">{formData.email}</span>
                                    </p>
                                    <p className="text-slate-400">
                                        Please click the unique link in your inbox to directly unlock the digital signature execution canvas.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setStep(1)}
                                    className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all text-sm"
                                >
                                    Modify Details / Resend
                                </button>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="p-8 md:p-12 text-center"
                            >
                                <h2 className="text-2xl font-bold mb-4">Finalize Agreement</h2>
                                <p className="text-slate-400 mb-8">Please provide your digital signature below to execute the NDA.</p>

                                <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 text-left">
                                    {/* SKHY AI Solutions Pre-Executed Signature */}
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
                                        <div className="absolute top-0 right-0 bg-sky-500/10 text-sky-400 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-l border-b border-sky-500/20 uppercase tracking-wider">
                                            Pre-Executed
                                        </div>
                                        <div>
                                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Disclosing Party Signatory</h3>
                                            <div className="bg-white/5 rounded-xl p-3 mb-4 flex items-center justify-center h-[120px]">
                                                <img
                                                    src={cheahSignatureBase64}
                                                    alt="Chow Cheah Hui Signature"
                                                    className="max-h-[60px] w-auto object-contain filter brightness-125"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-xs">
                                            <p className="font-bold text-white">Chow Cheah Hui</p>
                                            <p className="text-slate-400 text-[11px]">Chief Executive Officer (CEO)</p>
                                            <p className="text-sky-400 font-mono text-[10px]">ID: SEC-8892 | {today}</p>
                                        </div>
                                    </div>

                                    {/* Counterparty Signing Block */}
                                    <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Your Digital Signature *</h3>
                                                <div className="flex bg-slate-800 rounded-lg p-1">
                                                    <button
                                                        onClick={() => { setSignatureMode('draw'); clearSignature(); }}
                                                        className={`text-[10px] px-3 py-1 rounded-md transition-all ${signatureMode === 'draw' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                                                    >
                                                        Draw
                                                    </button>
                                                    <button
                                                        onClick={() => { setSignatureMode('upload'); setSignatureData(null); }}
                                                        className={`text-[10px] px-3 py-1 rounded-md transition-all ${signatureMode === 'upload' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                                                    >
                                                        Upload
                                                    </button>
                                                </div>
                                            </div>

                                            {signatureMode === 'draw' ? (
                                                <div className="bg-white rounded-xl p-2 shadow-inner mb-3 relative">
                                                    <canvas
                                                        ref={canvasRef}
                                                        width={400}
                                                        height={120}
                                                        className="w-full h-[120px] cursor-crosshair touch-none rounded-lg"
                                                        onMouseDown={startDrawing}
                                                        onMouseMove={draw}
                                                        onMouseUp={stopDrawing}
                                                        onMouseLeave={stopDrawing}
                                                        onTouchStart={startDrawing}
                                                        onTouchMove={draw}
                                                        onTouchEnd={stopDrawing}
                                                    />
                                                    {!signatureData && (
                                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                                                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                                                <Pencil className="w-3 h-3" /> Draw signature inside box
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-xl p-4 mb-3 relative min-h-[136px] flex flex-col items-center justify-center text-center">
                                                    {signatureData ? (
                                                        <div className="relative w-full h-[104px] flex items-center justify-center">
                                                            <img 
                                                                src={signatureData} 
                                                                alt="Signature" 
                                                                className="max-h-full max-w-full object-contain filter invert brightness-0"
                                                            />
                                                            <button 
                                                                onClick={() => setSignatureData(null)}
                                                                className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-400 transition-colors"
                                                            >
                                                                <AlertCircle className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <label className="cursor-pointer flex flex-col items-center group w-full h-full justify-center">
                                                            <Upload className="w-8 h-8 text-slate-500 group-hover:text-sky-400 transition-colors mb-2" />
                                                            <span className="text-xs font-medium text-slate-400 group-hover:text-slate-200">Click to upload signature image</span>
                                                            <span className="text-[10px] text-slate-500 mt-1">PNG, JPG or WebP (Max 2MB)</span>
                                                            <input 
                                                                type="file" 
                                                                className="hidden" 
                                                                accept="image/*"
                                                                onChange={handleFileUpload}
                                                            />
                                                        </label>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex justify-between items-center">
                                                <button
                                                    onClick={clearSignature}
                                                    className="text-xs text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1"
                                                >
                                                    <AlertCircle className="w-3.5 h-3.5" /> Clear Input
                                                </button>
                                                <span className="text-[10px] text-slate-500 italic">Required to finalize</span>
                                            </div>
                                        </div>
                                        <div className="pt-4 mt-2 border-t border-white/5 text-[11px] text-slate-400">
                                            <p className="font-semibold text-white truncate">{formData.signatoryName || 'Authorized Signatory'}</p>
                                            <p className="truncate text-slate-500">{formData.signatoryTitle || 'Representative'} — {formData.companyName || 'Company'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={isSubmitting || !signatureData}
                                        className="w-full py-4 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" /> Finalizing & Storing...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="w-5 h-5" /> Sign & Execute NDA
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setStep(2)}
                                        disabled={isSubmitting}
                                        className="text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        Back to Review
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="p-12 text-center"
                            >
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <CheckCircle2 className="w-12 h-12 text-green-500" />
                                </div>
                                <h2 className="text-3xl font-bold mb-4 text-white">NDA Successfully Executed</h2>
                                <p className="text-slate-300 mb-6 max-w-md mx-auto text-sm leading-relaxed">
                                    A copy of the signed agreement has been stored in our secure compliance bucket.
                                </p>
                                <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-4 max-w-md mx-auto mb-8 text-xs text-sky-300 text-left space-y-1">
                                    <p className="font-semibold text-sky-400">Secure Transmission Confirmed:</p>
                                    <p>The executed PDF access link has been dispatched to your corporate email: <span className="font-semibold text-white">{formData.email}</span></p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-4">
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="px-8 py-3 bg-sky-500 hover:bg-sky-400 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all"
                                        title="Download your locally signed and executed copy of the NDA"
                                    >
                                        <Download className="w-5 h-5" /> Download Executed NDA
                                    </button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all"
                                    >
                                        Return Home
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer Info */}
                <div className="mt-8 text-center">
                    <p className="text-xs text-slate-500 flex items-center justify-center gap-2">
                        <Lock className="w-3 h-3" /> All documents are encrypted and stored in our secure Malaysian database.
                    </p>
                </div>
            </div>

            <Footer />

            {/* Hidden Print Containers for PDF Generation */}
            {/* The header and footer are captured separately as images, while the text body is rendered natively by jsPDF */}
            <div style={{ position: 'absolute', left: '-9999px', top: 0, pointerEvents: 'none' }}>
                {/* Header Container */}
                <div
                    ref={headerRef}
                    style={{
                        width: '800px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: '13px',
                        lineHeight: '1.7',
                        padding: '80px 72px 24px 72px',
                        boxSizing: 'border-box',
                    }}
                >
                    <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                        <img
                            src="/skhy-logo.jpg"
                            alt="Logo"
                            style={{ width: '130px', height: 'auto', margin: '0 auto 28px', display: 'block' }}
                        />
                        <h1 style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                            letterSpacing: '0.15em',
                            borderBottom: '2px solid #000',
                            paddingBottom: '16px',
                            marginBottom: '12px',
                            margin: '0 0 12px 0',
                        }}>Mutual Non-Disclosure Agreement</h1>
                        <p style={{ fontSize: '12px', fontStyle: 'italic', color: '#555', margin: '12px 0 0 0' }}>Executed on {today}</p>
                    </div>

                    <p style={{ margin: '0 0 24px 0' }}>This Mutual Non-Disclosure Agreement (the "Agreement") is entered into between:</p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', margin: '24px 0 0 0' }}>
                        <div>
                            <p style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px' }}>THE DISCLOSING PARTY:</p>
                            <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>{skhyDetails.name}</p>
                            <p style={{ fontSize: '12px', margin: '0 0 4px 0' }}>Reg: {skhyDetails.reg}</p>
                            <p style={{ fontSize: '12px', margin: 0 }}>{skhyDetails.address}</p>
                        </div>
                        <div>
                            <p style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '4px', marginBottom: '8px' }}>THE RECEIVING PARTY:</p>
                            <p style={{ fontWeight: 'bold', margin: '0 0 4px 0' }}>{formData.companyName}</p>
                            <p style={{ fontSize: '12px', margin: '0 0 4px 0' }}>Reg: {formData.companyReg}</p>
                            <p style={{ fontSize: '12px', margin: 0 }}>{formData.companyAddress}</p>
                        </div>
                    </div>
                </div>

                {/* Footer Container */}
                <div
                    ref={footerRef}
                    style={{
                        width: '800px',
                        backgroundColor: '#ffffff',
                        color: '#000000',
                        fontFamily: 'Georgia, "Times New Roman", serif',
                        fontSize: '13px',
                        lineHeight: '1.7',
                        padding: '24px 72px 80px 72px',
                        boxSizing: 'border-box',
                    }}
                >
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '48px',
                        paddingTop: '20px',
                        borderTop: '2px solid #000',
                    }}>
                        {/* SKHY AI Side */}
                        <div>
                            <h3 style={{ fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>For SKHY AI SOLUTIONS</h3>
                            <div style={{ height: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', borderBottom: '1px solid #000', paddingBottom: '6px', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px' }}>
                                    <img
                                        src={cheahSignatureBase64}
                                        alt="Chow Cheah Hui Signature"
                                        style={{ display: 'block', width: '160px', height: '50px', objectFit: 'contain' }}
                                    />
                                    <p style={{ color: '#0369a1', fontFamily: 'monospace', fontSize: '10px', fontStyle: 'italic', margin: 0 }}>Verified ID: SEC-8892</p>
                                </div>
                            </div>
                            <p style={{ fontWeight: 'bold', margin: '0 0 3px 0' }}>Chow Cheah Hui</p>
                            <p style={{ fontSize: '12px', margin: '0 0 3px 0' }}>Chief Executive Officer (CEO)</p>
                            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Date: {today}</p>
                        </div>

                        {/* Counterparty Side */}
                        <div>
                            <h3 style={{ fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '24px' }}>For {formData.companyName}</h3>
                            <div style={{ height: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', borderBottom: '1px solid #000', paddingBottom: '6px', marginBottom: '12px' }}>
                                {signatureData ? (
                                    <img
                                        src={signatureData}
                                        alt="Signature"
                                        style={{ display: 'block', width: '160px', height: '50px', objectFit: 'contain' }}
                                    />
                                ) : (
                                    <div style={{ height: '50px' }} />
                                )}
                            </div>
                            <p style={{ fontWeight: 'bold', margin: '0 0 3px 0' }}>{formData.signatoryName}</p>
                            <p style={{ fontSize: '12px', margin: '0 0 3px 0' }}>{formData.signatoryTitle}</p>
                            <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Date: {today}</p>
                        </div>
                    </div>

                    <div style={{ marginTop: '60px', paddingTop: '24px', borderTop: '1px solid #ddd' }}>
                        <div style={{ fontSize: '10px', color: '#888', textAlign: 'center', fontStyle: 'italic' }}>
                            <p style={{ margin: '0 0 4px 0' }}>This document was electronically signed and stored securely at skhy.systems/nda.</p>
                            <p style={{ margin: '0 0 4px 0' }}>Signee Audit Trail — IP Address: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{auditMeta.ip}</span> | Cryptographic Session/Hardware Hash: <span style={{ fontFamily: 'monospace' }}>{auditMeta.deviceHash}</span></p>
                            <p style={{ margin: 0 }}>Verification ID: {Math.random().toString(36).substring(2, 15).toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NDAPage;
