import React, { useEffect, useRef } from "react";
import { Tooltip } from "bootstrap";

interface InstructionProps {
  type: string;
  args: string[];
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
    // new Tooltip(tooltipRef.current, {
    //   title: helperTexts[type],
    //   placement: "left",
    //   trigger: "hover",
    // });
  });
  return (
    <div className="py-1 px-2" ref={tooltipRef}>
      <div className="d-flex w-100 justify-content-between">
        <div className="mb-0 fill-flex">
          <abbr title={helperTexts[type]} className="initialism">
            {type}
          </abbr>
        </div>
        <div className="d-flex fill-flex">
          {args.length === 0 ||
            args.map((s, i) => (
              <code
                className="badge text-bg-primary bg-opacity-75 text-truncate fw-normal ms-1 align-self-center"
                key={i}
              >
                {s}
              </code>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Instruction;
