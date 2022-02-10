import { GeometryType } from "flatgeobuf/lib/mjs/generic";

const GeomTypes = {
  0: 'Unknown',
  1: 'Point',
  2: 'LineString',
  3: 'Polygon',
  4: 'MultiPoint',
  5: 'MultiLineString',
  6: 'MultiPolygon',
  7: 'GeometryCollection',
  8: 'CircularString',
  9: 'CompoundCurve',
  10: 'CurvePolygon',
  11: 'MultiCurve',
  12: 'MultiSurface',
  13: 'Curve',
  14: 'Surface',
  15: 'PolyhedralSurface',
  16: 'TIN',
  17: 'Triangle',
};

export function geomType(num: number): GeometryType {
  return GeomTypes[num];
}
