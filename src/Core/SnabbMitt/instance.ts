

import { Fragment, FunctionComponent, init, Props, VNode } from "../Snabbdom";
import applyHook from "./hook";
import createRenderer from "./renderer";
import mitt from "../Mitt";
import { FactoryFunction, IFactory, IView } from "./types";
export let globalContext: Record<string, any> = {};
function instanceComponent(patch: ReturnType<typeof init>, container: HTMLElement| VNode | null, factory: IFactory, userProps: Props = {}, userContext: Record<string, any> = {}) {
    const render = createRenderer(patch, container);
    globalContext = Object.assign(globalContext, userContext);
    let context = globalContext;
    let props = userProps;
    let children: VNode[] = [];
    let userView: VNode | FunctionComponent;
    let store;
    const emitter = mitt();

    emitter.on('render', () => {
        render({ usePatch: true, view, state, props, children, context });
    });

    const instance = (factory as FactoryFunction)({ emitter, props, context });

    if (typeof instance === 'function') {
        userView = instance;
    } else {
        userView = instance.view as FunctionComponent;
        store = instance.store;
    }

    const view: IView = ({ state, props, children, context }) => {
        if (typeof userView === 'function') {
            return applyHook((userView as FunctionComponent)({ state, props, children, context }));
        } 
        return Fragment({ children } as any);
       
    };

    const state = typeof store === 'function' ? store() : {};
    if (typeof state !== 'object') throw new Error('Store function in your components should return an state object');

    return {
        render({ usePatch = false, props: userProps = {}, children: userChildren = [], context: userContext = {} }) {
            props = userProps;
            children = userChildren;
            context = userContext;
            return render({ usePatch, view, state, props, children, context });
        },
        state,
        props,
        emitter
    };
};
export default instanceComponent;
