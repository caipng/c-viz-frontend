import React, { useEffect, useRef } from "react";
import "./App.css";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import Agenda from "./Agenda";
import "react18-json-view/src/style.css";
import cviz from "c-viz";
import { getErrorMessage, markField } from "./utils";
import ExternalDeclarations from "./ExternalDeclarations";
import Stash from "./Stash";
import {
  BezierConnector,
  BrowserJsPlumbInstance,
  newInstance,
} from "@jsplumb/browser-ui";
import Stack from "./Stack";
import Box from "@mui/material/Box";
import { MySlider } from "./MySlider";
import SliderLabel from "./SliderLabel";
import { RuntimeView } from "c-viz/lib/interpreter/interpreter";
import { Runtime, isInstruction } from "c-viz/lib/interpreter/types";
import { isCallInstruction } from "c-viz/lib/interpreter/instructions";

const STEPS_LIMIT = 1000;

interface Mark {
  value: number;
  label: any;
}

function App() {
  const [code, setCode] = React.useState("");
  useEffect(() => {
    fetch("/sample.c")
      .then((r) => r.text())
      .then((t) => setCode(t));
  }, []);

  const onChange = React.useCallback(
    (val: React.SetStateAction<string>, viewUpdate: any) => {
      setCode(val);
    },
    [],
  );

  const [rts, setRts] = React.useState<RuntimeView[]>([]);
  const [marks, setMarks] = React.useState<Mark[]>([]);
  const [idx, setIdx] = React.useState<number | undefined>(undefined);
  const [error, setError] = React.useState("");
  const [exitCode, setExitCode] = React.useState<undefined | number>(undefined);
  const [timeTaken, setTimeTaken] = React.useState(0);
  const [loading, setLoading] = React.useState(false);

  const run = () => {
    setLoading(true);
    let rt: Runtime | undefined;
    const rts: RuntimeView[] = [];
    setRts(rts);
    const marks: Mark[] = [];
    setMarks(marks);
    const start = Date.now();
    try {
      rt = cviz.run(code);
    } catch (err) {
      console.error(err);
      setTimeTaken(Date.now() - start);
      setError(getErrorMessage(err));
      setLoading(false);
      return;
    }
    rts.push(new RuntimeView(rt));
    for (let i = 0; i < STEPS_LIMIT; i++) {
      const nextItem = rt.agenda.peek();
      if (isInstruction(nextItem) && isCallInstruction(nextItem)) {
        const n = nextItem.arity;
        const arr = rt.stash.getArr().slice(-(n + 1));
        let t = rt.memory[arr[0].value].identifier + "(";
        for (let j = 0; j < n; j++)
          t += arr[j + 1].value + (j === n - 1 ? "" : ", ");
        t += ")";
        marks.push({
          value: i,
          label: <SliderLabel tooltip={t} />,
        });
      }
      try {
        rt = cviz.next(rt);
      } catch (err) {
        console.error(err);
        setTimeTaken(Date.now() - start);
        setError(getErrorMessage(err));
        setIdx(rts.length - 1);
        setLoading(false);
        return;
      }
      rts.push(new RuntimeView(rt));
      if (rt.exitCode !== undefined) {
        setTimeTaken(Date.now() - start);
        setExitCode(rt.exitCode);
        setIdx(rts.length - 1);
        setLoading(false);
        return;
      }
    }
    setTimeTaken(Date.now() - start);
    setError("Steps limit (" + STEPS_LIMIT + ") exceeded");
    setIdx(rts.length - 1);
    setLoading(false);
  };

  let viewRef = useRef<EditorView>();
  let instance = useRef<BrowserJsPlumbInstance>();
  useEffect(() => {
    const canvas = document.getElementById("canvas");
    if (canvas) {
      instance.current = newInstance({
        container: canvas,
        elementsDraggable: false,
      });
    }
  }, []);
  useEffect(() => {
    instance?.current?.select().deleteAll();
    const canvas = document.getElementById("canvas");
    if (!canvas) return;
    canvas.querySelectorAll(".ptr-from").forEach((elem) => {
      const addr = (elem as HTMLElement).dataset.address;
      const to = document.getElementById("" + addr);
      if (!to || !instance.current) return;
      instance.current.connect({
        source: elem,
        target: to,
        connector: {
          type: BezierConnector.type,
          options: { curviness: 30 },
        },
        anchors: ["Right", "Left"],
        endpoints: ["Dot", "Blank"],
        overlays: [{ type: "Arrow", options: { location: 1 } }],
      });
    });
    canvas.querySelectorAll(".last-item").forEach((elem) =>
      elem.scrollIntoView({
        block: "end",
        inline: "nearest",
      }),
    );
  }, [idx]);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    setIdx(newValue as number);
  };

  return (
    <>
      <div className="container text-center">
        <br />
        <h1 className="display-1">
          c<small className="text-body-secondary">-viz</small>
        </h1>
        <br />
      </div>
      <div className="container-fluid" id="container">
        <hr />
        <div className="row g-1 my-5">
          <div className="col-4">
            {idx !== undefined && (
              <Box>
                <MySlider
                  step={1}
                  marks={marks}
                  min={0}
                  max={rts.length - 1}
                  valueLabelDisplay="on"
                  value={idx}
                  onChange={handleSliderChange}
                />
                <div className="d-flex justify-content-center">
                  <button
                    type="button"
                    className="btn btn-outline-primary m-1"
                    onClick={() => setIdx(idx - 1)}
                    disabled={idx === 0}
                  >
                    {"Prev"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-primary m-1"
                    onClick={() => setIdx(idx + 1)}
                    disabled={idx === rts.length - 1}
                  >
                    {"Next"}
                  </button>
                </div>
              </Box>
            )}
            <br />
            <CodeMirror
              value={code}
              height="500px"
              extensions={[cpp(), markField]}
              onChange={onChange}
              readOnly={timeTaken > 0}
              onCreateEditor={(view, state) => (viewRef.current = view)}
            />
            <br />
            <div className="text-center">
              <button
                type="button"
                className="btn btn-dark m-1"
                onClick={run}
                disabled={timeTaken > 0}
              >
                Run
              </button>
              <button
                type="button"
                className="btn btn-light m-1"
                onClick={() => window.location.reload()}
              >
                Reset
              </button>
            </div>
            {loading && (
              <div className="text-center">
                <div className="spinner-border my-5" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            {timeTaken > 0 && (
              <pre className="my-2">Time elapsed: {timeTaken} ms</pre>
            )}
            {error !== "" && (
              <pre
                className="text-danger border border-danger p-2 my-3"
                style={{
                  whiteSpace: "pre-wrap",
                }}
              >
                <strong>Error</strong>
                <br />
                {error}
              </pre>
            )}
            {exitCode !== undefined && (
              <pre
                className="text-success border border-success p-2 my-3"
                style={{
                  whiteSpace: "pre-wrap",
                }}
              >
                Program exited with code <strong>{exitCode}</strong>
              </pre>
            )}
          </div>
          <div className="col-8" id="canvas" style={{ position: "relative" }}>
            <div className="container-fluid">
              <div className="row g-2">
                <div className="col-5 viz">
                  <Agenda
                    agenda={idx === undefined ? undefined : rts[idx].agenda}
                    view={viewRef.current}
                  />
                </div>
                <div className="col-2 viz">
                  <Stash
                    stash={idx === undefined ? undefined : rts[idx].stash}
                  />
                </div>
                <div className="col-5 viz">
                  <ExternalDeclarations
                    declarations={
                      idx === undefined
                        ? undefined
                        : rts[idx].externalDeclarations
                    }
                  />
                </div>
                <div className="col-5 viz">
                  <Stack
                    stack={idx === undefined ? undefined : rts[idx].symTable}
                  />
                </div>
                <div className="col-7 viz">
                  <div className="card">
                    <div className="card-header text-center py-0">
                      <small>HEAP</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <footer className="py-3 my-4">
          <p className="text-center text-body-secondary">
            Made with <i className="bi bi-heart-fill"></i>
          </p>
        </footer>
      </div>
    </>
  );
}

export default App;
