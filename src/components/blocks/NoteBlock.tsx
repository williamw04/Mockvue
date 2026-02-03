import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";

// NoteBlock - A block for additional notes and annotations
// Can be used for clarifications, follow-ups, or related information
export const NoteBlock = createReactBlockSpec(
  {
    type: "note",
    propSchema: {
      ...defaultProps,
      noteType: {
        default: "general" as const,
        values: ["general", "important", "clarification", "follow-up", "reference"] as const,
      },
      isCollapsed: {
        default: false,
      },
      timestamp: {
        default: "",
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const { noteType, isCollapsed, timestamp } = props.block.props;

      const noteTypeStyles = {
        general: {
          bg: "bg-slate-50 dark:bg-slate-800/50",
          border: "border-slate-300 dark:border-slate-600",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
          ),
          iconColor: "text-slate-400",
          badge: "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300",
          label: "Note",
        },
        important: {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-300 dark:border-red-600",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          ),
          iconColor: "text-red-500",
          badge: "bg-red-100 dark:bg-red-800 text-red-600 dark:text-red-300",
          label: "Important",
        },
        clarification: {
          bg: "bg-cyan-50 dark:bg-cyan-900/20",
          border: "border-cyan-300 dark:border-cyan-600",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          iconColor: "text-cyan-500",
          badge: "bg-cyan-100 dark:bg-cyan-800 text-cyan-600 dark:text-cyan-300",
          label: "Clarification",
        },
        "follow-up": {
          bg: "bg-orange-50 dark:bg-orange-900/20",
          border: "border-orange-300 dark:border-orange-600",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          ),
          iconColor: "text-orange-500",
          badge: "bg-orange-100 dark:bg-orange-800 text-orange-600 dark:text-orange-300",
          label: "Follow-up",
        },
        reference: {
          bg: "bg-indigo-50 dark:bg-indigo-900/20",
          border: "border-indigo-300 dark:border-indigo-600",
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          ),
          iconColor: "text-indigo-500",
          badge: "bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-300",
          label: "Reference",
        },
      };

      const styles = noteTypeStyles[noteType as keyof typeof noteTypeStyles];

      const toggleCollapse = () => {
        props.editor.updateBlock(props.block, {
          props: { isCollapsed: !isCollapsed },
        });
      };

      const setTimestamp = () => {
        const now = new Date().toLocaleString();
        props.editor.updateBlock(props.block, {
          props: { timestamp: now },
        });
      };

      return (
        <div
          className={`note-block rounded-lg p-3 mb-2 ml-6 border ${styles.bg} ${styles.border} transition-all duration-200`}
          data-note-type={noteType}
          data-collapsed={isCollapsed}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {/* Collapse toggle */}
              <button
                onClick={toggleCollapse}
                className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                contentEditable={false}
              >
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    isCollapsed ? "" : "rotate-90"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              {/* Note icon */}
              <span className={styles.iconColor}>{styles.icon}</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {styles.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Timestamp display */}
              {timestamp && (
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {timestamp}
                </span>
              )}
              {/* Add timestamp button */}
              {!timestamp && (
                <button
                  onClick={setTimestamp}
                  className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  contentEditable={false}
                  title="Add timestamp"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </button>
              )}
              {/* Note type selector */}
              <select
                className={`text-xs px-2 py-0.5 rounded-full font-medium cursor-pointer ${styles.badge} border-0 focus:ring-2 focus:ring-offset-1`}
                value={noteType}
                onChange={(e) =>
                  props.editor.updateBlock(props.block, {
                    props: {
                      noteType: e.target.value as
                        | "general"
                        | "important"
                        | "clarification"
                        | "follow-up"
                        | "reference",
                    },
                  })
                }
                contentEditable={false}
              >
                <option value="general">General</option>
                <option value="important">Important</option>
                <option value="clarification">Clarification</option>
                <option value="follow-up">Follow-up</option>
                <option value="reference">Reference</option>
              </select>
            </div>
          </div>

          {/* Note content - collapsible */}
          {!isCollapsed && (
            <div className="note-content pl-6">
              <div
                ref={props.contentRef}
                className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed"
              />
            </div>
          )}

          {/* Collapsed preview */}
          {isCollapsed && (
            <div className="pl-6 text-xs text-gray-400 dark:text-gray-500 italic truncate">
              Click to expand note...
            </div>
          )}
        </div>
      );
    },
  }
);

export default NoteBlock;

