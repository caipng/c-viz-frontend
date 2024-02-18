import React, { Key } from "react";
import { Stash as StashType } from "c-viz/lib/interpreter";

interface StashProps {
  stash: StashType | undefined;
}

const Stash: React.FC<StashProps> = ({ stash }) => {
  return (
    <div className="list-group border" style={{ overflowY: "auto" }}>
      {stash === undefined ||
        stash.getArr().map((v: any, k: Key, arr) => {
          const isLast = k === arr.length - 1;
          return (
            <span
              className={
                "list-group-item list-group-item-action p-0 list-group-item-light" +
                (isLast ? " border-2 border-primary-subtle" : "")
              }
              key={k}
            >
              <div className="p-2">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-0">{JSON.stringify(v)}</h6>
                </div>
              </div>
            </span>
          );
        })}
    </div>
  );
};

export default Stash;
