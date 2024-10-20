import { createServer } from 'http';
// import { createClient } from 'redis';
import {
    App,
    createApp,
    eventHandler,
    EventHandlerRequest,
    fromNodeMiddleware,
    H3Event,
    toNodeListener
} from 'h3';
import path from 'path';
import fs from 'fs';
import serveStatic from 'serve-static';


// const client = await createClient({ url: "rediss://red-crjrhhjtq21c73a5b7lg:3oQVTSdgID8csHRmLC0ovnC8BZC6AKcQ@singapore-redis.render.com:6379" })
//   .on('error', err => console.log('Redis Client Error', err))
//   .connect();
  // @ts-ignore

const resolve = (_path: string) => path.resolve(path.resolve(), _path)
async function configProd(app: App) {
    app.use(fromNodeMiddleware(serveStatic(resolve('./dist/client'), {
        index: false,
    })))
    app.use(fromNodeMiddleware(serveStatic(resolve('./client'), {
        index: false,
    })))
    app.use(fromNodeMiddleware(serveStatic(resolve('./public'), {
        index: false,
    })))
    // @ts-ignore
    const render = (await import('../server/entry-server.js')).render
    // replace bootstrap script with compiled scripts
    const files = fs.readdirSync('./dist/client/assets')
    const styleLink = files.filter((s: string) => s.endsWith('.css')).map((s: string) => '/assets/' + s)
    const listScript = files
        .filter((fn: string) => fn.endsWith('.js'))
        .map((fn: string) => '/assets/' + fn)
    app.use(eventHandler(async (event) => {
        try {
            const url = event.node.req.url;
            if(url === '/favicon.ico' || url?.includes('/assets/')) {
                return;
            }
            // const cacheKey = `ssr:${url}`;
            // const cachedHtml = await client.get(cacheKey);
            // if(cachedHtml) {
            //     console.log("cache hit", url);
                // setHeader(event, 'Content-Type', 'text/html');
            //     return cachedHtml;
            // }
            return render(event, styleLink, listScript)
            // htmlStream.then(getStringFromPassThrough).then((html: string) => {
            //     client.setEx(cacheKey, 60 * 5, html);
            // })
        } catch (err) {
            const e = err as Error
            console.log(e.stack)
            event.node.res.statusCode = 500
            event.node.res.end(e.stack)
        }
    }))
    return app
}

async function configDev(app: App) {
    // dev mode, configure vite as middleware
    const vite = await (await import('vite')).createServer({
        root: process.cwd(),
        server: {
            middlewareMode: true,
            hmr: true,
        },
        appType: 'custom',
    })
   
    app.use(fromNodeMiddleware(vite.middlewares))

    const renderer = async (event: H3Event<EventHandlerRequest>) => {
        // in dev mode, we will try to load the render function for every request,
        // so that editing the entry-server file take effect without restart server.
        try {
            const url = event.node.req.url;
            if(url === '/favicon.ico' || url?.includes('/assets/')) {
                return;
            }
            const render = (await vite.ssrLoadModule('./src/entry-server.ts'))
                .render
            return render(event, [], [`/src/main.ts`]);
        } catch (err) {
            const e = err as Error
            vite.ssrFixStacktrace(e)
            console.log(e.stack)
            event.node.res.statusCode = 500
            event.node.res.end(e.stack)
        }
    }
    // app.use('*', renderer)
    app.use(eventHandler(renderer))
}

const isProd = process.env.NODE_ENV === 'production'
const port = process.env.PORT || (isProd ? 4173 : 5173)
const config = isProd ? configProd : configDev
export const app = createApp();
config(app).then().catch(console.error)

const server = createServer(toNodeListener(app));
server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

console.log("Hello, World!")