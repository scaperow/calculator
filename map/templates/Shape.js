import {
  makeOnewayBinding, createTextBlock, makeTwowayBinding, makeSelectable,
  makeRotatable,
  makeResizable, createNameToolTip, createSizeToolTip, createContextMenu, makePorts, makeTextEditable, selectionAdornmentTemplate, makeContextMenu, makeToolTip
} from '../helper'
const $ = go.GraphObject.make
var style = { fill: '#fff', stroke: '#333', strokeDashArray: [], strokeWidth: 1, opacity: 1, width: 80, height: 80, fontColor: '#333', fontSize: 14, fontFamily: 'arial,sans-serif', fontBold: null, fontItalic: null, isUnderline: null, isStrikethrough: false }
var allowAction = ['cut', 'paste', 'group', 'copy', 'ungroup']
function createPreview(style) {
  var { fill, stroke, strokeDashArray, strokeWidth, opacity, width, height } = style

  return $(go.Node, 'Vertical',
    {
      locationObjectName: 'SHAPE', cursor: 'move',
      selectionAdornmentTemplate
    },

    $(go.Shape, {
      name: 'SHAPE',
      width: 60,
      height: 60,
      //desiredSize: new go.Size(width / 2, height / 2),
      fill, stroke, strokeDashArray, strokeWidth,
    }, ...makeOnewayBinding(false, 'angle', 'figure')),
    createTextBlock({ ...style, fontColor: '#333', fontSize: 12 }, name, {
      isMultiline: false,
    })
  )
}

const Shape = {
  style,
  allowAction,
  createPreview,

  createTemplate(style, actionList) {
    var { fill, stroke, strokeDashArray, strokeWidth, opacity, width, height } = style


    return $(go.Node, 'Spot',
      $(go.Shape, {
        width,
        height,
        stretch: go.GraphObject.Fill,
        name: 'NODE',
        fill,
        stroke,
        opacity,
        strokeDashArray,
        strokeWidth,
        cursor: 'move',
        ...makeTextEditable()
      },
        ...makeOnewayBinding(false, 'figure', 'fill', 'opacity', 'stroke', 'strokeWidth', 'strokeDashArray'),
        ...makeTwowayBinding(false, 'width', 'height', 'angle')),
      createTextBlock(style),
      makeContextMenu(actionList, this.allowAction),
      makeToolTip(),
      makeSelectable(),
      makeTextEditable(),
      makeRotatable(),
      makeResizable(),
      makePorts(),
    )
  }
}

