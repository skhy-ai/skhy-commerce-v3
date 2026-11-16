import React from 'react';
import { X, ShieldAlert, Scale, FileText, Ban } from 'lucide-react';

interface PartnerAgreementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAgree: () => void;
}

export const PartnerAgreementModal: React.FC<PartnerAgreementModalProps> = ({ isOpen, onClose, onAgree }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-navy-900 border border-navy-600 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-navy-700 bg-navy-950/50 rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-sky-400" />
                        <h2 className="text-xl font-bold text-white">Partner Agreement & Terms of Service</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 text-gray-300">
                    <div className="bg-navy-800/50 p-4 rounded-lg border border-navy-700">
                        <p className="text-sm font-mono text-sky-200">
                            <strong>PARTIES:</strong> <br />
                            1. <strong>SKHY AI</strong>, operated by SKAND DEV TECHNOLOGIES (OPC) PVT LTD ("Platform") <br />
                            2. <strong>THE PARTNER</strong> ("You/Seller")
                        </p>
                    </div>

                    <section className="space-y-4">
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-red-400 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">1. Indemnification & Risk Allocation</h3>
                                <p>
                                    To the fullest extent permitted by law, the Partner agrees to indemnify, defend, and hold harmless SKHY AI (SKAND DEV TECHNOLOGIES (OPC) PVT LTD), its officers, directors, and employees from and against any and all claims, liabilities, damages, losses, or expenses (including legal fees) arising out of or in any way connected with:
                                </p>
                                <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                    <li>Your access to or use of the Platform;</li>
                                    <li>Your violation of any of these Terms;</li>
                                    <li>Any products or services sold or provided by you through the Platform;</li>
                                    <li>Any disputes between you and any Buyer/User.</li>
                                </ul>
                                <p className="mt-2 text-red-300/80 text-sm font-medium">
                                    <strong>Clause 1.1:</strong> The Partner assumes full responsibility and risk for all transactions and interactions with Buyers. SKHY AI shall bear no liability for any actions, omissions, or defaults of any Buyer or Partner.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Ban className="w-5 h-5 text-orange-400 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">2. Force Majeure & Limitation of Liability</h3>
                                <p>
                                    SKHY AI shall not be liable for any failure to perform its obligations hereunder where such failure results from any cause beyond SKHY AI's reasonable control, including, without limitation, mechanical, electronic, or communications failure or degradation (Force Majeure).
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">3. Buyer Restrictions & Non-Circumvention</h3>
                            <p>
                                Buyers acquired through this Platform are customers of the Platform ecosystem. The Partner agrees:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                <li><strong>No Off-Platform Usage:</strong> Buyers originating from this Platform cannot be solicited for off-platform transactions or added to external marketing lists without explicit platform consent.</li>
                                <li><strong>Data Usage:</strong> Buyer data provided to the Partner is solely for the purpose of order fulfillment and strictly in accordance with SKHY AI's Data Policy.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">4. Return Policy Agreement</h3>
                            <p>
                                The Partner explicitly agrees to adhere to the Platform's Return and Refund Policy. You acknowledge that SKHY AI may issue refunds to buyers on your behalf in accordance with said policy, and such potential costs are the sole responsibility of the Partner.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Scale className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">5. De-Platforming & Dispute Resolution</h3>
                                <ul className="list-disc pl-5 mt-2 space-y-2 text-sm">
                                    <li>
                                        <strong>Right to De-Platform:</strong> SKHY AI reserves the unconditional right to suspend, terminate, or "de-platform" any Partner account with notice, for any violation of these terms or for any other reason deemed necessary to protect the integrity of the Platform.
                                    </li>
                                    <li>
                                        <strong>Finality of Decision:</strong> While a Partner may appeal a de-platforming decision through the designated Platform appeal process, <strong>the decision of SKHY AI is final and binding</strong>.
                                    </li>
                                    <li>
                                        <strong>Waiver of Legal Action:</strong> The Partner explicitly agrees that SKHY AI's decisions regarding account termination, product delisting, or dispute resolution are not subject to review in any court of law. The Partner waives any right to bring a lawsuit or class action against SKHY AI regarding such administrative decisions.
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-start gap-3">
                            <ShieldAlert className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-2">6. Disclaimer of Warranties</h3>
                                <p className="uppercase text-sm font-medium text-gray-400">
                                    THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. SKHY AI DOES NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE.
                                </p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-2">7. General Provisions (EULA)</h3>
                            <ul className="list-disc pl-5 mt-2 space-y-2 text-sm">
                                <li>
                                    <strong>Severability:</strong> If any provision of this Agreement is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary so that this Agreement shall otherwise remain in full force and effect and enforceable.
                                </li>
                                <li>
                                    <strong>Entire Agreement:</strong> This Agreement constitutes the entire agreement between the parties relative to its subject matter and supersedes all prior agreements, proposals, or representations, written or oral, concerning its subject matter.
                                </li>
                                <li>
                                    <strong>Class Action Waiver:</strong> YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED OR REPRESENTATIVE ACTION.
                                </li>
                            </ul>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-navy-700 bg-navy-950/50 rounded-b-xl flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-gray-300 hover:text-white hover:bg-navy-800 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onAgree}
                        className="px-8 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/20"
                    >
                        I Agree to These Terms
                    </button>
                </div>
            </div>
        </div>
    );
};
