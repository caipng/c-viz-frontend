import React, { useEffect, useRef } from "react";
import "./App.css";
import CodeMirror, { EditorView } from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import Agenda from "./viz/Agenda";
import "react18-json-view/src/style.css";
import cviz from "c-viz";
import { getErrorMessage, markField, randomColor } from "./utils/utils";
import TextAndData from "./viz/TextAndData";
import Stash from "./viz/Stash";
import {
  BezierConnector,
  StraightConnector,
  BrowserJsPlumbInstance,
  newInstance,
  JsPlumbListManager,
  DotEndpoint,
  AnchorSpec,
  Connection,
} from "@jsplumb/browser-ui";
import Stack from "./viz/Stack";
import Box from "@mui/material/Box";
import { MySlider } from "./utils/MySlider";
import SliderLabel from "./utils/SliderLabel";
import { Runtime, RuntimeView } from "c-viz/lib/interpreter/runtime";
import { isInstruction } from "c-viz/lib/interpreter/agenda";
import { isCallInstruction } from "c-viz/lib/interpreter/instructions";
import { Endianness } from "c-viz/lib/config";
import { displayValue } from "./utils/object";
import {
  isFunctionDesignator,
  isTemporaryObject,
} from "c-viz/lib/interpreter/stash";
import { bytesToBigint } from "c-viz/lib/typing/representation";
import { isScalarType, isSigned } from "c-viz/lib/typing/types";
import Heap from "./viz/Heap";
import "animate.css";
import { Popover } from "bootstrap";
import { Buffer } from "buffer";
import ReactDOMServer from "react-dom/server";

const SAMPLES_DIR = "samples/";
const samples: string[] = [
  "assign.c",
  "blocks.c",
  "heap.c",
  "strict-aliasing.c",
  "struct.c",
  "uninit.c",
];

export const EndiannessContext = React.createContext<Endianness>("little");

export const RuntimeViewContext = React.createContext<RuntimeView | null>(null);

export type BytesDisplayOption = "hex" | "binary";

export const BytesDisplayContext =
  React.createContext<BytesDisplayOption>("hex");

const STEPS_LIMIT = 1000;

interface Mark {
  value: number;
  label: any;
}

async function drawReturnArrows(
  elem: Element,
  instance: BrowserJsPlumbInstance,
) {
  const markIdx = (elem as HTMLElement).dataset.mark;
  const to = document.querySelector(".mark-" + markIdx);
  // if (!to || !(await isVisible(to)) || !(await isVisible(elem))) return;
  if (!to) return;
  instance.connect({
    source: elem,
    target: to,
    connector: {
      type: BezierConnector.type,
      options: { curviness: 10 },
    },
    anchor: "Left",
    endpoint: { type: DotEndpoint.type, options: { radius: 3 } },
    overlays: [
      {
        type: "Arrow",
        options: { location: 0.5, width: 8, length: 5 },
      },
    ],
  });
}

function drawPtrArrow(
  instance: BrowserJsPlumbInstance,
  from: Element,
  to: Element,
) {
  let toAnchor: AnchorSpec;
  if (to.classList.contains("list-group-item"))
    toAnchor = [
      [0.05, 0.5, -1, 0],
      [0.95, 0.5, 1, 0],
    ];
  else toAnchor = { type: "Perimeter", options: { shape: "Rectangle" } };
  instance.connect({
    source: from,
    target: to,
    connector: StraightConnector.type,
    //{
    //type: BezierConnector.type,
    //options: { curviness: 30 },
    //},
    anchors: ["Center", toAnchor],
    endpoints: [{ type: DotEndpoint.type, options: { radius: 3 } }, "Blank"],
    overlays: [
      { type: "Arrow", options: { location: 1, width: 16, length: 10 } },
    ],
  });
}

