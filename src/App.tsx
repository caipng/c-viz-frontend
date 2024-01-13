import React from "react";
import "./App.css";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import JsonView from "react18-json-view";
import "react18-json-view/src/style.css";
import cviz from "c-viz";
import { Runtime } from "c-viz/lib/interpreter";
import { getErrorMessage } from "./utils";

function App() {
  const [code, setCode] = React.useState(`struct point {
  int x;
  float y;
  char * name;
} a, b;
  
int main() {
  double PI = 3.14;
  printf("Hello World");
  return 0;
}`);

  const onChange = React.useCallback(
    (val: React.SetStateAction<string>, viewUpdate: any) => {
      setCode(val);
    },
    [],
  );

  const [rt, setRt] = React.useState<undefined | Runtime>(undefined);
  const [error, setError] = React.useState("");
  const [timeTaken, setTimeTaken] = React.useState(0);
  const run = () => {
    const start = Date.now();
    try {
      const rt = cviz.run(code);
      setRt(rt);
      setTimeTaken(Date.now() - start);
      setError("");
      console.log(rt.staticNames);
    } catch (err) {
      setTimeTaken(Date.now() - start);
      setError(getErrorMessage(err));
    }
  };

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
              extensions={[cpp()]}
              onChange={onChange}
            />
            <br />
            <div className="text-center">
              <button type="button" className="btn btn-dark m-1" onClick={run}>
                Run
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => window.location.reload()}
              >
                Reset
              </button>
            </div>
          </div>
          <div className="col-8">
            <div className="container-fluid">
              <div className="row">
                <div className="col viz">
                  <div id="agenda" className="border"></div>
                  <label className="text-center">Agenda</label>
                </div>
                <div className="col viz">
                  <div id="stash" className="border"></div>
                  <label className="text-center">Stash</label>
                </div>
                <div className="col viz">
                  <div id="static-names" className="border"></div>
                  <label className="text-center">Static Names</label>
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
          {timeTaken > 0 && (<pre>Time elapsed: {timeTaken} ms</pre>)}
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
