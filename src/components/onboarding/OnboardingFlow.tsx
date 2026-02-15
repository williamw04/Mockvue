import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useNotifications } from '../../services';
import WelcomeStep from './WelcomeStep';
import ResumeUploadStep from './ResumeUploadStep';
import StoryCreationStep from './StoryCreationStep';
import CompletionStep from './CompletionStep';

type OnboardingStep = 'welcome' | 'resume' | 'stories' | 'completion';

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const userService = useUser();
  const notifications = useNotifications();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [userName, setUserName] = useState('');
  const [targetRole, setTargetRole] = useState('');

  useEffect(() => {
    // Check if user has already completed onboarding
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const profile = await userService.getUserProfile();
      if (profile?.onboardingCompleted) {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const handleWelcomeComplete = (name: string, role: string) => {
    setUserName(name);
    setTargetRole(role);
    setCurrentStep('resume');
  };

  const handleResumeComplete = async () => {
    setCurrentStep('stories');
  };

  const handleStoriesComplete = async () => {
    try {
      // Save user profile with onboarding completed
      await userService.saveUserProfile({
        name: userName,
        targetRole: targetRole,
        onboardingCompleted: false, // Not yet - show completion step first
      });
      setCurrentStep('completion');
    } catch (error) {
      console.error('Error saving profile:', error);
      await notifications.showError('Failed to save your progress');
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await userService.completeOnboarding();
      await notifications.showSuccess('Welcome to Mockvue! 🎉');
      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      await notifications.showError('Failed to complete onboarding');
    }
  };

  const steps = [
    { id: 'welcome', label: 'Welcome', number: 1 },
    { id: 'resume', label: 'Resume', number: 2 },
    { id: 'stories', label: 'Stories', number: 3 },
    { id: 'completion', label: 'Complete', number: 4 },
  ];

  const currentStepNumber = steps.find(s => s.id === currentStep)?.number || 1;

  return (
    <div className="min-h-screen transition-colors duration-300 bg-gray-100 text-gray-900">
      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Getting Started</h2>
            <span className="text-sm text-gray-500">
              Step {currentStepNumber} of {steps.length}
            </span>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                      step.number <= currentStepNumber
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      step.number <= currentStepNumber
                        ? 'text-gray-900'
                        : 'text-gray-500'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-colors ${
                      step.number < currentStepNumber
                        ? 'bg-blue-600'
                        : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-32 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {currentStep === 'welcome' && (
            <WelcomeStep onComplete={handleWelcomeComplete} />
          )}

          {currentStep === 'resume' && (
            <ResumeUploadStep onComplete={handleResumeComplete} />
          )}

          {currentStep === 'stories' && (
            <StoryCreationStep onComplete={handleStoriesComplete} />
          )}

          {currentStep === 'completion' && (
            <CompletionStep onComplete={handleOnboardingComplete} />
          )}
        </div>
      </div>
    </div>
  );
}
