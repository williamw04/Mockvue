
import { createReactBlockSpec } from "@blocknote/core";
import { BlockContent } from "@blocknote/react";

export const Alert = createReactBlockSpec(
  {
    type: "alert",
    propSchema: {
      level: {
        default: "info",
        values: ["info", "warning", "error"],
      },
    },
    content: "inline",
  },
  {
    render: (props) => {
      const level = props.block.props.level;
      const levelClasses = {
        info: "bg-blue-100 text-blue-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
      };
      return (
        <div className={`p-4 rounded ${levelClasses[level]}`}>
          <BlockContent block={props.block} />
        </div>
      );
    },
  }
);
