import { toolkit as tk } from "../lib/polylineToolkit/toolkit.js";
import { path } from "../lib/path.js";
import { rawDataToBoard } from "../lib/rawDataToBoard.js";

const rawData = {
  regions: [],
  traces: [],
  routes: [],
};

const tabHeightStator = 5;
const tabHeightRotor = 2;
const traceThickness = 3;
const drillSize = 0.75;
const rows = 2;
const dotSpacing = 3;
const angle = 57;

const cutN = 33; // rotor electrodes

const stator_sides = 8;
const rotor_sides = 10;
const extra_sides = 1;

makeRotor(37, 86, 30, rotor_sides + extra_sides);
makeStator(0, 0, 41, stator_sides + extra_sides);

export default rawDataToBoard(rawData);

function makeRotor(originX, originY, radius, sides) {
  const a = 2 * radius * Math.sin(Math.PI / (sides - extra_sides));
  const thetaKnotAngle = angle;
  const thetaKnotRads = (thetaKnotAngle / 180) * Math.PI;
  const thetaMax =
    Math.PI - (2 * Math.PI) / (sides - extra_sides) - thetaKnotRads;
  const height =
    radius * Math.sqrt(2 * (Math.cos(thetaKnotRads) - Math.cos(thetaMax)));

  const angleDegs = thetaKnotAngle;
  const angleRads = thetaKnotRads;
  const b = height / Math.sin(thetaKnotRads);

  const cols = sides;

  const outline = path(
    ["mt", originX, originY],
    ["lb", a * cols, 0],
    ["pb", angleDegs, b * rows],
    ["lb", -a * cols, 0],
    ["z"],
  );

  const copper = [];

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const t0 = tile({
        a,
        b,
        angleDegs,
        originX: originX + i * a + j * (height / Math.tan(angleRads)),
        originY: originY + j * height,
      });

      copper.push(
        rectangleAlongSegment(...t0.side34, traceThickness, "bottom", 100),
        rectangleAlongSegment(...t0.side12, traceThickness, "bottom", 100),
      );

      tk.resample(t0.side12, dotSpacing);
      t0.side12.forEach((pt) => {
        if (i === cols - 1) addDrill(...pt);
      });

      tk.resample(t0.side23, dotSpacing);
      t0.side23.forEach((pt) => {
        addDrill(...pt);
      });

      tk.resample(t0.side34, dotSpacing);
      t0.side34.forEach((pt) => {
        addDrill(...pt);
      });

      tk.resample(t0.side02, dotSpacing);
      t0.side02.forEach((pt) => {
        addDrill(...pt);
      });

      if (j !== 0) continue;
      tk.resample(t0.side01, dotSpacing);
      t0.side01.forEach((pt) => {
        addDrill(...pt);
      });
    }
  }

  tk.outline(copper);
  tk.intersection(copper, outline);

  const electrodeCuts = [];

  const step = (height * rows) / cutN;
  for (let i = 1; i < cutN; i++) {
    const electrodeCut = rectangleAlongSegment(
      [originX - 10, originY + step * i],
      [originX + a * cols * 2, originY + step * i],
      1,
    );

    electrodeCuts.push(electrodeCut);
  }

  tk.difference(copper, electrodeCuts);

  copper.forEach((rect) => {
    const bbox = tk.bounds(rect);
    rawData.traces.push({
      track: [bbox.lc, bbox.rc],
      diameter: 1,
      layers: ["F.Cu"],
      polarity: "+",
    });
  });

  for (let i = 0; i < cols; i++) {
    const bottomTab = path(
      ["mt", originX + i * a, originY + 0.01],
      ["lb", a, 0],
      ["lb", -a * 0.1, -tabHeightRotor],
      ["lb", -a * 0.7, 0],
      ["z"],
    );

    tk.union(outline, bottomTab);

    const topTab = path(
      [
        "mt",
        originX + i * a + (height * rows) / Math.tan(angleRads),
        originY + height * rows - 0.01,
      ],
      ["lb", a, 0],
      ["lb", -a * 0.1, tabHeightRotor],
      ["lb", -a * 0.7, 0],
      ["z"],
    );

    tk.union(outline, topTab);
  }

  addPolylinesToRegion(outline, ["outline"]);
  addPolylinesToRegion(outline, ["F.Mask"]);
  addPolylinesToRegion(outline, ["B.Mask"]);
}

