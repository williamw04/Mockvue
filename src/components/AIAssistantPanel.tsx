/**
 * AI Assistant Panel Component
 * Provides AI-powered features: Brainstorm, Feedback, and Draft
 */

import { useState } from 'react';
import { useAgentic, useNotifications } from '../services';
import type { AIFeatureType } from '../types';
import type { BlockNoteEditor } from '@blocknote/core';

interface AIAssistantPanelProps {
  editor: BlockNoteEditor<any, any, any>;
  onClose?: () => void;
}

export default function AIAssistantPanel({ editor, onClose }: AIAssistantPanelProps) {
  const agentic = useAgentic();
  const notifications = useNotifications();
  
  const [selectedFeature, setSelectedFeature] = useState<AIFeatureType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | string[] | null>(null);

  // Get selected responses from the editor
  const getSelectedResponses = (): string[] => {
    const blocks = editor.document;
    const selectedResponses: string[] = [];
    
    for (const block of blocks) {
      if (block.type === 'response' && (block.props as any).selected) {
        // Get the text content from the block
        const text = editor.blocksToFullHTML([block]);
        selectedResponses.push(text);
      }
    }
    
    return selectedResponses;
  };

  // Get context from the document
  const getDocumentContext = (): string => {
    const blocks = editor.document;
    let context = '';
    
    for (const block of blocks) {
      if (block.type === 'context') {
        const text = editor.blocksToFullHTML([block]);
        context += text + ' ';
      }
    }
    
    return context.trim() || 'Document content';
  };

  const handleBrainstorm = async () => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      const context = getDocumentContext();
      const ideas = await agentic.brainstorm(context);
      setResult(ideas);
      await notifications.showSuccess('Brainstorming complete!');
    } catch (error) {
      console.error('Brainstorm error:', error);
      await notifications.showError('Failed to generate ideas');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeedback = async () => {
    const selectedResponses = getSelectedResponses();
    
    if (selectedResponses.length === 0) {
      await notifications.showInfo('Please select a response block first');
      return;
    }
    
    setIsProcessing(true);
    setResult(null);
    
    try {
      const context = getDocumentContext();
      const feedback = await agentic.provideFeedback(selectedResponses[0], context);
      setResult(feedback);
      await notifications.showSuccess('Feedback generated!');
    } catch (error) {
      console.error('Feedback error:', error);
      await notifications.showError('Failed to generate feedback');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDraft = async () => {
    setIsProcessing(true);
    setResult(null);
    
    try {
      const context = getDocumentContext();
      const selectedResponses = getSelectedResponses();
      const draft = await agentic.generateDraft(context, selectedResponses);
      setResult(draft);
      await notifications.showSuccess('Draft generated!');
    } catch (error) {
      console.error('Draft error:', error);
      await notifications.showError('Failed to generate draft');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFeatureSelect = (feature: AIFeatureType) => {
    setSelectedFeature(feature);
    setResult(null);
    
    // Auto-execute the feature
    switch (feature) {
      case 'brainstorm':
        handleBrainstorm();
        break;
      case 'feedback':
        handleFeedback();
        break;
      case 'draft':
        handleDraft();
        break;
    }
  };

  const insertResultIntoEditor = () => {
    if (!result) return;
    
    const content = Array.isArray(result) 
      ? result.join('\n\n') 
      : result;
    
    // Insert a new response block with AI-generated content
    editor.insertBlocks(
      [
        {
          type: 'response',
          props: { aiGenerated: true, selected: false },
          content: content,
        },
      ],
      editor.getTextCursorPosition().block,
      'after'
    );
    
    notifications.showSuccess('Result inserted into document!');
    setResult(null);
  };

  return (
    <div className="flex flex-col h-full bg-[#1a1a1a] text-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
          ✨ AI Assistant
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Feature Selection */}
      <div className="px-4 py-4 space-y-2 border-b border-gray-800">
        <button
          onClick={() => handleFeatureSelect('brainstorm')}
          disabled={isProcessing}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group ${
            selectedFeature === 'brainstorm'
              ? 'bg-purple-500/20 text-purple-400'
              : 'hover:bg-gray-800/50 text-gray-300'
          } disabled:opacity-50`}
        >
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">💡</span>
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">Brainstorm</div>
            <div className="text-xs text-gray-400">Generate creative ideas</div>
          </div>
        </button>

        <button
          onClick={() => handleFeatureSelect('feedback')}
          disabled={isProcessing}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group ${
            selectedFeature === 'feedback'
              ? 'bg-blue-500/20 text-blue-400'
              : 'hover:bg-gray-800/50 text-gray-300'
          } disabled:opacity-50`}
        >
          <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">📝</span>
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">Feedback</div>
            <div className="text-xs text-gray-400">Get AI feedback on response</div>
          </div>
        </button>

        <button
          onClick={() => handleFeatureSelect('draft')}
          disabled={isProcessing}
          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors group ${
            selectedFeature === 'draft'
              ? 'bg-green-500/20 text-green-400'
              : 'hover:bg-gray-800/50 text-gray-300'
          } disabled:opacity-50`}
        >
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">✍️</span>
          </div>
          <div className="flex-1 text-left">
            <div className="text-sm font-medium">Draft</div>
            <div className="text-xs text-gray-400">Create structured draft</div>
          </div>
        </button>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {isProcessing && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-400">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-sm">Processing...</p>
          </div>
        )}

        {!isProcessing && result && (
          <div className="space-y-3">
            {Array.isArray(result) ? (
              // Brainstorming results
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Ideas Generated
                </h4>
                {result.map((idea, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-800/50 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors"
                  >
                    {idea}
                  </div>
                ))}
              </div>
            ) : (
              // Feedback or Draft results
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {selectedFeature === 'feedback' ? 'Feedback' : 'Generated Draft'}
                </h4>
                <div className="p-4 bg-gray-800/50 rounded-lg text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {result}
                </div>
              </div>
            )}
            
            {/* Insert button */}
            <button
              onClick={insertResultIntoEditor}
              className="w-full mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Insert into Document
            </button>
          </div>
        )}

        {!isProcessing && !result && selectedFeature && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-sm text-center">
            <p>No results yet.</p>
            <p className="mt-2">Select a feature above to begin.</p>
          </div>
        )}

        {!selectedFeature && !isProcessing && (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-sm text-center">
            <span className="text-4xl mb-4">🤖</span>
            <p>Choose an AI feature to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

