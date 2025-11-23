import { Card, CardContent, CardHeader } from "./ui/card";
import { Badge } from "./ui/badge";
import { MoreHorizontal, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTheme } from '../services/ThemeContext';

interface DocumentCardProps {
  id: string;
  title: string;
  preview: string;
  lastModified: string;
  tags: string[];
  wordCount: number;
  onClick?: () => void;
  onDelete?: (id: string) => void; // Kept for compatibility if needed
}

export default function DocumentCard({ 
  id,
  title, 
  preview, 
  lastModified, 
  tags, 
  wordCount,
  onClick,
  onDelete
}: DocumentCardProps) {
  const { theme } = useTheme();

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete) {
      if (window.confirm(`Delete "${title}"?`)) {
        onDelete(id);
      }
    }
  };

  return (
    <Card 
      className={`group hover:shadow-md transition-shadow cursor-pointer ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white'}`} 
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3 pt-4 px-4">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <FileText className={`w-5 h-5 flex-shrink-0 ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`} />
          <h3 className={`truncate font-semibold ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>{title}</h3>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 h-8 w-8 rounded-md inline-flex items-center justify-center ${theme === 'dark' ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-accent hover:text-accent-foreground'}`}>
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : ''}>
            <DropdownMenuItem className={theme === 'dark' ? 'focus:bg-gray-700 focus:text-gray-200' : ''}>Edit</DropdownMenuItem>
            <DropdownMenuItem className={theme === 'dark' ? 'focus:bg-gray-700 focus:text-gray-200' : ''}>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className={theme === 'dark' ? 'focus:bg-gray-700 focus:text-gray-200' : ''}>Share</DropdownMenuItem>
            <DropdownMenuItem 
              className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
              onClick={handleDelete}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3 px-4 pb-4">
        <p className={`line-clamp-3 leading-relaxed text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-muted-foreground'}`}>
          {preview || "No preview available"}
        </p>
        <div className="flex flex-wrap gap-1">
          {tags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className={`text-xs ${theme === 'dark' ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : ''}`}
            >
              {tag}
            </Badge>
          ))}
        </div>
        <div className={`flex items-center justify-between pt-2 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'}`}>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'}`}>
            {lastModified}
          </span>
          <span className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-muted-foreground'}`}>
            {wordCount} words
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
