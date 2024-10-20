import { VNode } from "../Snabbdom";

export type VRouteHandle = (p?: string[]) => void;

export interface VRoute {
  name?: string;
  path: string;
  redirectTo?: string;
  component?: () => Promise<any> | VNode;
}
export interface VRouter {
  mode: "history" | "hash";
  root: string;
  notFound: VRouteHandle;
}
