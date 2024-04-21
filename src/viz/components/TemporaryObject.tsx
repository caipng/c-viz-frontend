import { TemporaryObject as TemporaryObjectType } from "c-viz/lib/interpreter/object";
import {
  getTypeName,
  isFunctionTypeInfo,
  isObjectTypeInfo,
  isPointer,
} from "c-viz/lib/typing/types";
import React, { useContext, useEffect, useId, useRef } from "react";
import { displayBytes } from "../../utils/utils";
import { displayValue, visualizeObject } from "../../utils/object";
import {
  BytesDisplayContext,
  EndiannessContext,
  RuntimeViewContext,
} from "../../App";
import { SHRT_ALIGN } from "c-viz/lib/constants";
import { Tooltip } from "bootstrap";

interface TemporaryObjectProps {
  data: TemporaryObjectType;
  isLast: boolean;
}

const TemporaryObject: React.FC<TemporaryObjectProps> = ({ data, isLast }) => {
  const id = useId();
  const { typeInfo, bytes } = data;
  const { size } = typeInfo;
  const value = displayValue(bytes, typeInfo, useContext(EndiannessContext));
  const bytesDisplayOpt = useContext(BytesDisplayContext);

  const rt = useContext(RuntimeViewContext);
  let isMisaligned = false;
  let pointsToUnalloc = false;
  if (isPointer(typeInfo)) {
    const ptrValue = parseInt(value, 16);
    const t = typeInfo.referencedType;
    const alignment = isObjectTypeInfo(t)
      ? t.alignment
      : isFunctionTypeInfo(t)
        ? SHRT_ALIGN
        : 0;
    isMisaligned = ptrValue % alignment > 0;
    if (ptrValue && rt) pointsToUnalloc = !(ptrValue in rt.effectiveTypeTable);
  }

  const hasErr = isMisaligned || pointsToUnalloc;
  const tooltipRef = useRef(null);
  useEffect(() => {
    if (!tooltipRef.current || !hasErr) return;
    new Tooltip(tooltipRef.current, {
      title: isMisaligned
        ? "unaligned pointer"
        : pointsToUnalloc
          ? "pointer to unallocated memory"
          : "unknown error",
      placement: "top",
      trigger: "hover",
    });
  });

  return (
    <>
      <a
        href={"#" + id}
        className={
          "list-group-item list-group-item-action p-0" +
          (isLast ? " border-2 border-primary-subtle last-item" : "") +
          (isPointer(typeInfo) ? " ptr-from" : "") +
          (hasErr ? " list-group-item-danger" : "")
        }
        data-bs-toggle="modal"
        data-address={isPointer(typeInfo) ? value : undefined}
        ref={tooltipRef}
      >
        <div className={"px-2 py-1 "}>
          <div
            className="font-monospace text-body-tertiary hstack"
            style={{ fontSize: "12px" }}
          >
            <div>{getTypeName(typeInfo)}</div>
            <div className="vr mx-1"></div>
            <div className="text-truncate">
              {displayBytes(bytes, bytesDisplayOpt)}
            </div>
          </div>
          <hr className="m-0" />
          <div className="d-flex w-100 justify-content-between text-truncate">
            <h5 className="mb-0" style={{ display: "inline-block" }}>
              {value}
            </h5>
          </div>
        </div>
      </a>
      <div className="modal fade" id={id} tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header py-2">
              <h1 className="modal-title fs-5">Temporary Object</h1>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body py-2 px-3">
              <table className="table m-0 align-middle table-sm">
                <tbody>
                  <tr>
                    <th scope="row">Type</th>
                    <td className="w-75">{getTypeName(typeInfo)}</td>
                  </tr>
                  <tr>
                    <th scope="row">Size (Bytes)</th>
                    <td className="w-75">{size}</td>
                  </tr>
                  <tr>
                    <th scope="row">Object Representation</th>
                    <td className="w-75 text-break">
                      {displayBytes(bytes, bytesDisplayOpt)}
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Value</th>
                    <td className="w-75 text-break">{value}</td>
                  </tr>
                </tbody>
              </table>
              <br />
              <h5 className="my-3">Visualization</h5>
              {visualizeObject(typeInfo, bytes, useContext(EndiannessContext))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TemporaryObject;
