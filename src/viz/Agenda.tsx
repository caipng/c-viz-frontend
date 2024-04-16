import React from "react";
import ASTNode from "./components/ASTNode";
import { EditorView } from "@uiw/react-codemirror";
import Instruction from "./components/Instruction";
import {
  AgendaItem,
  isASTNode,
  isInstruction,
} from "c-viz/lib/interpreter/agenda";
import {
  isMarkInstruction,
  isReturnInstruction,
} from "c-viz/lib/interpreter/instructions";

interface AgendaProps {
  agenda: AgendaItem[] | undefined;
  lvalueFlags: boolean[] | undefined;
  view: EditorView | undefined;
  colors: string[];
}

const Agenda: React.FC<AgendaProps> = ({
  agenda,
  lvalueFlags,
  view,
  colors,
}) => {
  let markIdx = 0;
  return (
    <div className="card" id="agenda-card">
      <div className="card-header text-center py-0">
        <small>CONTROL</small>
      </div>
      <div
        id="agenda-list"
        className="list-group hide-scroll"
        style={{ overflowY: "auto", position: "relative" }}
      >
        {agenda === undefined ||
          agenda.map((i: AgendaItem, k: number, arr: AgendaItem[]) => {
            const isLast = k === arr.length - 1;
            const isLvalue = lvalueFlags !== undefined && lvalueFlags[k];
            if (isASTNode(i))
              return (
                <div
                  key={k}
                  className={
                    isLast
                      ? "last-item border border-2 border-primary-subtle animate__animated animate__pulse animate__faster"
                      : ""
                  }
                >
                  <div className={"border-start border-2 border-dark-subtle "}>
                    <ASTNode node={i} view={view} key={k} asLvalue={isLvalue} />
                  </div>
                </div>
              );
            if (isInstruction(i)) {
              if (isMarkInstruction(i)) markIdx++;
              return (
                <span
                  key={k}
                  className={
                    "list-group-item list-group-item-action p-0 list-group-item-light" +
                    (isLast
                      ? " border-2 border-primary-subtle last-item "
                      : "") +
                    (isMarkInstruction(i) ? " mark-inst mark-" + markIdx : "") +
                    (isReturnInstruction(i) ? " return-inst" : "") +
                    (isLvalue ? " bg-warning bg-opacity-25" : "")
                  }
                  data-mark={isReturnInstruction(i) ? markIdx : null}
                  style={
                    isMarkInstruction(i) || isReturnInstruction(i)
                      ? { backgroundColor: colors[markIdx % colors.length] }
                      : {}
                  }
                >
                  <Instruction inst={i} />
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
