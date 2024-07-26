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
import { isBreakMarkInstruction } from "c-viz/lib/interpreter/instructions";
import { isContinueMarkInstruction } from "c-viz/lib/interpreter/instructions";
import {
  isJumpStatementBreak,
  isJumpStatementContinue,
} from "c-viz/lib/ast/types";

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
  let rmarkIdx = 0,
    bmarkIdx = 0,
    cmarkIdx = 0;
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
        {agenda === undefined ? (
          <div className="d-flex align-items-center justify-content-center p-3 text-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-bezier2"
              viewBox="0 0 16 16"
            >
              <path
                fillRule="evenodd"
                d="M1 2.5A1.5 1.5 0 0 1 2.5 1h1A1.5 1.5 0 0 1 5 2.5h4.134a1 1 0 1 1 0 1h-2.01q.269.27.484.605C8.246 5.097 8.5 6.459 8.5 8c0 1.993.257 3.092.713 3.7.356.476.895.721 1.787.784A1.5 1.5 0 0 1 12.5 11h1a1.5 1.5 0 0 1 1.5 1.5v1a1.5 1.5 0 0 1-1.5 1.5h-1a1.5 1.5 0 0 1-1.5-1.5H6.866a1 1 0 1 1 0-1h1.711a3 3 0 0 1-.165-.2C7.743 11.407 7.5 10.007 7.5 8c0-1.46-.246-2.597-.733-3.355-.39-.605-.952-1-1.767-1.112A1.5 1.5 0 0 1 3.5 5h-1A1.5 1.5 0 0 1 1 3.5zM2.5 2a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm10 10a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z"
              />
            </svg>
          </div>
        ) : (
          agenda
            .map((i: AgendaItem, k: number, arr: AgendaItem[]) => {
              const isLast = k === arr.length - 1;
              const isLvalue = lvalueFlags !== undefined && lvalueFlags[k];
              if (isASTNode(i))
                return (
                  <div
                    key={k}
                    className={
                      (isLast
                        ? "last-item border border-2 border-primary-subtle animate__animated animate__pulse animate__faster"
                        : "") +
                      (isJumpStatementBreak(i) ? " break-inst" : "") +
                      (isJumpStatementContinue(i) ? " continue-inst" : "")
                    }
                    data-mark={
                      isJumpStatementBreak(i)
                        ? bmarkIdx
                        : isJumpStatementContinue(i)
                          ? cmarkIdx
                          : null
                    }
                    style={
                      isJumpStatementBreak(i)
                        ? {
                            backgroundColor:
                              colors[(23 * bmarkIdx) % colors.length],
                          }
                        : isJumpStatementContinue(i)
                          ? {
                              backgroundColor:
                                colors[(73 * cmarkIdx) % colors.length],
                            }
                          : {}
                    }
                  >
                    <div
                      className={"border-start border-2 border-dark-subtle "}
                    >
                      <ASTNode
                        node={i}
                        view={view}
                        key={k}
                        asLvalue={isLvalue}
                      />
                    </div>
                  </div>
                );
              if (isInstruction(i)) {
                if (isMarkInstruction(i)) rmarkIdx++;
                if (isBreakMarkInstruction(i)) bmarkIdx++;
                if (isContinueMarkInstruction(i)) cmarkIdx++;
                return (
                  <span
                    key={k}
                    className={
                      "list-group-item list-group-item-action p-0 list-group-item-light" +
                      (isLast
                        ? " border-2 border-primary-subtle last-item "
                        : "") +
                      (isMarkInstruction(i)
                        ? " mark-inst rmark-" + rmarkIdx
                        : "") +
                      (isBreakMarkInstruction(i)
                        ? " mark-inst bmark-" + bmarkIdx
                        : "") +
                      (isContinueMarkInstruction(i)
                        ? " mark-inst cmark-" + cmarkIdx
                        : "") +
                      (isReturnInstruction(i) ? " return-inst" : "") +
                      (isLvalue ? " bg-warning bg-opacity-25" : "")
                    }
                    data-mark={isReturnInstruction(i) ? rmarkIdx : null}
                    style={
                      isMarkInstruction(i) || isReturnInstruction(i)
                        ? { backgroundColor: colors[rmarkIdx % colors.length] }
                        : isBreakMarkInstruction(i)
                          ? {
                              backgroundColor:
                                colors[(23 * bmarkIdx) % colors.length],
                            }
                          : isContinueMarkInstruction(i)
                            ? {
                                backgroundColor:
                                  colors[(73 * cmarkIdx) % colors.length],
                              }
                            : {}
                    }
                  >
                    <Instruction inst={i} isLvalue={isLvalue} />
                  </span>
                );
              }
              return <></>;
            })
            .reverse()
        )}
      </div>
    </div>
  );
};

export default Agenda;
