
import { BlockNoteView, useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/react/style.css";
import { BlockNoteSchema, defaultBlockSpecs } from "@blocknote/core";
import { Question, Answer, Context, Notes } from "./CustomBlock";

const schema = BlockNoteSchema.create({
  blockSpecs: {
    ...defaultBlockSpecs,
    question: Question,
    answer: Answer,
    context: Context,
    notes: Notes,
  },
});

export function DocumentEditor() {
  const editor = useCreateBlockNote({ schema });

  return <BlockNoteView editor={editor} />;
}
