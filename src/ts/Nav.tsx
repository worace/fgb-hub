import * as React from "react";
import Auth from "./auth";
import { AppContext } from "./AppContext";

export const Nav = () => {
  const { currentUser } = React.useContext(AppContext);
  console.log("current user", currentUser);

  if (currentUser) {
    return <p>You're logged in {currentUser.displayName}</p>;
  } else {
    return (
      <p>
        <a href="#" onClick={Auth.ghAuth}>
          Login
        </a>
      </p>
    );
  }
};
