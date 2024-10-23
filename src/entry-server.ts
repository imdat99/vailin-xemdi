import { EventHandlerRequest, getRequestProtocol, H3Event, readBody, setResponseHeader } from 'h3';
import RenderToString from "./Core/RenderToString";
import { component } from "./Core/SnabbMitt";
import { defaultTheme, storageThemeKey } from './Lib/Constants';
import { PassThrough } from 'stream';
import { minifyJavaScript } from './Lib/Utils';
import { App } from './App';
import { createStaticHandler } from '@remix-run/router';
import routeList from './Router';
import {createStaticRouter, StaticRouterProvider} from './Core/Router/StaticRouter';
import { hydrationNonceKey } from './Core/Router/Helper';
export async function render(    event: H3Event<EventHandlerRequest>, styles: string[], listScript: string[]) {
    const { req } = event.node;
    let { query, dataRoutes } = createStaticHandler(routeList, {
        future: {
            v7_throwAbortReason: true,
        },
    });
    const remixRequest = await createFetchRequest(event)
    const context = await query(remixRequest)

    if (context instanceof Response) {
        throw context
    }
    const router = createStaticRouter(dataRoutes, context)
    const {hydrateScript} = StaticRouterProvider({ context, router, hydrate: true, nonce: "xemdi-nonce" })
    // router.
    // console.log("context: ",context, "dataRoutes: ", dataRoutes)
    // console.log({router, context, dataRoutes})
    // dataRoutes.forEach((r) => {
    //     r.lazy?.().then((m) => console.log(m().view()))
    // })
    const stringHtml = RenderToString(component(App))
    const cookies: Record<string, string> =
        req.headers.cookie
            ?.split('; ')
            .reduce(
                (acc, cur) => ({
                    ...acc,
                    [cur.split('=')[0]]: cur.split('=')[1],
                }),
                {}
            ) || {}

    // const ggAnalytics = import.meta.env.DEV ? '' : `<script async src="https://www.googletagmanager.com/gtag/js?id=G-JHH53M709Q"></script><script>window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-JHH53M709Q');</script>`
    const fastRefresh = import.meta.env.DEV ? `<script type="module" src="/@vite/client"></script><script type="module" src="/src/refresh-hack.js"></script>` : ''
    const scripts = import.meta.env.PROD ? listScript.map((url) => `<link rel="prefetch" href="${url}" as="script" crossorigin="anonymous" />`).join('') : "";
    const styleStr = styles.map((url) => `<link rel="stylesheet" href="${url}" /><link rel="preload" href="${url}" as="style"/>`).join('');
    const header =
        `<!DOCTYPE html>
                <html lang="en" xemdi-theme="${cookies[storageThemeKey] || defaultTheme }">
                <head>
                    <meta charset="utf-8" />
                    <link rel="icon" href="/favicon.ico" />
                    <meta name="theme-color" content="#000000" />
                    <meta name="application-name" content="MOVIE Xemdi" />
                    <meta name="author" content="Xemdi.fun" />
                    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
                    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
                    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
                    <link rel="manifest" href="/site.webmanifest">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />`
        + styleStr
        + fastRefresh 
        + scripts
        +
        // Object.values(helmetContext.helmet).map((value) => value.toString()).filter(Boolean).join('') +
        '</head>';
    const bootstrapModules = listScript.filter((s) => s.includes('main')).map((s) => `<script type="module" src="${s}" async></script>`).join('');
    const hydrateData = ["<script nonce=\"",hydrationNonceKey,"\">",hydrateScript,"</script>"].join('');
    // const stream = new ReadableStream();
    const body = new PassThrough();
    body.write(minifyJavaScript(header));
    body.write(minifyJavaScript(["<body>", stringHtml, hydrateData, bootstrapModules, "</body>"].join('')));
    body.end('</html>');
    setResponseHeader(event, 'content-type', 'text/html');
    return body;
}

async function createFetchRequest(event: H3Event<EventHandlerRequest>): Promise<Request> {
    const protocol = getRequestProtocol(event);
    const req = event.node.req
    const origin = `${protocol}://${req.headers.host}`;

    const url = new URL(req.headers.origin || req.url!, origin)
    // const controller = new AbortController()
    // req.on('close', () => {
    //     try {
    //         controller.abort()
    //     } catch (error) {
    //         console.error(error)
    //     }
    // })

    const headers = new Headers()

    for (const [key, values] of Object.entries(req.headers)) {
        if (values) {
            if (Array.isArray(values)) {
                for (const value of values) {
                    headers.append(key, value)
                }
            } else {
                headers.set(key, values)
            }
        }
    }

    const init: RequestInit = {
        method: req.method,
        headers,
        // signal: controller.signal,
    }

    if (req.method !== 'GET' && req.method !== 'HEAD') {
        await readBody(event).then((body) => {
            init.body = body;
        })
    }

    return new Request(url.href, init)
}