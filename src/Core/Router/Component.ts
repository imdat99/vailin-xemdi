import { RouterState } from "@remix-run/router";
import { Fragment, h } from "Core/Snabbdom";
import { component } from "Core/SnabbMitt";
import { isClient } from "Lib/Utils";

// 
function Outlet({emitter, context }: any): any {
    let [match] = context.router.state?.matches?.slice(-1);
    function store() {
        let state = {
            component: match?.handle,
        };
        
        if(isClient){
            context.router.subscribe((router: RouterState) => {
                if(router.historyAction === 'PUSH'){
                    state.component = router.matches.at(-1)
                    emitter.emit('render');
                }
            });
        }
    }
  
    return {
        // view: () => h('div', {}, 'Outlet'),
        store,
        view({state}: any){ return state.component.handle({emitter, context}).view({emitter, context}) },
    };
}

export default Outlet;