import React, { Key } from "react";
import { StashItem, Stash as StashType } from "c-viz/lib/interpreter";
import { decimalAddressToHex } from "./utils";

interface StashProps {
  stash: StashType | undefined;
}

const Stash: React.FC<StashProps> = ({ stash }) => {
  return (
    <div
      className="list-group border hide-scroll"
      style={{ overflowY: "auto" }}
    >
      {stash === undefined ||
        stash.getArr().map((v: StashItem, k: Key, arr) => {
          const isLast = k === arr.length - 1;
          return (
            <span
              className={
                "list-group-item list-group-item-action p-0 list-group-item-light" +
                (isLast ? " border-2 border-primary-subtle" : "") +
                (v.type === "ptr" ? " ptr-from" : "")
              }
              key={k}
              data-address={v.type === "ptr" ? v.value : -1}
            >
              <div className="p-2">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-0">
                    {v.type === "value"
                      ? JSON.stringify(v.value)
                      : "0x" + decimalAddressToHex(v.value)}
                  </h6>
                </div>
              </div>
            </span>
          );
        })}
    </div>
  );
};

export default Stash;