const Personal = {

  style: { fill: '#fff', stroke: '#333', strokeDashArray: [], strokeWidth: 1, fontColor: '#333', radius: 4, fontSize: 14, fontFamily: 'arial,sans-serif', fontBold: null, fontItalic: null, isUnderline: null, isStrikethrough: false },

  form: {
    avatar: {
      type: 'file',
      label: '头像'
    },
    name: {
      type: 'text', label: '姓名', flex: 12
    },
    position: {
      type: 'text', label: '职位', flex: 12
    },
    gender: {
      toCtrl({ value }) {
        if (value === null) {
          return '无'
        }

        return value
      },
      fromCtrl({ value }) {
        if (value === '无') {
          return null
        }

        return value
      },
      type: 'radio', label: '性别', options: ['无', '男', '女'], flex: 12
    }
  },

  createTemplate(style, actionList) {
    var { fill, stroke, radius, strokeDashArray, strokeWidth, } = style

    return $(go.Node, "Auto",
      {
        doubleClick: (e, object) => {
          var clicked = object.part;
          var diagram = clicked.diagram

          if (clicked !== null) {
            var thisemp = clicked.data;
            diagram.startTransaction("add employee");

            var newemp = {
              name: "(new person)",
              title: "",
              comments: "",
              parent: thisemp.key,
              category: 'Personal'
            };

            diagram.model.addNodeData(newemp);
            diagram.commitTransaction("add employee");
          }
        }
      },
      {
        // handle dragging a Node onto a Node to (maybe) change the reporting relationship
        mouseDragEnter: function (e, node, prev) {
          var diagram = node.diagram;
          var selnode = diagram.selection.first();
          if (!mayWorkFor(selnode, node)) return;
          var shape = node.findObject("SHAPE");
          if (shape) {
            shape._prevFill = shape.fill;  // remember the original brush
            shape.fill = "darkred";
          }
        },
        mouseDragLeave: function (e, node, next) {
          var shape = node.findObject("SHAPE");
          if (shape && shape._prevFill) {
            shape.fill = shape._prevFill;  // restore the original brush
          }
        },
        mouseDrop: function (e, node) {
          var diagram = node.diagram;
          var selnode = diagram.selection.first();  // assume just one Node in selection
          if (mayWorkFor(selnode, node)) {
            // find any existing link into the selected node
            var link = selnode.findTreeParentLink();
            if (link !== null) {  // reconnect any existing link
              link.fromNode = node;
            } else {  // else create a new link
              diagram.toolManager.linkingTool.insertLink(node, node.port, selnode, selnode.port);
            }
          }
        }
      },
      // for sorting, have the Node.text be the data.name
      new go.Binding("text", "name"),
      // bind the Part.layerName to control the Node's layer depending on whether it isSelected
      new go.Binding("layerName", "isSelected", function (sel) { return sel ? "Foreground" : ""; }).ofObject(),
      // define the node's outer shape
      $(go.Shape, "RoundedRectangle",
        {
          name: "SHAPE",
          fill,
          stroke,
          strokeWidth,
          strokeDashArray,
          parameter1: radius,
          portId: "",
          fromLinkable: true, toLinkable: true, cursor: "pointer"
        }),
      $(go.Panel, "Horizontal",
        $(go.Panel, 'Auto',
          $(go.Shape, 'Circle', { fill: 'transparent', stroke: 'transparent' }),
          $(go.Picture,
            {
              name: "PICTURE",
              desiredSize: new go.Size(39, 50),
              margin: new go.Margin(6, 8, 6, 10),
            },
            new go.Binding("source", "avatar", (avatar) => {
              return ''
            }))
        ),
        $(go.Panel, "Vertical",
          {
            maxSize: new go.Size(150, 999),
            margin: new go.Margin(6, 10, 0, 3),
            defaultAlignment: go.Spot.Left
          },
          // createTextBlock(style, '姓名', new go.Binding("text", 'name')),
          // createTextBlock(style, '性别', new go.Binding("text", 'gender')),
          // createTextBlock(style, '职位', new go.Binding("text", 'position'))
          ..._.map(this.form.property, (value, key) => {
            if (key !== 'avatar') {
              return createTextBlock(style, '', new go.Binding("text", key))
            }
          })
        )  // end Table Panel
      ) // end Horizontal Panel
    );  // end Node
  }
}

const ShapeVertical = {
  styleName: "Shape",
  style,
  allowAction,
  createPreview,

  createTemplate(style, actionList) {
    var { fill, stroke, strokeDashArray, strokeWidth, opacity, width, height } = style

    return $(go.Node, 'Vertical',
      $(go.Shape, {
        width,
        height,
        stretch: go.GraphObject.Fill,
        name: 'NODE',
        fill,
        stroke,
        opacity,
        strokeDashArray,
        strokeWidth,
        cursor: 'move',
        ...makeTextEditable()
      },
        ...makeOnewayBinding(false, 'figure', 'fill', 'opacity', 'stroke', 'strokeWidth', 'strokeDashArray'),
        ...makeTwowayBinding(false, 'width', 'height', 'angle')),

      createTextBlock(style),
      makeContextMenu(actionList, this.allowAction),
      makeToolTip(),
      makeSelectable(),
      makeRotatable(),
      makeResizable()
    )
  }
}




export default { Shape, ShapeVertical, Personal }