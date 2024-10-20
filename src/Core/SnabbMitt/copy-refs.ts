import { VNode } from "../Snabbdom";

function copyRefs(vnode: VNode, nextvnode: VNode) {
    vnode.elm = nextvnode.elm;
    vnode.data = nextvnode.data;
    vnode.children = nextvnode.children;
    vnode.text = nextvnode.text;
    vnode.sel = nextvnode.sel;
};
export default copyRefs;