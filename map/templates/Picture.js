import { makeOnewayBinding, createTextBlock, makeContextMenu, makeToolTip, } from '../helper'
const $ = go.GraphObject.make
const Picture = {
  allowAction: ['cut', 'paste', 'group', 'copy', 'ungroup'],
  style: { figure: 'RoundedRectangle', fill: 'transparent', background: 'transparent', opacity: 1, stroke: 'transparent', strokeWidth: 1, stroke: 'transparent', width: 80, height: 80, fontColor: '#333', fontSize: '14px', fontBold: false, fontItalic: false, isUnderline: false, isStrikethrough: false },


  /**
   * 
   * @return {GraphObject}
   */
  createTemplate(style, actionList) {
    let { fill, stroke, strokeWidth, width, height, figure, background,
      opacity, } = style

    return $(go.Node, 'Spot',
      $(go.Panel, 'Auto',
        {
          alignment: go.Spot.Center,
          width,
          height,
          name: 'NODE',
          stretch: go.GraphObject.Fill,
          background,
        },
        new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
        $(go.Shape, {
          figure,
          fill,
          stroke,
          opacity,
          strokeWidth,
        }, ...makeOnewayBinding(false, 'figure', 'fill', 'stroke', 'strokeWidth'))
      ),
      createTextBlock(style),
      makeToolTip(),
      makeContextMenu(actionList, this.allowAction))
  }
}

export default { Picture }