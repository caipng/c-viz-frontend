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
  const [runtimeError, setRuntimeError] = React.useState("");
  const [timeTaken, setTimeTaken] = React.useState(0);
  const [key, setKey] = React.useState(0);
  const run = () => {
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
        setRt(nextRt);
        setKey(key + 1);
      } catch (err) {
        console.error(err);
        setRuntimeError(getErrorMessage(err));
      }
    }
  };

  let viewRef = useRef<EditorView>();

  return (
    <>
      <div className="container text-center">
        <br />
        <h1>c-viz</h1>
        <br />
      </div>
      <div className="container-fluid" id="container">
        <div className="row" style={{ paddingBottom: "100px" }}>
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
                disabled={rt === undefined || runtimeError !== ""}
              >
                Next
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
          </div>
          <div className="col-8">
            <div className="container-fluid">
              <div className="row">
                <div className="col-4 viz">
                  <Agenda
                    agenda={rt?.agenda}
                    view={viewRef.current}
                    key={key}
                  />
                  <label className="text-center">Agenda</label>
                </div>
                <div className="col-4 viz">
                  <Stash stash={rt?.stash} />
                  <label className="text-center">Stash</label>
                </div>
                <div className="col-4 viz">
                  <ExternalDeclarations
                    declarations={rt?.externalDeclarations}
                    key={key}
                  />
                  <label className="text-center">External Declarations</label>
                </div>
              </div>
              <div className="row" style={{ marginTop: "30px" }}>
                <div className="col-5 viz">
                  <div id="stack" className="border"></div>
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
