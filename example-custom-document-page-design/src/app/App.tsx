import { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QuestionItem } from './components/QuestionItem';
import { Plus, ChevronsDown, ChevronsUp } from 'lucide-react';

interface Question {
  id: string;
  text: string;
  response: string;
  isExpanded: boolean;
}

function App() {
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', text: 'What is your primary goal for this project?', response: '', isExpanded: false },
    { id: '2', text: 'Who is your target audience?', response: '', isExpanded: false },
    { id: '3', text: 'What are the main features you need?', response: '', isExpanded: false },
    { id: '4', text: 'What is your timeline for completion?', response: '', isExpanded: false },
    { id: '5', text: 'What is your budget range?', response: '', isExpanded: false },
  ]);

  const moveQuestion = useCallback((dragIndex: number, hoverIndex: number) => {
    setQuestions((prevQuestions) => {
      const newQuestions = [...prevQuestions];
      const draggedQuestion = newQuestions[dragIndex];
      newQuestions.splice(dragIndex, 1);
      newQuestions.splice(hoverIndex, 0, draggedQuestion);
      return newQuestions;
    });
  }, []);

  const updateResponse = useCallback((id: string, response: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === id ? { ...q, response } : q))
    );
  }, []);

  const updateQuestionText = useCallback((id: string, text: string) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === id ? { ...q, text } : q))
    );
  }, []);

  const setQuestionExpanded = useCallback((id: string, expanded: boolean) => {
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => (q.id === id ? { ...q, isExpanded: expanded } : q))
    );
  }, []);

  const toggleExpandAll = () => {
    const allExpanded = questions.every((q) => q.isExpanded);
    setQuestions((prevQuestions) =>
      prevQuestions.map((q) => ({ ...q, isExpanded: !allExpanded }))
    );
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      text: 'New question',
      response: '',
      isExpanded: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const allExpanded = questions.length > 0 && questions.every((q) => q.isExpanded);

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 flex items-start justify-between">
            <div>
              <h1 className="text-gray-900 mb-2">Custom Document</h1>
              <p className="text-gray-600">
                Drag questions to reorder. Click to expand and add your responses.
              </p>
            </div>
            {questions.length > 0 && (
              <button
                onClick={toggleExpandAll}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
              >
                {allExpanded ? (
                  <>
                    <ChevronsUp className="w-4 h-4" />
                    Collapse All
                  </>
                ) : (
                  <>
                    <ChevronsDown className="w-4 h-4" />
                    Expand All
                  </>
                )}
              </button>
            )}
          </div>

          <div className="mb-4">
            <div className="rounded-lg overflow-hidden shadow-sm">
              {questions.map((question, index) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  index={index}
                  moveQuestion={moveQuestion}
                  updateResponse={updateResponse}
                  updateQuestionText={updateQuestionText}
                  isExpanded={question.isExpanded}
                  setIsExpanded={(expanded) => setQuestionExpanded(question.id, expanded)}
                />
              ))}
            </div>
            
            {questions.length > 0 && (
              <div className="h-2 bg-gradient-to-b from-gray-200/50 to-transparent rounded-b-lg -mt-1"></div>
            )}
          </div>

          <button
            onClick={addQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-gray-700"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </div>
    </DndProvider>
  );
}

export default App;
