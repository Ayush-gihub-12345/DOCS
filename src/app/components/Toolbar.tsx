import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Link,
  Image,
  Heading1,
  Heading2
} from 'lucide-react';

interface ToolbarProps {
  onInsert: (text: string) => void;
  onImageUpload: () => void;
}

export default function Toolbar({ onInsert, onImageUpload }: ToolbarProps) {
  const tools = [
    { icon: Heading1, text: '# ', label: 'Heading 1' },
    { icon: Heading2, text: '## ', label: 'Heading 2' },
    { icon: Bold, text: '**text**', label: 'Bold' },
    { icon: Italic, text: '*text*', label: 'Italic' },
    { icon: List, text: '- ', label: 'Bullet list' },
    { icon: ListOrdered, text: '1. ', label: 'Numbered list' },
    { icon: Code, text: '```\ncode\n```', label: 'Code block' },
    { icon: Link, text: '[text](url)', label: 'Link' }
  ];

  return (
    <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
      {tools.map((tool, index) => (
        <button
          key={index}
          onClick={() => onInsert(tool.text)}
          className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          title={tool.label}
        >
          <tool.icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
        </button>
      ))}
      <div className="w-px h-6 bg-gray-300 dark:bg-gray-700 mx-1" />
      <button
        onClick={onImageUpload}
        className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        title="Upload image"
      >
        <Image className="w-4 h-4 text-gray-600 dark:text-gray-400" />
      </button>
    </div>
  );
}
