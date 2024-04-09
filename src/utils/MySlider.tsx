import { SliderMarkLabel, Slider } from "@mui/material";
import { useCallback, useMemo } from "react";

const ClickableSliderMarkLabel = (props: any) => {
  const { labelOnChange, ownerState, ...restProps } = props;

  const markValue = ownerState?.marks[props?.["data-index"]]?.value;

  const noop = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  const onClick = useCallback(
    (e: React.SyntheticEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (markValue != null) {
        labelOnChange(e, markValue);
      }
    },
    [labelOnChange, markValue],
  );

  return (
    <SliderMarkLabel
      onMouseDown={noop}
      onTouchStart={noop}
      onClick={onClick}
      sx={useMemo(
        () => ({
          ...props?.sx,
          userSelect: "none",
        }),
        [props?.sx],
      )}
      ownerState={ownerState}
      {...restProps}
    />
  );
};

export const MySlider = (props: React.ComponentProps<typeof Slider>) => {
  return (
    <Slider
      slotProps={{
        markLabel: {
          // @ts-ignore
          labelOnChange: props.onChange,
        },
      }}
      slots={{
        markLabel: ClickableSliderMarkLabel,
      }}
      {...props}
    />
  );
};
