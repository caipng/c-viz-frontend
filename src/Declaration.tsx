import React, { useId } from "react";
import { Declaration as DeclarationType } from "c-viz/lib/interpreter";

interface DeclarationProps {
  data: DeclarationType;
}

const Declaration: React.FC<DeclarationProps> = ({ data }) => {
  const id = useId();
  const { identifier, specifiers, isPtr, value } = data;
  return (
    <>
      <a
        href={"#" + id}
        className={
          "list-group-item list-group-item-action" +
          (value === undefined ? " list-group-item-danger" : "")
        }
        data-bs-toggle="modal"
      >
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
            {value === undefined ? "uninitialized" : JSON.stringify(value)}
          </code>
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
