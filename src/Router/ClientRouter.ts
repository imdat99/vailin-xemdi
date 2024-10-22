import {
    AgnosticRouteObject,
    createBrowserHistory,
    createRouter,
    HydrationState,
    Router,
    RouterNavigateOptions
} from '@remix-run/router'
import { ErrorResponseImpl } from '@remix-run/router/utils'
import mitt from '@/Core/Mitt'

const isClient = typeof window != 'undefined'
export function getWindows() {
    return isClient ? window : undefined
}
const naSymbol = Symbol("xemdi-na")
const emitter = mitt()
function parseHydrationData(): HydrationState | undefined {
    let state = (window as any).__staticRouterHydrationData
    if (state && state.errors) {
        state = {
            ...state,
            errors: deserializeErrors(state.errors)
        }
    }
    return state
}
export function navigateTo(url: string|number, options?: RouterNavigateOptions) {
    if (isClient) {
        emitter.emit(naSymbol, { url, options })
    }
}
export function createBrowserRoter(routes: AgnosticRouteObject[]): Router {
    const router = createRouter({
        // Required properties
        history: createBrowserHistory({ window }),
        hydrationData: parseHydrationData(),
        window: getWindows(),
        routes,
        future: {
            v7_prependBasename: true,
            v7_partialHydration: true
        }
        // // Optional properties
        // basename, // Base path

        // hydrationData, // Hydration data if using server-side-rendering
    }).initialize()
    if (isClient) {
        emitter.on(naSymbol, (event) => {
            const {url, options} = event as {url: string, options: RouterNavigateOptions}
            router.navigate(url, options);
        })
    }
    return router
}
function deserializeErrors(
    errors: Router['state']['errors']
): Router['state']['errors'] {
    if (!errors) return null
    let entries = Object.entries(errors)
    let serialized: Router['state']['errors'] = {}
    for (let [key, val] of entries) {
        // Hey you!  If you change this, please change the corresponding logic in
        // serializeErrors in react-router-dom/server.tsx :)
        if (val && val.__type === 'RouteErrorResponse') {
            serialized[key] = new ErrorResponseImpl(
                val.status,
                val.statusText,
                val.data,
                val.internal === true
            )
        } else if (val && val.__type === 'Error') {
            // Attempt to reconstruct the right type of Error (i.e., ReferenceError)
            if (val.__subType) {
                let ErrorConstructor = window[val.__subType]
                if (typeof ErrorConstructor === 'function') {
                    try {
                        // @ts-expect-error
                        let error = new ErrorConstructor(val.message)
                        // Wipe away the client-side stack trace.  Nothing to fill it in with
                        // because we don't serialize SSR stack traces for security reasons
                        error.stack = ''
                        serialized[key] = error
                    } catch (e) {
                        // no-op - fall through and create a normal Error
                    }
                }
            }

            if (serialized[key] == null) {
                let error = new Error(val.message)
                // Wipe away the client-side stack trace.  Nothing to fill it in with
                // because we don't serialize SSR stack traces for security reasons
                error.stack = ''
                serialized[key] = error
            }
        } else {
            serialized[key] = val
        }
    }
    return serialized
}
