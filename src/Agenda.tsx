import React, { Key } from "react";
import ASTNode from "./ASTNode";
import { EditorView } from "@uiw/react-codemirror";
import Instruction from "./Instruction";
import { has, isEmpty } from "lodash";
import {
  AgendaItem,
  isASTNode,
  isInstruction,
} from "c-viz/lib/interpreter/types";

interface AgendaProps {
  agenda: AgendaItem[] | undefined;
  view: EditorView | undefined;
}

const Agenda: React.FC<AgendaProps> = ({ agenda, view }) => {
  return (
    <div className="card">
      <div className="card-header text-center py-0">
        <small>CONTROL</small>
      </div>
      <div className="list-group hide-scroll" style={{ overflowY: "auto" }}>
        {agenda === undefined ||
          agenda.map((i: AgendaItem, k: Key, arr: AgendaItem[]) => {
            const isLast = k === arr.length - 1;
            if (isASTNode(i))
              return (
                <div
                  key={k}
                  className={
                    isLast
                      ? "last-item border border-2 border-primary-subtle"
                      : ""
                  }
                >
                  <div className={"border-start border-2 border-dark-subtle"}>
                    <ASTNode node={i} view={view} active={isLast} key={k} />
                  </div>
                </div>
              );
            if (isInstruction(i)) {
              const { type, ...others } = i;
              return (
                <span
                  key={k}
                  className={
                    "list-group-item list-group-item-action p-0 list-group-item-light" +
                    (isLast ? " border-2 border-primary-subtle last-item" : "")
                  }
                >
                  <Instruction
                    type={type}
                    args={
                      isEmpty(others)
                        ? []
                        : Object.values(others).map((i) =>
                            has(i, "src")
                              ? i.src
                              : typeof i === "string" || i instanceof String
                                ? i
                                : JSON.stringify(i),
                          )
                    }
                  />
                </span>
              );
            }
            return <></>;
          })}
      </div>
    </div>
  );
};

export default Agenda;
