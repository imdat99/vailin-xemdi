import { VNode } from "../Snabbdom";
import { PatchFunction, RenderParams } from "./types";


function createRenderer(patch: PatchFunction, container: HTMLElement | VNode | null) {
    let vnode = container;

    function render({ usePatch, view, state, props, children, context }: RenderParams) {
        if (usePatch && vnode && ((vnode as VNode).elm || (vnode as HTMLElement).parentNode)) {
            vnode = patch(vnode, view({ state, props, children, context }));
            // console.log('patched', vnode);
        } else {
            vnode = view({ state, props, children, context });
        }

        return vnode;
    }

    return render;
};
export default createRenderer;