
import { makeOnewayBinding, createTextBlock, createContextMenu, makeGroupDragable, makeEmptyChildBinding, selectionAdornmentTemplate, makeTextEditable, makeSelectable } from '../helper'
import { PoolLayout, relayoutDiagram } from '../layout/PoolLayout'
import go from 'gojs'
const $ = go.GraphObject.make
const LinePrefix = 20;  // vertical starting point in document for all Messages and Activations
const LineSuffix = 30;  // vertical length beyond the last message time
const MessageSpacing = 20;  // vertical distance between Messages at different steps
const ActivityWidth = 10;  // width of each vertical activity bar
const ActivityStart = 5;  // height before start message time
const ActivityEnd = 5;  // height beyond end message time



function updateCrossLaneLinks(group) {
  group.findExternalLinksConnected().each(function (l) {
    l.visible = (l.fromNode.isVisible() && l.toNode.isVisible());
  });
}


const Group = {
  name: 'Group',
  style: { radius: 8, opacity: 1, fill: 'transparent', stroke: '#333', strokeWidth: 1, fontColor: '#333', fontFamily: 'arial,sans-serif', fontSize: 14, fontBold: false, fontItalic: false, isUnderline: false, isStrikethrough: false },
  allowAction: ['cut', 'delete', 'paste', 'group', 'copy', 'ungroup'],

  /**
   * 
   * @return {GraphObject}
   */
  createTemplate(style, actionList) {
    var { radius, opacity, fill, stroke, strokeWidth } = style

    return $(go.Group, "Vertical",
      {
        contextMenu: createContextMenu(actionList.searchAction('ungroup', 'remove', 'copy', 'cut')),
        cursor: 'move',
        name: 'GROUP',
        ungroupable: true,
        selectionAdornmentTemplate,
        doubleClick(event, node) {
          if (node.diagram && !node.diagram.isReadOnly) {
            var text = node.part.findObject('TEXT')
            if (text) {
              node.diagram.commandHandler.editTextBlock(text)
            }
          }
        }
      },
      createTextBlock(style),
      makeTextEditable(),
      $(go.Panel, "Auto",
        $(go.Shape, "RoundedRectangle",
          {
            parameter1: radius,
            fill,
            opacity,
            stroke,
            strokeWidth
          },
          new go.Binding(),
          ...makeOnewayBinding(false, 'opacity', 'fill', 'radius', 'stroke', 'strokeWidth'),
        ),
        $(go.Placeholder,
          { padding: 6 },
          ...makeOnewayBinding(false, 'padding'))
      )
    )
  }
}

