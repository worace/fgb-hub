import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { deserialize } from 'flatgeobuf';
import { deserializeFiltered } from 'flatgeobuf/lib/mjs/generic/featurecollection';
import { Rect } from 'flatgeobuf/lib/mjs/packedrtree';
import { HttpReader } from 'flatgeobuf/lib/mjs/HttpReader';
import HeaderMeta from 'flatgeobuf/lib/mjs/HeaderMeta';
import { GeometryType } from 'flatgeobuf/lib/mjs/generic';
import L from 'leaflet';

const GeomTypes = {
  0: "Unknown",
  1: "Point",
  2: "LineString",
  3: "Polygon",
  4: "MultiPoint",
  5: "MultiLineString",
  6: "MultiPolygon",
  7: "GeometryCollection",
  8: "CircularString",
  9: "CompoundCurve",
  10: "CurvePolygon",
  11: "MultiCurve",
  12: "MultiSurface",
  13: "Curve",
  14: "Surface",
  15: "PolyhedralSurface",
  16: "TIN",
  17: "Triangle"
}

function geomType(num: number): GeometryType {
  return GeomTypes[num];
}

const Viewer = (props: { url: string, header: HeaderMeta }) => {
  const mapEl = useRef(null);
  const [map, updateMap] = useState(null);

  useEffect(() => {
    console.log('my effect', mapEl);
    const map = L.map(mapEl.current).setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    console.log('mounted map', map);
    updateMap(map);
  }, []);

  return (
    <div>
      <h1>View Url</h1>
      <h2>{props.url}</h2>
      <p>Num Features: {props.header.featuresCount}</p>
      <p>Geometry Type: {geomType(props.header.geometryType)}</p>
      <div id="map" style={{ height: '400px', width: '600px' }} ref={mapEl}>
      </div>
    </div>
  );
}

const url = new URLSearchParams(window.location.search).get("url");
if (url == null) {
  alert('Missing fgb url in ?url= query param');
}

const nullBB: Rect = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

/* deserializeFiltered(
 *   url,
 *   nullBB,
 *   (f) => f, (header) => console.log(header)
 * );
 *  */
async function init(url: string) {
  console.log('init', url);

  const reader = await HttpReader.open(url);
  console.log('reader', reader);

  console.log('header:', reader.header);
  ReactDOM.render(
    <Viewer url={url} header={reader.header} />, document.getElementById('app')
  );
}

console.log('init...');
init(url);