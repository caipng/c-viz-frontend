import React, { Key } from "react";
import { SymbolTable } from "c-viz/lib/interpreter";
import { has } from "lodash";

interface StackProps {
  stack: SymbolTable[] | undefined;
}

const Stack: React.FC<StackProps> = ({ stack }) => {
  return (
    <div
      className="list-group border hide-scroll"
      style={{ overflowY: "auto" }}
    >
      {stack === undefined ||
        stack.map((v: SymbolTable, k: Key, arr) => {
          const isLast = k === arr.length - 1;
          return (
            <span
              className={
                "list-group-item list-group-item-action p-0 list-group-item-light" +
                (isLast ? " border-2 border-primary-subtle" : "")
              }
              key={k}
            >
              <div className="p-2 w-100">
                <div className="d-flex w-100 justify-content-between">
                  <table className="table">
                    <thead>
                      <tr>
                        <th scope="col">Identifier</th>
                        <th scope="col">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(v).map((i) => (
                        <tr>
                          <td>{i[0]}</td>
                          <td>
                            {has(i[1], "params")
                              ? "[function]"
                              : JSON.stringify(i[1].value)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </span>
          );
        })}
    </div>
  );
};

export default Stack;