const HorizontalLane = {
  name: 'Lane',
  style: { radius: 4, opacity: 1, fill: '#fff', stroke: '#333', strokeWidth: 1, fontColor: '#333', fontFamily: 'arial,sans-serif', fontSize: 14, fontBold: false, fontItalic: false, isUnderline: false, isStrikethrough: false },
  allowAction: ['cut', 'delete', 'paste', 'group', 'copy', 'ungroup'],
  createPreview(style) {
    var { radius, opacity, fill, stroke, strokeWidth } = style

    return $(go.Group, 'Vertical', {
      name: 'NODE',
      background: fill,
    },

      makeSelectable(),
      $(go.Panel, 'Viewbox', { width: 60, height: 60 },
        $(go.Shape, {
          geometryString: 'M 0 20 L 80 20 L 80 60 L 0 60 L 0 20 M 20 0 L 20 80 L 60 80 L 60 0 L 20 0',
          stroke,
          strokeWidth,
        })
      ),
      createTextBlock(style, '通道'))
  },

  /**
   * 
   * @return {GraphObject} 
   */
  createTemplate(style, actionList) {
    var { radius, opacity, fill, stroke, strokeWidth } = style
    return $(go.Group, "Horizontal",
      {

        layerName: "Background",  // all pools and lanes are always behind all nodes and links
        background: "transparent",  // can grab anywhere in bounds
        name: 'GROUP',
        resizeAdornmentTemplate: $(go.Adornment, "Spot",
          $(go.Placeholder),
          $(go.Shape,  // for changing the length of a lane
            {
              alignment: go.Spot.Right,
              desiredSize: new go.Size(7, 50),
              fill: "lightblue", stroke: "dodgerblue",
              cursor: "col-resize"
            },
            new go.Binding("visible", "", function (ad) {
              if (ad.adornedPart === null) return false;
              return ad.adornedPart.isSubGraphExpanded;
            }).ofObject()),
          $(go.Shape,  // for changing the breadth of a lane
            {
              alignment: go.Spot.Bottom,
              desiredSize: new go.Size(50, 7),
              fill: "lightblue", stroke: "dodgerblue",
              cursor: "row-resize"
            },
            new go.Binding("visible", "", function (ad) {
              if (ad.adornedPart === null) return false;
              return ad.adornedPart.isSubGraphExpanded;
            }).ofObject())
        ),
        selectionObjectName: "GROUP",  // selecting a lane causes the body of the lane to be highlit, not the label
        selectionAdornmentTemplate,
        resizable: true,
        resizeObjectName: "SHAPE",  // the custom resizeAdornmentTemplate only permits two kinds of resizing
        layout: $(go.LayeredDigraphLayout,  // automatically lay out the lane's subgraph
          {
            isInitial: false,  // don't even do initial layout
            isOngoing: false,  // don't invalidate layout when nodes or links are added or removed
            direction: 0,
            columnSpacing: 10,
            layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource
          }),
        computesBoundsAfterDrag: true,  // needed to prevent recomputing Group.placeholder bounds too soon
        computesBoundsIncludingLinks: false,  // to reduce occurrences of links going briefly outside the lane
        computesBoundsIncludingLocation: true,  // to support empty space at top-left corner of lane
        //handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
        subGraphExpandedChanged: function (grp) {
          debugger
          var shp = grp.resizeObject;
          if (grp.diagram.undoManager.isUndoingRedoing)
            return;

          if (grp.isSubGraphExpanded) {
            shp.height = grp._savedBreadth;
          } else {
            grp._savedBreadth = shp.height;
            shp.height = NaN;
          }

          updateCrossLaneLinks(grp);
        }
      },

      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      new go.Binding("isSubGraphExpanded", "expanded").makeTwoWay(),

      makeTextEditable(),
      // the lane header consisting of a Shape and a TextBlock
      $(go.Panel, "Horizontal",
        {
          name: "HEADER",
          angle: 270,
          alignment: go.Spot.Center
        },
        $(go.Panel, "Horizontal",  // this is hidden when the swimlane is collapsed
          new go.Binding("visible", "isSubGraphExpanded").ofObject(),
          createTextBlock(style, '通道', { margin: 0 }),
        ),
        $("SubGraphExpanderButton", { margin: 4 })  // but this remains always visible!
      ),  // end Horizontal Panel
      $(go.Panel, "Auto",  // the lane consisting of a background Shape and a Placeholder representing the subgraph
        { ...makeGroupDragable(['*'], { denyCategories: ['VerticalPool', 'HorizontalPool', 'HorizontalLane', 'VerticalLane'] }) },
        $(go.Shape, "RoundedRectangle",  // this is the resized object
          {
            //minSize: isPalatte ? new go.Size(60, 20) : new go.Size(NaN, NaN),
            name: "SHAPE",
            fill,
            stroke,
            strokeWidth,
            parameter1: radius,
            opacity
          },
          ...makeOnewayBinding(false, 'fill', 'stroke', 'strokeWidth', 'radius', 'opacity'),
          // new go.Binding('minSize', 'dir', (dir) => dir === 'Horizontal' ? new go.Size(320, 260) : new go.Size(320, 260)).ofObject(),
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
          new go.Binding("fill", "isHighlighted", (isHighlighted, shape) => isHighlighted ? '#FFC107' : (shape.part.data.color || fill)).ofObject()),
        $(go.Placeholder,
          { alignment: go.Spot.TopLeft, padding: 6 }),
        createTextBlock(style, '通道', new go.Binding("visible", "isSubGraphExpanded", function (e) { return !e; }).ofObject())

      )  // end Auto Panel
    )
  }
}

