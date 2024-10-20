// import { forOwn, kebabCase, escape } from "./Helper"
// import { VNode } from "../../Snabbdom"
// import { Attributes } from "../types"

import { VNode } from "../Snabbdom"
import { kebabCase, forOwn, uniq, escape, remove } from "./Helper"
import { Attributes } from "./types"

// data.style

export function styleModule (vnode: VNode, attributes: Attributes) {
  const values: Array<string | number> = []
  var style = vnode!.data!.style || {}

  // merge in `delayed` properties
  if (style.delayed) {
    // assign(style, style.delayed)
    style = Object.assign({}, style, style.delayed)
  }

  forOwn(style, function (value, key) {
    // omit hook objects
    if (typeof value === 'string' || typeof value === 'number') {
      var kebabKey = kebabCase(key)
      values.push((key.match(/^--.*/) ? '--' + kebabKey : kebabKey) + ': ' + escape(String(value)))
    }
  })

  if (values.length) {
    attributes.set('style', values.join('; '))
  }
}

// https://developer.mozilla.org/en-US/docs/Web/API/element
const omit = [
  'attributes',
  'childElementCount',
  'children',
  'classList',
  'clientHeight',
  'clientLeft',
  'clientTop',
  'clientWidth',
  'currentStyle',
  'firstElementChild',
  'innerHTML',
  'lastElementChild',
  'nextElementSibling',
  'ongotpointercapture',
  'onlostpointercapture',
  'onwheel',
  'outerHTML',
  'previousElementSibling',
  'runtimeStyle',
  'scrollHeight',
  'scrollLeft',
  'scrollLeftMax',
  'scrollTop',
  'scrollTopMax',
  'scrollWidth',
  'tabStop',
  'tagName'
]

// https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attributes
const booleanAttributes = [
  'disabled',
  'visible',
  'checked',
  'readonly',
  'required',
  'allowfullscreen',
  'autofocus',
  'autoplay',
  'compact',
  'controls',
  'default',
  'formnovalidate',
  'hidden',
  'ismap',
  'itemscope',
  'loop',
  'multiple',
  'muted',
  'noresize',
  'noshade',
  'novalidate',
  'nowrap',
  'open',
  'reversed',
  'seamless',
  'selected',
  'sortable',
  'truespeed',
  'typemustmatch'
]

// data.props

export function propsModule (vnode: VNode, attributes: Attributes) {
  var props = vnode!.data!.props || {}

  forOwn(props, function (value, key) {
    if (omit.indexOf(key) > -1) {
      return
    }
    if (key === 'htmlFor') {
      key = 'for'
    }
    if (key === 'className') {
      key = 'class'
    }

    var lkey = key.toLowerCase()
    if (~booleanAttributes.indexOf(lkey)) {
      if (value) { // set attr only when truthy
        attributes.set(lkey, lkey)
      }
    } else {
      attributes.set(lkey, escape(value))
    }
  })
}

// data.dataset
export function datasetModule (vnode: VNode, attributes: Attributes) {
  var dataset = vnode!.data!.dataset || {}

  forOwn(dataset, function (value, key) {
    attributes.set(`data-${key}`, escape(value))
  })
}

// data.class
export function classModule (vnode: VNode, attributes: Attributes) {
  let values
  let _add: any = []
  let _remove: any = []
  let classes = vnode!.data!.class || {}
  let existing = (attributes.get('class') || []) as string[]
  existing = existing.length > 0 ? String(existing).split(' ') : []

  forOwn(classes, function (value, key) {
    if (value) {
      _add.push(key)
    } else {
      _remove.push(key)
    }
  })

  values = remove(uniq(existing.concat(_add)), function (value) {
    return _remove.indexOf(value) < 0
  })

  if (values.length) {
    attributes.set('class', values.join(' '))
  }
}



// data.attrs
export function attrsModule (vnode: VNode, attributes: Attributes) {
  var attrs = vnode!.data!.attrs || {}

  forOwn(attrs, function (value, key) {
    attributes.set(key, escape(String(value)))
  })
}
