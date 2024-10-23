import {
    Action,
    AgnosticDataRouteObject,
    UNSAFE_convertRoutesToDataRoutes as convertRoutesToDataRoutes,
    createPath,
    IDLE_BLOCKER,
    IDLE_FETCHER,
    IDLE_NAVIGATION,
    Path,
    Router as RemixRouter,
    RevalidationState,
    UNSAFE_RouteManifest as RouteManifest,
    FutureConfig as RouterFutureConfig,
    StaticHandlerContext,
    To,
    UNSAFE_invariant as invariant,
} from "@remix-run/router";
import { MapRoutePropertiesFunction } from "@remix-run/router/utils";
import { htmlEscape, hydrationDataKey, serializeErrors } from "./Helper";

export interface StaticRouterProviderProps {
  context: StaticHandlerContext;
  router: RemixRouter;
  hydrate?: boolean;
  nonce?: string;
}
export function createStaticRouter(
    routes: AgnosticDataRouteObject[],
    context: StaticHandlerContext,
    opts: {
      // Only accept future flags that impact the server render
      future?: Partial<
        Pick<RouterFutureConfig, "v7_partialHydration" | "v7_relativeSplatPath">
      >;
    } = {}
  ): RemixRouter {
    let manifest: RouteManifest = {};
    let dataRoutes = convertRoutesToDataRoutes(
      routes,
      defaultMapRouteProperties,
      undefined,
      manifest
    );
  
    // Because our context matches may be from a framework-agnostic set of
    // routes passed to createStaticHandler(), we update them here with our
    // newly created/enhanced data routes
    let matches = context.matches.map((match) => {
      let route = manifest[match.route.id] || match.route;
      return {
        ...match,
        route,
      };
    });
  
    let msg = (method: string) =>
      `You cannot use router.${method}() on the server because it is a stateless environment`;
  
    return {
      get basename() {
        return context.basename;
      },
      get future() {
        return {
          v7_fetcherPersist: false,
          v7_normalizeFormMethod: false,
          v7_partialHydration: opts.future?.v7_partialHydration === true,
          v7_prependBasename: false,
          v7_relativeSplatPath: opts.future?.v7_relativeSplatPath === true,
          v7_skipActionErrorRevalidation: false,
        };
      },
      get state() {
        return {
          historyAction: Action.Pop,
          location: context.location,
          matches,
          loaderData: context.loaderData,
          actionData: context.actionData,
          errors: context.errors,
          initialized: true,
          navigation: IDLE_NAVIGATION,
          restoreScrollPosition: null,
          preventScrollReset: false,
          revalidation: "idle" as RevalidationState,
          fetchers: new Map(),
          blockers: new Map(),
        };
      },
      get routes() {
        return dataRoutes;
      },
      get window() {
        return undefined;
      },
      initialize() {
        throw msg("initialize");
      },
      subscribe() {
        throw msg("subscribe");
      },
      enableScrollRestoration() {
        throw msg("enableScrollRestoration");
      },
      navigate() {
        throw msg("navigate");
      },
      fetch() {
        throw msg("fetch");
      },
      revalidate() {
        throw msg("revalidate");
      },
      createHref,
      encodeLocation,
      getFetcher() {
        return IDLE_FETCHER;
      },
      deleteFetcher() {
        throw msg("deleteFetcher");
      },
      dispose() {
        throw msg("dispose");
      },
      getBlocker() {
        return IDLE_BLOCKER;
      },
      deleteBlocker() {
        throw msg("deleteBlocker");
      },
      patchRoutes() {
        throw msg("patchRoutes");
      },
      _internalFetchControllers: new Map(),
      _internalActiveDeferreds: new Map(),
      _internalSetRoutes() {
        throw msg("_internalSetRoutes");
      },
    };
  }

  function createHref(to: To) {
    return typeof to === "string" ? to : createPath(to);
  }
  const ABSOLUTE_URL_REGEX = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
  function encodeLocation(to: To): Path {
    let href = typeof to === "string" ? to : createPath(to);
    // Treating this as a full URL will strip any trailing spaces so we need to
    // pre-encode them since they might be part of a matching splat param from
    // an ancestor route
    href = href.replace(/ $/, "%20");
    let encoded = ABSOLUTE_URL_REGEX.test(href)
      ? new URL(href)
      : new URL(href, "http://localhost");
    return {
      pathname: encoded.pathname,
      search: encoded.search,
      hash: encoded.hash,
    };
  }

  const defaultMapRouteProperties: MapRoutePropertiesFunction = (route) => ({
    hasErrorBoundary: Boolean(route.hasErrorBoundary),
  });
  
  function mapRouteProperties(route: AgnosticDataRouteObject) {
    let updates: Partial<AgnosticDataRouteObject> & { hasErrorBoundary: boolean } = {
      // Note: this check also occurs in createRoutesFromChildren so update
      // there if you change this -- please and thank you!
      hasErrorBoundary: route.hasErrorBoundary != null,
    };
  
  /*  if (route.handle) {
      // if (__DEV__) {
      //   if (route.element) {
      //     warning(
      //       false,
      //       "You should not include both `Component` and `element` on your route - " +
      //         "`Component` will be used."
      //     );
      //   }
      // }
      Object.assign(updates, {
        element: React.createElement(route.Component),
        Component: undefined,
      });
    }
  
    if (route.HydrateFallback) {
      if (__DEV__) {
        if (route.hydrateFallbackElement) {
          warning(
            false,
            "You should not include both `HydrateFallback` and `hydrateFallbackElement` on your route - " +
              "`HydrateFallback` will be used."
          );
        }
      }
      Object.assign(updates, {
        hydrateFallbackElement: React.createElement(route.HydrateFallback),
        HydrateFallback: undefined,
      });
    }
  
    if (route.ErrorBoundary) {
      if (__DEV__) {
        if (route.errorElement) {
          warning(
            false,
            "You should not include both `ErrorBoundary` and `errorElement` on your route - " +
              "`ErrorBoundary` will be used."
          );
        }
      }
      Object.assign(updates, {
        errorElement: React.createElement(route.ErrorBoundary),
        ErrorBoundary: undefined,
      });
    }*/
  
    return updates;
  }

  export function StaticRouterProvider({
    context,
    router,
    hydrate = true,
    nonce,
  }: StaticRouterProviderProps) {
    invariant(
      router && context,
      "You must provide `router` and `context` to <StaticRouterProvider>"
    );
  
    let dataRouterContext = {
      router,
      navigator: getStatelessNavigator(),
      static: true,
      staticContext: context,
      basename: context.basename || "/",
    };
  
    let fetchersContext = new Map();
  
    let hydrateScript = "";
  
    if (hydrate !== false) {
      let data = {
        loaderData: context.loaderData,
        actionData: context.actionData,
        errors: serializeErrors(context.errors),
      };
      // Use JSON.parse here instead of embedding a raw JS object here to speed
      // up parsing on the client.  Dual-stringify is needed to ensure all quotes
      // are properly escaped in the resulting string.  See:
      //   https://v8.dev/blog/cost-of-javascript-2019#json
      let json = htmlEscape(JSON.stringify(JSON.stringify(data)));
      hydrateScript = `window.${hydrationDataKey} = JSON.parse(${json});`;
    }
  
    let { state } = dataRouterContext.router;
    // console.log("state: ", state)
    // console.log({
    //                    basename: dataRouterContext.basename,
    //               location: state.location,
    //               navigationType: state.historyAction,
    //               navigator: dataRouterContext.navigator,
    //               static: dataRouterContext.static,
    // })
    let [match] = context.matches.slice(-1);
    return {
      basename: dataRouterContext.basename,
      location: state.location,
      navigationType: state.historyAction, 
      navigator: dataRouterContext.navigator,
      static: dataRouterContext.static,
      hydrateScript,
      match
    }
    // console.log("hydrateScript: ", hydrateScript)
    // console.log("match: ", match.route)
    // console.log("dataRouterContext: ", dataRouterContext, "state: ", state.matches, "fetchersContext: ", fetchersContext)
    // return (
    //   <>
    //     <DataRouterContext.Provider value={dataRouterContext}>
    //       <DataRouterStateContext.Provider value={state}>
    //         <FetchersContext.Provider value={fetchersContext}>
    //           <ViewTransitionContext.Provider value={{ isTransitioning: false }}>
    //             <Router
    //               basename={dataRouterContext.basename}
    //               location={state.location}
    //               navigationType={state.historyAction}
    //               navigator={dataRouterContext.navigator}
    //               static={dataRouterContext.static}
    //               future={{
    //                 v7_relativeSplatPath: router.future.v7_relativeSplatPath,
    //               }}
    //             >
    //               <DataRoutes
    //                 routes={router.routes}
    //                 future={router.future}
    //                 state={state}
    //               />
    //             </Router>
    //           </ViewTransitionContext.Provider>
    //         </FetchersContext.Provider>
    //       </DataRouterStateContext.Provider>
    //     </DataRouterContext.Provider>
    //     {hydrateScript ? (
    //       <script
    //         suppressHydrationWarning
    //         nonce={nonce}
    //         dangerouslySetInnerHTML={{ __html: hydrateScript }}
    //       />
    //     ) : null}
    //   </>
    // );
  }

  function getStatelessNavigator() {
    return {
      createHref,
      encodeLocation,
      push(to: To) {
        throw new Error(
          `You cannot use navigator.push() on the server because it is a stateless ` +
            `environment. This error was probably triggered when you did a ` +
            `\`navigate(${JSON.stringify(to)})\` somewhere in your app.`
        );
      },
      replace(to: To) {
        throw new Error(
          `You cannot use navigator.replace() on the server because it is a stateless ` +
            `environment. This error was probably triggered when you did a ` +
            `\`navigate(${JSON.stringify(to)}, { replace: true })\` somewhere ` +
            `in your app.`
        );
      },
      go(delta: number) {
        throw new Error(
          `You cannot use navigator.go() on the server because it is a stateless ` +
            `environment. This error was probably triggered when you did a ` +
            `\`navigate(${delta})\` somewhere in your app.`
        );
      },
      back() {
        throw new Error(
          `You cannot use navigator.back() on the server because it is a stateless ` +
            `environment.`
        );
      },
      forward() {
        throw new Error(
          `You cannot use navigator.forward() on the server because it is a stateless ` +
            `environment.`
        );
      },
    };
  }
