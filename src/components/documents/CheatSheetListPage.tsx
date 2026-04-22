import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TopNavBar } from '../TopNavBar';
import { useDocuments } from '../../services';
import { Document } from '../../types';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export default function CheatSheetListPage() {
  const documentService = useDocuments();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    documentService
      .getDocuments()
      .then((docs) => {
        setDocuments(docs);
        setLoading(false);
      })
      .catch(console.error);
  }, [documentService]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col font-sans">
      <TopNavBar />
      <div className="px-14 py-10 max-w-5xl">
        <div className="flex items-baseline justify-between mb-8">
          <h1 className="font-serif text-[44px] font-normal tracking-tight m-0 leading-tight">
            Cheat Sheets
          </h1>
          <button
            onClick={() => navigate('/document/new')}
            className="bg-accent-hi text-white border-none px-4.5 py-2.5 text-[13px] font-semibold cursor-pointer font-sans hover:opacity-90 transition-opacity"
          >
            Create New Sheet
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <Link
              key={doc.id}
              to={`/document/${doc.id}`}
              className="block bg-card border border-rule p-6 hover:border-ink/30 transition-colors cursor-pointer group"
            >
              <div className="font-mono text-[10px] text-accent-hi tracking-widest uppercase mb-2">
                {doc.tags?.[0] || 'Prep Sheet'}
              </div>
              <h2 className="font-serif text-2xl m-0 mb-1 group-hover:text-accent-hi transition-colors">
                {doc.title}
              </h2>
              <div className="text-[13px] text-ink-2 mb-4 line-clamp-2">
                {doc.description || 'No description provided.'}
              </div>
              <div className="font-mono text-[10px] text-ink-3 uppercase border-t border-rule pt-4 mt-auto">
                Edited {new Date(doc.lastModified).toLocaleDateString()}
              </div>
            </Link>
          ))}
          {documents.length === 0 && (
            <div className="col-span-full py-16 text-center border border-rule border-dashed bg-card text-ink-3">
              <div className="font-serif text-xl mb-2 text-ink-2">No Cheat Sheets yet</div>
              <div className="text-[14px]">
                Create your first prep sheet to start getting ready.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
