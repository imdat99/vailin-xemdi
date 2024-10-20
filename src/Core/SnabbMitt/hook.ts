import { Hooks, VNode } from "../Snabbdom";
import copyRefs from "./copy-refs";
import { _snabbmitt } from "./Symbol";
import { CallBackCompoent, HookParams } from "./types";

const noop = () => {};
const hooks: Array<keyof Hooks> = [
    'pre',
    'init',
    'create',
    'insert',
    'prepatch',
    'update',
    'postpatch',
    'destroy',
    'remove',
    'post'
];

function applyHook(vnode: VNode) {
    vnode.data!.hook = vnode.data?.hook || {};

    const componentHooks: Hooks = {
        create(...args) {
            const vnode = args[args.length - 1];
            if (vnode?.data![_snabbmitt]) {
                vnode!.data![_snabbmitt].cvnode.elm = vnode.elm;
            }
        },
        postpatch(oldVnode: VNode, vnode: VNode) {
            if (oldVnode.data![_snabbmitt]) {
                const rvnode = oldVnode.data![_snabbmitt].rvnode;
                copyRefs(rvnode, vnode);
                vnode.data![_snabbmitt] = oldVnode.data![_snabbmitt];
            }
        },
        pre: () => {},//PreHook;
        init: () => {},//InitHook;
        insert: () => {},//InsertHook;
        prepatch: () => {},//PrePatchHook;
        update: () => {},//UpdateHook;
        destroy:() => {},// DestroyHook;
        remove: () => {},//RemoveHook;
        post: () => {}//PostHook;
    };

    for (const hook of hooks) {
        if (!vnode?.data?.hook![hook] && !componentHooks[hook]) {
            continue;
        }
        const cb = vnode?.data?.hook[hook] || noop;
        const componentCb = componentHooks[hook] || noop;
        vnode!.data!.hook[hook] = (...args: HookParams) => {
            componentCb(...args as CallBackCompoent)
            cb(...args as CallBackCompoent);
        };
    }

    return vnode;
};

export default applyHook;