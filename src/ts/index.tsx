import { HttpReader } from "flatgeobuf/lib/mjs/HttpReader";
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
  <li key={fgb.url} className="mt-1">
    <a className="default" href={viewerLink(fgb.url)}>
      {fgb.url}
    </a>
  </li>
);

async function dummyGetFgbs(): Promise<Fgb[]> {
  console.log("getfgbs");
  return Promise.resolve([{ url: "pizza" }]);
}
const Index = () => {
  const [list, setList] = React.useState<Fgb[]>([]);
  const ctx = React.useContext<Ctx>(AppContext);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    ctx.fs.getFgbs().then(setList);
  }, []);

  const formSub = (e: React.FormEvent) => {
    e.preventDefault();

    console.log(search);
    try {
      const _url = new URL(search);
    } catch (_) {
      alert(`Not a valid URL: ${search}`);
      return;
    }

    HttpReader.open(search)
      .then(() => {
        // Got a header so it's a valid FGB URL
        window.location.href = viewerLink(search);
      })
      .catch((err) => {
        console.error(err);
        alert(
          `Unable to read FGB Header from ${search} -- appears to not be a valid FGB file.`
        );
      });
  };

  return (
    <div className="container mx-auto px-4">
      <h2 className="font-bold text-2xl my-4">View FGBs</h2>
      <ul>{list.map((u) => urlItem(u))}</ul>
      <div className="mt-4 py-4 border-t border-gray-300">
        <form className="md:flex" onSubmit={formSub}>
          <label className="mr-4">Enter FGB Url to view</label>
          <input
            className="text-default"
            type="text"
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="button md:ml-4">Submit</button>
        </form>
      </div>
    </div>
  );
};

App.render(<Index />);
