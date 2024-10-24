// const { _snabbmitt } = require('../symbols');
// const instanceComponent = require('./instance');
// const copyRefs = require('./copy-refs');

import { isClient } from "Lib/Utils";
import { Props, VNode } from "../Snabbdom";
import copyRefs from "./copy-refs";
import instanceComponent from "./instance";
import { _snabbmitt } from "./Symbol";
import { IFactory, PatchFunction } from "./types";

export function component(patch: PatchFunction, factory: IFactory, props: Props = {}, children = [], context = {}) {
    if (!(factory as VNode).sel) {
        (factory as VNode).sel = 'component';
    }
    const renderVnode = () => {
        const instance = instanceComponent(patch, null, factory, props, context);
        const cvnode = instance.render({ props, children });

        if ((factory as VNode).sel === 'component') {
            // from now we know the indentity of this type of components
            (factory as VNode).sel = cvnode.sel;
        }
        return {instance, cvnode};
    }
    return typeof window === 'undefined' ? renderVnode().cvnode : {
        sel: (factory as VNode).sel,
        key: props.key,
        data: {
            hook: {
                init(vnode: VNode) {
                    const {instance, cvnode} = renderVnode();
                    // console.log('component -> renderVnode', {instance, cvnode});

                    cvnode!.data![_snabbmitt] = {
                        instance,
                        factory,
                        cvnode,
                        rvnode: vnode
                    };
                    copyRefs(vnode, cvnode);
                },
                prepatch(oldVnode: VNode, vnode: VNode) {
                    const cvnode = oldVnode!.data![_snabbmitt]?.instance.render({ props, children, context });
                    cvnode.data[_snabbmitt] = oldVnode!.data![_snabbmitt];
                    cvnode.data[_snabbmitt].rvnode = vnode;
                    cvnode.elm = oldVnode.elm;
                    copyRefs(vnode, cvnode);
                }
            }
        }
    } as VNode;
};
export default component