import { App } from "./App";
import snabbmitt, { component as _c } from "./Core/SnabbMitt";
const { hydrate } = snabbmitt();
hydrate(document.getElementById('app')!, App);