function onIdxChange(
  instance: BrowserJsPlumbInstance | undefined,
  observer: IntersectionObserver | undefined,
) {
  const canvas = document.getElementById("canvas");
  if (!canvas || !instance || !observer) return;

  instance.select().each((i) => {
    if (document.body.contains(i.source) && document.body.contains(i.target)) {
      if (
        i.source.classList.contains("list-group") &&
        i.target.classList.contains("list-group")
      )
        instance.deleteConnection(i);
    } else {
      instance.deleteConnection(i);
    }
  });

  canvas.querySelectorAll(".ptr-from").forEach((elem) => {
    const addr = (elem as HTMLElement).dataset.address;
    if (addr === "NULL") return;
    const to = document.getElementById("" + addr);
    if (!to) {
      elem.closest(".list-group-item")?.classList.add("list-group-item-danger");
      return;
    }
    elem
      .closest(".list-group-item")
      ?.classList.remove("list-group-item-danger");

    if (instance.getConnections({ source: elem, target: to }).length) return;
    (instance.getConnections({ source: elem }) as Connection<any>[]).forEach(
      (i) => instance.deleteConnection(i),
    );

    let wg = 0;
    const p1 = elem.closest(".animate__animated");
    const p2 = to.closest(".animate__animated");
    if (p1) {
      wg++;
      p1.addEventListener("animationend", (e) => {
        p1.classList.remove("animate__animated");
        wg--;
        if (!wg) drawPtrArrow(instance, elem, to);
      });
    }
    if (p2) {
      wg++;
      p2.addEventListener("animationend", (e) => {
        p2.classList.remove("animate__animated");
        wg--;
        if (!wg) drawPtrArrow(instance, elem, to);
      });
    }

    if (!wg) drawPtrArrow(instance, elem, to);
  });

  document.querySelectorAll(".animate__animated").forEach((i) =>
    i.addEventListener("animationend", (e) => {
      i.classList.remove("animate__animated");
    }),
  );

  document.querySelectorAll(".return-inst").forEach((i) => {
    // if (isScrolledIntoView(i)) drawReturnArrows(i, instance);
    observer.observe(i);
  });
  document.querySelectorAll(".mark-inst").forEach((i) => observer.observe(i));

  canvas.querySelectorAll(".last-item").forEach((elem) =>
    elem.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    }),
  );

  instance.repaintEverything();
}

function onScroll(
  entry: IntersectionObserverEntry,
  instance: BrowserJsPlumbInstance | undefined,
) {
  if (!instance) return;
  if (!entry.isIntersecting)
    return instance.deleteConnectionsForElement(entry.target);
  if (entry.target.classList.contains("mark-inst")) return;

  drawReturnArrows(entry.target, instance);
}