function makeStator(originX, originY, radius, sides) {
  const a = 2 * radius * Math.sin(Math.PI / (sides - extra_sides));
  const thetaKnotAngle = angle;
  const thetaKnotRads = (thetaKnotAngle / 180) * Math.PI;
  const thetaMax =
    Math.PI - (2 * Math.PI) / (sides - extra_sides) - thetaKnotRads;
  const height =
    radius * Math.sqrt(2 * (Math.cos(thetaKnotRads) - Math.cos(thetaMax)));

  const angleDegs = thetaKnotAngle;
  const angleRads = thetaKnotRads;
  const b = height / Math.sin(thetaKnotRads);

  const cols = sides;

  const outline = path(
    ["mt", originX, originY],
    ["lb", a * cols, 0],
    ["pb", angleDegs, b * rows],
    ["lb", -a * cols, 0],
    ["z"],
  );

  const copper = [];

  const copper_tabs_only = [];

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      const t0 = tile({
        a,
        b,
        angleDegs,
        originX: originX + i * a + j * (height / Math.tan(angleRads)),
        originY: originY + j * height,
      });

      copper.push(
        rectangleAlongSegment(...t0.side02, traceThickness, "top", 100),
      );

      tk.resample(t0.side12, dotSpacing);
      t0.side12.forEach((pt) => {
        if (i === cols - 1) addDrill(...pt);
      });

      tk.resample(t0.side23, dotSpacing);
      t0.side23.forEach((pt) => {
        addDrill(...pt);
      });

      tk.resample(t0.side34, dotSpacing);
      t0.side34.forEach((pt) => {
        addDrill(...pt);
      });

      tk.resample(t0.side02, dotSpacing);
      t0.side02.forEach((pt) => {
        addDrill(...pt);
      });

      if (j !== 0) continue;

      tk.resample(t0.side01, dotSpacing);
      t0.side01.forEach((pt) => {
        addDrill(...pt);
      });
    }
  }

  tk.outline(copper);
  tk.intersection(copper, outline);

  for (let i = 0; i < cols; i++) {
    const bottomTab = path(
      ["mt", originX + i * a, originY + 0.01],
      ["lb", a, 0],
      ["lb", -a * 0.1, -tabHeightStator],
      ["lb", -a * 0.7, 0],
      ["z"],
    );

    tk.union(outline, bottomTab);

    const copperAttachPad = path(
      ["mt", originX + i * a, originY + 0.01],
      ["lb", a * 0.35, 0],
      ["lb", 0, -tabHeightStator],
      ["lb", -a * 0.4, 0],
    );

    tk.intersection(copperAttachPad, bottomTab);
    tk.union(copper, copperAttachPad);

    tk.intersection(copperAttachPad, bottomTab);
    tk.union(copper_tabs_only, copperAttachPad);

    const topTab = path(
      [
        "mt",
        originX + i * a + (height * rows) / Math.tan(angleRads),
        height * rows - 0.01,
      ],
      ["lb", a, 0],
      ["lb", -a * 0.1, tabHeightStator],
      ["lb", -a * 0.7, 0],
      ["z"],
    );

    tk.union(outline, topTab);

    const copperAttachPadTop = path(
      [
        "mt",
        originX + i * a + (height * rows) / Math.tan(angleRads),
        height * rows - 0.01,
      ],
      ["lb", a * 0.35, 0],
      ["lb", 0, tabHeightStator],
      ["lb", -a * 0.4, 0],
    );

    tk.intersection(copperAttachPadTop, topTab);
    tk.union(copper, copperAttachPadTop);

    tk.intersection(copperAttachPadTop, topTab);
    tk.union(copper_tabs_only, copperAttachPadTop);

    addVia(originX + i * a + a / 4, originY - tabHeightStator / 2, 1.5);

    addVia(
      originX + i * a + (height * rows) / Math.tan(angleRads) + a / 4,
      height * rows + tabHeightStator / 2,
      1.5,
    );
  }

  addPolylinesToRegion(outline, ["outline"]);
  addPolylinesToRegion(copper_tabs_only, ["F.Cu"]);
  addPolylinesToRegion(copper, ["B.Cu"]);
  addPolylinesToRegion(outline, ["F.Mask"]);
  addPolylinesToRegion(outline, ["B.Mask"]);
}

