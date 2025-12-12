// Custom BlockNote Blocks
// This module exports custom block definitions and a configured schema

import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import {
  DefaultReactSuggestionItem,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { QuestionBlock } from "./QuestionBlock";
import { AnswerBlock } from "./AnswerBlock";
import { NoteBlock } from "./NoteBlock";

// Export individual blocks
export { QuestionBlock } from "./QuestionBlock";
export { AnswerBlock } from "./AnswerBlock";
export { NoteBlock } from "./NoteBlock";

// Create the custom schema with our blocks
// The custom block specs are factory functions that need to be invoked
export const customSchema = BlockNoteSchema.create({
  blockSpecs: {
    // Include all default blocks
    ...defaultBlockSpecs,
    // Add our custom blocks (invoke the factory functions)
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

// Get custom slash menu items including our blocks
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getCustomSlashMenuItems = (editor: any): DefaultReactSuggestionItem[] => [
  ...getDefaultReactSlashMenuItems(editor),
  insertQuestion(editor),
  insertAnswer(editor),
  insertNote(editor),
];