function App() {
  const [code, setCode] = React.useState("");
  const [rts, setRts] = React.useState<RuntimeView[]>([]);
  const [marks, setMarks] = React.useState<Mark[]>([]);
  const [idx, setIdx] = React.useState<number | undefined>(undefined);
  const [error, setError] = React.useState("");
  const [exitCode, setExitCode] = React.useState<undefined | number>(undefined);
  const [timeTaken, setTimeTaken] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [randColors, setRandColors] = React.useState<string[]>([]);
  const [endianness, setEndianness] = React.useState<Endianness>("little");
  const [bytesDisplay, setBytesDisplay] =
    React.useState<BytesDisplayOption>("hex");
  const [sample, setSample] = React.useState("");
  const popoverRef = useRef(null);

  const onChange = React.useCallback((val: React.SetStateAction<string>) => {
    setCode(val);
  }, []);

  const run = () => {
    const rts: RuntimeView[] = [];
    const marks: Mark[] = [];
    let rt: Runtime | undefined;

    setRts(rts);
    setMarks(marks);
    setIdx(undefined);
    setError("");
    setExitCode(undefined);
    setTimeTaken(0);
    setLoading(true);

    const colors = [];
    for (let i = 0; i < 100; i++) colors.push(randomColor());
    setRandColors(colors);

    const start = Date.now();
    try {
      rt = cviz.run(code, { endianness });
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
        let fnName = "";
        if (isTemporaryObject(arr[0]) && isScalarType(arr[0].typeInfo))
          fnName = rt.symbolTable.getIdentifier(
            Number(
              bytesToBigint(
                arr[0].bytes,
                isSigned(arr[0].typeInfo),
                rt.config.endianness,
              ),
            ),
          );
        let t = fnName + "(";
        for (let j = 0; j < n; j++) {
          const o = arr[j + 1];
          const tt = isFunctionDesignator(o)
            ? "[function]"
            : displayValue(o.bytes, o.typeInfo, endianness);
          t += tt + (j === n - 1 ? "" : ", ");
        }
        t += ")";
        marks.push({
          value: i,
          label: <SliderLabel tooltip={t} />,
        });
      }
      try {
        rt.next();
      } catch (err) {
        console.error(err);
        setTimeTaken(Date.now() - start);
        setError(getErrorMessage(err));
        setIdx(rts.length - 1);
        setLoading(false);
        return;
      }
      const v = new RuntimeView(rt);
      rts.push(v);
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

  const encode = (code: string) =>
    encodeURIComponent(Buffer.from(code).toString("base64"));

  const getCodeFromURL = (): string => {
    const url = new URL(window.location.href);
    const base64url = url.searchParams.get("code");
    if (!base64url) return "";
    return Buffer.from(decodeURIComponent(base64url), "base64").toString();
  };

  let viewRef = useRef<EditorView>();
  let instance = useRef<BrowserJsPlumbInstance>();
  let listManager = useRef<JsPlumbListManager>();
  let observer = useRef<IntersectionObserver>();
  let p = useRef<Popover>();

  useEffect(() => {
    setCode(getCodeFromURL());

    if (popoverRef.current)
      p.current = new Popover(popoverRef.current, {
        placement: "top",
        html: true,
        content: "",
        title: "Permanent link",
        sanitize: false,
        trigger: "click",
      });

    const canvas = document.getElementById("canvas");
    if (!canvas) throw new Error("canvas not found");

    instance.current = newInstance({
      container: canvas,
      elementsDraggable: false,
    });
    listManager.current = new JsPlumbListManager(instance.current);

    const textAndDataList = document.getElementById("text-and-data-list");
    if (textAndDataList)
      listManager.current.addList(textAndDataList, {
        endpoint: { type: "Dot", options: { cssClass: "red-endpoint" } },
      });

    const stashList = document.getElementById("stash-list");
    if (stashList)
      listManager.current.addList(stashList, {
        endpoint: { type: "Dot", options: { cssClass: "red-endpoint" } },
      });

    const stackList = document.getElementById("stack-list");
    if (stackList)
      listManager.current.addList(stackList, {
        endpoint: { type: "Dot", options: { cssClass: "red-endpoint" } },
      });

    const agendaList = document.getElementById("agenda-list");
    // if (agendaList)
    //   listManager.current.addList(agendaList, {
    //     endpoint: { type: "Dot", options: { cssClass: "red-endpoint" } },
    //   });
    agendaList?.addEventListener("scroll", () => {
      instance.current?.repaintEverything();
    });

    const heapList = document.getElementById("heap-list");
    if (heapList)
      listManager.current.addList(heapList, {
        endpoint: { type: "Dot", options: { cssClass: "red-endpoint" } },
      });

    observer.current = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => onScroll(entry, instance.current)),
      {
        root: null,
        threshold: 0,
      },
    );
  }, []);

  useEffect(() => onIdxChange(instance.current, observer.current), [idx]);

  useEffect(() => {
    if (!samples.includes(sample)) return;
    fetch(SAMPLES_DIR + sample)
      .then((r) => r.text())
      .then((t) => setCode(t));
  }, [sample]);

  useEffect(() => {
    if (!p.current) return;
    const url = window.location.origin + "?code=" + encode(code);
    const content = ReactDOMServer.renderToString(
      <div className="input-group" style={{ width: 500 }}>
        <button
          className="btn btn-outline-secondary copy-code-btn"
          type="button"
          disabled
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            className="bi bi-copy"
            viewBox="0 0 16 16"
          >
            <path
              fill-rule="evenodd"
              d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
            />
          </svg>
        </button>
        <input type="text" className="form-control" value={url} readOnly />
      </div>,
    );
    p.current.setContent({
      ".popover-body": content,
      ".popover-header": "Permanent Link",
    });
  }, [code]);

  return (
    <>
      <div className="container text-center">
        <br />
        <h1 className="display-1">
          <img src="c-logo.png" alt="C" height="80px" />
          <small className="ms-1 text-body-secondary">viz</small>
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
                  onChange={(event: Event, newValue: number | number[]) => {
                    instance.current?.select().deleteAll();
                    setIdx(newValue as number);
                  }}
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
              onCreateEditor={(view, state) => (viewRef.current = view)}
            />
            <br />
            <div className="container text-center my-1 mb-5">
              <div className="row row-cols-auto justify-content-center">
                <div className="col px-1">
                  <button type="button" className="btn btn-dark" onClick={run}>
                    Run
                  </button>
                </div>
                <div className="col px-1">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => window.location.reload()}
                  >
                    Reset
                  </button>
                </div>
                <div className="col px-1 align-self-center">
                  <div className="input-group" style={{ width: 250 }}>
                    <label className="input-group-text" htmlFor="sample-select">
                      Sample
                    </label>
                    <select
                      className="form-select"
                      id="sample-select"
                      value={sample}
                      onChange={(e) => setSample(e.target.value)}
                    >
                      <option value="">Choose..</option>
                      {samples.map((file) => (
                        <option value={file} key={file}>
                          {file}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col px-1 align-self-center">
                  <button
                    className="btn btn-light"
                    type="button"
                    ref={popoverRef}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-link-45deg mx-1"
                      viewBox="0 0 16 16"
                    >
                      <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1 1 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4 4 0 0 1-.128-1.287z" />
                      <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243z" />
                    </svg>
                    Link
                  </button>
                </div>
              </div>
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
            <div className="container mt-4">
              <h6>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  className="bi bi-gear-wide-connected me-2"
                  viewBox="0 0 16 16"
                >
                  <path d="M7.068.727c.243-.97 1.62-.97 1.864 0l.071.286a.96.96 0 0 0 1.622.434l.205-.211c.695-.719 1.888-.03 1.613.931l-.08.284a.96.96 0 0 0 1.187 1.187l.283-.081c.96-.275 1.65.918.931 1.613l-.211.205a.96.96 0 0 0 .434 1.622l.286.071c.97.243.97 1.62 0 1.864l-.286.071a.96.96 0 0 0-.434 1.622l.211.205c.719.695.03 1.888-.931 1.613l-.284-.08a.96.96 0 0 0-1.187 1.187l.081.283c.275.96-.918 1.65-1.613.931l-.205-.211a.96.96 0 0 0-1.622.434l-.071.286c-.243.97-1.62.97-1.864 0l-.071-.286a.96.96 0 0 0-1.622-.434l-.205.211c-.695.719-1.888.03-1.613-.931l.08-.284a.96.96 0 0 0-1.186-1.187l-.284.081c-.96.275-1.65-.918-.931-1.613l.211-.205a.96.96 0 0 0-.434-1.622l-.286-.071c-.97-.243-.97-1.62 0-1.864l.286-.071a.96.96 0 0 0 .434-1.622l-.211-.205c-.719-.695-.03-1.888.931-1.613l.284.08a.96.96 0 0 0 1.187-1.186l-.081-.284c-.275-.96.918-1.65 1.613-.931l.205.211a.96.96 0 0 0 1.622-.434zM12.973 8.5H8.25l-2.834 3.779A4.998 4.998 0 0 0 12.973 8.5m0-1a4.998 4.998 0 0 0-7.557-3.779l2.834 3.78zM5.048 3.967l-.087.065zm-.431.355A4.98 4.98 0 0 0 3.002 8c0 1.455.622 2.765 1.615 3.678L7.375 8zm.344 7.646.087.065z" />
                </svg>
                Settings
              </h6>
              <hr />
              <div className="row row-cols-auto">
                <div className="col">
                  <div className="form-floating" style={{ width: 150 }}>
                    <select
                      className="form-select"
                      id="endiannessSelect"
                      onChange={(e) => {
                        setIdx(undefined);
                        setEndianness(e.target.value as Endianness);
                      }}
                      value={endianness}
                    >
                      <option value="little">Little</option>
                      <option value="big">Big</option>
                    </select>
                    <label htmlFor="endiannessSelect">Endianness</label>
                  </div>
                </div>
                <div className="col">
                  <div className="form-floating" style={{ width: 150 }}>
                    <select
                      className="form-select"
                      id="bytesDisplaySelect"
                      onChange={(e) =>
                        setBytesDisplay(e.target.value as BytesDisplayOption)
                      }
                      value={bytesDisplay}
                    >
                      <option value="hex">Hexadecimal</option>
                      <option value="binary">Binary</option>
                    </select>
                    <label htmlFor="bytesDisplaySelect">Bytes Display</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <RuntimeViewContext.Provider
            value={idx === undefined ? null : rts[idx]}
          >
            <EndiannessContext.Provider value={endianness}>
              <BytesDisplayContext.Provider value={bytesDisplay}>
                <div
                  className="col-8"
                  id="canvas"
                  style={{ position: "relative" }}
                >
                  <div className="container-fluid">
                    <div className="row g-2">
                      <div className="col-4 viz">
                        <Agenda
                          agenda={
                            idx === undefined ? undefined : rts[idx].agenda
                          }
                          lvalueFlags={
                            idx === undefined ? undefined : rts[idx].lvalueFlags
                          }
                          view={viewRef.current}
                          colors={randColors}
                        />
                      </div>
                      <div className="col-3 viz">
                        <Stash
                          stash={idx === undefined ? undefined : rts[idx].stash}
                        />
                      </div>
                      <div className="col-5 viz">
                        <TextAndData
                          textAndData={
                            idx === undefined ? undefined : rts[idx].textAndData
                          }
                        />
                      </div>
                      <div className="col-6 viz">
                        <Stack
                          stack={idx === undefined ? undefined : rts[idx].stack}
                          colors={randColors}
                        />
                      </div>
                      <div className="col-6 viz">
                        <Heap
                          heap={idx === undefined ? undefined : rts[idx].heap}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </BytesDisplayContext.Provider>
            </EndiannessContext.Provider>
          </RuntimeViewContext.Provider>
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
