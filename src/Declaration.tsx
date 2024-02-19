import React, { useId } from "react";
import {
  Declaration as DeclarationType,
  FunctionDeclaration,
} from "c-viz/lib/interpreter";
import { decimalAddressToHex, hexDump } from "./utils";
import { has } from "lodash";

interface DeclarationProps {
  data: DeclarationType;
}

const Declaration: React.FC<DeclarationProps> = ({ data }) => {
  const id = useId();
  const { identifier, specifiers, isPtr, value, sizeof, address } = data;
  const isFunctionDeclaration = has(data, "params");
  return (
    <>
      <a
        href={"#" + id}
        className={
          "list-group-item list-group-item-action p-0" +
          (value === undefined ? " list-group-item-danger" : "")
        }
        data-bs-toggle="modal"
        id={"" + address}
      >
        <div
          className={
            "border-start px-2 py-1 border-2 " +
            (isFunctionDeclaration
              ? "border-success-subtle"
              : "border-warning-subtle")
          }
        >
          <div
            className="font-monospace text-body-tertiary hstack"
            style={{ fontSize: "12px" }}
          >
            <div>0x{decimalAddressToHex(address)}</div>
            <div className="vr mx-1"></div>
            {isFunctionDeclaration ? (
              <div className="text-truncate">
                {value === 0 ? "-" : (value as { src: string }).src}
              </div>
            ) : (
              <>
                <div>{sizeof}</div>
                <div className="vr mx-1"></div>
                <div className="text-truncate">{hexDump(data)}</div>
              </>
            )}
          </div>
          <hr className="m-0" />
          <div className="d-flex w-100 justify-content-between">
            <span>
              <h5 className="mb-0" style={{ display: "inline-block" }}>
                {identifier}
              </h5>
              <small className="mx-1">
                <code>
                  :{isPtr && "ptr to "}
                  {specifiers}
                </code>
              </small>
            </span>
            <code
              className="mb-0"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-end",
              }}
            >
              {isFunctionDeclaration
                ? "(" +
                  (data as FunctionDeclaration).params
                    .map((i) => i.specifiers)
                    .join(", ") +
                  ")"
                : value === undefined
                  ? "uninitialized"
                  : JSON.stringify(value)}
            </code>
          </div>
        </div>
      </a>
      <div className="modal fade" id={id} tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog">
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
                    <th scope="row">test</th>
                    <td className="w-75">xd</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Declaration;
