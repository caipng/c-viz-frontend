import React from "react";
import { HeapEntry } from "c-viz/lib/interpreter/heap";
import HeapAllocation from "./components/HeapAllocation";

interface HeapProps {
  heap: Record<number, HeapEntry> | undefined;
}

const Heap: React.FC<HeapProps> = ({ heap }) => {
  return (
    <div className="card">
      <div className="card-header text-center py-0">
        <small>HEAP</small>
      </div>
      <div
        id="heap-list"
        className="list-group hide-scroll"
        style={{ overflowY: "auto" }}
      >
        {heap === undefined ||
          Object.keys(heap)
            .map(Number)
            .sort()
            .map((d) => (
              <span className="animate__animated animate__headShake" key={d}>
                <HeapAllocation size={heap[d].size} address={d} />
              </span>
            ))}
      </div>
    </div>
  );
};

export default Heap;
