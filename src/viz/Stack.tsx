import { StackFrame } from "c-viz/lib/interpreter/stack";
import React, { useContext } from "react";
import RuntimeObject from "./components/RuntimeObject";
import { RuntimeObject as RuntimeObjectType } from "c-viz/lib/interpreter/object";
import { RuntimeViewContext } from "../App";
import { decimalAddressToHex } from "../utils/utils";
import { getTypeName } from "c-viz/lib/typing/types";

interface StackProps {
  stack: StackFrame[] | undefined;
  colors: string[];
}

const Stack: React.FC<StackProps> = ({ stack, colors }) => {
  const rt = useContext(RuntimeViewContext);
  return (
    <div className="card">
      <div className="card-header text-center py-0">
        <small>STACK</small>
      </div>
      <div
        className="list-group hide-scroll"
        id="stack-list"
        style={{ overflowY: "auto" }}
      >
        {stack === undefined ||
          rt === null ||
          stack.map((v: StackFrame, k: number, arr) => {
            const isLast = k === arr.length - 1;
            const rbp = rt.rbpArr[k + 1];
            const seen: Record<string, boolean> = {};
            return (
              <div
                key={k}
                className={
                  "hstack border-top" +
                  (isLast
                    ? " border border-2 border-primary-subtle last-item"
                    : "")
                }
              >
                <small
                  className="mx-0 py-1"
                  style={{
                    writingMode: "vertical-rl",
                    textOrientation: "mixed",
                  }}
                >
                  {rt.functions[rt.functionCalls[k]][0]}
                </small>
                <div style={{ flex: 1 }}>
                  <div
                    className="font-monospace m-0 text-body-secondary px-1 border-start"
                    style={{ fontSize: "12px" }}
                  >
                    0x{decimalAddressToHex(rbp)}
                    {isLast ? <> &larr; rbp</> : ""}
                  </div>
                  {Object.entries(v).map((i) => {
                    let [identifier, j] = i;
                    const { typeInfo, address } = j;
                    let o: RuntimeObjectType | null = null;
                    try {
                      o = new RuntimeObjectType(
                        typeInfo,
                        rbp + address,
                        identifier,
                        rt.memory,
                      );
                      ((i) => i)(o.bytes); // invoke getter
                      o.initialized = rt.initTable.check(
                        rbp + address,
                        typeInfo,
                      );
                    } catch (e) {
                      o = null;
                    }

                    const blocks = identifier.split("::");
                    identifier = blocks.pop() as string;
                    if (o) o.setIdentifier(identifier);
                    const s = blocks.join();
                    let first = false;
                    if (!(s in seen)) {
                      seen[s] = true;
                      first = true;
                    }

                    return (
                      <div className="d-flex">
                        {blocks.map((i, w, xs) => {
                          const last = w === xs.length - 1;
                          const id =
                            (Math.pow(20, w) +
                              parseInt(i.replace("block", ""))) %
                            colors.length;
                          return (
                            <div
                              style={{
                                fontSize: 10,
                                display: "flex",
                                alignItems: "center",
                                backgroundColor: colors[id],
                                color: first && last ? "inherit" : colors[id],
                              }}
                            >
                              <span>&rarr;</span>
                            </div>
                          );
                        })}
                        <div className="flex-grow-1">
                          {o ? (
                            <RuntimeObject key={identifier} data={o} />
                          ) : (
                            <div className="list-group-item list-group-item-secondary p-0">
                              <div className="px-2 py-1">
                                <div
                                  className="font-monospace text-body-tertiary"
                                  style={{ fontSize: 12 }}
                                >
                                  <span>
                                    0x{decimalAddressToHex(rbp + address)}
                                  </span>
                                </div>
                                <hr className="m-0 mt-1" />
                                <div className="d-flex w-100 justify-content-between">
                                  <div className="hstack">
                                    <h5
                                      className="mb-0"
                                      style={{ display: "inline-block" }}
                                    >
                                      {identifier}
                                    </h5>
                                    <small className="mx-1">
                                      <code>{getTypeName(typeInfo)}</code>
                                    </small>
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      justifyContent: "center",
                                      alignItems: "flex-end",
                                    }}
                                  >
                                    <code className="mb-0 text-truncate">
                                      out of scope
                                    </code>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default Stack;
