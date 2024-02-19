import React, { useEffect, useRef } from "react";
import { Tooltip } from "bootstrap";

interface InstructionProps {
  type: string;
  args: string;
}

const helperTexts: { [type: string]: string } = {
  Assign: "Assigns the value on the top of the stash to the specified name",
  Entry: "Pushes an exit instruction and calls the main function",
  Mark: "Marks return address",
  Exit: "Exits the program with an exit code specified by the top of the stash",
  Call: "Calls the function specified in the stash with the correct number of arguments",
  Return: "Repeatedly pop from the control until a mark is reached",
  Branch:
    "Pushes the corresponding expression onto the control based on the value on top of the stash",
};

const Instruction: React.FC<InstructionProps> = ({ type, args }) => {
  const tooltipRef = useRef(null);
  useEffect(() => {
    if (!tooltipRef.current) return;
    if (!(type in helperTexts)) return;
    new Tooltip(tooltipRef.current, {
      title: helperTexts[type],
      placement: "left",
      trigger: "hover",
    });
  });
  return (
    <div
      className="border-start border-3 border-dark-subtle p-2"
      ref={tooltipRef}
    >
      <div className="d-flex w-100 justify-content-between">
        <h6
          className="mb-0 text-uppercase"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {type}
        </h6>
        {args === "" || (
          <small className="fw-semibold bg-secondary-subtle border border-dark-subtle rounded-2 px-1 py-0 text-truncate ms-1">
            {args}
          </small>
        )}
      </div>
    </div>
  );
};

export default Instruction;
