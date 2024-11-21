import { makeOnewayBinding, makeEmptyChildBinding, makeContextMenu, createSizeToolTip, createNameToolTip, createTextBlock } from '../helper'

import go from 'gojs'

const $ = go.GraphObject.make

const ColorCanvas = {
  style: {
    background: 'transparent',
    fill: 'transparent',
    opacity: 1,
    width: 40,
    height: 40,
    fontColor: '#333',
    fontFamily: 'arial,sans-serif',
    fontSize: 14,
    fontBold: false,
    fontItalic: false,
    isUnderline: false,
    isStrikethrough: false
  },
  allowAction: ['cut', 'delete', 'paste', 'group', 'copy', 'ungroup'],

  /**
   * 
   * @return {GraphObject}
   */
  createTemplate(style, actionList) {
    var { background = 'transparent', opacity = 1, width = 40, height = 40 } = style

    return $(go.Node, 'Spot',
      $(go.Panel, "Vertical",
        $(go.Panel, "Viewbox",
          {
            background,
            name: 'NODE',
            width,
            height,
          },
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
          $(go.Panel,
            {
              width: 1024,
              height: 1024,
              itemTemplate:
                $(go.Panel,
                  $(go.Shape,
                    {
                      name: 'NODE',
                      opacity: opacity
                    },
                    new go.Binding("opacity"),
                    new go.Binding("fill"),
                    new go.Binding("geometryString")
                  )
                )
            },
            new go.Binding("itemArray").makeTwoWay(),
            //...makeEmptyChildBinding('opacity', 'fill')
            ...makeOnewayBinding(false, 'opacity', 'fill')
          ))
      ),
      [createTextBlock(style),
      makeContextMenu(actionList, this.allowAction)]
    )

  }
}

const MonoCanvas = {
  style: {
    background: 'transparent',
    fill: 'transparent',
    opacity: 1,
    width: 40,
    height: 40,
    fontColor: '#333',
    fontFamily: 'arial,sans-serif',
    fontSize: 14,
    fontBold: false,
    fontItalic: false,
    isUnderline: false,
    isStrikethrough: false
  },
  allowAction: ['cut', 'delete', 'paste', 'group', 'copy', 'ungroup'],

  /**
   * 
   * @return {GraphObject}
   */
  createTemplate(style, actionList) {
    var { fill = 'transparent', stroke = '#666', strokeWidth = 0, opacity = 1, width = 80, height = 80 } = style
    var element = [
      $(go.Panel, "Vertical",
        $(go.Panel, "Viewbox",
          {
            name: 'NODE',
            width,
            height,
          },
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
          $(go.Panel,
            {
              width: 1024,
              height: 1024,
              itemTemplate:
                $(go.Panel,
                  $(go.Shape,
                    {
                      name: 'NODE',
                      opacity,
                      stroke,
                      strokeWidth,
                      fill
                    },
                    new go.Binding("opacity"),
                    new go.Binding("fill"),
                    new go.Binding("geometryString")
                  )
                )
            },
            new go.Binding("itemArray").makeTwoWay(),
            ...makeEmptyChildBinding('opacity', 'fill')
          )),
      ),
      createTextBlock(style)
    ]
  }
}

export default { ColorCanvas, MonoCanvas }