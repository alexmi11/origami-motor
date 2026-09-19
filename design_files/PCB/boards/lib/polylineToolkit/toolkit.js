import { boolean } from "./boolean.js";
import { scale, rotate, translate } from "./affineTransformations.js";
import { resamplePolylines } from "./resamplePolylines.js";
import { bounds } from "./bounds.js";
import { offset } from "./offset.js";

function normalizeInput(arg) {
  if (
    Array.isArray(arg) &&
    arg.length > 0 &&
    Array.isArray(arg[0]) &&
    typeof arg[0][0] === "number" &&
    typeof arg[0][1] === "number"
  ) {
    return [arg];
  }

  return arg;
}

export const toolkit = {
  union: (polylines0, polylines1, ops = {}) =>
    boolean(
      normalizeInput(polylines0),
      normalizeInput(polylines1),
      "union",
      ops,
    ),
  intersection: (polylines0, polylines1, ops = {}) =>
    boolean(
      normalizeInput(polylines0),
      normalizeInput(polylines1),
      "intersection",
      ops,
    ),
  difference: (polylines0, polylines1, ops = {}) =>
    boolean(
      normalizeInput(polylines0),
      normalizeInput(polylines1),
      "difference",
      ops,
    ),
  xor: (polylines0, polylines1, ops = {}) =>
    boolean(normalizeInput(polylines0), normalizeInput(polylines1), "xor", ops),
  offset: (polylines, ...args) => offset(normalizeInput(polylines), ...args),
  outline: (polylines) =>
    offset(normalizeInput(polylines), 0, { endType: "closedPolygon" }),
  bounds: (polylines, ...args) => bounds(normalizeInput(polylines), ...args),
  scale: (polylines, ...args) => scale(normalizeInput(polylines), ...args),
  rotate: (polylines, ...args) => rotate(normalizeInput(polylines), ...args),
  translate: (polylines, ...args) =>
    translate(normalizeInput(polylines), ...args),
  originate(polylines) {
    const pls = normalizeInput(polylines);
    const cc = bounds(pls).cc;
    translate(pls, [0, 0], cc);
    return polylines;
  },
  resample: (polylines, ...args) =>
    resamplePolylines(normalizeInput(polylines), ...args),
  join() {
    const normalizedArgs = Array.from(arguments).map(normalizeInput);

    const [first, ...rest] = normalizedArgs;
    if (!first) return [];
    if (!rest || rest.length === 0) return first;

    rest.forEach((pls) => {
      if (pls) {
        pls.forEach((pl) => {
          first.push(pl);
        });
      }
    });

    return first;
  },
  copy: (obj) => JSON.parse(JSON.stringify(obj)),
};
