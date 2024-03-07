import { EditorView, Decoration } from "@codemirror/view";
import { StateField, StateEffect, Range } from "@codemirror/state";
import { RuntimeObject } from "c-viz/lib/interpreter/types";

export function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
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

export function decimalAddressToHex(addr: number) {
  return ("00000000" + addr.toString(16).toUpperCase()).slice(-8);
}

export function hexDump(i: RuntimeObject) {
  if (i.rawValue === undefined) return "-";
  return ("00000000" + i.rawValue.toString(16).toUpperCase()).slice(-i.sizeof);
}
