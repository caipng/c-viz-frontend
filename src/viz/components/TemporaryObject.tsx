import { TemporaryObject as TemporaryObjectType } from "c-viz/lib/interpreter/object";
import {
  getTypeName,
  isFunctionTypeInfo,
  isObjectTypeInfo,
  isPointer,
} from "c-viz/lib/typing/types";
import React, { useContext, useEffect, useId, useRef } from "react";
import { asArrayBuffer, displayBytes } from "../../utils/utils";
import { displayValue, visualizeObject } from "../../utils/object";
import {
  BytesDisplayContext,
  EndiannessContext,
  RuntimeViewContext,
} from "../../App";
import { SHRT_ALIGN } from "c-viz/lib/constants";
import { Tooltip } from "bootstrap";
import { HexEditor } from "hex-editor-react";

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
    const t = new Tooltip(tooltipRef.current, {
      title: isMisaligned
        ? "unaligned pointer"
        : pointsToUnalloc
          ? "pointer to unallocated memory"
          : "unknown error",
      placement: "top",
      trigger: "hover",
    });
    return () => t.disable();
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
        data-bs-toggle="offcanvas"
        role="button"
        data-address={isPointer(typeInfo) ? value : undefined}
        ref={tooltipRef}
      >
        <div className={"px-2 py-1 "}>
          <div
            className="font-monospace text-body-tertiary hstack"
            style={{ fontSize: "12px" }}
          >
            <div className="text-truncate">{getTypeName(typeInfo)}</div>
            <div className="vr mx-1"></div>
            <div className="text-truncate">
              {displayBytes(bytes, bytesDisplayOpt)}
            </div>
          </div>
          <hr className="m-0" />
          <div className="d-flex w-100 justify-content-between">
            <h5
              className="mb-0 text-truncate"
              style={{ display: "inline-block", overflow: "hidden" }}
            >
              {value}
            </h5>
          </div>
        </div>
      </a>
      <div
        className="offcanvas offcanvas-start shadow-lg"
        data-bs-backdrop="false"
        id={id}
        tabIndex={-1}
        style={{ width: "auto", maxWidth: 888 }}
      >
        <div className="offcanvas-header border-bottom">
          <h1 className="offcanvas-title fs-5">Temporary Object</h1>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body px-3 py-0 hide-scroll">
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
                  <HexEditor
                    data={asArrayBuffer(bytes)}
                    offsetBase={2}
                    dataBase={2}
                    bytesPerLine={4}
                  />
                </td>
              </tr>
              <tr>
                <th scope="row">Value</th>
                <td className="w-75 text-break">{value}</td>
              </tr>
            </tbody>
          </table>
          <br />
          <div className="p-1">
            {visualizeObject(typeInfo, bytes, useContext(EndiannessContext), 0)}
          </div>
        </div>
      </div>
    </>
  );
};

export default TemporaryObject;
