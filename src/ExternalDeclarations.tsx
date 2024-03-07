import React, { Key } from "react";
import Declaration from "./Declaration";
import { RuntimeObject } from "c-viz/lib/interpreter/types";

interface ExternalDeclarationsProps {
  declarations: RuntimeObject[] | undefined;
}

const ExternalDeclarations: React.FC<ExternalDeclarationsProps> = ({
  declarations,
}) => {
  return (
    <div className="card">
      <div className="card-header text-center py-0">
        <small>EXT. DECLARATIONS</small>
      </div>
      <div className="list-group hide-scroll" style={{ overflowY: "auto" }}>
        {declarations === undefined ||
          declarations.map((d: RuntimeObject, i: Key) => (
            <Declaration data={d} key={i} />
          ))}
      </div>
    </div>
  );
};

export default ExternalDeclarations;
