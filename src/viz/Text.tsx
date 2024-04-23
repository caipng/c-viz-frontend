import React, { Key } from "react";
import { TextAndData as TextAndDataType } from "c-viz/lib/interpreter/runtime";
import { isFunctionDesignator } from "c-viz/lib/interpreter/runtime";
import FunctionDesignator from "./components/FunctionDesignator";

interface TextProps {
  textAndData: TextAndDataType | undefined;
}

const Text: React.FC<TextProps> = ({ textAndData: xs }) => {
  return (
    <div className="card" style={{ height: 420 }}>
      <div className="card-header text-center py-0">
        <small>TEXT</small>
      </div>
      <div
        id="text-list"
        className="list-group hide-scroll"
        style={{ overflowY: "auto", height: "100%" }}
      >
        {xs === undefined ? (
          <div
            className="d-flex align-items-center justify-content-center p-3 text-secondary"
            style={{ height: "100%" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              className="bi bi-file-earmark-code-fill"
              viewBox="0 0 16 16"
            >
              <path d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M6.646 7.646a.5.5 0 1 1 .708.708L5.707 10l1.647 1.646a.5.5 0 0 1-.708.708l-2-2a.5.5 0 0 1 0-.708zm2.708 0 2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L10.293 10 8.646 8.354a.5.5 0 1 1 .708-.708" />
            </svg>
          </div>
        ) : (
          xs.map((d, i: Key) => {
            if (!isFunctionDesignator(d)) return <span key={i}></span>;
            return (
              <span
                className="animate__animated animate__slideInUp animate__faster"
                key={i}
              >
                <FunctionDesignator data={d} isLast={false} />
              </span>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Text;
