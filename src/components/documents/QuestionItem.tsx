import { useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { ChevronDown, ChevronRight, GripVertical } from 'lucide-react';
import { DocumentQuestion } from '../../types';

interface QuestionItemProps {
  question: DocumentQuestion;
  index: number;
  moveQuestion: (dragIndex: number, hoverIndex: number) => void;
  updateResponse: (id: string, response: string) => void;
  updateQuestionText: (id: string, text: string) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

const ITEM_TYPE = 'QUESTION';

export function QuestionItem({
  question,
  index,
  moveQuestion,
  updateResponse,
  updateQuestionText,
  isExpanded,
  setIsExpanded,
}: QuestionItemProps) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag, preview] = useDrag({
    type: ITEM_TYPE,
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    hover: (item: { index: number }, monitor) => {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      const hoverBoundingRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;
      moveQuestion(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  preview(drop(ref));

  return (
    <div
      ref={ref}
      className={`bg-surface border border-gray-200 transition-all ${
        isDragging ? 'opacity-40' : 'opacity-100'
      } ${isOver ? 'border-blue-400' : ''} ${
        index === 0 ? 'rounded-t-lg' : '-mt-px'
      }`}
      style={{ cursor: 'move' }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div ref={drag} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="w-5 h-5 text-gray-400" />
        </div>
        <button
          className="flex-shrink-0 text-gray-500 hover:text-gray-700"
          onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
        >
          {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
        <div className="flex-1">
          <input
            type="text"
            value={question.text}
            onChange={(e) => updateQuestionText(question.id, e.target.value)}
            className="w-full bg-transparent text-gray-900 focus:outline-none focus:ring-0 border-none p-0"
            onClick={(e) => e.stopPropagation()}
            placeholder="Enter question..."
          />
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100">
          <textarea
            value={question.response}
            onChange={(e) => updateResponse(question.id, e.target.value)}
            placeholder="Type your response here..."
            className="w-full min-h-[120px] p-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y bg-white text-gray-900"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