const VerticalLane = {
  name: 'Lane',
  style: { radius: 4, opacity: 1, fill: '#fff', stroke: '#333', strokeWidth: 1, fontColor: '#333', fontFamily: 'arial,sans-serif', fontSize: 14, fontBold: false, fontItalic: false, isUnderline: false, isStrikethrough: false },
  allowAction: ['cut', 'delete', 'paste', 'group', 'copy', 'ungroup'],
  createPreview(style) {
    var { radius, opacity, fill, stroke, strokeWidth } = style

    return $(go.Group, 'Vertical', {
      name: 'NODE',
      background: fill,
    },

      makeSelectable(),
      $(go.Panel, 'Viewbox', { width: 60, height: 60 },
        $(go.Shape, {
          geometryString: 'M 0 20 L 80 20 L 80 60 L 0 60 L 0 20 M 20 0 L 20 80 L 60 80 L 60 0 L 20 0',
          stroke,
          strokeWidth,
        })
      ),
      createTextBlock(style, '通道'))
  },

  /**
   * 
   * @return {GraphObject} 
   */
  createTemplate(style, actionList) {
    var { radius, opacity, fill, stroke, strokeWidth } = style
    return $(go.Group, "Vertical",
      {

        layerName: "Background",  // all pools and lanes are always behind all nodes and links
        background: "transparent",  // can grab anywhere in bounds
        name: 'GROUP',
        resizeAdornmentTemplate:
          $(go.Adornment, "Spot",
            $(go.Placeholder),
            $(go.Shape,  // for changing the length of a lane
              {
                alignment: go.Spot.Bottom,
                desiredSize: new go.Size(50, 7),
                fill: "lightblue", stroke: "dodgerblue",
                cursor: "row-resize"
              },
              new go.Binding("visible", "", function (ad) {
                if (ad.adornedPart === null) return false;
                return ad.adornedPart.isSubGraphExpanded;
              }).ofObject()),
            $(go.Shape,  // for changing the breadth of a lane
              {
                alignment: go.Spot.Right,
                desiredSize: new go.Size(7, 50),
                fill: "lightblue", stroke: "dodgerblue",
                cursor: "col-resize"
              },
              new go.Binding("visible", "", function (ad) {
                if (ad.adornedPart === null) return false;
                return ad.adornedPart.isSubGraphExpanded;
              }).ofObject())
          ),
        selectionObjectName: "GROUP",  // selecting a lane causes the body of the lane to be highlit, not the label
        selectionAdornmentTemplate,
        resizable: true,
        resizeObjectName: "SHAPE",  // the custom resizeAdornmentTemplate only permits two kinds of resizing
        layout: $(go.LayeredDigraphLayout,  // automatically lay out the lane's subgraph
          {
            isInitial: false,  // don't even do initial layout
            isOngoing: false,  // don't invalidate layout when nodes or links are added or removed
            direction: 90,
            columnSpacing: 10,
            layeringOption: go.LayeredDigraphLayout.LayerLongestPathSource
          }),
        computesBoundsAfterDrag: true,  // needed to prevent recomputing Group.placeholder bounds too soon
        computesBoundsIncludingLinks: false,  // to reduce occurrences of links going briefly outside the lane
        computesBoundsIncludingLocation: true,  // to support empty space at top-left corner of lane
        //handlesDragDropForMembers: true,  // don't need to define handlers on member Nodes and Links
        subGraphExpandedChanged: function (grp) {
          var shp = grp.resizeObject;
          if (grp.diagram.undoManager.isUndoingRedoing) return;
          if (grp.isSubGraphExpanded) {
            shp.width = grp._savedBreadth;
          } else {
            grp._savedBreadth = shp.width;
            shp.width = NaN;
          }
          updateCrossLaneLinks(grp);
        }
      },

      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      new go.Binding("isSubGraphExpanded", "expanded").makeTwoWay(),

      makeTextEditable(),
      // the lane header consisting of a Shape and a TextBlock
      $(go.Panel, "Horizontal",
        {
          name: "HEADER",
          angle: 0,
          alignment: go.Spot.Center,
        },
        $(go.Panel, "Horizontal",  // this is hidden when the swimlane is collapsed
          new go.Binding("visible", "isSubGraphExpanded").ofObject(),
          createTextBlock(style, '通道', { margin: 0 }),
        ),
        $("SubGraphExpanderButton", { margin: 5 })  // but this remains always visible!
      ),  // end Horizontal Panel
      $(go.Panel, "Auto",  // the lane consisting of a background Shape and a Placeholder representing the subgraph

        $(go.Shape, "RoundedRectangle",  // this is the resized object
          {
            minSize: new go.Size(100, 60),
            name: "SHAPE",
            fill,
            stroke,
            strokeWidth,
            parameter1: radius,
            opacity
          },
          ...makeOnewayBinding(false, 'fill', 'stroke', 'strokeWidth', 'radius', 'opacity'),
          new go.Binding("desiredSize", "size", go.Size.parse).makeTwoWay(go.Size.stringify),
          new go.Binding("fill", "isHighlighted", (isHighlighted, shape) => isHighlighted ? '#FFC107' : (shape.part.data.color || fill)).ofObject()),
        $(go.Placeholder,
          { alignment: go.Spot.TopLeft, padding: 6, angle: 90 }, makeGroupDragable(['*'], { denyCategories: ['VerticalPool', 'HorizontalPool', 'HorizontalLane', 'VerticalLane'] })),
        createTextBlock(style, '通道', new go.Binding("visible", "isSubGraphExpanded", function (e) { return !e; }).ofObject())

      )  // end Auto Panel
    )
  }
}

