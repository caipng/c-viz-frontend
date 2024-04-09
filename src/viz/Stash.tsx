import React, { Key } from "react";
import { StashItem, isFunctionDesignator } from "c-viz/lib/interpreter/stash";
import TemporaryObject from "./components/TemporaryObject";
import FunctionDesignator from "./components/FunctionDesignator";

interface StashProps {
  stash: StashItem[] | undefined;
}

const Stash: React.FC<StashProps> = ({ stash }) => {
  return (
    <div className="card">
      <div className="card-header text-center py-0">
        <small>STASH</small>
      </div>
      <div
        className="list-group hide-scroll"
        style={{ overflowY: "auto" }}
        id="stash-list"
      >
        {stash === undefined ||
          stash.map((v: StashItem, k: Key, arr) => {
            const isLast = k === arr.length - 1;
            return isFunctionDesignator(v) ? (
              <FunctionDesignator key={k} data={v} isLast={isLast} />
            ) : (
              <TemporaryObject key={k} data={v} isLast={isLast} />
            );
          })}
      </div>
    </div>
  );
};

export default Stash;
