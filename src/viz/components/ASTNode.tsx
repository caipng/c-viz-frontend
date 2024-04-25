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
    let t2: Tooltip | null = null;
    if (asLvalue) {
      t2 = new Tooltip(tooltipRef.current, {
        title: "Evaluate as lvalue",
        placement: "top",
        trigger: "hover",
      });
    }
    const e = document.getElementById(id);
    if (e) {
      e.addEventListener("hide.bs.offcanvas", (event) => t.enable());
      e.addEventListener("show.bs.offcanvas", (event) => {
        t.hide();
        t.disable();
      });
    }
    return () => {
      t.disable();
      if (t2) t2.disable();
    };
  });

  return (
    <span ref={tooltipRef}>
      <a
        href={"#" + id}
        className={
          "list-group-item list-group-item-action px-2 py-1 " +
          (asLvalue ? "bg-warning bg-opacity-25" : "")
        }
        data-bs-toggle="offcanvas"
        role="button"
        onMouseEnter={(e) =>
          view && addHighlight(view, start.offset, end.offset)
        }
        onMouseLeave={(e) =>
          view && removeHighlight(view, start.offset, end.offset)
        }
      >
        <div className="d-flex w-100 justify-content-between">
          <h6 className="mb-1 text-truncate">{type}</h6>
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
      <div
        className="offcanvas offcanvas-start shadow-lg"
        data-bs-backdrop="false"
        id={id}
        tabIndex={-1}
        style={{ width: "auto", maxWidth: 888 }}
      >
        <div className="offcanvas-header border-bottom">
          <h1 className="offcanvas-title fs-5">{type}</h1>
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
    </span>
  );
};

export default ASTNode;
