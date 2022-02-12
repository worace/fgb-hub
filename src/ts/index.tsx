import * as React from "react";
import { App, AppContext, Ctx } from "./AppContext";
import { Fgb } from "./firebase";

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

async function dummyGetFgbs(): Promise<Fgb[]> {
  console.log("getfgbs");
  return Promise.resolve([{ url: "pizza" }]);
}
const Index = () => {
  const [list, setList] = React.useState<Fgb[]>([]);
  const ctx = React.useContext<Ctx>(AppContext);

  React.useEffect(() => {
    ctx.fs.getFgbs().then(setList);
  }, []);

  return (
    <div>
      <h1>Fgb Hub</h1>
      <h3>View FGBs</h3>
      <ul>{list.map((u) => urlItem(u))}</ul>
    </div>
  );
};

App.render(<Index />);
