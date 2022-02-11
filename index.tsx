import * as React from "react";
import ReactDOM, { flushSync } from "react-dom";
import firebase, { Fgb, FireStore } from "./firebase";

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

const urlItem = (fgb: Fgb) => (
  <li key={fgb.url}>
    <a href={viewerLink(fgb.url)}>{fgb.url}</a>
  </li>
);

const Index = (props: { fs: FireStore }) => {
  const [list, setList] = React.useState<Fgb[]>([]);

  props.fs.getFgbs().then(setList);

  return (
    <div>
      <h1>Fgb Hub</h1>
      <h3>View FGBs</h3>
      <ul>{list.map((u) => urlItem(u))}</ul>
    </div>
  );
};

const fb = firebase.init();
ReactDOM.render(<Index fs={fb} />, document.getElementById("app"));
