import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
  getRedirectResult,
  User,
} from "firebase/auth";

export default {
  currentUser(): User | null {
    const auth = getAuth();
    return auth.currentUser;
  },
  checkAuth() {
    const auth = getAuth();
    getRedirectResult(auth)
      .then((result) => {
        console.log("redirect result: ", result);
        const credential = GithubAuthProvider.credentialFromResult(result);
        if (credential) {
          // This gives you a GitHub Access Token. You can use it to access the GitHub API.
          const token = credential.accessToken;
        }

        // The signed-in user info.
        const user = result.user;
        console.log(user);
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GithubAuthProvider.credentialFromError(error);
        console.log(errorCode, errorMessage, email, credential);
      });
  },
  ghAuth() {
    const provider = new GithubAuthProvider();
    const auth = getAuth();
    console.log("log in with ", provider, auth);
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a GitHub Access Token. You can use it to access the GitHub API.
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;

        // The signed-in user info.
        const user = result.user;
        console.log("user:", user);
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GithubAuthProvider.credentialFromError(error);
        console.log(errorCode, errorMessage, email, credential);
      });
  },
};
