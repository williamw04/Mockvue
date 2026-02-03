// Custom BlockNote Blocks
// This module exports custom block definitions and a minimal schema

import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { DefaultReactSuggestionItem } from "@blocknote/react";
import { QuestionBlock } from "./QuestionBlock";
import { AnswerBlock } from "./AnswerBlock";
import { NoteBlock } from "./NoteBlock";

// Export individual blocks
export { QuestionBlock } from "./QuestionBlock";
export { AnswerBlock } from "./AnswerBlock";
export { NoteBlock } from "./NoteBlock";

// Create a MINIMAL custom schema with only essential blocks + Q&A blocks
// This removes all the extra blocks from the slash menu
export const customSchema = BlockNoteSchema.create({
  blockSpecs: {
    // Essential default blocks only
    paragraph: defaultBlockSpecs.paragraph,
    heading: defaultBlockSpecs.heading,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
    
    // Our custom Q&A blocks
    question: QuestionBlock(),
    answer: AnswerBlock(),
    note: NoteBlock(),
  },
});

// Helper function to insert a Question block
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const insertQuestion = (editor: any) => ({
  title: "Question",
  subtext: "Add a question block to group Q&A content",
  onItemClick: () => {
    const currentBlock = editor.getTextCursorPosition().block;
    editor.insertBlocks(
      [
        {
          type: "question",
          props: {
            status: "unanswered",
            priority: "normal",
          },
        },
      ],
      currentBlock,
      "after"
    );
  },
  aliases: ["question", "q", "ask"],
  group: "Q&A Blocks",
  icon: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
});

// Helper function to insert an Answer block
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const insertAnswer = (editor: any) => ({
  title: "Answer",
  subtext: "Add an answer to a question",
  onItemClick: () => {
    const currentBlock = editor.getTextCursorPosition().block;
    editor.insertBlocks(
      [
        {
          type: "answer",
          props: {
            confidence: "certain",
            isVerified: false,
          },
        },
      ],
      currentBlock,
      "after"
    );
  },
  aliases: ["answer", "a", "reply", "response"],
  group: "Q&A Blocks",
  icon: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
});

// Helper function to insert a Note block
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const insertNote = (editor: any) => ({
  title: "Note",
  subtext: "Add a note or annotation",
  onItemClick: () => {
    const currentBlock = editor.getTextCursorPosition().block;
    editor.insertBlocks(
      [
        {
          type: "note",
          props: {
            noteType: "general",
            isCollapsed: false,
          },
        },
      ],
      currentBlock,
      "after"
    );
  },
  aliases: ["note", "n", "annotation", "comment"],
  group: "Q&A Blocks",
  icon: (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  ),
});

// Custom slash menu items - ONLY includes blocks in our minimal schema
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCustomSlashMenuItems = (editor: any): DefaultReactSuggestionItem[] => [
  // Basic blocks
  {
    title: "Paragraph",
    subtext: "Plain text block",
    onItemClick: () => {
      const currentBlock = editor.getTextCursorPosition().block;
      editor.insertBlocks([{ type: "paragraph" }], currentBlock, "after");
    },
    aliases: ["p", "paragraph", "text"],
    group: "Basic",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
  },
  {
    title: "Heading 1",
    subtext: "Large section heading",
    onItemClick: () => {
      const currentBlock = editor.getTextCursorPosition().block;
      editor.insertBlocks([{ type: "heading", props: { level: 1 } }], currentBlock, "after");
    },
    aliases: ["h1", "heading1", "title"],
    group: "Basic",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <text x="4" y="18" fontSize="16" fontWeight="bold">H1</text>
      </svg>
    ),
  },
  {
    title: "Heading 2",
    subtext: "Medium section heading",
    onItemClick: () => {
      const currentBlock = editor.getTextCursorPosition().block;
      editor.insertBlocks([{ type: "heading", props: { level: 2 } }], currentBlock, "after");
    },
    aliases: ["h2", "heading2", "subtitle"],
    group: "Basic",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <text x="4" y="18" fontSize="14" fontWeight="bold">H2</text>
      </svg>
    ),
  },
  {
    title: "Heading 3",
    subtext: "Small section heading",
    onItemClick: () => {
      const currentBlock = editor.getTextCursorPosition().block;
      editor.insertBlocks([{ type: "heading", props: { level: 3 } }], currentBlock, "after");
    },
    aliases: ["h3", "heading3"],
    group: "Basic",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <text x="4" y="18" fontSize="12" fontWeight="bold">H3</text>
      </svg>
    ),
  },
  {
    title: "Bullet List",
    subtext: "Unordered list item",
    onItemClick: () => {
      const currentBlock = editor.getTextCursorPosition().block;
      editor.insertBlocks([{ type: "bulletListItem" }], currentBlock, "after");
    },
    aliases: ["ul", "bullet", "list", "-"],
    group: "Basic",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        <circle cx="2" cy="6" r="1" fill="currentColor" />
        <circle cx="2" cy="12" r="1" fill="currentColor" />
        <circle cx="2" cy="18" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Numbered List",
    subtext: "Ordered list item",
    onItemClick: () => {
      const currentBlock = editor.getTextCursorPosition().block;
      editor.insertBlocks([{ type: "numberedListItem" }], currentBlock, "after");
    },
    aliases: ["ol", "numbered", "1."],
    group: "Basic",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13M7 18h13" />
        <text x="1" y="8" fontSize="8" fill="currentColor">1</text>
        <text x="1" y="14" fontSize="8" fill="currentColor">2</text>
        <text x="1" y="20" fontSize="8" fill="currentColor">3</text>
      </svg>
    ),
  },
  // Q&A blocks
  insertQuestion(editor),
  insertAnswer(editor),
  insertNote(editor),
];

