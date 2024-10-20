import { h } from "@/Core/Snabbdom";
import { FactoryFunctionReturn } from "@/Core/SnabbMitt/types";

export default function AboutUs(): FactoryFunctionReturn {
    function view() {
        return h('div', [
            h('h1', 'About Us'),
            // _c(Clock, { name: 'Clock 3', time: [23, 59, 40] }),
        ]);
    }

    return {view};
}