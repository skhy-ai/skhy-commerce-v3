import React from 'react';
import { Lock } from 'lucide-react';

const BlockedAccess: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 to-navy-900 flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-red-500/10 border border-red-500/30 rounded-full p-4">
            <Lock className="w-12 h-12 text-red-400" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-white mb-4">Access Restricted</h1>

        <p className="text-sky-100 mb-6">
          We're unable to provide access to this service in your region at this time.
        </p>

        <div className="bg-black/40 border border-white/10 rounded-lg p-4">
          <p className="text-sm text-sky-200">
            If you believe this is an error or have questions about service availability in your area, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlockedAccess;
