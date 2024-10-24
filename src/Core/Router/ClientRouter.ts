import mitt from 'Core/Mitt'
import {
    AgnosticRouteObject,
    createBrowserHistory,
    createRouter,
    Router,
    RouterNavigateOptions
} from '@remix-run/router'
import { parseHydrationData } from './Helper'

const isClient = typeof window != 'undefined'
export function getWindows() {
    return isClient ? window : undefined
}
const naSymbol = Symbol("xemdi-na")
const emitter = mitt()

export function navigateTo(url: string|number, options?: RouterNavigateOptions) {
    if (isClient) {
        emitter.emit(naSymbol, { url, options })
    }
}
export function createBrowserRoter(routes: AgnosticRouteObject[]): Router {
    const router = createRouter({
        history: createBrowserHistory({ window }),
        hydrationData: parseHydrationData(),
        window: getWindows(),
        routes,
        future: {
            v7_prependBasename: true,
            v7_partialHydration: true
        }
    }).initialize()
    if (isClient) {
        emitter.on(naSymbol, (event) => {
            const {url, options} = event as {url: string, options: RouterNavigateOptions}
            router.navigate(url, options);
        })
    }
    return router
}