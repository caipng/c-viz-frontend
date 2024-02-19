import React, { Key, useEffect, useRef } from "react";
import {
  Agenda as AgendaType,
  AgendaItem,
  isASTNode,
  isInstruction,
} from "c-viz/lib/interpreter";
import ASTNode from "./ASTNode";
import { EditorView } from "@uiw/react-codemirror";
import Instruction from "./Instruction";
import { isEmpty } from "lodash";

interface AgendaProps {
  agenda: AgendaType | undefined;
  view: EditorView | undefined;
}

const Agenda: React.FC<AgendaProps> = ({ agenda, view }) => {
  const lastEl = useRef<HTMLElement>(null);
  useEffect(() => {
    lastEl?.current?.scrollIntoView({
      block: "end",
      inline: "nearest",
    });
  }, []);
  return (
    <div
      className="list-group border hide-scroll"
      style={{ overflowY: "auto" }}
    >
      {agenda === undefined ||
        agenda.getArr().map((i: AgendaItem, k: Key, arr: AgendaItem[]) => {
          const isLast = k === arr.length - 1;
          if (isASTNode(i))
            return (
              <span ref={isLast ? lastEl : null} key={k}>
                <ASTNode node={i} view={view} active={isLast} key={k} />
              </span>
            );
          if (isInstruction(i)) {
            const { type, ...others } = i;
            return (
              <span
                className={
                  "list-group-item list-group-item-action p-0 list-group-item-light" +
                  (isLast ? " border-2 border-primary-subtle" : "")
                }
                key={k}
                ref={isLast ? lastEl : null}
              >
                <Instruction
                  type={type}
                  args={
                    isEmpty(others)
                      ? ""
                      : Object.values(others)
                          .map((i) => JSON.stringify(i))
                          .join(", ")
                  }
                />
              </span>
            );
          }
          return <></>;
        })}
    </div>
  );
};

export default Agenda;
