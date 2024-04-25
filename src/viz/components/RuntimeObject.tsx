import React, { useContext, useEffect, useId, useRef } from "react";
import { decimalAddressToHex, displayBytes } from "../../utils/utils";
import { RuntimeObject as RuntimeObjectType } from "c-viz/lib/interpreter/object";
import {
  getTypeName,
  isFunctionTypeInfo,
  isObjectTypeInfo,
  isPointer,
} from "c-viz/lib/typing/types";
import {
  displayValue,
  drawObjectInline,
  visualizeObject,
} from "../../utils/object";
import {
  BytesDisplayContext,
  EndiannessContext,
  RuntimeViewContext,
} from "../../App";
import { SHRT_ALIGN } from "c-viz/lib/constants";
import { Tooltip } from "bootstrap";

interface RuntimeObjectProps {
  data: RuntimeObjectType;
}

const RuntimeObject: React.FC<RuntimeObjectProps> = ({ data }) => {
  const id = useId();
  const { identifier, typeInfo, address, bytes, initialized } = data;
  const { size, alignment } = typeInfo;
  const value = displayValue(bytes, typeInfo, useContext(EndiannessContext));
  const bytesDisplayOpt = useContext(BytesDisplayContext);
  const endianness = useContext(EndiannessContext);

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

  const hasErr = isMisaligned || !initialized || pointsToUnalloc;
  const tooltipRef = useRef(null);
  useEffect(() => {
    if (!tooltipRef.current || !hasErr) return;
    const t = new Tooltip(tooltipRef.current, {
      title: !initialized
        ? "uninitialized"
        : isMisaligned
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
          (hasErr ? " list-group-item-danger" : "")
        }
        data-bs-toggle="offcanvas"
        role="button"
        style={{ position: "static" }}
        ref={tooltipRef}
      >
        <div className={"px-2 py-1 "}>
          <div
            className="font-monospace text-body-tertiary"
            style={{ fontSize: "10px" }}
          >
            <span style={{ fontSize: 12 }}>
              0x{decimalAddressToHex(address)}
            </span>
            <span className="vr mx-1"></span>
            {/* <div>{size}</div>
            <div className="vr mx-1"></div> */}
            {drawObjectInline(typeInfo, bytes, address, endianness)}
          </div>
          <hr className="m-0 mt-1" />
          <div className="d-flex w-100 justify-content-between">
            <div className="hstack">
              <h5 className="mb-0" style={{ display: "inline-block" }}>
                {identifier}
              </h5>
              <small className="mx-1 text-truncate">
                <code>{getTypeName(typeInfo)}</code>
              </small>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
                overflow: "hidden",
              }}
            >
              <code className="mb-0 text-truncate">{value}</code>
            </div>
          </div>
        </div>
        {/* {!isScalarType(typeInfo) && (
          <div className="m-0 p-0 font-monospace" style={{ fontSize: 10 }}>
            {drawObjectInline(typeInfo, bytes, address, endianness)}
          </div>
        )} */}
      </a>
      <div
        className="offcanvas offcanvas-start shadow-lg"
        data-bs-backdrop="false"
        id={id}
        tabIndex={-1}
        style={{ width: "auto", maxWidth: 888 }}
      >
        <div className="offcanvas-header border-bottom">
          <h1 className="offcanvas-title fs-5">{identifier}</h1>
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
                <th scope="row">Identifier</th>
                <td className="w-75">{identifier}</td>
              </tr>
              <tr>
                <th scope="row">Address</th>
                <td className="w-75">0x{decimalAddressToHex(address)}</td>
              </tr>
              <tr>
                <th scope="row">Size (Bytes)</th>
                <td className="w-75">{size}</td>
              </tr>
              <tr>
                <th scope="row">Alignment</th>
                <td className="w-75">{alignment}</td>
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
          <div className="p-1">
            {visualizeObject(typeInfo, bytes, endianness)}
          </div>
        </div>
      </div>
    </>
  );
};

export default RuntimeObject;
