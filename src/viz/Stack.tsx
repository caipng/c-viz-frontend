import { StackFrame } from "c-viz/lib/interpreter/stack";
import React, { useContext } from "react";
import RuntimeObject from "./components/RuntimeObject";
import { RuntimeObject as RuntimeObjectType } from "c-viz/lib/interpreter/object";
import { RuntimeViewContext } from "../App";
import { decimalAddressToHex } from "../utils/utils";

interface StackProps {
  stack: StackFrame[] | undefined;
}

const Stack: React.FC<StackProps> = ({ stack }) => {
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
                    const [identifier, j] = i;
                    const { typeInfo, address } = j;
                    const o = new RuntimeObjectType(
                      typeInfo,
                      rbp + address,
                      identifier,
                      rt.memory,
                    );
                    return <RuntimeObject key={identifier} data={o} />;
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
