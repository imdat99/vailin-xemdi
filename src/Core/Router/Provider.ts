import { Router } from "@remix-run/router";
import { FactoryFunctionReturn } from "../SnabbMitt/types";

export function ClientRouterProvider(router: Router) {
    return function(factory: FactoryFunctionReturn) {
        return {
            ...factory,
            context: {
                ...factory.context,
                router
            }
        }
    }
}