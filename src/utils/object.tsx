import { bytesToBigint } from "c-viz/lib/typing/representation";
import {
  ObjectTypeInfo,
  isStructure,
  getTypeName,
  isPointer,
  isArray,
  isSigned,
  isChar,
  isScalarType,
} from "c-viz/lib/typing/types";
import { ReactNode } from "react";
import { Endianness } from "c-viz/lib/config";
import { decimalAddressToHex, displayBytes } from "./utils";

export const visualizeObject = (
  t: ObjectTypeInfo,
  bytes: number[],
  endianness: Endianness,
  address: number,
): ReactNode => {
  if (isStructure(t)) {
    return (
      <>
        <em>{getTypeName(t)}</em>
        <div className="border border-primary">
          <table className="table m-0 align-middle table-sm">
            <tbody>
              {t.members.map((i, idx) => {
                const curr = address + i.relativeAddress;
                const pad =
                  (idx === t.members.length - 1
                    ? t.size
                    : t.members[idx + 1].relativeAddress) -
                  i.relativeAddress -
                  i.type.size;
                return (
                  <>
                    <tr key={2 * idx}>
                      <th scope="row">
                        .{i.name}
                        <br />
                        <em className="fw-normal" style={{ fontSize: 14 }}>
                          {getTypeName(i.type)}
                        </em>
                      </th>
                      <td className="w-100">
                        {visualizeObject(
                          i.type,
                          bytes.slice(
                            i.relativeAddress,
                            i.relativeAddress + i.type.size,
                          ),
                          endianness,
                          curr,
                        )}
                      </td>
                    </tr>
                    {pad > 0 ? (
                      <tr key={2 * idx + 1}>
                        <th scope="row">
                          <em className="fw-normal" style={{ fontSize: 14 }}>
                            padding
                          </em>
                        </th>
                        <td className="w-100">
                          <code style={{ fontSize: 12, marginRight: 5 }}>
                            0x{decimalAddressToHex(curr + i.type.size)}:
                          </code>
                          {Array(pad * 2)
                            .fill(0)
                            .map((_, i) => (
                              <span
                                key={i}
                                style={{
                                  display: "inline-block",
                                  marginRight: 2,
                                }}
                              >
                                <kbd>?</kbd>
                              </span>
                            ))}
                        </td>
                      </tr>
                    ) : (
                      <></>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  }
  if (isArray(t)) {
    return (
      <>
        <em>{getTypeName(t)}</em>
        <div className="border border-success">
          <table className="table m-0 table-sm">
            <tbody>
              {Array(t.length)
                .fill(0)
                .map((_, i) => (
                  <tr key={i}>
                    <th scope="row">[{i}]</th>
                    <td className="w-100">
                      {visualizeObject(
                        t.elementType,
                        bytes.slice(
                          i * t.elementType.size,
                          (i + 1) * t.elementType.size,
                        ),
                        endianness,
                        address + i * t.elementType.size,
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }
  if (!isScalarType(t)) return <></>;
  const s = displayBytes(bytes, "hex", "");
  return (
    <>
      <code style={{ fontSize: 12, marginRight: 5 }}>
        0x{decimalAddressToHex(address)}:
      </code>
      {Array(t.size * 2)
        .fill(0)
        .map((_, i) => (
          <span key={i} style={{ display: "inline-block", marginRight: 2 }}>
            <kbd>{s[i]}</kbd>
          </span>
        ))}
    </>
  );
};

export const drawUninitBytes = (address: number, size: number): ReactNode => {
  return Array(size)
    .fill(0)
    .map((_, i) => (
      <span
        className="border border-secondary"
        key={i}
        id={"0x" + decimalAddressToHex(address + i)}
        style={{ marginLeft: "1px" }}
      >
        ??
      </span>
    ));
};

export const drawObjectInline = (
  t: ObjectTypeInfo,
  bytes: number[],
  address: number,
  endianness: Endianness,
  prefix: string = "",
): ReactNode => {
  if (isStructure(t)) {
    return (
      <>
        {t.members.map((m, i) => {
          const nextAddr =
            i === t.members.length - 1
              ? t.size
              : t.members[i + 1].relativeAddress;
          const paddingAft = nextAddr - (m.relativeAddress + m.type.size);
          return (
            <span key={i}>
              {drawObjectInline(
                m.type,
                bytes.slice(m.relativeAddress, m.relativeAddress + m.type.size),
                address + m.relativeAddress,
                endianness,
                prefix + "." + m.name,
              )}
              {paddingAft > 0 && (
                <span style={{ display: "inline-block" }}>
                  <span style={{ marginRight: "1px" }}>
                    <em>pad</em>
                  </span>
                  {drawUninitBytes(
                    address + m.relativeAddress + m.type.size,
                    paddingAft,
                  )}
                  <div className="vr me-1"></div>
                </span>
              )}
            </span>
          );
        })}
      </>
    );
  }
  if (isArray(t)) {
    return (
      <>
        {Array(t.length)
          .fill(0)
          .map((_, i) => (
            <span key={i}>
              {drawObjectInline(
                t.elementType,
                bytes.slice(
                  i * t.elementType.size,
                  (i + 1) * t.elementType.size,
                ),
                address + i * t.elementType.size,
                endianness,
                prefix + "[" + i + "]",
              )}
            </span>
          ))}
      </>
    );
  }
  if (!isScalarType(t)) return <></>;
  const s = displayBytes(bytes, "hex", "");
  const val = displayValue(bytes, t, endianness);
  return (
    <span style={{ display: "inline-block" }}>
      <span
        className={isPointer(t) ? "ptr-from" : ""}
        data-address={isPointer(t) ? val : undefined}
        style={{ marginRight: "1px" }}
      >
        {prefix}
      </span>
      {Array(t.size)
        .fill(0)
        .map((_, i) => (
          <span
            className="border border-secondary"
            key={i}
            id={"0x" + decimalAddressToHex(address + i)}
            style={{ marginLeft: "1px" }}
          >
            {s.slice(i * 2, i * 2 + 2)}
          </span>
        ))}
      <div className="vr me-1"></div>
    </span>
  );
};

export const displayValue = (
  bytes: number[],
  t: ObjectTypeInfo,
  endianness: Endianness,
): string => {
  if (bytes.length !== t.size)
    throw new Error("number of bytes do not match type given");
  if (isScalarType(t)) {
    const n = bytesToBigint(bytes, isSigned(t), endianness);
    if (isChar(t)) return "'" + encodeURI(String.fromCharCode(Number(n))) + "'";
    if (isPointer(t)) {
      if (n === BigInt(0)) return "NULL";
      return "0x" + decimalAddressToHex(Number(n));
    }
    return n.toString();
  }
  if (isArray(t)) {
    const et = t.elementType;
    const res = [];
    for (let i = 0; i < t.size; i += et.size) {
      res.push(displayValue(bytes.slice(i, i + et.size), et, endianness));
    }
    return "[" + res.join(", ") + "]";
  }
  if (isStructure(t)) {
    const res = [];
    for (const i of t.members) {
      const b = bytes.slice(i.relativeAddress, i.relativeAddress + i.type.size);
      res.push(displayValue(b, i.type, endianness));
    }
    return (t.tag || "") + "{" + res.join(", ") + "}";
  }
  return "?";
};
