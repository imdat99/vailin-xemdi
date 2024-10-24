import { h, VNode } from "./Core/Snabbdom";
import { component as _c } from "./Core/SnabbMitt";
import { FactoryFunction, FactoryFunctionReturn, IView } from "./Core/SnabbMitt/types";
import { navigateTo } from "./Core/Router/ClientRouter";
import SWR from "./Core/SWR";
import { isClient } from "./Lib/Utils";
import Outlet from "Core/Router/Component";


const Clock: FactoryFunction = ({ emitter, props, context }) => {
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

    // console.log('context: ', context);
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
    if(isClient) {
        const subscribe = SWR<any>('/api/hello', (data: any) => fetch('https://jsonplaceholder.typicode.com/todos').then(r => r.json()), {
            fallbackData: { name: 'loading...' },
            revalidateOnWatch: false,
            revalidateOnFocus: false
        });
        subscribe.watch((data) => {
           
        });
    }
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
    if (typeof window !== 'undefined') {
        // console.log("clientRouter: ", clientRouter);
        // clientRouter.subscribe((e) => {
        //     console.log(e);
        // });
    }
    function view({context}: any): VNode {
        // console.log('context: ', context);

        return h('div', {
            attrs: {
                id: 'app'
            }
        }, [
            _c(Clock, { name: 'Clock 1' }),
            _c(Clock, { name: 'Clock 2', time: [5 ,20, 16] }),
            h('hr'),
            h('button', {on: {click: () => {
                navigateTo('about');
                // clientRouter.navigate('about');
            }}}, 'about'),
            h('button', {on: {click: () => {
                console.log('back');
                navigateTo('..');
                // clientRouter.navigate('about');
            }}}, 'back'),
            _c(Outlet)
            // _c(Clock, { name: 'Clock 3', time: [23, 59, 40] }),
        ]);
    }

    return {view};
}