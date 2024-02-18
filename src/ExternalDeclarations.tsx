import React, { Key } from "react";
import Declaration from "./Declaration";
import { Declaration as DeclarationType } from "c-viz/lib/interpreter";

interface ExternalDeclarationsProps {
  declarations: DeclarationType[] | undefined;
}

const ExternalDeclarations: React.FC<ExternalDeclarationsProps> = ({
  declarations,
}) => {
  return (
    <div className="list-group border" style={{ overflowY: "auto" }}>
      {declarations === undefined ||
        declarations.map((d: DeclarationType, i: Key) => (
          <Declaration data={d} key={i} />
        ))}
    </div>
  );
};

export default ExternalDeclarations;
