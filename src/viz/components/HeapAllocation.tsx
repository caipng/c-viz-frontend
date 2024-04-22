import React, { ReactNode, useContext, useId } from "react";
import { decimalAddressToHex } from "../../utils/utils";
import { drawUninitBytes } from "../../utils/object";
import { RuntimeViewContext } from "../../App";
import { RuntimeView } from "c-viz/lib/interpreter/runtime";
import { NO_EFFECTIVE_TYPE } from "c-viz/lib/interpreter/effectiveTypeTable";
import RuntimeObject from "./RuntimeObject";
import { RuntimeObject as RuntimeObjectType } from "c-viz/lib/interpreter/object";

interface HeapAllocationProps {
  size: number;
  address: number;
}

const drawHeapContents = (
  address: number,
  size: number,
  rt: RuntimeView,
): ReactNode => {
  let curr = address;
  const t = rt.effectiveTypeTable;
  let cnt = 0;
  const res: ReactNode[] = [];
  const f = (cnt: number) => (
    <span className="font-monospace text-secondary" style={{ fontSize: 10 }}>
      0x{decimalAddressToHex(curr - cnt)}:{drawUninitBytes(curr - cnt, cnt)}
    </span>
  );
  while (curr < address + size) {
    const tc = t[curr];
    if (tc === NO_EFFECTIVE_TYPE) {
      cnt++;
      curr++;
    } else {
      if (cnt) {
        res.push(f(cnt));
        cnt = 0;
      }
      const r = new RuntimeObjectType(tc, curr, "", rt.memory);
      r.initialized = true;
      res.push(<RuntimeObject data={r} />);
      curr += tc.size;
    }
  }
  if (cnt) res.push(f(cnt));
  return (
    <>
      {res.map((i, idx) => (
        <div className="my-1" key={idx}>
          {i}
        </div>
      ))}
    </>
  );
};

const HeapAllocation: React.FC<HeapAllocationProps> = ({ size, address }) => {
  const id = useId();
  const rt = useContext(RuntimeViewContext);
  if (!rt) return <></>;
  return (
    <a href={"#" + id} className="list-group-item list-group-item-action p-0">
      <div className="px-2 py-1">
        <div
          className="font-monospace text-body-tertiary"
          style={{ fontSize: "12px", fontWeight: "bold" }}
        >
          <span>Block 0x{decimalAddressToHex(address)}</span>
          <span className="vr mx-2"></span>
          <span>{size} bytes</span>
          {/* <span className="vr mx-2"></span>
          <span>uninitialized, no effective type</span> */}
        </div>
        <div className="w-100 mt-1 px-1 border border-dark-subtle">
          {drawHeapContents(address, size, rt)}
        </div>
      </div>
    </a>
  );
};

export default HeapAllocation;
