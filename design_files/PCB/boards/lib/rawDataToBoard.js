export function rawDataToBoard(rawData, ops = {}) {
  const mmPerUnit = ops.mmPerUnit ?? 1;
  const dedupeDrills = ops.dedupeDrills ?? true;

  const regions = [];
  rawData.regions.forEach((region) => {
    if (region.contour.length < 2) return;

    regions.push({
      contour: polylineToPath(region.contour, true),
      polarity: region.polarity,
      layers: region.layers,
    });
  });

  const traces = [];
  rawData.traces.forEach((trace) => {
    if (trace.track.length < 2) return;

    traces.push({
      track: polylineToPath(trace.track, false),
      diameter: trace.diameter,
      polarity: trace.polarity,
      layers: trace.layers,
    });
  });

  const drills = [];
  const seen = new Set();
  rawData.routes.forEach((route) => {
    const [x, y] = route.track[0];
    const key = `${x.toFixed(6)},${y.toFixed(6)},${route.diameter}`;
    if (dedupeDrills && seen.has(key)) return;
    seen.add(key);

    drills.push({
      track: polylineToPath(route.track, false),
      diameter: route.diameter,
      start: route.start,
      end: route.end,
      plated: route.plated,
    });
  });

  return {
    version: "0.2.0",
    footprints: [],
    components: [],
    traces,
    regions,
    drills,
    mmPerUnit,
  };
}

function polylineToPath(polyline, closed) {
  let pts = polyline;

  if (closed) {
    const [x0, y0] = pts[0];
    const [xn, yn] = pts.at(-1);
    if (x0 === xn && y0 === yn) pts = pts.slice(0, -1);
  }

  const path = pts.map(([x, y], i) => [i === 0 ? "start" : "lineTo", x, y]);
  if (closed) path.push(["close"]);

  return path;
}
