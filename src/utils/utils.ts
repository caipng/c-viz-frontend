import { EditorView, Decoration } from "@codemirror/view";
import { StateField, StateEffect, Range } from "@codemirror/state";
import { BytesDisplayOption } from "../App";

type ErrorWithMessage = {
  message: string;
};

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as Record<string, unknown>).message === "string"
  );
}

function toErrorWithMessage(maybeError: unknown): ErrorWithMessage {
  if (isErrorWithMessage(maybeError)) return maybeError;

  try {
    return new Error(JSON.stringify(maybeError));
  } catch {
    // fallback in case there's an error stringifying the maybeError
    // like with circular references for example.
    return new Error(String(maybeError));
  }
}

export function getErrorMessage(error: unknown) {
  return toErrorWithMessage(error).message;
}

const addMarks = StateEffect.define<Range<Decoration>[]>(),
  filterMarks =
    StateEffect.define<
      (from: number, to: number, value: Decoration) => boolean
    >();

export const markField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(value, tr) {
    value = value.map(tr.changes);
    for (let effect of tr.effects) {
      if (effect.is(addMarks))
        value = value.update({ add: effect.value, sort: true });
      else if (effect.is(filterMarks))
        value = value.update({ filter: effect.value });
    }
    return value;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const strikeMark = Decoration.mark({
  attributes: { class: "code-highlight" },
});

export function addHighlight(view: EditorView, from: number, to: number) {
  view.dispatch({
    effects: addMarks.of([strikeMark.range(from, to)]),
  });
}

export function removeHighlight(view: EditorView, a: number, b: number) {
  view.dispatch({
    effects: filterMarks.of((from, to) => to <= a || from >= b),
  });
}

export function isVisible(domElement: Element) {
  return new Promise((resolve) => {
    const o = new IntersectionObserver(([entry]) => {
      resolve(entry.intersectionRatio === 1);
      o.disconnect();
    });
    o.observe(domElement);
  });
}

export const randomColor = (() => {
  const randomInt = (min: number, max: number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  };

  return (opacity: number = 0.2) => {
    var h = randomInt(0, 360);
    var s = randomInt(42, 98);
    var l = randomInt(40, 90);
    return `hsl(${h},${s}%,${l}%,${opacity})`;
  };
})();

export function decimalAddressToHex(addr: number) {
  return ("00000000" + addr.toString(16).toUpperCase()).slice(-8);
}

export function displayBytes(
  bytes: number[],
  opt: BytesDisplayOption,
  sep: string = " ",
): string {
  const base = opt === "binary" ? 2 : 16;
  const padding = opt === "binary" ? 8 : 2;
  return bytes
    .map((i) => i.toString(base).toUpperCase().padStart(padding, "0"))
    .join(sep);
}

export function asArrayBuffer(bytes: number[]) {
  const res = new Uint8Array(bytes.length);
  res.set(bytes, 0);
  console.log(bytes, res);
  return res;
}
