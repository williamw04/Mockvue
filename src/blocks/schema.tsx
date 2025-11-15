/**
 * Custom BlockNote schema with Question, Response, Context, and Notes blocks
 */

import { 
  BlockNoteSchema, 
  defaultBlockSpecs,
} from "@blocknote/core";
import { createReactBlockSpec } from "@blocknote/react";

// Custom block type for Question
export const QuestionBlock = createReactBlockSpec(
  {
    type: "question" as const,
    propSchema: {
      questionText: {
        default: "Type your question here...",
      },
      aiFeatureEnabled: {
        default: false,
      },
    },
    content: "none",
  },
  {
    render: (props) => {
      const { block, editor } = props;
      
      return (
        <div className="bn-question-block" style={{
          border: "2px solid #3b82f6",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "16px",
          backgroundColor: "#eff6ff",
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            marginBottom: "12px",
          }}>
            <span style={{
              fontSize: "20px",
            }}>❓</span>
            <input
              type="text"
              value={block.props.questionText}
              onChange={(e) => {
                editor.updateBlock(block.id, {
                  props: { ...block.props, questionText: e.target.value },
                });
              }}
              style={{
                flex: 1,
                border: "none",
                outline: "none",
                fontSize: "16px",
                fontWeight: "600",
                backgroundColor: "transparent",
                color: "#1e40af",
              }}
              placeholder="Type your question here..."
            />
          </div>
          <div style={{
            fontSize: "12px",
            color: "#6b7280",
            fontStyle: "italic",
          }}>
            Add Response, Context, or Notes blocks below this question
          </div>
        </div>
      );
    },
  }
);

// Custom block type for Response
export const ResponseBlock = createReactBlockSpec(
  {
    type: "response" as const,
    propSchema: {
      responseText: {
        default: "",
      },
      selected: {
        default: false,
      },
      aiGenerated: {
        default: false,
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const { block, editor, contentRef } = props;
      
      return (
        <div 
          className="bn-response-block" 
          style={{
            border: `2px solid ${block.props.selected ? "#10b981" : "#e5e7eb"}`,
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "8px",
            marginLeft: "24px",
            backgroundColor: block.props.selected ? "#f0fdf4" : "#ffffff",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onClick={() => {
            editor.updateBlock(block.id, {
              props: { ...block.props, selected: !block.props.selected },
            });
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
          }}>
            <span style={{
              fontSize: "16px",
              marginTop: "2px",
            }}>
              {block.props.selected ? "✅" : "💬"}
            </span>
            <div style={{ flex: 1 }}>
              <div 
                ref={contentRef}
                style={{
                  color: "#374151",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              />
              {block.props.aiGenerated && (
                <div style={{
                  fontSize: "10px",
                  color: "#8b5cf6",
                  marginTop: "4px",
                  fontWeight: "500",
                }}>
                  ✨ AI Generated
                </div>
              )}
            </div>
          </div>
        </div>
      );
    },
  }
);

// Custom block type for Context
export const ContextBlock = createReactBlockSpec(
  {
    type: "context" as const,
    propSchema: {},
    content: "inline",
  },
  {
    render: (props) => {
      const { contentRef } = props;
      
      return (
        <div 
          className="bn-context-block" 
          style={{
            border: "2px solid #f59e0b",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "8px",
            marginLeft: "24px",
            backgroundColor: "#fffbeb",
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
          }}>
            <span style={{
              fontSize: "16px",
              marginTop: "2px",
            }}>📋</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#92400e",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Context
              </div>
              <div 
                ref={contentRef}
                style={{
                  color: "#78350f",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              />
            </div>
          </div>
        </div>
      );
    },
  }
);

// Custom block type for Notes
export const NotesBlock = createReactBlockSpec(
  {
    type: "notes" as const,
    propSchema: {},
    content: "inline",
  },
  {
    render: (props) => {
      const { contentRef } = props;
      
      return (
        <div 
          className="bn-notes-block" 
          style={{
            border: "2px solid #8b5cf6",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "8px",
            marginLeft: "24px",
            backgroundColor: "#faf5ff",
          }}
        >
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
          }}>
            <span style={{
              fontSize: "16px",
              marginTop: "2px",
            }}>📝</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: "11px",
                fontWeight: "600",
                color: "#6b21a8",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}>
                Notes
              </div>
              <div 
                ref={contentRef}
                style={{
                  color: "#581c87",
                  fontSize: "14px",
                  lineHeight: "1.5",
                }}
              />
            </div>
          </div>
        </div>
      );
    },
  }
);

// Create custom schema with our blocks
export const customSchema = BlockNoteSchema.create({
  blockSpecs: {
    // Include default blocks
    ...defaultBlockSpecs,
    // Add custom blocks - call the functions to get the specs
    question: QuestionBlock(),
    response: ResponseBlock(),
    context: ContextBlock(),
    notes: NotesBlock(),
  },
});

// Export the type for use in components
export type CustomBlockSchema = typeof customSchema.blockSchema;
export type CustomInlineContentSchema = typeof customSchema.inlineContentSchema;
export type CustomStyleSchema = typeof customSchema.styleSchema;