const HorizontalPool = {
  name: 'HorizontalPool',
  //node: 'SHAPE,TABLE',
  styleSetter: {},
  style: { radius: 4, fill: '#fff', stroke: '#333', strokeWidth: 1, strokeDashArray: [], fontColor: '#333', fontFamily: 'arial,sans-serif', fontSize: 14, fontBold: false, fontItalic: false, isUnderline: false, isStrikethrough: false },
  allowAction: ['insertLane', 'cut', 'delete', 'paste', 'group', 'copy', 'ungroup'],
  subscribes: {
    "SelectionMoved": (e) => relayoutDiagram(e.diagram),
    "SelectionCopied": (e) => relayoutDiagram(e.diagram)
  },

  createPreview(style) {
    var { radius, opacity, fill, stroke, strokeWidth } = style
    return $(go.Group, 'Vertical', {
      name: 'NODE',
      background: fill,
    },
      makeSelectable(),
      $(go.Panel, 'Viewbox', { width: 60, height: 60 },
        $(go.Shape, {
          stroke, strokeWidth,
          fill,
          geometryString: 'M 0 0 L 80 0 L 80 80 L 0 80 L 0 0 M 20 0 L 20 80 M 20 40 L 80 40',
        })),
      createTextBlock(style, '泳道')
    )

  },

  /**
   * 
   * @return {GraphObject} 
   */
  createTemplate(style, actionList) {
    var { fill, stroke, strokeWidth, radius, strokeDashArray } = style
    return $(go.Group, "Auto",
      {
        selectionAdornmentTemplate,
        layerName: "Background",
        background: "transparent",
        layout: $(PoolLayout, { direction: 'Horizontal', spacing: 6 }), // no space between lanes
        contextMenu: createContextMenu(actionList.searchAction(...this.allowAction)),
        ...makeGroupDragable(['HorizontalLane']),
      },

      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      makeTextEditable(),
      $(go.Shape, 'RoundedRectangle',
        {
          name: 'NODE',
          fill,
          stroke,
          strokeWidth,
          parameter1: radius,
          strokeDashArray,
          minSize: new go.Size(100, 60),
        },
        new go.Binding("fill", "isHighlighted", (isHighlighted, shape) => isHighlighted ? '#FFC107' : (shape.part.data.color || fill)).ofObject(),
        ...makeOnewayBinding(false, 'fill', 'stroke', 'strokeWidth', 'radius', 'strokeDashArray')),
      $(go.Panel, 'Table',
        {
          name: 'TABLE',
          defaultColumnSeparatorStroke: stroke,
          defaultColumnSeparatorStrokeWidth: strokeWidth,
          defaultRowSeparatorDashArray: strokeDashArray
        },
        new go.Binding('defaultColumnSeparatorStroke', 'stroke'),
        new go.Binding('defaultColumnSeparatorStrokeWidth', 'strokeWidth'),
        new go.Binding('defaultColumnSeparatorDashArray', 'strokeDashArray'),
        $(go.Panel, "Horizontal", { column: 0, angle: 270 }, createTextBlock(style, '横向泳道')),
        $(go.Placeholder,
          { padding: 0, column: 1 }
        )
      )
    )
  }
}


