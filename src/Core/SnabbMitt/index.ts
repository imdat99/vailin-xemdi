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
import instanceComponent from './instance'
import { Args, IFactory, PatchFunction } from './types'
// import { init } from 'snabbdom'
// import { styleModule } from '../OverWrite/SnabbStyle'

// const { instanceComponent, component } = require('./lib/component');
let defaultPatch: PatchFunction

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
    return [props, children]
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
        run(container: HTMLElement | VNode, factory: IFactory, props = {}) {
            const instance = instanceComponent(patch, container, factory, props)
            return instance.render({ usePatch: true, props })
        },
        component(factory: IFactory, ...args: Array<Props>) {
            return _c(patch, factory, ...defineArgs(args as any))
        },
        hydrate(container: HTMLElement, factory: IFactory, props = {}) {
            console.log("vnode", toVNode(container))
            const instance = instanceComponent(
                patch,
                toVNode(container),
                factory,
                props
            )
            patch(container, instance.render({ usePatch: false, props }))
        }
    }
}

function component(
    factory: IFactory,
    ...args: Array<Props>
): VNode {
    return _c(defaultPatch, factory, ...defineArgs(args as any))
}
export { component }

export default snabbmitt
