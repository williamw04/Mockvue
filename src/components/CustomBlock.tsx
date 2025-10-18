import { createReactBlockSpec } from "@blocknote/react";
import { Menu } from "@mantine/core";
import { MdCancel } from "react-icons/md";

// The Question block
export const Question = createReactBlockSpec(
  {
    type: "question",
    propSchema: {},
    content: "dynamic",
  },
  {
    render: (props) => {
      return (
        <div className={"question-block"}>
          <div className={"[&>div]:inline-block"}>
            {props.contentRef}
          </div>
          <Menu withinPortal={false} zIndex={999999}>
            <Menu.Target>
              <div className="remove-question-button" contentEditable={false}>
                <MdCancel size={32} />
              </div>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                onClick={() =>
                  props.editor.removeBlocks([props.block])
                }>
                Remove Question
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </div>
      );
    },
  }
);

// The Answer block
export const Answer = createReactBlockSpec(
  {
    type: "answer",
    propSchema: {},
    content: "inline",
  },
  {
    render: (props) => {
      return (
        <div className={"answer-block"}>
          <span>Answer: </span>
          <div className={"[&>div]:inline-block"} ref={props.contentRef} />
        </div>
      );
    },
  }
);

// The Context block
export const Context = createReactBlockSpec(
  {
    type: "context",
    propSchema: {},
    content: "inline",
  },
  {
    render: (props) => {
      return (
        <div className={"context-block"}>
          <span>Context: </span>
          <div className={"[&>div]:inline-block"} ref={props.contentRef} />
        </div>
      );
    },
  }
);

// The Notes block
export const Notes = createReactBlockSpec(
  {
    type: "notes",
    propSchema: {},
    content: "inline",
  },
  {
    render: (props) => {
      return (
        <div className={"notes-block"}>
          <span>Notes: </span>
          <div className={"[&>div]:inline-block"} ref={props.contentRef} />
        </div>
      );
    },
  }
);
