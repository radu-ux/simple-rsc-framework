import { createRoot } from "react-dom/client";
import { createFromFetch } from "react-server-dom-webpack/client.browser";
import { Router } from "@framework/router.client.jsx";

import "./index.css";

window.__webpack_require__ = (id) => {
  return import(id);
};

const root = createRoot(document.getElementById("root"));

createFromFetch(
  fetch(
    `/rsc?pathname=${window.location.pathname}&${window.location.search.replace(
      "?",
      ""
    )}`
  )
).then((serverTree) => {
  root.render(<Router initialServerTree={serverTree} />);
});
