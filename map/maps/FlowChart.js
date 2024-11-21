import go from 'gojs'
import _ from 'lodash'
import Maps from './Maps'

let toolTip = go.GraphObject.make("ToolTip", { name: 'SIZE_TOOLTIP' },
  go.GraphObject.make(go.Panel,
    go.GraphObject.make(go.TextBlock, { name: 'TEXT', margin: 4 })))
let $ = go.GraphObject.make
const DefaultModel = {
}

class FlowChart extends Maps {
  name = "FLOWCHART"
  allowActions = ['undo', 'redo', 'cut', 'paste', , 'copy', 'ceiling', 'floor', 'lock', 'unlock', 'merge', 'split']

  getProperties() {
    return {
      "undoManager.isEnabled": true,
      //"commandHandler.archetypeGroupData": { isGroup: true, title: '分组', ungroupable: true, category: 'Group' },
      ...this.toolMaker.makeGuideDraggingTool(),
      ...this.toolMaker.makeMeshTemplate(),
      ...this.templateMaker.makeGroupTemplate(),
      ...this.templateMaker.makeNodeTemplates(),
      ...this.templateMaker.makeLinkTemplate(),
      ...this.toolMaker.makeRelinkTool(),
      ...this.toolMaker.makeRotatingTool(),
      ...this.toolMaker.makeResizingTool(),
      "draggingTool.dragsLink": true,
      "draggingTool.isGridSnapEnabled": true,
      "linkingTool.isUnconnectedLinkValid": true,
      "linkingTool.portGravity": 20,
      "relinkingTool.isUnconnectedLinkValid": true,
      "relinkingTool.portGravity": 20,
      "rotatingTool.handleAngle": 270,
      "rotatingTool.handleDistance": 30,
      "rotatingTool.snapAngleMultiple": 15,
      "rotatingTool.snapAngleEpsilon": 15,
      "undoManager.isEnabled": true
    }
  }

  parseModel(model) {
    return go.Model.fromJson(model || DefaultModel)
  }

  created() {

    this.toolMaker.setupRule(this.canvas)
    // this.canvas.toolManager.draggingTool.on('dragger:start', () => {
    //   this.templateMaker.onStartDrag.call(this.templateMaker, arguments)
    // })
    // this.canvas.toolManager.draggingTool.on('dragger:dragging', () => {
    //   this.canvas.selection.each(function (part) {
    //     if (part instanceof go.Link || part instanceof go.Group)
    //       return

    //     toolTip.findObject('TEXT').text = `X:${part.position.x.toFixed(2)} Y:${part.position.y.toFixed(2)}`
    //     part.diagram.toolManager.showToolTip(toolTip, part)
    //   })

    //   this.templateMaker.onDragging.call(this.templateMaker, arguments)
    // })
    // this.canvas.toolManager.draggingTool.on('dragger:stop', () => this.templateMaker.onStopDrag.call(this.templateMaker, arguments))
  }

}

export default FlowChart