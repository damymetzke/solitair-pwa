import "../style/style.scss";

import * as solitaire from "./solitaire/solitaire";
import { start as startFuture } from "./future/futureInterface";
import "./draw";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register(`/service-worker.js${""}`, { scope: "/" })
      .then(
        function (registration) {
          console.log(
            "ServiceWorker registration successful with scope: ",
            registration.scope
          );
        },
        function (err) {
          console.log("ServiceWorker registration failed: ", err);
        }
      );
  });
}

async function run() {
  const [future] = await Promise.all([
    startFuture(),
    solitaire.waitUntilLoaded(),
  ]);
  console.log(solitaire.ping());
  console.log(await future.ping());
}

run();
