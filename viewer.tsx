import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { deserializeFiltered } from 'flatgeobuf/lib/mjs/generic/featurecollection';
import { Rect } from 'flatgeobuf/lib/mjs/packedrtree';
import { HttpReader } from 'flatgeobuf/lib/mjs/HttpReader';
import HeaderMeta from 'flatgeobuf/lib/mjs/HeaderMeta';
import { GeometryType } from 'flatgeobuf/lib/mjs/generic';
import { humanFileSize } from './bytes';
import mapboxgl from 'mapbox-gl';

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

function geomType(num: number): GeometryType {
  return GeomTypes[num];
}

function fmtBounds(bounds: mapboxgl.LngLatBounds): string {
  console.log('fmt bounds', JSON.stringify(bounds));
  return [bounds._sw.lng, bounds._sw.lat, bounds._ne.lng, bounds._ne.lat]
    .map((num) => num.toFixed(6))
    .join(',');
}

const emptyBounds = {
  _sw: { lng: 0, lat: 0 },
  _ne: { lng: 0, lat: 0 },
};
const mbToken =
  'pk.eyJ1Ijoid29yYWNlIiwiYSI6ImNremdhdjh0MDNwbngyd25mbTVwYmxpbGwifQ.uUKEsBJuZ_mMZCxbqkkkkA';

function fetchData(bounds: mapboxgl.LngLatBounds, client: HttpReader) {}

function indexSize(client: HttpReader): number {
  return client.lengthBeforeFeatures() - client.lengthBeforeTree();
}

const Viewer = (props: {
  url: string;
  header: HeaderMeta;
  client: HttpReader;
}) => {
  const mapEl = useRef(null);
  const [map, updateMap] = useState(null);
  const [bounds, updateBounds] = useState(emptyBounds);
  const [isMoving, updateIsMoving] = useState(true);

  useEffect(() => {
    mapboxgl.accessToken = mbToken;
    const map = new mapboxgl.Map({
      container: 'map', // container ID
      style: 'mapbox://styles/mapbox/streets-v11', // style URL
      center: [-74.5, 40], // starting position [lng, lat]
      hash: true,
      zoom: 9, // starting zoom
    });

    map.on('load', () => {
      console.log('mounted map', map);
      updateMap(map);
      updateBounds(map.getBounds());
      updateIsMoving(false);
    });

    map.on('movestart', () => {
      updateIsMoving(true);
    });

    map.on('moveend', () => {
      updateIsMoving(false);
      updateBounds(map.getBounds());
    });
  }, []);

  return (
    <div>
      <h1>View Url</h1>
      <h2>{props.url}</h2>
      <p>Num Features: {props.header.featuresCount}</p>
      <p>Geometry Type: {geomType(props.header.geometryType)}</p>
      <p>Header Size: {props.client.lengthBeforeTree()} bytes</p>
      <p>Index Size: {humanFileSize(indexSize(props.client))}</p>
      <p>Bounds: {fmtBounds(bounds)}</p>
      <p>
        <button disabled={isMoving} onClick={console.log}>
          Load Data
        </button>
      </p>
      <div
        id="map"
        style={{ height: '400px', width: '600px' }}
        ref={mapEl}
      ></div>
    </div>
  );
};

const url = new URLSearchParams(window.location.search).get('url');
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
    <Viewer url={url} header={reader.header} client={reader} />,
    document.getElementById('app')
  );
}

console.log('init...');
init(url);
