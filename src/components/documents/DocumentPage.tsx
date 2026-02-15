import { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { QuestionItem } from './QuestionItem';
import { Plus, ChevronsDown, ChevronsUp, Save, ArrowLeft } from 'lucide-react';
import { DocumentQuestion, Document } from '../../types';
import { useNotifications, useDocuments } from '../../services';

export default function DocumentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const notifications = useNotifications();
  const documentService = useDocuments();

  const [document, setDocument] = useState<Document | null>(null);
  const [questions, setQuestions] = useState<DocumentQuestion[]>([]);
  const [title, setTitle] = useState('Untitled Document');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [id]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      if (id) {
        const doc = await documentService.getDocument(id);
        if (doc) {
          setDocument(doc);
          setTitle(doc.title);
          setDescription(doc.description || '');
          setQuestions(doc.questions);
        }
      } else {
        const defaultQuestions: DocumentQuestion[] = [
          { id: '1', text: 'What is your primary goal for this project?', response: '', isExpanded: false },
          { id: '2', text: 'Who is your target audience?', response: '', isExpanded: false },
          { id: '3', text: 'What are the main features you need?', response: '', isExpanded: false },
        ];
        setQuestions(defaultQuestions);
      }
    } catch (error) {
      console.error('Error loading document:', error);
      await notifications.showError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  const saveDocument = async () => {
    try {
      setSaving(true);
      if (document) {
        await documentService.updateDocument(document.id, {
          title,
          description,
          questions,
        });
        await notifications.showSuccess('Document saved!');
      } else {
        const newDoc = await documentService.createDocument({ title, description, questions });
        setDocument(newDoc);
        await notifications.showSuccess('Document created!');
        navigate(`/document/${newDoc.id}`, { replace: true });
      }
    } catch (error) {
      console.error('Error saving document:', error);
      await notifications.showError('Failed to save document');
    } finally {
      setSaving(false);
    }
  };

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
    const newQuestion: DocumentQuestion = {
      id: Date.now().toString(),
      text: 'New question',
      response: '',
      isExpanded: false,
    };
    setQuestions([...questions, newQuestion]);
  };

  const allExpanded = questions.length > 0 && questions.every((q) => q.isExpanded);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-gray-100 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-gray-100 text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>

            <button
              onClick={saveDocument}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Document'}
            </button>
          </div>

          <div className="mb-8">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold mb-3 bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-gray-900"
              placeholder="Document Title"
            />
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 p-0 text-gray-600"
              placeholder="Add a description..."
            />
          </div>

          {questions.length > 0 && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={toggleExpandAll}
                className="flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors bg-surface border-gray-200 hover:bg-gray-50 text-gray-700"
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
            </div>
          )}

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
              <div className="h-2 rounded-b-lg -mt-1 bg-gradient-to-b from-gray-200/50 to-transparent"></div>
            )}
          </div>

          <button
            onClick={addQuestion}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors bg-surface border-gray-200 hover:bg-gray-50 text-gray-700"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </div>
    </DndProvider>
  );
}
