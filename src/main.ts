import { matchRoutes } from "@remix-run/router";
import { App } from "./App";
import snabbmitt, { component as _c } from "./Core/SnabbMitt";
import { createBrowserRoter } from "./Core/Router/ClientRouter";
import routeList from "./Router";
import './style.css'
const render = () => {
    createBrowserRoter(routeList)
    .subscribe(console.log);
    const { hydrate } = snabbmitt();
    hydrate(document.getElementById('app')!, App);
}
// Determine if any of the initial routes are lazy
const lazyMatches = matchRoutes(routeList, window.location)?.filter(
    (m) => m.route.lazy
)
// Load the lazy matches and update the routes before creating your router
// so we can hydrate the SSR-rendered content synchronously

if (typeof window === 'object' && lazyMatches && lazyMatches?.length > 0) {
    Promise.all(
        lazyMatches.map(async (m) => {
            if (m.route.lazy) {
                const routeModule = await m.route.lazy()
                console.log("routeModule: ", routeModule)
                Object.assign(m.route, {
                    ...routeModule,
                    lazy: undefined,
                })
            }
        })
    ).then(render)
}
if (lazyMatches?.length === 0) {
    render()
}