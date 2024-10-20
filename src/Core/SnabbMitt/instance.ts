

import { FunctionComponent, init, Props, VNode } from "../Snabbdom";
import applyHook from "./hook";
import createRenderer from "./renderer";
import mitt from "../Mitt";
import { FactoryFunction, IFactory, IView } from "./types";
function instanceComponent(patch: ReturnType<typeof init>, container: HTMLElement| VNode | null, factory: IFactory, userProps: Props = {}) {
    const render = createRenderer(patch, container);
    let props = userProps;
    let children: VNode[] = [];
    let userView: VNode | FunctionComponent;
    let store;
    const emitter = mitt();

    emitter.on('render', () => {
        render({ usePatch: true, view, state, props, children });
    });

    const instance = (factory as FactoryFunction)({ emitter, props });

    if (typeof instance === 'function') {
        userView = instance;
    } else {
        userView = instance.view as FunctionComponent;
        store = instance.store;
    }

    const view: IView = ({ state, props, children }) => {
        return applyHook((userView as FunctionComponent)({ state, props, children }));
    };

    const state = typeof store === 'function' ? store() : {};
    if (typeof state !== 'object') throw new Error('Store function in your components should return an state object');

    return {
        render({ usePatch = false, props: userProps = {}, children: userChildren = [] }) {
            props = userProps;
            children = userChildren;
            return render({ usePatch, view, state, props, children });
        },
        state,
        props,
        emitter
    };
};
export default instanceComponent;
