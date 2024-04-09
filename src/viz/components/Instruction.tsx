import {
  Instruction as Inst,
  InstructionType,
} from "c-viz/lib/interpreter/instructions";
import { isFunctionDesignator } from "c-viz/lib/interpreter/stash";
import { getTypeName } from "c-viz/lib/typing/types";
import React, { ReactNode, useContext } from "react";
import { displayValue } from "../../utils/object";
import { Endianness } from "c-viz/lib/config";
import { EndiannessContext } from "../../App";

interface InstructionProps {
  inst: Inst;
}

const instructions: {
  [t in InstructionType]: {
    displayName: string;
    helperText: string;
    displayArgs: (
      i: Extract<Inst, { type: t }>,
      endianness: Endianness,
    ) => ReactNode[];
  };
} = {
  [InstructionType.ARITHMETIC_CONVERSION]: {
    displayName: "Convert Type",
    helperText: "Converts the type of the temporary object on top of the stash",
    displayArgs: (i) => [getTypeName(i.typeInfo)],
  },
  [InstructionType.ASSIGN]: {
    displayName: "Assign",
    helperText: "Assigns the value on the stash to the specified address",
    displayArgs: (i) => [],
  },
  [InstructionType.BINARY_OP]: {
    displayName: "Binary Operator",
    helperText:
      "Applies the specified binary operator to the top 2 stash items",
    displayArgs: (i) => [i.op],
  },
  [InstructionType.BRANCH]: {
    displayName: "Branch",
    helperText:
      "Pushes the corresponding expression onto the control based on the value on top of the stash",
    displayArgs: (i) => [i.exprIfTrue.src, i.exprIfFalse.src],
  },
  [InstructionType.CALL]: {
    displayName: "Call",
    helperText:
      "Calls the function specified in the stash with the correct number of arguments",
    displayArgs: (i) => [i.arity.toString()],
  },
  [InstructionType.EXIT]: {
    displayName: "Exit",
    helperText:
      "Exits the program with an exit code specified by the top of the stash",
    displayArgs: (i) => [],
  },
  [InstructionType.MARK]: {
    displayName: "Mark",
    helperText: "Marks return address",
    displayArgs: (i) => [],
  },
  [InstructionType.POP]: {
    displayName: "Pop",
    helperText: "Pops the top stash item",
    displayArgs: (i) => [],
  },
  [InstructionType.RETURN]: {
    displayName: "Return",
    helperText: "Repeatedly pop from the control until a mark is reached",
    displayArgs: (i) => [],
  },
  [InstructionType.UNARY_OP]: {
    displayName: "Unary Operator",
    helperText: "Applies the specified unary operator to the top stash item",
    displayArgs: (i) => [i.op],
  },
  [InstructionType.CAST]: {
    displayName: "Cast",
    helperText: "Performs explicit type conversion",
    displayArgs: (i) => [getTypeName(i.targetType)],
  },
  [InstructionType.PUSH]: {
    displayName: "Push",
    helperText: "Pushes the corresponding item onto the stash",
    displayArgs: (i, endianness) => [
      isFunctionDesignator(i.item)
        ? i.item.identifier
        : displayValue(i.item.bytes, i.item.typeInfo, endianness),
    ],
  },
  [InstructionType.ARRAY_SUBSCRIPT]: {
    displayName: "Array Subscript",
    helperText:
      "Performs array subscript operation on the top 2 items in the stash",
    displayArgs: (i) => [],
  },
};

const Instruction: React.FC<InstructionProps> = ({ inst }) => {
  const { displayName, helperText, displayArgs } = instructions[inst.type];
  const args = displayArgs(inst as any, useContext(EndiannessContext));
  return (
    <div className="py-1 px-2">
      <div className="d-flex w-100 justify-content-between">
        <div className="mb-0 fill-flex">
          <abbr title={helperText} className="initialism">
            {displayName}
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
