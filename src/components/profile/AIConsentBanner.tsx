import { useState } from 'react';
import { useUser, useNotifications } from '../../services';
import { Sparkles, Shield, X } from 'lucide-react';

interface AIConsentBannerProps {
    onConsent: (consent: boolean) => void;
}

export function AIConsentBanner({ onConsent }: AIConsentBannerProps) {
    const userService = useUser();
    const notifications = useNotifications();
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const handleConsent = async (consent: boolean) => {
        try {
            await userService.saveUserProfile({
                aiPreferences: {
                    aiAnalysisConsent: consent,
                    askedAt: new Date().toISOString(),
                },
            });
            onConsent(consent);
            setDismissed(true);
            notifications.showInfo(
                consent
                    ? 'AI analysis enabled. The coach will provide detailed feedback.'
                    : 'ATS-only mode. Only formatting and keyword checks will be used.'
            );
        } catch {
            notifications.showError('Failed to save preference. Please try again.');
        }
    };

    return (
        <div className="rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50 p-4 shadow-sm">
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Enable AI-Powered Coaching?</h4>
                    <p className="text-xs text-gray-600 mb-3">
                        The coaching workspace can analyze your resume using AI to suggest rewrites, identify weak points,
                        and track improvement over time. Your resume data stays local and is only sent to the AI model you configure.
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleConsent(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            Allow AI Analysis
                        </button>
                        <button
                            onClick={() => handleConsent(false)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 bg-surface hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                        >
                            <Shield className="w-3.5 h-3.5" />
                            ATS Only
                        </button>
                    </div>
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
