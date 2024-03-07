import React, { useEffect, useRef } from "react";
import { Tooltip } from "bootstrap";

interface SliderLabelProps {
  tooltip: string;
}

const SliderLabel: React.FC<SliderLabelProps> = ({ tooltip }) => {
  const tooltipRef = useRef(null);
  useEffect(() => {
    if (!tooltipRef.current) return;
    new Tooltip(tooltipRef.current, {
      title: tooltip,
      placement: "bottom",
      trigger: "hover",
    });
  });
  return (
    <a
      className="icon-link icon-link-hover"
      style={
        {
          "--bs-icon-link-transform": "translate3d(0, -.175rem, 0)",
        } as React.CSSProperties
      }
      href="#"
      ref={tooltipRef}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        className="bi bi-arrow-up-short"
        viewBox="0 0 16 16"
      >
        <path
          fillRule="evenodd"
          d="M8 12a.5.5 0 0 0 .5-.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 .5.5"
        />
      </svg>
    </a>
  );
};

export default SliderLabel;
