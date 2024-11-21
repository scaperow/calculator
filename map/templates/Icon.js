import { makeOnewayBinding, makeContextMenu, makeToolTip, createNameToolTip, createSizeToolTip } from '../helper'

import go from 'gojs'

const $ = go.GraphObject.make
const fontName = 'Material Design Icons'
const FontIcon = {
  style: { fill: '#333', fontSize: 32, opacity: 1, width: 40, height: 40, fontColor: '#333' },
  styleSetter: {
    stroke(part, value) {
      part.findObject('TEXT').stroke = value
    }
  },
  allowAction: ['cut', 'delete', 'paste', 'group', 'copy', 'ungroup'],

  /**
   * 
   * @return {GraphObject}
   */
  createTemplate(style, actionList) {
    var { fill, fontSize, opacity, width, height } = style

    return $(go.Node, 'Viewbox',
      { padding: 0, margin: 0 },
      $(go.TextBlock, {
        name: 'ICON',
        margin: 0,
        stroke: fill,
        opacity,
        font: `${fontSize}px "${fontName}"`,
        editable: false,
        isMultiline: false
      }, ...makeOnewayBinding(false, 'fontSize'),
        new go.Binding('fill'),
        new go.Binding('text', 'text', (text) => String.fromCodePoint(parseInt(text, 16)))
      ),
      makeContextMenu(actionList, this.allowAction),
      makeToolTip())
  }
}



export default { FontIcon }