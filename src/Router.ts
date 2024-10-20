import { AgnosticRouteObject } from '@remix-run/router'

const routeList: AgnosticRouteObject[] = [
    {
        path: '/',
        //   loader: ({ request, params }) => { /* ... */ },
        children: [
            {
                index: true,
                handle: () => {
                    return new Response('Hello, world!')
                }
                // path: 'home',
                // loader: ({ request, params }) => { /* ... */ },
            },
            {
                path: 'about',
                loader: async function(){
                    return new Promise((resolve) => {
                        import('@/View/Pages/AboutUs').then((module) => {
                            resolve(module.default as any);
                        });
                    })
                },
                lazy: async () => ({
                    handle: (await import('@/View/Pages/AboutUs')).default,
                }),
                children: [
                    {
                        path: 'team',
                        handle: () => {
                            return new Response('Team page')
                        }
                    }
                ]
                // lazy() {
                //     return new Promise((resolve) => {
                //         import('@/View/Pages/AboutUs').then((module) => {
                //             resolve({
                //                 handle: module.default,
                //             });
                //         });
                //     })},
                },
            /*
      caseSensitive?: boolean;
      path?: string;
      id?: string;
      loader?: LoaderFunction | boolean;
      action?: ActionFunction | boolean;
      hasErrorBoundary?: boolean;
      shouldRevalidate?: ShouldRevalidateFunction;
      handle?: any;
      lazy?: LazyRouteFunction<AgnosticBaseRouteObject>;
   */
        ]
    }
]
export default routeList