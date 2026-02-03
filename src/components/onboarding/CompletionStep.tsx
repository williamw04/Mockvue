import { useTheme } from '../../services/ThemeContext';

interface CompletionStepProps {
  onComplete: () => void;
}

export default function CompletionStep({ onComplete }: CompletionStepProps) {
  const { theme } = useTheme();

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="text-7xl mb-8 animate-bounce">🎉</div>
      
      <h1 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
        You're All Set!
      </h1>
      
      <p className={`text-xl mb-8 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
        Your interview prep workspace is ready
      </p>

      <div className={`rounded-2xl p-8 mb-8 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
        <h2 className={`text-2xl font-semibold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          What's Next?
        </h2>
        
        <div className="space-y-4 text-left">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Build More Stories
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Add more experiences to your library. The more stories you have, the better prepared you'll be.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Create Interview Responses
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Use your stories to craft compelling answers to common behavioral questions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Practice & Refine
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Practice your responses out loud and refine them based on feedback.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0">
              4
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold mb-1 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Ace Your Interviews
              </h3>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Use your preparation to confidently tackle any behavioral question.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={onComplete}
        className="px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-lg transition-colors shadow-xl"
      >
        Go to Dashboard
      </button>

      <p className={`mt-6 text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
        You can always update your profile and stories from the settings
      </p>
    </div>
  );
}
