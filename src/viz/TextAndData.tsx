import React, { Key } from "react";
import RuntimeObject from "./components/RuntimeObject";
import { TextAndData as TextAndDataType } from "c-viz/lib/interpreter/runtime";
import { isFunctionDesignator } from "c-viz/lib/interpreter/runtime";
import FunctionDesignator from "./components/FunctionDesignator";

interface TextAndDataProps {
  textAndData: TextAndDataType | undefined;
}

const TextAndData: React.FC<TextAndDataProps> = ({ textAndData: xs }) => {
  return (
    <div className="card">
      <div className="card-header text-center py-0">
        <small>TEXT & DATA</small>
      </div>
      <div
        id="text-and-data-list"
        className="list-group hide-scroll"
        style={{ overflowY: "auto" }}
      >
        {xs === undefined ||
          xs.map((d, i: Key) => (
            <span
              className="animate__animated animate__slideInUp animate__faster"
              key={i}
            >
              {isFunctionDesignator(d) ? (
                <FunctionDesignator data={d} isLast={false} />
              ) : (
                <RuntimeObject data={d} />
              )}
            </span>
          ))}
      </div>
    </div>
  );
};

export default TextAndData;
