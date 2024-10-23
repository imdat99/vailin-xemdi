import { HydrationState, isRouteErrorResponse, Router, StaticHandlerContext } from "@remix-run/router"
import { ErrorResponseImpl } from "@remix-run/router/utils"

export const hydrationDataKey = '__XemdiHydrationData';
export const hydrationNonceKey = '__XemdiHydrationNonce';
export function parseHydrationData(): HydrationState | undefined {
    let state = (window as any)[hydrationDataKey]
    if (state && state.errors) {
        state = {
            ...state,
            errors: deserializeErrors(state.errors)
        }
    }
    return state
}
export function deserializeErrors(
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
const ESCAPE_LOOKUP: { [match: string]: string } = {
    "&": "\\u0026",
    ">": "\\u003e",
    "<": "\\u003c",
    "\u2028": "\\u2028",
    "\u2029": "\\u2029",
};

const ESCAPE_REGEX = /[&><\u2028\u2029]/g;
export function htmlEscape(str: string): string {
    return str.replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match]);
}
export function serializeErrors(
    errors: StaticHandlerContext["errors"]
): StaticHandlerContext["errors"] {
    if (!errors) return null;
    let entries = Object.entries(errors);
    let serialized: StaticHandlerContext["errors"] = {};
    for (let [key, val] of entries) {
        // Hey you!  If you change this, please change the corresponding logic in
        // deserializeErrors in react-router-dom/index.tsx :)
        if (isRouteErrorResponse(val)) {
            serialized[key] = { ...val, __type: "RouteErrorResponse" };
        } else if (val instanceof Error) {
            // Do not serialize stack traces from SSR for security reasons
            serialized[key] = {
                message: val.message,
                __type: "Error",
                // If this is a subclass (i.e., ReferenceError), send up the type so we
                // can re-create the same type during hydration.
                ...(val.name !== "Error"
                    ? {
                        __subType: val.name,
                    }
                    : {}),
            };
        } else {
            serialized[key] = val;
        }
    }
    return serialized;
}