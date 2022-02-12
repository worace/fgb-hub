import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { deserializeFiltered } from "flatgeobuf/lib/mjs/generic/featurecollection";
import { Rect } from "flatgeobuf/lib/mjs/packedrtree";
import { HttpReader } from "flatgeobuf/lib/mjs/HttpReader";
import HeaderMeta from "flatgeobuf/lib/mjs/HeaderMeta";
import { GeometryType } from "flatgeobuf/lib/mjs/generic";
import { humanFileSize } from "./bytes";
import { geomType } from "./GeomType";
import Bounds from "./Bounds";
import mapboxgl, {
  GeoJSONSource,
  LngLatBounds,
  MapboxGeoJSONFeature,
} from "mapbox-gl";
import { Feature } from "flatgeobuf/lib/mjs/flat-geobuf/feature";
import {
  fromFeature,
  IGeoJsonFeature,
} from "flatgeobuf/lib/mjs/geojson/feature";
import firebase from "./firebase";
import { App } from "./AppContext";

function fmtBounds(bounds: mapboxgl.LngLatBounds): string {
  console.log("fmt bounds", JSON.stringify(bounds));
  return [
    bounds.getWest(),
    bounds.getSouth(),
    bounds.getEast(),
    bounds.getNorth(),
  ]
    .map((num) => num.toFixed(6))
    .join(",");
}

const mbToken =
  "pk.eyJ1Ijoid29yYWNlIiwiYSI6ImNremdhdjh0MDNwbngyd25mbTVwYmxpbGwifQ.uUKEsBJuZ_mMZCxbqkkkkA";

function fetchData(bounds: mapboxgl.LngLatBounds, client: HttpReader) {}

function indexSize(client: HttpReader): number {
  return client.lengthBeforeFeatures() - client.lengthBeforeTree();
}

const BoundsDisplay = (bounds: LngLatBounds) => (
  <div>
    <p>Bounds: {fmtBounds(bounds)}</p>
    <pre>{Bounds.toWkt(bounds)}</pre>
  </div>
);

const Viewer = (props: {
  url: string;
  header: HeaderMeta;
  client: HttpReader;
}) => {
  const mapEl = useRef(null);
  const [map, updateMap] = useState<mapboxgl.Map>(null);
  const [loadedFeatures, updateLoadedFeatures] = useState<number>(0);
  const [bounds, updateBounds] = useState<mapboxgl.LngLatBounds>(
    Bounds.emptyBounds
  );
  const [isLoading, updateIsLoading] = useState<boolean>(true);

  useEffect(() => {
    mapboxgl.accessToken = mbToken;
    const map = new mapboxgl.Map({
      container: "map", // container ID
      style: "mapbox://styles/mapbox/streets-v11", // style URL
      center: [-74.5, 40], // starting position [lng, lat]
      hash: true,
      zoom: 9, // starting zoom
    });

    map.on("load", () => {
      console.log("mounted map", map);
      map.addSource("features", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "features-fill",
        type: "fill",
        source: "features", // reference the data source
        layout: {},
        paint: {
          "fill-color": "#0080ff", // blue color fill
          "fill-opacity": 0.5,
        },
      });

      updateMap(map);
      updateBounds(map.getBounds());
      updateIsLoading(false);
    });

    map.on("movestart", () => {
      updateIsLoading(true);
    });

    map.on("moveend", () => {
      updateIsLoading(false);
      updateBounds(map.getBounds());
    });
  }, []);

  const fetchData = async () => {
    updateIsLoading(true);
    console.log("fetch data", bounds, Bounds.toRect(bounds));
    const features: IGeoJsonFeature[] = [];
    const start = new Date().getTime();
    for await (const feature of props.client.selectBbox(
      Bounds.toRect(bounds)
    )) {
      features.push(fromFeature(feature, props.client.header));
    }
    const fc = {
      type: "FeatureCollection",
      features: features as any[],
    };
    (map.getSource("features") as GeoJSONSource).setData(fc as any);
    console.log(
      "finished loading num features:",
      features.length,
      new Date().getTime() - start
    );
    updateLoadedFeatures(features.length);
    updateIsLoading(false);
  };

  return (
    <div>
      <h1>View Url</h1>
      <h2>{props.url}</h2>
      <p>Num Features: {props.header.featuresCount}</p>
      <p>Currently loaded features: {loadedFeatures}</p>
      <p>Geometry Type: {geomType(props.header.geometryType)}</p>
      <p>Header Size: {props.client.lengthBeforeTree()} bytes</p>
      <p>Index Size: {humanFileSize(indexSize(props.client))}</p>
      {BoundsDisplay(bounds)}
      <p>
        <button disabled={isLoading} onClick={fetchData}>
          Load Data
        </button>
      </p>
      <div
        id="map"
        style={{ height: "600px", width: "800px" }}
        ref={mapEl}
      ></div>
    </div>
  );
};

const url = new URLSearchParams(window.location.search).get("url");
if (url == null) {
  alert("Missing fgb url in ?url= query param");
}

const nullBB: Rect = { minX: 0, minY: 0, maxX: 0, maxY: 0 };

async function init(url: string) {
  const fb = firebase.init();
  console.log(fb);
  console.log("init", url);
  const reader = await HttpReader.open(url);
  console.log("reader", reader);
  console.log("header:", reader.header);

  App.render(<Viewer url={url} header={reader.header} client={reader} />);
}

init(url);
