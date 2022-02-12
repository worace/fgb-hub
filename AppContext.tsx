import { User } from "firebase/auth";
import * as React from "react";
import firebase, { Fgb, FireStore } from "./firebase";
import ReactDOM from "react-dom";
import { Nav } from "./Nav";

export interface Ctx {
  fs: FireStore;
  currentUser: User | null;
}

export const AppContext = React.createContext<Ctx>(null);

export class App extends React.Component<{}, { currentUser: User | null }> {
  static contextType? = AppContext;
  static render(children: React.ReactNode) {
    ReactDOM.render(<App>{children}</App>, document.getElementById("app"));
  }

  state = { currentUser: null, fs: firebase.init() };

  componentDidMount(): void {
    console.log("App Mounted");

    this.state.fs.auth.onAuthStateChanged((currentUser) => {
      console.log("got curent user", currentUser);
      this.setState({ currentUser });
    });
  }

  render() {
    return (
      <AppContext.Provider value={this.state}>
        <Nav />
        <div>{this.props.children}</div>
      </AppContext.Provider>
    );
  }
}
