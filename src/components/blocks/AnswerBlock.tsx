import { createReactBlockSpec } from "@blocknote/react";
import { defaultProps } from "@blocknote/core";

// AnswerBlock - A block for individual answer responses
// Can be marked with confidence level and source attribution
export const AnswerBlock = createReactBlockSpec(
  {
    type: "answer",
    propSchema: {
      ...defaultProps,
      confidence: {
        default: "certain" as const,
        values: ["uncertain", "likely", "certain"] as const,
      },
      source: {
        default: "",
      },
      author: {
        default: "",
      },
      isVerified: {
        default: false,
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const { confidence, source, author, isVerified } = props.block.props;

      const confidenceStyles = {
        uncertain: {
          bg: "bg-gray-50 dark:bg-gray-800/50",
          border: "border-gray-300 dark:border-gray-600",
          icon: "text-gray-400",
          badge: "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300",
        },
        likely: {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-300 dark:border-blue-600",
          icon: "text-blue-400",
          badge: "bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300",
        },
        certain: {
          bg: "bg-emerald-50 dark:bg-emerald-900/20",
          border: "border-emerald-300 dark:border-emerald-600",
          icon: "text-emerald-500",
          badge: "bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-300",
        },
      };

      const styles = confidenceStyles[confidence as keyof typeof confidenceStyles];

      return (
        <div
          className={`answer-block rounded-lg p-4 mb-2 ml-6 border ${styles.bg} ${styles.border} transition-all duration-200`}
          data-confidence={confidence}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {/* Answer icon */}
              <svg
                className={`w-5 h-5 ${styles.icon}`}
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
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Answer
              </span>
              {/* Verified badge */}
              {isVerified && (
                <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Confidence selector */}
              <select
                className={`text-xs px-2 py-1 rounded-full font-medium cursor-pointer ${styles.badge} border-0 focus:ring-2 focus:ring-offset-1`}
                value={confidence}
                onChange={(e) =>
                  props.editor.updateBlock(props.block, {
                    props: { confidence: e.target.value as "uncertain" | "likely" | "certain" },
                  })
                }
                contentEditable={false}
              >
                <option value="uncertain">Uncertain</option>
                <option value="likely">Likely</option>
                <option value="certain">Certain</option>
              </select>
              {/* Verify toggle */}
              <button
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  isVerified
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
                onClick={() =>
                  props.editor.updateBlock(props.block, {
                    props: { isVerified: !isVerified },
                  })
                }
                contentEditable={false}
              >
                {isVerified ? "✓ Verified" : "Mark Verified"}
              </button>
            </div>
          </div>

          {/* Answer content */}
          <div className="answer-content">
            <div
              ref={props.contentRef}
              className="text-sm text-gray-700 dark:text-gray-200 leading-relaxed"
            />
          </div>

          {/* Footer with metadata */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            {/* Author input */}
            <div className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <input
                type="text"
                placeholder="Author..."
                className="text-xs bg-transparent border-0 p-0 text-gray-500 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 w-24"
                value={author}
                onChange={(e) =>
                  props.editor.updateBlock(props.block, {
                    props: { author: e.target.value },
                  })
                }
                contentEditable={false}
              />
            </div>
            {/* Source input */}
            <div className="flex items-center gap-1">
              <svg
                className="w-3.5 h-3.5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <input
                type="text"
                placeholder="Source..."
                className="text-xs bg-transparent border-0 p-0 text-gray-500 dark:text-gray-400 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-0 flex-1 min-w-0"
                value={source}
                onChange={(e) =>
                  props.editor.updateBlock(props.block, {
                    props: { source: e.target.value },
                  })
                }
                contentEditable={false}
              />
            </div>
          </div>
        </div>
      );
    },
  }
);

export default AnswerBlock;
