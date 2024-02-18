import React, { Key, useEffect, useRef } from "react";
import {
  Agenda as AgendaType,
  AgendaItem,
  isASTNode,
  isInstruction,
} from "c-viz/lib/interpreter";
import ASTNode from "./ASTNode";
import { EditorView } from "@uiw/react-codemirror";
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
    <div className="list-group border" style={{ overflowY: "auto" }}>
      {agenda === undefined ||
        agenda.getArr().map((i: AgendaItem, k: Key, arr: AgendaItem[]) => {
          const isLast = k === arr.length - 1;
          if (isASTNode(i))
            return (
              <span ref={isLast ? lastEl : null}>
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
                <div className="border-start border-3 border-dark-subtle p-2">
                  <div className="d-flex w-100 justify-content-between">
                    <h6
                      className="mb-0 text-uppercase"
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      {type}
                    </h6>
                    {isEmpty(others) || (
                      <small className="fw-semibold bg-secondary-subtle border border-dark-subtle rounded-2 px-2 py-0">
                        {Object.values(others).join(", ")}
                      </small>
                    )}
                  </div>
                </div>
              </span>
            );
          }
          return <></>;
        })}
    </div>
  );
};

export default Agenda;
