/**
 * AI Assistant Component
 * Demonstrates integration of LangGraph-based agentic system with the application
 */

import { useState, useEffect } from 'react';
import { useAgent } from '../services/context';
import type { AgentCapability, AgentTask } from '../types';

export function AIAssistant() {
  const agent = useAgent();
  const [capabilities, setCapabilities] = useState<AgentCapability[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<string>('summarize');
  const [input, setInput] = useState('');
  const [context, setContext] = useState({
    tone: 'professional',
    targetLanguage: 'Spanish',
    additionalInstructions: ''
  });
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskHistory, setTaskHistory] = useState<AgentTask[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [useStreaming, setUseStreaming] = useState(false);

  useEffect(() => {
    // Load capabilities
    const caps = agent.getCapabilities();
    setCapabilities(caps);
    
    // Load task history
    loadHistory();
  }, [agent]);

  const loadHistory = async () => {
    try {
      const history = await agent.getTaskHistory();
      setTaskHistory(history);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const handleExecute = async () => {
    if (!input.trim()) {
      alert('Please enter some input text');
      return;
    }

    setIsLoading(true);
    setResult('');
    setStreamingText('');

    try {
      const taskContext = selectedFeature === 'translate' || selectedFeature === 'rewrite' || selectedFeature === 'custom'
        ? context
        : undefined;

      if (useStreaming) {
        // Use streaming for real-time results
        const response = await agent.streamTask(
          selectedFeature as any,
          input,
          taskContext,
          (chunk) => {
            setStreamingText(prev => prev + chunk);
          }
        );
        setResult(response.result);
      } else {
        // Standard execution
        const response = await agent.executeTask(
          selectedFeature as any,
          input,
          taskContext
        );
        setResult(response.result);
      }

      // Refresh history
      await loadHistory();
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedCapability = capabilities.find(c => c.feature === selectedFeature);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-surface rounded-2xl shadow-xl p-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            🤖 AI Assistant Demo
          </h1>
          <p className="text-gray-600 text-lg">
            Powered by LangGraph Agentic System Integration
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This demo shows how to integrate a LangGraph-based agentic system 
              with your application's service architecture. The responses are simulated - in production, 
              these would connect to actual LangGraph agents with LLMs.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Feature Selection */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-2xl shadow-xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                AI Features
              </h2>
              <div className="space-y-2">
                {capabilities.map((capability) => (
                  <button
                    key={capability.feature}
                    onClick={() => setSelectedFeature(capability.feature)}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedFeature === capability.feature
                        ? 'bg-blue-500 text-white shadow-lg scale-105'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{capability.icon}</span>
                      <div>
                        <div className="font-semibold">{capability.name}</div>
                        <div className={`text-sm ${
                          selectedFeature === capability.feature 
                            ? 'text-blue-100' 
                            : 'text-gray-500'
                        }`}>
                          {capability.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* History Toggle */}
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="w-full mt-4 p-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition-colors"
              >
                {showHistory ? '📝 Hide History' : '📜 View History'} ({taskHistory.length})
              </button>
            </div>
          </div>

          {/* Right Panel - Input & Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <div className="bg-surface rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCapability?.icon} {selectedCapability?.name}
                </h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useStreaming}
                    onChange={(e) => setUseStreaming(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-gray-600">Stream response</span>
                </label>
              </div>

              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your text here..."
                className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none min-h-[150px] resize-y"
              />

              {/* Context Options */}
              {selectedCapability?.requiresContext && (
                <div className="mt-4 space-y-3">
                  <h3 className="font-semibold text-gray-700">Options</h3>
                  
                  {selectedFeature === 'rewrite' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Tone</label>
                      <select
                        value={context.tone}
                        onChange={(e) => setContext({ ...context, tone: e.target.value })}
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="professional">Professional</option>
                        <option value="casual">Casual</option>
                        <option value="formal">Formal</option>
                        <option value="creative">Creative</option>
                        <option value="technical">Technical</option>
                      </select>
                    </div>
                  )}

                  {selectedFeature === 'translate' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Target Language</label>
                      <select
                        value={context.targetLanguage}
                        onChange={(e) => setContext({ ...context, targetLanguage: e.target.value })}
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                      >
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="German">German</option>
                        <option value="Japanese">Japanese</option>
                        <option value="Chinese">Chinese</option>
                      </select>
                    </div>
                  )}

                  {selectedFeature === 'custom' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Additional Instructions</label>
                      <textarea
                        value={context.additionalInstructions}
                        onChange={(e) => setContext({ ...context, additionalInstructions: e.target.value })}
                        placeholder="Provide specific instructions for the AI..."
                        className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none min-h-[80px]"
                      />
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleExecute}
                disabled={isLoading}
                className={`w-full mt-4 p-4 rounded-lg font-semibold text-white transition-all ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 hover:shadow-lg active:scale-95'
                }`}
              >
                {isLoading ? '⏳ Processing...' : '✨ Execute AI Task'}
              </button>
            </div>

            {/* Results Section */}
            {(result || streamingText || isLoading) && (
              <div className="bg-surface rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  📤 Result
                </h2>
                <div className="p-4 bg-gray-50 rounded-lg border-2 border-gray-200 min-h-[200px] whitespace-pre-wrap">
                  {isLoading && !streamingText && (
                    <div className="flex items-center gap-3 text-gray-500">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      Processing your request...
                    </div>
                  )}
                  {streamingText && (
                    <div className="text-gray-800">{streamingText}</div>
                  )}
                  {!isLoading && result && !streamingText && (
                    <div className="text-gray-800">{result}</div>
                  )}
                </div>
              </div>
            )}

            {/* History Section */}
            {showHistory && (
              <div className="bg-surface rounded-2xl shadow-xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  📜 Task History
                </h2>
                {taskHistory.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No tasks yet</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {taskHistory.map((task) => (
                      <div
                        key={task.id}
                        className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-gray-900">
                            {capabilities.find(c => c.feature === task.feature)?.icon}{' '}
                            {task.feature}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            task.status === 'completed' ? 'bg-green-100 text-green-800' :
                            task.status === 'failed' ? 'bg-red-100 text-red-800' :
                            task.status === 'running' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-2">
                          <strong>Input:</strong> {task.input.substring(0, 100)}
                          {task.input.length > 100 && '...'}
                        </div>
                        {task.result && (
                          <div className="text-sm text-gray-600">
                            <strong>Result:</strong> {task.result.substring(0, 150)}
                            {task.result.length > 150 && '...'}
                          </div>
                        )}
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(task.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Architecture Info */}
        <div className="mt-8 bg-surface rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🏗️ Architecture Overview
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Service Integration
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The AI Assistant uses the same service abstraction pattern as the rest of the 
                application. The <code className="bg-gray-100 px-1 py-0.5 rounded">IAgentService</code> interface 
                defines the contract, and implementations can use LangGraph, LangChain, or any other 
                agentic framework.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                LangGraph Integration
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Each AI feature can be powered by a different LangGraph state graph. For example, 
                the summarization feature could use a multi-step graph that first analyzes content, 
                then extracts key points, and finally generates a coherent summary.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Platform Support
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Both web and Electron implementations are supported. Electron can additionally 
                support local models (like Ollama) for offline AI capabilities, while the web 
                version can connect to cloud-based LangGraph APIs.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-lg text-gray-900 mb-2">
                Document Context
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                The agent service can access document content through the storage service, 
                enabling context-aware AI features. This allows agents to work with your 
                existing documents and incorporate them into their reasoning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

