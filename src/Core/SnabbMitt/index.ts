import {
    attributesModule,
    classModule,
    datasetModule,
    eventListenersModule,
    Props,
    propsModule,
    VNode,
    VNodeChildren,
    toVNode,
    styleModule,
    init
} from '../Snabbdom'
import { component as _c } from './component'
import instanceComponent, { globalContext } from './instance'
import { Args, IFactory, PatchFunction } from './types'
// import { init } from 'snabbdom'
// import { styleModule } from '../OverWrite/SnabbStyle'

// const { instanceComponent, component } = require('./lib/component');
let defaultPatch: PatchFunction;
function defineArgs(args: Args) {
    let props: Props = {}
    let children: VNodeChildren | Args['1'] | Args['0'] = []
    if (args.length === 2) {
        ;[props, children] = args
    } else if (args.length === 1) {
        if (Array.isArray(args[0])) {
            children = args[0]
        } else {
            props = args[0] as Props
        }
    }
    return [props, children, globalContext]
}

function snabbmitt(...args: Args) {
    let patch
    if (typeof args[0] === 'function') {
        patch = args[0]
    } else if (Array.from(args).length === 0 && defaultPatch) {
        patch = defaultPatch
    } else {
        if (Array.from(args).length === 0) {
            patch = init([
                attributesModule, // for setting attributes on DOM elements
                datasetModule, // makes it easy to set and remove data attributes
                eventListenersModule, // attaches event listeners
                classModule, // makes it easy to toggle classes
                propsModule, // for setting properties on DOM elements
                styleModule
            ])
        } else {
            patch = init(...(args as Parameters<typeof init>))
        }
    }

    if (!defaultPatch) {
        defaultPatch = patch
    }

    return {
        run(container: HTMLElement | VNode, factory: IFactory, props = {}, context = {}) {
            const instance = instanceComponent(patch, container, factory, props, context)
            instance.render({ usePatch: false, props, context })
        },
        component(factory: IFactory, ...args: Array<Props>) {
            return _c(patch, factory, ...defineArgs(args as any))
        },
        hydrate(container: HTMLElement, factory: IFactory, props = {}, context = {}) {
            const instance = instanceComponent(
                patch,
                toVNode(container),
                factory,
                props,
                context
            )
            patch(container, instance.render({ usePatch: false, props, context }))
        }
    }
}
function createSSR(factory: IFactory, props = {}, context = {}) {
    const instance = instanceComponent(defaultPatch, null, factory, props, context)
    return instance.render({ usePatch: false, props, context })
}
function component(
    factory: IFactory,
    ...args: Array<Props>
): VNode {
    const a = defineArgs(args as any)
    return _c(defaultPatch, factory, ...a)
}
export { component, createSSR }

export default snabbmitt