function tile({ a, b, angleDegs, originX, originY }) {
  const angleRads = (angleDegs / 180) * Math.PI;

  const height = Math.sin(Math.PI - angleRads) * b;

  const outline = path(
    ["mt", originX, originY],
    ["lb", a, 0],
    ["pb", angleDegs, b],
    ["lb", -a, 0],
    ["z"],
  );

  const getSide = (i, j) => [[...outline[0][i]], [...outline[0][j]]];

  return {
    outline,
    side01: getSide(0, 1),
    side12: getSide(1, 2),
    side23: getSide(2, 3),
    side34: getSide(3, 4),
    side02: getSide(0, 2),
  };
}

function addVia(x, y, radius) {
  rawData.regions.push({
    contour: circlePolyline(x, y, radius * 0.75),
    layers: ["F.Cu"],
    polarity: "+",
  });

  rawData.routes.push({
    track: [[x, y]],
    diameter: radius,
    start: "F.Cu",
    end: "B.Cu",
    plated: true,
  });
}

function addDrill(x, y) {
  rawData.routes.push({
    track: [[x, y]],
    diameter: drillSize,
    start: "F.Cu",
    end: "B.Cu",
    plated: false,
  });
}

function addPolylinesToRegion(pls, layers, polarity = "+") {
  return pls.map((pl) => addPolylineToRegion(pl, layers, polarity));
}

function addPolylineToRegion(pl, layers, polarity = "+") {
  rawData.regions.push({
    contour: pl,
    layers,
    polarity,
  });
}

function circlePolyline(cx, cy, radius) {
  const samples = 32;

  const pts = [];

  for (let i = 0; i <= samples; i++) {
    const angle = ((2 * Math.PI) / samples) * i;
    const x = Math.cos(angle) * radius + cx;
    const y = Math.sin(angle) * radius + cy;
    pts.push([x, y]);
  }

  return pts;
}

function rectangleAlongSegment(p0, p1, width, align = "center", extension = 0) {
  const [x0, y0] = p0;
  const [x1, y1] = p1;
  const dx = x1 - x0,
    dy = y1 - y0;
  const len = Math.hypot(dx, dy);
  if (len === 0) throw new Error("p0 and p1 must be distinct");

  const dirX = dx / len;
  const dirY = dy / len;

  let startExt, endExt;
  if (Array.isArray(extension)) {
    [startExt = 0, endExt = 0] = extension;
  } else {
    startExt = endExt = extension;
  }

  const x0e = x0 - dirX * startExt;
  const y0e = y0 - dirY * startExt;
  const x1e = x1 + dirX * endExt;
  const y1e = y1 + dirY * endExt;

  const extDx = x1e - x0e,
    extDy = y1e - y0e;
  const extLen = Math.hypot(extDx, extDy);
  const ux = -extDy / extLen;
  const uy = extDx / extLen;

  const half = width / 2;
  const map = {
    top: -1,
    center: 0,
    bottom: 1,
  };
  const sf = map[align] ?? 0;
  const sx = ux * half * sf;
  const sy = uy * half * sf;
  const ox = ux * half;
  const oy = uy * half;

  return [
    [x0e + ox + sx, y0e + oy + sy],
    [x1e + ox + sx, y1e + oy + sy],
    [x1e - ox + sx, y1e - oy + sy],
    [x0e - ox + sx, y0e - oy + sy],
    [x0e + ox + sx, y0e + oy + sy],
  ];
}
