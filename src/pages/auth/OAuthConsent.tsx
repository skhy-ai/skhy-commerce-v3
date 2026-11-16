import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Check, Shield, AlertTriangle } from 'lucide-react';
import '../../index.css';

const OAuthConsent: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [loading, setLoading] = useState(false);

    // In a real OAuth flow as implemented by Supabase, the consent screen 
    // is often handled by the provider login screen. 
    // However, if we are implementing a custom third-party consent 
    // for our own ecosystem apps, we would verify the client_id here.
    const clientName = searchParams.get('client_name') || 'External Application';
    const scope = searchParams.get('scope') || 'read_user_data';

    const handleAllow = async () => {
        setLoading(true);
        // Simulate processing or redirect back to callback url with code
        // For demonstration, we'll just log
        console.log("Allowed access");

        const redirectUri = searchParams.get('redirect_uri');
        if (redirectUri) {
            // Check if redirect URI is allowed effectively by our system 
            // In a real scenario, we'd sign a token and append it
            window.location.href = redirectUri + '?code=mock_auth_code_123';
        } else {
            alert("No redirect URI provided.");
            setLoading(false);
        }
    };

    const handleDeny = () => {
        const redirectUri = searchParams.get('redirect_uri');
        if (redirectUri) {
            window.location.href = redirectUri + '?error=access_denied';
        } else {
            alert("Access denied. You can close this window.");
        }
    };

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[100px] rounded-full"></div>
                <div className="absolute top-[20%] right-[20%] w-[20%] h-[20%] bg-cyan-900/10 blur-[80px] rounded-full"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-[#050B14] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">

                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 border border-white/10 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <Shield className="w-8 h-8 text-blue-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2 text-center">Authorization Request</h1>
                        <p className="text-gray-400 text-center text-sm">
                            <span className="text-blue-400 font-medium">{clientName}</span> wants to access your Skhy Account
                        </p>
                    </div>

                    {/* Permissions */}
                    <div className="space-y-4 mb-8">
                        <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                            <h3 className="text-gray-300 text-sm font-medium mb-3">This application will be able to:</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <div className="mt-0.5 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                                        <Check className="w-3 h-3 text-green-400" />
                                    </div>
                                    <span className="text-gray-400 text-sm">View your basic profile information (name, email)</span>
                                </li>
                                {scope.includes('offline_access') && (
                                    <li className="flex items-start gap-3">
                                        <div className="mt-0.5 w-5 h-5 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
                                            <AlertTriangle className="w-3 h-3 text-yellow-400" />
                                        </div>
                                        <span className="text-gray-400 text-sm">Maintain access to your data while you are offline</span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <Shield className="w-4 h-4 text-blue-400 shrink-0" />
                            <p className="text-xs text-blue-300">
                                Your password will <span className="font-bold">not</span> be shared with this application.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleDeny}
                            className="flex-1 px-4 py-3 rounded-lg border border-white/10 text-gray-300 hover:bg-white/5 hover:text-white transition-all text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleAllow}
                            disabled={loading}
                            className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/25 transition-all text-sm font-bold flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full"></span>
                            ) : (
                                "Approve Access"
                            )}
                        </button>
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-600">
                        By approving, you agree to share the listed information with this application.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OAuthConsent;
