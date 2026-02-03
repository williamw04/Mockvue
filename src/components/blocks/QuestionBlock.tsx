import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";

// QuestionBlock - A block that groups a question with its answers and notes
// This creates a visual container for Q&A content
export const QuestionBlock = createReactBlockSpec(
  {
    type: "question",
    propSchema: {
      ...defaultProps,
      questionText: {
        default: "",
      },
      status: {
        default: "unanswered" as const,
        values: ["unanswered", "answered", "review"] as const,
      },
      priority: {
        default: "normal" as const,
        values: ["low", "normal", "high"] as const,
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const { status, priority } = props.block.props;

      const statusColors = {
        unanswered: {
          bg: "bg-amber-50 dark:bg-amber-900/20",
          border: "border-amber-200 dark:border-amber-700",
          badge: "bg-amber-100 dark:bg-amber-800 text-amber-700 dark:text-amber-200",
          icon: "text-amber-500",
        },
        answered: {
          bg: "bg-green-50 dark:bg-green-900/20",
          border: "border-green-200 dark:border-green-700",
          badge: "bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200",
          icon: "text-green-500",
        },
        review: {
          bg: "bg-purple-50 dark:bg-purple-900/20",
          border: "border-purple-200 dark:border-purple-700",
          badge: "bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200",
          icon: "text-purple-500",
        },
      };

      const priorityIndicators = {
        low: "opacity-50",
        normal: "",
        high: "ring-2 ring-red-300 dark:ring-red-600",
      };

      const colors = statusColors[status as keyof typeof statusColors];
      const priorityClass = priorityIndicators[priority as keyof typeof priorityIndicators];

      return (
        <div
          className={`question-block rounded-lg p-4 mb-2 border-l-4 ${colors.bg} ${colors.border} ${priorityClass} transition-all duration-200`}
          data-status={status}
          data-priority={priority}
        >
          {/* Header with question icon and status */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* Question icon */}
              <svg
                className={`w-5 h-5 ${colors.icon}`}
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
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Question
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* Priority indicator */}
              {priority === "high" && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 font-medium">
                  High Priority
                </span>
              )}
              {/* Status badge */}
              <select
                className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer ${colors.badge} border-0 focus:ring-2 focus:ring-offset-1`}
                value={status}
                onChange={(e) =>
                  props.editor.updateBlock(props.block, {
                    props: { status: e.target.value as "unanswered" | "answered" | "review" },
                  })
                }
                contentEditable={false}
              >
                <option value="unanswered">Unanswered</option>
                <option value="answered">Answered</option>
                <option value="review">Needs Review</option>
              </select>
            </div>
          </div>

          {/* Question content - editable inline content */}
          <div className="question-content">
            <div
              ref={props.contentRef}
              className="text-base font-medium text-gray-800 dark:text-gray-100 leading-relaxed"
            />
          </div>

          {/* Helper text */}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 italic">
            Add Answer or Note blocks below to respond to this question
          </p>
        </div>
      );
    },
  }
);

export default QuestionBlock;

