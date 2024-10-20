import { VNode } from "../Snabbdom";

export type Attributes = Map<string | number, string>;
export type Module = (vnode: VNode, attributes: Attributes) => void;
export interface ModuleIndex {
    class: Module;
    props: Module;
    attributes: Module;
    style: Module;
    dataset: Module;
  }