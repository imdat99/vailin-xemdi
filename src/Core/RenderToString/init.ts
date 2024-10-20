
import { escape } from './Helper'
import { CONTAINER as CONTAINER_ELEMENTS, VOID as VOID_ELEMENTS } from './elements'
//@ts-ignore
import parseSelector from 'parse-sel'
import { VNode } from '../Snabbdom'
import { Module } from './types'
function init (modules: Module[]) {
  function parse (vnode: VNode, node: Record<string, any>) {
    let result: string[] = []
    let attributes = new Map([
      // These can be overwritten because that’s what happens in snabbdom
      ['id', node.id],
      ['class', node.className]
    ])

    modules.forEach(function (fn, _index) {
      fn(vnode, attributes)
    })
    attributes.forEach(function (value, key) {
      if (value && value !== '') {
        result.push(key + '="' + value + '"')
      }
    })

    return result.join(' ')
  }

  return function renderToString (vnode: VNode): string {
    if (typeof vnode === 'undefined' || vnode === null) {
      return ''
    }

    if (!vnode.sel && typeof vnode.text === 'string') {
      return escape(vnode.text)
    }

    vnode.data = vnode.data || {}

    // Support thunks
    if (vnode.data.hook &&
      typeof vnode.data.hook.init === 'function' &&
      typeof vnode.data.fn === 'function') {
      vnode.data.hook.init(vnode)
    }

    let node = parseSelector(vnode.sel)
    let tagName = node.tagName as keyof typeof CONTAINER_ELEMENTS;
    let attributes = parse(vnode, node)
    let svg = vnode.data.ns === 'http://www.w3.org/2000/svg'
    let tag = []

    if ((tagName as string) === '!') {
      return '<!--' + vnode.text + '-->'
    }

    // Open tag
    tag.push('<' + tagName)
    if (attributes.length) {
      tag.push(' ' + attributes)
    }
    if (svg && CONTAINER_ELEMENTS[tagName] !== true) {
      tag.push(' /')
    }
    tag.push('>')

    // Close tag, if needed
    if ((VOID_ELEMENTS[tagName as keyof typeof VOID_ELEMENTS] !== true && !svg) ||
        (svg && CONTAINER_ELEMENTS[tagName] === true)) {
      if (vnode.data.props && vnode.data.props.innerHTML) {
        tag.push(vnode.data.props.innerHTML)
      } else if (vnode.text) {
        tag.push(escape(vnode.text))
      } else if (vnode.children) {
        vnode.children.forEach(function (child) {
          tag.push(renderToString(child as VNode))
        })
      }
      tag.push('</' + tagName + '>')
    }

    return tag.join('')
  }
}
export default init;
