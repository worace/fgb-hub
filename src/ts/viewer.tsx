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

const mbToken =
  "pk.eyJ1Ijoid29yYWNlIiwiYSI6ImNremdhdjh0MDNwbngyd25mbTVwYmxpbGwifQ.uUKEsBJuZ_mMZCxbqkkkkA";

function fetchData(bounds: mapboxgl.LngLatBounds, client: HttpReader) {}

function indexSize(client: HttpReader): number {
  return client.lengthBeforeFeatures() - client.lengthBeforeTree();
}

const BoundsDisplay = (bounds: LngLatBounds) => (
  <div>
    <p>Bounds: {Bounds.fmtBounds(bounds)}</p>
    <pre>{Bounds.toWkt(bounds)}</pre>
  </div>
);

const row = (label: string, value: string | number) => (
  <div className="bg-gray-50 px-4 py-3">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900 overflow-x-clip">{value}</dd>
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
    const limit = 2000;
    updateIsLoading(true);
    console.log("fetch data", bounds, Bounds.toRect(bounds));
    const features: IGeoJsonFeature[] = [];
    const start = new Date().getTime();
    for await (const feature of props.client.selectBbox(
      Bounds.toRect(bounds)
    )) {
      if (features.length < limit) {
        features.push(fromFeature(feature, props.client.header));
      } else {
        break;
      }
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
    <div className="flex">
      <div className="w-1/3 p-4">
        <h2 className="font-bold text-xl text-gray-900">Viewing FGB File</h2>
        <p className="text-sm mt-1 text-gray-500">{props.url}</p>

        <div className="border-t border-gray-200 mt-4">
          <dl>
            {row("Num Features", props.header.featuresCount)}
            {row("Visible Features", loadedFeatures)}
            {row("Geometry Type", geomType(props.header.geometryType))}
            {row(
              "Header Size",
              props.client.lengthBeforeTree().toString() + " bytes"
            )}
            {row("Index Size", humanFileSize(indexSize(props.client)))}
            {row("Bounds", Bounds.fmtBounds(bounds))}
          </dl>
          <p className="flex flex-row-reverse mt-2">
            <button className="button" disabled={isLoading} onClick={fetchData}>
              Load Data
            </button>
          </p>
        </div>
      </div>
      <div
        className="w-2/3"
        id="map"
        style={{ height: "600px" }}
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

// <!-- This example requires Tailwind CSS v2.0+ -->
// <div class="bg-white shadow overflow-hidden sm:rounded-lg">
//   <div class="px-4 py-5 sm:px-6">
//     <h3 class="text-lg leading-6 font-medium">Applicant Information</h3>
//     <p class="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application.</p>
//   </div>
//   <div class="border-t border-gray-200">
//     <dl>
//       <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//         <dt class="text-sm font-medium text-gray-500">Full name</dt>
//         <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Margot Foster</dd>
//       </div>
//       <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//         <dt class="text-sm font-medium text-gray-500">Application for</dt>
//         <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Backend Developer</dd>
//       </div>
//       <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//         <dt class="text-sm font-medium text-gray-500">Email address</dt>
//         <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">margotfoster@example.com</dd>
//       </div>
//       <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//         <dt class="text-sm font-medium text-gray-500">Salary expectation</dt>
//         <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">$120,000</dd>
//       </div>
//       <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//         <dt class="text-sm font-medium text-gray-500">About</dt>
//         <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure nostrud pariatur mollit ad adipisicing reprehenderit deserunt qui eu.</dd>
//       </div>
//       <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
//         <dt class="text-sm font-medium text-gray-500">Attachments</dt>
//         <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
//           <ul role="list" class="border border-gray-200 rounded-md divide-y divide-gray-200">
//             <li class="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
//               <div class="w-0 flex-1 flex items-center">
//                 <!-- Heroicon name: solid/paper-clip -->
//                 <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//                   <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
//                 </svg>
//                 <span class="ml-2 flex-1 w-0 truncate"> resume_back_end_developer.pdf </span>
//               </div>
//               <div class="ml-4 flex-shrink-0">
//                 <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500"> Download </a>
//               </div>
//             </li>
//             <li class="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
//               <div class="w-0 flex-1 flex items-center">
//                 <!-- Heroicon name: solid/paper-clip -->
//                 <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
//                   <path fill-rule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clip-rule="evenodd" />
//                 </svg>
//                 <span class="ml-2 flex-1 w-0 truncate"> coverletter_back_end_developer.pdf </span>
//               </div>
//               <div class="ml-4 flex-shrink-0">
//                 <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500"> Download </a>
//               </div>
//             </li>
//           </ul>
//         </dd>
//       </div>
//     </dl>
//   </div>
// </div>
