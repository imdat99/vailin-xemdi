import { h } from "../../Snabbdom";

function Outlet({ emitter }: any): any {
    function store() {
        const state = {
            count: 0
        };

        emitter.on('button:click', () => {
            state.count++;
            emitter.emit('render');
        });

        return state;
    }

    function view({ state, props }: any) {
        return h('button', { on: { click: () => {
          props.handleClick();
          emitter.emit('button:click')
        } } }, `${props.text} ${state.count}`);
    }

    return {
        view,
        store
    };
}

export default Outlet;