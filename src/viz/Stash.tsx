import React, { Key } from "react";
import { StashItem, isFunctionDesignator } from "c-viz/lib/interpreter/stash";
import TemporaryObject from "./components/TemporaryObject";
import FunctionDesignator from "./components/FunctionDesignator";

interface StashProps {
  stash: StashItem[] | undefined;
}

const Stash: React.FC<StashProps> = ({ stash }) => {
  return (
    <div className="card" style={{ height: 420 }}>
      <div className="card-header text-center py-0">
        <small>STASH</small>
      </div>
      <div
        className="list-group hide-scroll"
        style={{ overflowY: "auto", height: "100%" }}
        id="stash-list"
      >
        {stash === undefined ? (
          <div
            className="d-flex align-items-center justify-content-center p-3 text-secondary"
            style={{ height: "100%" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-collection"
              viewBox="0 0 16 16"
            >
              <path d="M2.5 3.5a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1zm2-2a.5.5 0 0 1 0-1h7a.5.5 0 0 1 0 1zM0 13a1.5 1.5 0 0 0 1.5 1.5h13A1.5 1.5 0 0 0 16 13V6a1.5 1.5 0 0 0-1.5-1.5h-13A1.5 1.5 0 0 0 0 6zm1.5.5A.5.5 0 0 1 1 13V6a.5.5 0 0 1 .5-.5h13a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5z" />
            </svg>
          </div>
        ) : (
          stash.map((v: StashItem, k: Key, arr) => {
            const isLast = k === arr.length - 1;
            return isFunctionDesignator(v) ? (
              <FunctionDesignator key={k} data={v} isLast={isLast} />
            ) : (
              <TemporaryObject key={k} data={v} isLast={isLast} />
            );
          })
        )}
      </div>
    </div>
  );
};

export default Stash;
