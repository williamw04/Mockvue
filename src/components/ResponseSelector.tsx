/**
 * Response Selector Component
 * Displays responses from the document and allows users to select them for AI features
 */

import { useState, useEffect } from 'react';
import type { BlockNoteEditor } from '@blocknote/core';

interface Response {
  id: string;
  content: string;
  selected: boolean;
}

interface ResponseSelectorProps {
  editor: BlockNoteEditor<any, any, any>;
  onSelectionChange?: (selectedCount: number) => void;
}

export default function ResponseSelector({ editor, onSelectionChange }: ResponseSelectorProps) {
  const [responses, setResponses] = useState<Response[]>([]);

  useEffect(() => {
    // Extract responses from the editor
    const extractResponses = () => {
      const blocks = editor.document;
      const responseBlocks: Response[] = [];

      for (const block of blocks) {
        if (block.type === 'response') {
          const props = block.props as any;
          const content = block.content as any;
          
          // Extract text content
          let text = '';
          if (Array.isArray(content)) {
            text = content.map(c => c.text || '').join('');
          }
          
          responseBlocks.push({
            id: block.id,
            content: text || 'Empty response',
            selected: props.selected || false,
          });
        }
      }

      setResponses(responseBlocks);
      
      // Notify parent of selection count
      if (onSelectionChange) {
        const selectedCount = responseBlocks.filter(r => r.selected).length;
        onSelectionChange(selectedCount);
      }
    };

    extractResponses();
    
    // Set up listener for editor changes
    editor.onEditorContentChange(() => {
      extractResponses();
    });
  }, [editor, onSelectionChange]);

  const toggleResponse = (responseId: string) => {
    // Find and update the block in the editor
    const block = editor.document.find(b => b.id === responseId);
    if (block && block.type === 'response') {
      const props = block.props as any;
      editor.updateBlock(responseId, {
        props: { ...props, selected: !props.selected },
      });
    }
  };

  if (responses.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        <p>No responses found in the document.</p>
        <p className="mt-2 text-xs">Add Response blocks to use AI feedback.</p>
      </div>
    );
  }

  const selectedCount = responses.filter(r => r.selected).length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-800">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Responses ({selectedCount} selected)
        </h4>
      </div>

      {/* Response List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {responses.map((response, index) => (
          <div
            key={response.id}
            onClick={() => toggleResponse(response.id)}
            className={`p-3 rounded-lg cursor-pointer transition-all ${
              response.selected
                ? 'bg-green-500/20 border-2 border-green-500'
                : 'bg-gray-800/50 border-2 border-transparent hover:border-gray-700'
            }`}
          >
            <div className="flex items-start gap-2">
              <span className="text-base flex-shrink-0">
                {response.selected ? '✅' : '💬'}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-1">Response {index + 1}</div>
                <div className="text-sm text-gray-300 line-clamp-3">
                  {response.content}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div className="px-4 py-3 border-t border-gray-800">
        <p className="text-xs text-gray-500">
          💡 Click on responses to select them for AI feedback
        </p>
      </div>
    </div>
  );
}

