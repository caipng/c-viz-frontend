import React, { Key } from "react";
import { SymbolTable } from "c-viz/lib/interpreter/types";
import { has } from "lodash";

interface StackProps {
  stack: SymbolTable[] | undefined;
}

const Stack: React.FC<StackProps> = ({ stack }) => {
  return (
    <div className="card">
      <div className="card-header text-center py-0">
        <small>STACK</small>
      </div>
      <div className="list-group hide-scroll" style={{ overflowY: "auto" }}>
        {stack === undefined ||
          stack.map((v: SymbolTable, k: Key, arr) => {
            const isLast = k === arr.length - 1;
            return (
              <span
                className={
                  "list-group-item list-group-item-action p-0 list-group-item-light" +
                  (isLast ? " border-2 border-primary-subtle last-item" : "")
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
                          <tr key={i[0]}>
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
    </div>
  );
};

export default Stack;
