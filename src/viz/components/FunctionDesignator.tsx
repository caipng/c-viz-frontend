import { FunctionDesignator as FunctionDesignatorType } from "c-viz/lib/interpreter/object";
import { getTypeName, isSigned, shortInt } from "c-viz/lib/typing/types";
import React, { useContext, useId } from "react";
import { decimalAddressToHex } from "../../utils/utils";
import { EndiannessContext, RuntimeViewContext } from "../../App";
import { SHRT_SIZE } from "c-viz/lib/constants";
import { bytesToBigint } from "c-viz/lib/typing/representation";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";

interface FunctionDesignatorProps {
  data: FunctionDesignatorType;
  isLast: boolean;
}

const FunctionDesignator: React.FC<FunctionDesignatorProps> = ({
  data,
  isLast,
}) => {
  const id = useId();
  const { typeInfo, address, identifier } = data;
  const { returnType, parameterTypes, type } = typeInfo;

  const endianness = useContext(EndiannessContext);
  const rt = useContext(RuntimeViewContext);
  let fnSource = "?";
  if (rt) {
    const fnIdxBytes = rt.memory.getBytes(address, SHRT_SIZE, true);
    const fnIdx = bytesToBigint(fnIdxBytes, isSigned(shortInt()), endianness);
    const fnBody = rt.functions[Number(fnIdx)][1];
    fnSource = fnBody.src;
  }
  return (
    <>
      <a
        href={"#" + id}
        className={
          "list-group-item list-group-item-action p-0" +
          (isLast ? " border-2 border-primary-subtle last-item" : "")
        }
        data-bs-toggle="modal"
        id={"0x" + decimalAddressToHex(address)}
      >
        <div className={"px-2 py-1 border-start border-2 border-dark-subtle"}>
          <div
            className="font-monospace text-body-tertiary hstack"
            style={{ fontSize: "12px" }}
          >
            <div>0x{decimalAddressToHex(address)}</div>
            <div className="vr mx-1"></div>
            <div className="text-truncate">{fnSource}</div>
          </div>
          <hr className="m-0" />
          <div className="d-flex w-100 justify-content-between">
            <span>
              <h5 className="mb-0" style={{ display: "inline-block" }}>
                {identifier}
              </h5>
              <small className="mx-1">
                <code>{getTypeName(typeInfo)}</code>
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
              {"(" +
                parameterTypes.map((i) => getTypeName(i.type)).join(", ") +
                ") > " +
                getTypeName(returnType)}
            </code>
          </div>
        </div>
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
                    <th scope="row">Return Type</th>
                    <td className="w-75">{getTypeName(returnType)}</td>
                  </tr>
                  {parameterTypes.map((t, i: number) => (
                    <tr key={i}>
                      <th scope="row">{"Parameter " + (i + 1)}</th>
                      <td className="w-75">
                        {t.identifier}
                        <small className="mx-1">
                          <code>{getTypeName(t.type)}</code>
                        </small>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="text-center align-top pt-3">
                      Source
                    </th>
                    <td className="py-2">
                      <CodeMirror
                        value={fnSource}
                        extensions={[cpp()]}
                        readOnly={true}
                        basicSetup={{ lineNumbers: false }}
                      />
                    </td>
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

export default FunctionDesignator;
