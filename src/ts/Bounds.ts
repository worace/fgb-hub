import { IGeoJsonFeature } from "flatgeobuf/lib/mjs/geojson/feature";
import { Rect } from "flatgeobuf/lib/mjs/packedrtree";
import mapboxgl, { LngLatBounds } from "mapbox-gl";

export default {
  toRect(bounds: LngLatBounds): Rect {
    return {
      minX: bounds.getWest(),
      minY: bounds.getSouth(),
      maxX: bounds.getEast(),
      maxY: bounds.getNorth(),
    };
  },
  toWkt(bounds: LngLatBounds): string {
    const points = [
      [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
      [bounds.getNorthWest().lng, bounds.getNorthWest().lat],
      [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
      [bounds.getSouthEast().lng, bounds.getSouthEast().lat],
      [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
    ];
    const pointsStr = points.map((p) => p.join(" ")).join(", ");
    return `POLYGON((${pointsStr}))`;
  },
  toGeoJSON(bounds: LngLatBounds): IGeoJsonFeature {
    const points = [
      [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
      [bounds.getNorthWest().lng, bounds.getNorthWest().lat],
      [bounds.getNorthEast().lng, bounds.getNorthEast().lat],
      [bounds.getSouthEast().lng, bounds.getSouthEast().lat],
      [bounds.getSouthWest().lng, bounds.getSouthWest().lat],
    ];

    return {
      type: "Feature",
      properties: {},
      geometry: { type: "Polygon", coordinates: [points] },
    };
  },
  emptyBounds: new LngLatBounds([0, 0, 0, 0]),
  fmtBounds(bounds: mapboxgl.LngLatBounds): string {
    console.log("fmt bounds", JSON.stringify(bounds));
    return [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ]
      .map((num) => num.toFixed(6))
      .join(",");
  },
};
