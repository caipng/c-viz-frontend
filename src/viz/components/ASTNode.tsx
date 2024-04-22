import React, { useEffect, useId, useRef } from "react";
import { EditorView } from "@uiw/react-codemirror";
import { addHighlight, removeHighlight } from "../../utils/utils";
import { Tooltip } from "bootstrap";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import JsonView from "react18-json-view";
import { TypedASTNode as ASTNodeType } from "c-viz/lib/ast/types";

interface ASTNodeProps {
  node: ASTNodeType;
  view: EditorView | undefined;
  asLvalue: boolean;
}

const ASTNode: React.FC<ASTNodeProps> = ({ node, view, asLvalue }) => {
  const id = useId();
  const { type, start, end, src, ...others } = node;
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!tooltipRef.current) return;
    const t = new Tooltip(tooltipRef.current, {
      title: "<pre class='mb-0'>" + src + "</pre>",
      placement: "left",
      trigger: "hover",
      html: true,
    });
    const e = document.getElementById(id);
    if (e) {
      e.addEventListener("hide.bs.modal", (event) => t.enable());
      e.addEventListener("show.bs.modal", (event) => t.disable());
    }
    return () => t.disable();
  });

  return (
    <span ref={tooltipRef}>
      <a
        href={"#" + id}
        className={
          "list-group-item list-group-item-action px-2 py-1 " +
          (asLvalue ? "bg-warning bg-opacity-25" : "")
        }
        data-bs-toggle="modal"
        onMouseEnter={(e) =>
          view && addHighlight(view, start.offset, end.offset)
        }
        onMouseLeave={(e) =>
          view && removeHighlight(view, start.offset, end.offset)
        }
      >
        <div className="d-flex w-100 justify-content-between">
          <h6 className="mb-1">{type}</h6>
          <span className="badge text-bg-light">
            <small>
              {start.line}:
              <span className="text-secondary">{start.column}</span>
              {" - "}
              {end.line}:<span className="text-secondary">{end.column}</span>
            </small>
          </span>
        </div>
        <div className="mb-0">
          <pre
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            className="m-0"
          >
            {src}
          </pre>
        </div>
      </a>
      <div className="modal fade" id={id} tabIndex={-1} aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header py-2">
              <h1 className="modal-title fs-5">{type}</h1>
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
                    <th scope="row" rowSpan={3}>
                      Start
                    </th>
                    <th scope="row">Line</th>
                    <td className="w-75">{start.line}</td>
                  </tr>
                  <tr>
                    <th scope="row">Col</th>
                    <td>{start.column}</td>
                  </tr>
                  <tr>
                    <th scope="row">Offset</th>
                    <td>{start.offset}</td>
                  </tr>
                  <tr>
                    <th scope="row" rowSpan={3}>
                      End
                    </th>
                    <th scope="row">Line</th>
                    <td>{end.line}</td>
                  </tr>
                  <tr>
                    <th scope="row">Col</th>
                    <td>{end.column}</td>
                  </tr>
                  <tr>
                    <th scope="row">Offset</th>
                    <td>{end.offset}</td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      colSpan={2}
                      className="text-center align-top pt-3"
                    >
                      Source
                    </th>
                    <td className="py-2">
                      <CodeMirror
                        value={src}
                        extensions={[cpp()]}
                        readOnly={true}
                        basicSetup={{ lineNumbers: false }}
                      />
                    </td>
                  </tr>
                  <tr>
                    <th
                      scope="row"
                      colSpan={2}
                      className="text-center align-top pt-3"
                    >
                      Others
                    </th>
                    <td className="py-2">
                      <JsonView src={others} collapseObjectsAfterLength={5} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </span>
  );
};

export default ASTNode;