const VerticalPool = {
  name: 'VerticalPool',
  //node: 'SHAPE,TABLE',
  styleSetter: {},
  style: { radius: 4, fill: '#fff', stroke: '#333', strokeWidth: 1, strokeDashArray: [], fontColor: '#333', fontFamily: 'arial,sans-serif', fontSize: 14, fontBold: false, fontItalic: false, isUnderline: false, isStrikethrough: false },
  allowAction: ['insertLane', 'cut', 'delete', 'paste', 'group', 'copy', 'ungroup'],
  subscribes: {
    "SelectionMoved": (e) => relayoutDiagram(e.diagram),
    "SelectionCopied": (e) => relayoutDiagram(e.diagram)
  },

  createPreview(style) {
    var { radius, opacity, fill, stroke, strokeWidth } = style
    return $(go.Group, 'Vertical', {
      name: 'NODE',
      background: fill,
    },
      makeSelectable(),
      $(go.Panel, 'Viewbox', { width: 60, height: 60 },
        $(go.Shape, {
          stroke, strokeWidth,
          fill,
          geometryString: 'M 0 0 L 80 0 L 80 80 L 0 80 L 0 0 M 0 20 L 80 20 M 40 20 L 40 80',
        },
        )),
      createTextBlock(style, '泳道')
    )

  },

  /**
   * 
   * @return {GraphObject} 
   */
  createTemplate(style, actionList) {
    var { fill, stroke, strokeWidth, radius, strokeDashArray } = style
    return $(go.Group, "Auto",
      {
        selectionAdornmentTemplate,
        layerName: "Background",
        background: "transparent",
        layout: $(PoolLayout, { direction: 'Vertical', spacing: 0 }), // no space between lanes
        contextMenu: createContextMenu(actionList.searchAction(...this.allowAction)),
        ...makeGroupDragable(['VerticalLane']),
      },

      new go.Binding("location", "loc", go.Point.parse).makeTwoWay(go.Point.stringify),
      makeTextEditable(),
      $(go.Shape, 'RoundedRectangle',
        {
          name: 'NODE',
          fill,
          stroke,
          strokeWidth,
          parameter1: radius,
          strokeDashArray,
        },
        new go.Binding("fill", "isHighlighted", (isHighlighted, shape) => isHighlighted ? '#FFC107' : (shape.part.data.color || fill)).ofObject(),
        ...makeOnewayBinding(false, 'fill', 'stroke', 'strokeWidth', 'radius', 'strokeDashArray')),
      $(go.Panel, 'Table',
        {
          name: 'TABLE',
          defaultRowSeparatorStroke: stroke,
          defaultRowSeparatorStrokeWidth: strokeWidth,
          defaultRowSeparatorDashArray: strokeDashArray
        },
        new go.Binding('defaultRowSeparatorStroke', 'stroke'),
        new go.Binding('defaultRowSeparatorStrokeWidth', 'strokeWidth'),
        new go.Binding('defaultRowSeparatorDashArray', 'strokeDashArray'),
        $(go.Panel, "Horizontal", { row: 0, angle: 0 },
          createTextBlock(style, '竖向泳道', {
            stretch: go.GraphObject.Horizontal
          })
        ),
        $(go.Placeholder,
          { padding: 0, row: 1 }
        )
      )
    )
  }
}


export default { Group, VerticalPool, HorizontalPool, VerticalLane, HorizontalLane }