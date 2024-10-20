import { FunctionComponent, Hooks, init, Props, VNode, VNodeChildren } from "../Snabbdom";
import { Emitter, EventType } from "../Mitt";

export type HookParams = Parameters<NonNullable<Hooks[keyof Hooks]>>;
export type CallBackCompoent = [VNode, VNode & (() => void)]
export interface ViewParams {state: any; props: Props; children: VNodeChildren}
export type IView = (a: ViewParams) => VNode;

export type RenderParams = {
    usePatch: boolean;
    view: IView;
    state: any;
    props: Props;
    children: VNodeChildren;
}
export type PatchFunction = (oldVnode: VNode | Element | DocumentFragment, vnode: VNode) => VNode;
// export type FactoyFunction = VNode | FunctionComponent | any;
export interface FactoyFunctionArgs {
    emitter: Emitter<Record<EventType, unknown>>;
    props: Props;
}
// export type FactoyFunction = (p: FactoyFunctionArgs) => {view: IView; store: () => any} | VNode | FunctionComponent;
export type FactoryFunctionReturn = { view: IView; store?: () => any };

// Định nghĩa FactoryFunction với tham số và kiểu trả về
export type FactoryFunction = (p: FactoyFunctionArgs) => FactoryFunctionReturn;
export type IFactory = VNode | FactoryFunction | FunctionComponent;

export type Args = Parameters<typeof init> | [PatchFunction, IFactory, Props, VNodeChildren] | [PatchFunction, IFactory, Props] | [PatchFunction, IFactory] | [PatchFunction, any] | [PatchFunction] | [];