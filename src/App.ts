import { clientRouter } from "./Router/ClientRouter";
import { h, VNode } from "./Core/Snabbdom";
import { component as _c } from "./Core/SnabbMitt";
import { FactoryFunction, FactoryFunctionReturn, IView } from "./Core/SnabbMitt/types";


const Clock: FactoryFunction = ({ emitter, props }) => {
    function store() {
        const state = {
            hours: props.time ? props.time[0] : 0,
            minutes: props.time ? props.time[1] : 0,
            seconds: props.time ? props.time[2] : 0
        };

        emitter.on('clock:update', () => {
            state.seconds++;

            if (state.seconds === 60) {
                state.minutes++;
                state.seconds = 0;
            }

            if (state.minutes === 60) {
                state.hours++;
                state.minutes = 0;
            }
            
            if (state.hours === 24) {
                state.hours = 0;
            }

            emitter.emit('render');
        });

        return state;
    }
    let interval: any;
    const hook: any = {
        create() {
            interval = setInterval(() => emitter.emit('clock:update'), 1000);
        },
        destroy(_vnode: VNode, removeCallback: any) {
            clearInterval(interval);
            removeCallback();
        }
    };

    function displayDigit(digit: any) {
        if (digit < 10) {
            return `0${digit}`;
        }
        return digit;
    }

    const view: IView = ({ state, props }) => {
        return h("p",[h('h1', { hook }, [
            props.name,
            '=>',
            h('span.hours', displayDigit(state.hours)),
            ':',
            h('span.minutes', displayDigit(state.minutes)),
            ':',
            h('span.seconds', displayDigit(state.seconds)),
        ]), _c(Button, { text: 'Click me', handleClick: () => console.log('Button clicked') })]);
    }

    return {
        view,
        store
    };
}
function Button({ emitter }: any): any {
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

export function App(): FactoryFunctionReturn {
    function view() {
        return h('div', {
            attrs: {
                id: 'app'
            }
        }, [
            _c(Clock, { name: 'Clock 1' }),
            _c(Clock, { name: 'Clock 2', time: [5 ,20, 16] }),
            h('hr'),
            h('button', {on: {click: () => {
                clientRouter.navigate('about');
            }}}, 'Hello, world!'),
            // _c(Clock, { name: 'Clock 3', time: [23, 59, 40] }),
        ]);
    }

    return {view};
}