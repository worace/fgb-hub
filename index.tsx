import * as React from "react";
import ReactDOM from "react-dom";

/* const STORAGE_KEY = 'fgbhub_data';
 * const data = JSON.parse(ls.getItem(STORAGE_KEY)) || [];
 *  */
const urls = [
  "http://localhost:8000/data/point.fgb",
  "http://localhost:8001/australia.fgb",
  "http://localhost:8001/colorado.fgb",
  "http://localhost:8001/alabama.fgb",
];

function viewerLink(url: string): string {
  return "/viewer.html?url=" + encodeURIComponent(url);
}

const urlItem = (url: string) => (
  <li key={url}>
    <a href={viewerLink(url)}>{url}</a>
  </li>
);

const Index = () => (
  <div>
    <h1>Fgb Hub</h1>
    <h3>View FGBs</h3>
    <ul>{urls.map((u) => urlItem(u))}</ul>
  </div>
);

ReactDOM.render(<Index />, document.getElementById("app"));
