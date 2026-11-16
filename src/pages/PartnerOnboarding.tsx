import { OnboardingProfileSchema } from '../schemas/validation';
import { z } from 'zod';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  User as UserIcon,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { handleError, ErrorContexts } from '../utils/ErrorHandler';
import type { ErrorInfo } from '../utils/ErrorHandler';
import { ErrorNotification } from '../components/ErrorNotification';
import { SupportChatbot } from '../components/SupportChatbot';
import {
  User as UserType,
  OnboardingStep,
} from '../types/partner';
import { ProfileForm } from '../components/partner/ProfileForm';
import { PartnerAgreementModal } from '../components/partner/PartnerAgreementModal';


const PartnerOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | undefined>(undefined);
  const [user, setUser] = useState<Partial<UserType>>({
    user_type: 'seller',
    seller_type: 'manufacturer',
    default_currency: 'USD',
    shipping_preference: 'self_managed',
    restricted_countries: ['Pakistan', 'Ukraine', 'Yemen', 'North Korea', 'Iran']
  });

  const [error, setError] = useState<ErrorInfo | null>(null);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showAgreement, setShowAgreement] = useState(false);

  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(true);




  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Company Profile',
      description: 'Set up your company profile and seller information',
      completed: false,
      required: true
    },
    {
      id: 'review',
      title: 'Review & Submit',
      description: 'Review your information and complete onboarding',
      completed: false,
      required: true
    }
  ];

  useEffect(() => {
    loadUserData();
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser?.user_metadata?.onboarding_complete) {
      navigate('/partner/dashboard');
    }
  };

  const loadUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Store auth user id for storage folder paths
      setAuthUserId(authUser.id);

      // Load existing user data
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (userData) {
        setUser(userData);



      }
    } catch (error: any) {
      const errorInfo = handleError(error, ErrorContexts.PROFILE_LOAD);
      setError(errorInfo);
    }
  };

  const saveProfile = async () => {
    // Validate Profile
    try {
      const { website, description } = user as any;
      OnboardingProfileSchema.parse({
        company_name: user?.company_name,
        website: website,
        description: description,
        contact_email: user?.email, // usually auth email, but nice to have in profile too if needed or keep loose
        contact_phone: (user as any)?.phone
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        // Safe access to ZodError issues
        const firstIssue = err.issues && err.issues.length > 0 ? err.issues[0].message : err.message || 'Validation error';
        setError({
          message: firstIssue,
          context: ErrorContexts.PROFILE_SAVE as any,
          timestamp: new Date().toISOString(),
          retryable: false
        } as any);
        return; // Stop execution
      }
    }

    setLoading(true);
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      // Extract metadata fields if they exist in the user object (passed from ProfileForm)
      const { website, description, ...userData } = user as any;

      const profileData = {
        ...userData,
        user_id: authUser.id,
        email: authUser.email,
        updated_at: new Date().toISOString(),
        user_metadata: {
          ...(user.user_metadata || {}),
          website: website || user.user_metadata?.website,
          description: description || user.user_metadata?.description
        }
      };

      const { error } = await supabase
        .from('users')
        .upsert(profileData);

      if (error) throw error;
    } catch (error: any) {
      const errorInfo = handleError(error, ErrorContexts.PROFILE_SAVE);
      setError(errorInfo);
      throw error; // Re-throw to prevent step progression
    } finally {
      setLoading(false);
    }
  };




  const completeOnboarding = async () => {
    setLoading(true);
    try {
      await saveProfile();

      // Mark onboarding as complete in BOTH auth.users and public.users
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        // 1. Update public.users
        await supabase
          .from('users')
          .update({
            user_metadata: {
              ...(user.user_metadata || {}),
              onboarding_complete: true
            }
          })
          .eq('user_id', authUser.id);

        // 2. Update auth.users (Essential for session persistence)
        await supabase.auth.updateUser({
          data: { onboarding_complete: true }
        });

        // 3. Newsletter Sync
        if (isSubscribed) {
          try {
            await supabase
              .from('pitch_deck_recipients')
              .insert({
                email: authUser.email,
                name: user?.company_name || authUser.email?.split('@')[0],
                company: user?.company_name,
                category: 'partner',
                source: 'registration',
                is_subscribed: true
              });
          } catch (err) {
            console.error('Newsletter sync error:', err);
          }
        }
      }

      alert('Onboarding completed successfully! Your profile will be reviewed.');
      // Navigate to partner dashboard after successful onboarding
      navigate('/partner/dashboard');
    } catch (error: any) {
      const errorInfo = handleError(error, 'complete_onboarding');
      setError(errorInfo);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    switch (currentStep) {
      case 0:
        await saveProfile();
        break;
      case 1:
        await completeOnboarding();
        return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setError(null);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };
  const renderProfileStep = () => (
    <div className="space-y-6">
      <div className="bg-navy-800 p-6 rounded-lg border border-navy-600">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <UserIcon className="w-5 h-5 mr-2" />
          Company Profile
        </h3>
        <p className="text-gray-400 mb-6">
          Please provide your company details to set up your seller account.
        </p>
        <ProfileForm
          user={user as any}
          initialData={user}
          onChange={setUser as any}
          hideSubmit={true}
          requireBusinessDoc={true}
          authUserId={authUserId}
        />
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-8">
      <div className="bg-navy-800 p-6 rounded-lg border border-navy-600">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <UserIcon className="w-5 h-5 mr-2" />
          Company Profile
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Company:</span>
            <span className="text-white ml-2">{user?.company_name}</span>
          </div>
          <div>
            <span className="text-gray-400">Email:</span>
            <span className="text-white ml-2">{user?.email}</span>
          </div>
          <div>
            <span className="text-gray-400">Seller Type:</span>
            <span className="text-white ml-2">{user?.seller_type}</span>
          </div>
          <div>
            <span className="text-gray-400">Stripe Customer ID:</span>
            <span className="text-white ml-2">{user?.stripe_customer_id || 'Not provided'}</span>
          </div>
        </div>
      </div>

      <div className="bg-sky-900/20 border border-sky-600/30 p-6 rounded-lg">
        <div className="flex items-start mb-4">
          <AlertCircle className="w-5 h-5 text-sky-400 mr-3 mt-0.5" />
          <div>
            <h4 className="text-sky-400 font-medium mb-2">Next Steps</h4>
            <p className="text-sky-100 text-sm">
              After submitting your profile, our team will review your account.
              Once approved, you will be able to add products and configure shipping/payouts in your dashboard.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-4 border-t border-sky-600/30">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="agreement"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-5 h-5 bg-navy-900 border-sky-600 rounded text-sky-500 focus:ring-sky-500 focus:ring-offset-navy-900"
            />
            <label htmlFor="agreement" className="ml-3 text-sm text-sky-100">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => setShowAgreement(true)}
                className="text-sky-400 hover:text-sky-300 underline font-medium"
              >
                Partner Agreement & Terms of Service
              </button>
            </label>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="isSubscribed"
              checked={isSubscribed}
              onChange={(e) => setIsSubscribed(e.target.checked)}
              className="mt-1 w-5 h-5 bg-navy-900 border-sky-600 rounded text-sky-500 focus:ring-sky-500 focus:ring-offset-navy-900"
            />
            <label htmlFor="isSubscribed" className="ml-3 text-sm text-sky-100 leading-tight cursor-pointer">
              <span className="font-medium text-white block mb-0.5">Stay informed with Skhy AI</span>
              Subscribe to our newsletter for the latest updates on defense technology, AI advancements, and partner highlights.
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderProfileStep();
      case 1:
        return renderReviewStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <a href="/" className="inline-block mb-6">
            <img
              src="/skhy-logo.jpg"
              alt="Skhy AI Logo"
              className="h-14 w-auto mx-auto rounded-lg hover:opacity-90 transition"
            />
          </a>
          <h1 className="text-4xl font-bold text-white mb-4">Partner Onboarding</h1>
          <p className="text-sky-100 text-lg">
            Set up your product catalog and start selling with Skhy AI
          </p>
        </div>

        {/* Error Notification */}
        <ErrorNotification
          error={error}
          onClose={() => setError(null)}
          onRetry={async () => {
            setError(null);
            // Retry the current step's save operation
            try {
              switch (currentStep) {
                case 0: await saveProfile(); break;
                case 1: await completeOnboarding(); break;
              }
            } catch (e) {
              // Error will be set by the save function
            }
          }}
          onGetHelp={() => {
            setShowChatbot(true);
          }}
        />

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${index <= currentStep
                  ? 'bg-sky-600 border-sky-600 text-white'
                  : 'border-navy-600 text-navy-400'
                  }`}>
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-24 h-0.5 mx-4 ${index < currentStep ? 'bg-sky-600' : 'bg-navy-600'
                    }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div key={step.id} className="text-center" style={{ width: `${100 / steps.length}%` }}>
                <h3 className={`text-sm font-medium ${index <= currentStep ? 'text-white' : 'text-navy-400'
                  }`}>
                  {step.title}
                </h3>
                <p className={`text-xs mt-1 ${index <= currentStep ? 'text-sky-100' : 'text-navy-500'
                  }`}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-navy-900 p-8 rounded-lg border border-navy-700 mb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white mb-2">
              {steps[currentStep].title}
            </h2>
            <p className="text-sky-100">
              {steps[currentStep].description}
            </p>
          </div>

          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-navy-700">
            <button
              onClick={prevStep}
              disabled={currentStep === 0 || loading}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${currentStep === 0
                ? 'bg-navy-700 text-navy-500 cursor-not-allowed'
                : 'bg-navy-700 text-white hover:bg-navy-600'
                }`}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Previous
            </button>

            <button
              onClick={nextStep}
              disabled={loading || (currentStep === 1 && !agreedToTerms)}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-lg font-medium hover:from-sky-700 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  {'Saving...'}
                </>
              ) : (
                <>
                  {currentStep === 1 ? 'Complete Onboarding' : 'Next'}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Support Chatbot */}
      <SupportChatbot
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
        initialCategory={error?.category === 'database' ? 'products' : undefined}
        initialErrorDetails={error?.technicalDetails}
      />

      <PartnerAgreementModal
        isOpen={showAgreement}
        onClose={() => setShowAgreement(false)}
        onAgree={() => {
          setAgreedToTerms(true);
          setShowAgreement(false);
        }}
      />
    </div>
  );
};

export default PartnerOnboarding;