import React, { useEffect, useRef } from "react";
import "./App.css";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import JsonView from "react18-json-view";
import Agenda from "./Agenda";
import "react18-json-view/src/style.css";
import cviz from "c-viz";
import { Runtime } from "c-viz/lib/interpreter";
import { getErrorMessage, markField } from "./utils";
import ExternalDeclarations from "./ExternalDeclarations";
import Stash from "./Stash";
import {
  BezierConnector,
  BrowserJsPlumbInstance,
  StateMachineConnector,
  newInstance,
} from "@jsplumb/browser-ui";
import Stack from "./Stack";

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

  const [rt, setRt] = React.useState<undefined | Runtime>(undefined);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);
  const [runtimeError, setRuntimeError] = React.useState("");
  const [timeTaken, setTimeTaken] = React.useState(0);
  const [key, setKey] = React.useState(0);
  const run = () => {
    setDone(false);
    const start = Date.now();
    try {
      const rt = cviz.run(code);
      setRt(rt);
      setTimeTaken(Date.now() - start);
      setError("");
      setRuntimeError("");
    } catch (err) {
      setTimeTaken(Date.now() - start);
      setError(getErrorMessage(err));
    }
  };

  const next = () => {
    if (rt !== undefined) {
      try {
        const nextRt = cviz.next(rt);
        console.log(nextRt.symTable);
        setRt(nextRt);
        setKey(key + 1);
      } catch (err) {
        console.error(err);
        setRuntimeError(getErrorMessage(err));
      }
      if (rt.exitCode !== undefined) {
        setDone(true);
      }
    }
  };

  let viewRef = useRef<EditorView>();

  const canvas = document.getElementById("canvas");
  let instance: BrowserJsPlumbInstance | undefined;
  if (canvas) {
    instance = newInstance({
      container: canvas,
      elementsDraggable: false,
    });
  }
  useEffect(() => {
    if (!canvas || !instance) return;
    instance.deleteEveryConnection();
    canvas.querySelectorAll(".ptr-from").forEach((elem) => {
      const addr = (elem as HTMLElement).dataset.address;
      const to = document.getElementById("" + addr);
      if (!to || !instance) return;
      // console.log(elem, to);
      instance.connect({
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
    instance.repaintEverything();
  }, [key, canvas, instance]);

  return (
    <>
      <div className="container text-center">
        <br />
        <h1>c-viz</h1>
        <br />
      </div>
      <div className="container-fluid" id="container">
        <div className="row g-1" style={{ paddingBottom: "100px" }}>
          <div className="col-4">
            <CodeMirror
              value={code}
              height="500px"
              extensions={[cpp(), markField]}
              onChange={onChange}
              readOnly={rt !== undefined}
              onCreateEditor={(view, state) => (viewRef.current = view)}
            />
            <br />
            <div className="text-center">
              <button
                type="button"
                className="btn btn-dark m-1"
                onClick={run}
                disabled={rt !== undefined}
              >
                Run
              </button>
              <button
                type="button"
                className="btn btn-primary m-1"
                onClick={next}
                disabled={rt === undefined || runtimeError !== "" || done}
              >
                {"Next"}
              </button>
              <button
                type="button"
                className="btn btn-primary m-1"
                onClick={() => {
                  for (let i = 0; i < 5; i++) next();
                }}
                disabled={rt === undefined || runtimeError !== "" || done}
              >
                {">>"}
              </button>
              <button
                type="button"
                className="btn btn-light m-1"
                onClick={() => window.location.reload()}
              >
                Reset
              </button>
            </div>
            {runtimeError !== "" && (
              <pre
                className="text-danger border border-danger p-2 my-3"
                style={{
                  whiteSpace: "pre-wrap",
                }}
              >
                <strong>Runtime Error</strong>
                <br />
                {runtimeError}
              </pre>
            )}
            {rt?.exitCode !== undefined && (
              <pre
                className="text-success border border-success p-2 my-3"
                style={{
                  whiteSpace: "pre-wrap",
                }}
              >
                Program exited with code <strong>{rt.exitCode}</strong>
              </pre>
            )}
          </div>
          <div className="col-8" id="canvas" style={{ position: "relative" }}>
            <div className="container-fluid">
              <div className="row g-2">
                <div className="col-5 viz">
                  <Agenda
                    agenda={rt?.agenda}
                    view={viewRef.current}
                    key={key}
                  />
                  <label className="text-center">Control</label>
                </div>
                <div className="col-2 viz">
                  <Stash stash={rt?.stash} />
                  <label className="text-center">Stash</label>
                </div>
                <div className="col-5 viz">
                  <ExternalDeclarations
                    declarations={rt?.externalDeclarations}
                    key={key}
                  />
                  <label className="text-center">External Declarations</label>
                </div>
                <div className="col-5 viz">
                  <Stack stack={rt?.symTable} />
                  <label className="text-center">Stack</label>
                </div>
                <div className="col-7 viz">
                  <div id="heap" className="border"></div>
                  <label className="text-center">Heap</label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <hr />
        <div className="row">
          <span
            className="text-center"
            style={{ paddingTop: "50px", paddingBottom: "25px" }}
          >
            <h4>Debugging Output</h4>
          </span>
          {timeTaken > 0 && <pre>Time elapsed: {timeTaken} ms</pre>}
          {error === "" && rt !== undefined && <JsonView src={rt} />}
          {error !== "" && (
            <pre
              className="text-danger border border-danger"
              style={{
                whiteSpace: "pre-wrap",
                padding: "10px",
              }}
            >
              {error}
            </pre>
          )}
        </div>
      </div>
      <br />
      <br />
    </>
  );
}

export default App;
