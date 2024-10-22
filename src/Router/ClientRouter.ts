import { createBrowserHistory, createRouter, Router } from "@remix-run/router";
import appRouter from "./Router";
import routeList from "./Router";

export const clientRouter = typeof window != "undefined" ? createRouter({
    // Required properties
    routes: routeList,
    history: createBrowserHistory(),
    // // Optional properties
    // basename, // Base path
    // mapRouteProperties, // Map framework-agnostic routes to framework-aware routes

    // hydrationData, // Hydration data if using server-side-rendering
}).initialize() : {} as Router
