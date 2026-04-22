/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useNotifications } from '../../services';
import { SurveyResponse } from '../../types';
import WelcomeStep from './WelcomeStep';
import SurveyStep from './SurveyStep';
import ResumeUploadStep from './ResumeUploadStep';
import CoreStoryMatchStep from './CoreStoryMatchStep';
import CompletionStep from './CompletionStep';

type OnboardingStep = 'welcome' | 'survey' | 'resume' | 'stories' | 'completion';

export default function OnboardingFlow() {
  const navigate = useNavigate();
  const userService = useUser();
  const notifications = useNotifications();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [userName, setUserName] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [surveyResponses, setSurveyResponses] = useState<SurveyResponse[]>([]);

  useEffect(() => {
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
    setCurrentStep('survey');
  };

  const handleSurveyComplete = (responses: SurveyResponse[]) => {
    setSurveyResponses(responses);
    setCurrentStep('resume');
  };

  const handleResumeComplete = async () => {
    try {
      await userService.saveUserProfile({
        name: userName,
        targetRole: targetRole,
        surveyResponses: surveyResponses,
        onboardingCompleted: false,
      });
      setCurrentStep('stories');
    } catch (error) {
      console.error('Error saving profile:', error);
      await notifications.showError('Failed to save your progress');
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await userService.completeOnboarding();
      await notifications.showSuccess('Welcome to Mockvue!');
      navigate('/');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      await notifications.showError('Failed to complete onboarding');
    }
  };

  const handleStoriesComplete = () => {
    setCurrentStep('completion');
  };

  const steps = [
    { id: 'welcome', label: 'Welcome', number: 1 },
    { id: 'survey', label: 'Survey', number: 2 },
    { id: 'resume', label: 'Resume', number: 3 },
    { id: 'stories', label: 'Stories', number: 4 },
    { id: 'completion', label: 'Complete', number: 5 },
  ];

  const currentStepNumber = steps.find((s) => s.id === currentStep)?.number || 1;

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-rule">
        <div className="max-w-4xl mx-auto px-14 py-4">
          <div className="flex items-center justify-between mb-5">
            <div className="font-serif text-xl font-medium">Getting Started</div>
            <div className="font-mono text-[11px] text-ink-3">
              Step {currentStepNumber} of {steps.length}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`w-7 h-7 rounded-sm flex items-center justify-center font-mono text-[11px] font-semibold transition-colors ${
                      step.number <= currentStepNumber
                        ? 'bg-accent-hi text-white'
                        : 'bg-bg text-ink-3 border border-rule'
                    }`}
                  >
                    {step.number}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      step.number <= currentStepNumber ? 'text-ink' : 'text-ink-3'
                    }`}
                  >
                    {step.label}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-px mx-3 transition-colors ${
                      step.number < currentStepNumber ? 'bg-accent-hi' : 'bg-rule'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-32 pb-12 px-14">
        <div className="max-w-4xl mx-auto">
          {currentStep === 'welcome' && <WelcomeStep onComplete={handleWelcomeComplete} />}

          {currentStep === 'survey' && <SurveyStep onComplete={handleSurveyComplete} />}

          {currentStep === 'resume' && <ResumeUploadStep onComplete={handleResumeComplete} />}

          {currentStep === 'stories' && <CoreStoryMatchStep onComplete={handleStoriesComplete} />}

          {currentStep === 'completion' && <CompletionStep onComplete={handleOnboardingComplete} />}
        </div>
      </div>
    </div>
  );
}
