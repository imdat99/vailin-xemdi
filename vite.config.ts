import path from "path"
import { UserConfig, defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'
// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
    if (command === 'build') {
        return {
            ...devConfig,
            ssr: {
                optimizeDeps: {
                    include: ["lodash"]
                  },
                noExternal: ['react-helmet-async', 'lodash', 'devtools-detector'],
                // Add your external dependencies here for the SSR build, otherwise,
                // the bundled won't have enough libraries to render noExternal:
                // [/@\w+\/*/],
            },
        }
    }

    return devConfig
})

const devConfig: UserConfig = {
    plugins: [
        tsConfigPaths(),
        // react(),
        // cssInjectedByJsPlugin()
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    esbuild: { legalComments: 'none' },
    build: {
        terserOptions: {
            format: {
              comments: false
            }
        },
        rollupOptions: {
            plugins: [{
                name: "remove-router-version",
                async transform(code, id) {
                    return code.replace("__reactRouterVersion", "__movie")
                }
              }],
            input: './src/main.ts',
            output: {
                manualChunks: undefined,
                // entryFileNames: `assets/[hash].js`,
                chunkFileNames: `assets/[hash].js`,
                // assetFileNames: `assets/[name].[ext]`
                // assetFileNames: `assets/[hash].[ext]`
            },

        },
        chunkSizeWarningLimit: 512,
        target: ['es2015', 'edge88', 'firefox78', 'chrome87', 'safari11'],
    },
}