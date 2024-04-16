import React, { useContext, useId } from "react";
import { decimalAddressToHex, displayBytes } from "../../utils/utils";
import { RuntimeObject as RuntimeObjectType } from "c-viz/lib/interpreter/object";
import { getTypeName, isPointer } from "c-viz/lib/typing/types";
import {
  displayValue,
  drawObjectInline,
  visualizeObject,
} from "../../utils/object";
import { BytesDisplayContext, EndiannessContext } from "../../App";

interface RuntimeObjectProps {
  data: RuntimeObjectType;
}

const RuntimeObject: React.FC<RuntimeObjectProps> = ({ data }) => {
  const id = useId();
  const { identifier, typeInfo, address, bytes } = data;
  const { size, alignment } = typeInfo;
  const value = displayValue(bytes, typeInfo, useContext(EndiannessContext));
  const bytesDisplayOpt = useContext(BytesDisplayContext);
  const isMisaligned =
    isPointer(typeInfo) && parseInt(value, 16) % typeInfo.alignment;
  const endianness = useContext(EndiannessContext);
  return (
    <>
      <a
        href={"#" + id}
        className={
          "list-group-item list-group-item-action p-0" +
          (isMisaligned ? " list-group-item-danger" : "")
        }
        data-bs-toggle="modal"
        style={{ position: "static" }}
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
              <small className="mx-1">
                <code>{getTypeName(typeInfo)}</code>
              </small>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
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
      <div className="modal fade" id={id} tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header py-2">
              <h1 className="modal-title fs-5">{identifier}</h1>
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
              <h5 className="my-3">Visualization</h5>
              {visualizeObject(typeInfo, bytes, endianness)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RuntimeObject;
