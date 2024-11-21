import go, { EnumValue } from 'gojs'
import _ from 'lodash'
import ToolMaker from '../tools'
import TemplateMaker from '../templates/'

import { ActionList } from '../Action'
// import '../extentions/Arrow'
import Commander from '../extentions/Commander'
import TextEditingTool from '../extentions/TextEditor'
import EventEmitter from 'event-emitter'

let $ = go.GraphObject.make

const Captures = Object.freeze({
  PNG: Symbol('png'),
  SVG: Symbol('svg'),
  JPEG: Symbol('jpg'),
  BASE64: Symbol('base64')
})

/**
 * 将 style 于 setting 重复样式写入到新的样式之中,并返回新的样式
 * @param {*} styleObject 
 * @param {*} setting
 * @returns {*} new style Object
 */
const mixinSettingToStyle = function (styleObject = {}, setting = {}) {
  var result = _.clone(styleObject)
  let { meshColor, ruleColor, background } = setting
  let { root } = result

  if (!_.isEmpty(meshColor)) {
    _.set(root, 'meshColor', meshColor)
  }

  if (!_.isEmpty(ruleColor)) {
    _.set(root, 'ruleColor', ruleColor)
  }

  if (!_.isEmpty(background)) {
    _.set(root, 'background', background)
  }

  return result
}

const onModelChange = function (e) {
  var model = e.model.toJSON()

  if (e.isTransactionFinished && !_.isEqual(this.model, model)) {

    this.event.emit('model:changed', JSON.parse(model))
    this.model = model
  }
}

/**
   * 将 css style object 直接应用于 canvas 对应的 div 之上
   * @param {*} key 
   * @param {*} style 
   */
const setCanvasWrapperStyle = function (canvas, key, style) {
  canvas.div.style[key] = style
  canvas.requestUpdate()
}

class Maps {
  setting = null
  style = null
  canvas = null
  model = null
  toolMaker = null
  templateMaker = null
  actionList = null
  onModelChange = null
  allowActions = []
  event = new EventEmitter()

  constructor(style, setting) {
    if (setting) {
      this.setting = setting
    }

    if (style) {
      this.style = style
    }

    this.onModelChange = onModelChange.bind(this)
  }

  /**
   * 挂载
   * @param {*} elementId 
   */
  mount(elementId, model) {
    this.canvas = $(go.Diagram, elementId,)
    // Empty funcion to crack go.js license temporary
    this.canvas.ir = function () { }
    this.canvas.commandHandler = new Commander()
    this.canvas.commandHandler.arrowKeyBehavior = 'select'
    this.canvas.commandHandler.shortcutEvent.on('shortcut', (args) => {
      if (this.templateMaker.onShortcut(args.char)) {
        args.isHandle = true
      }
    })

    this.canvas.toolManager.textEditingTool.defaultTextEditor = TextEditingTool

    this.actionList = new ActionList(this.canvas)
    this.toolMaker = new ToolMaker(mixinSettingToStyle(this.style, this.setting), this.canvas)
    this.templateMaker = new TemplateMaker(this.style, this.canvas, this.actionList, this.name)

    var ps = this.getProperties()
    this.canvas.setProperties({ ...ps })
    this.canvas.model = this.parseModel(model)
    //this.canvas.toolManager.toolTipDuration  = 500
    this.canvas.toolManager.hoverDelay = 200
    this.model = this.canvas.model.toJSON()
    this.created && this.created()

    this.canvas.model.addChangedListener(this.onModelChange)
    this.applySetting(this.setting)
  }

  /**
   * 循环选中
   * @param {*} callback 
   * @param {*} onFinish 
   */
  loopSelection(callback, onFinish) {
    var it = this.canvas.selection.iterator
    while (it.next()) {
      callback.call(this, it.value, it)
    }

    if (onFinish) {
      onFinish()
    }
  }

  /**
   * 设置是否只读
   * @param {Boolean} isReadonly 
   */
  setReadonly(isReadOnly) {
    this.canvas.setProperties({
      isReadOnly
    })
  }

  /**
   * 设置数据
   * @param {*} model 
   * @param {*} isFireEvent 
   */
  setModel(model, isFireEvent) {
    if (!isFireEvent) {
      this.canvas.removeModelChangedListener(this.onModelChange)
    }

    // this.model = model
    this.canvas.setProperties({
      model: go.Model.fromJson(model)
    })

    if (!isFireEvent) {
      this.canvas.addModelChangedListener(this.onModelChange)
    }
  }

  /**
   * 获取实体
   * @return {*} result
   */
  getModel() {
    return this.canvas.model.toJSON()
  }

  addMapListener(name, listener) {
    this.canvas.addDiagramListener(name, listener)
  }

  addStyleListener(listener) {
    this.styleChangeListener.push(listener)
  }

  /**
   * 应用尺寸和方向
   * @param {*} param0 
   */
  applySizeDirection({ direction, width, height, size }) {
    var d = direction || this.setting.direction
    var w = width || this.setting.width
    var h = height || this.setting.height

    if (!_.isEmpty(w) && !_.isEmpty(h)) {
      var offset = parseInt(w) - parseInt(h)
      var s = size || this.setting.size

      if (offset !== 0) {
        switch (d) {
          case 'H':
            if (offset > 0) {
              this.applySize(w, h)
            } else {
              this.applySize(h, w)
            }

            break;

          case 'V':
            if (offset > 0) {
              this.applySize(h, w)
            } else {
              this.applySize(w, h)
            }

            break;
        }
      }
    }
  }

  /**
   * 应用尺寸
   * @param {*} param0 
   */
  applySize({ width, height }) {
    setCanvasWrapperStyle(this.canvas, 'width', width)
    setCanvasWrapperStyle(this.canvas, 'height', height)
  }

  /**
   * 应用设置
   * @param {*} setting
   */
  applySetting(setting) {
    let { showMesh, showRule, width, height, direction } = setting

    if (showMesh === true) {
      this.toolMaker.setupMesh(this.canvas)
    } else if (showMesh === false) {
      this.toolMaker.unsetupMesh(this.canvas)
    }

    if (showRule === true) {
      let { width, height } = setting

      if (!width) {
        width = this.canvas.div.offsetWidth
      }

      if (!height) {
        height = this.canvas.div.offsetHeight
      }

      this.toolMaker.setupRule(this.canvas, width, height)
    } else if (showRule === false) {
      this.toolMaker.unsetupRule(this.canvas)
    }

    if (!_.isEmpty(direction)) {
      this.applySizeDirection(setting)
    }

    if (!_.isEmpty(width) && !_.isEmpty(height)) {
      this.applySize(setting)
    }

    this.applyStyle(this.style)
  }

  /**
   * 改变设置
   * @param {*} changes
   */
  changeSetting(changes) {
    this.setting = {
      ...this.setting,
      ...changes
    }

    this.applySetting(this.setting)
    this.event.emit('setting:changed', this.setting)
  }

  /**
   * 改变样式对象
   * @param {*} styleObject 
   */
  changeStyle(styleObject) {
    this.style = styleObject
    //this.applyStyle(styleObject)
    this.canvas.model.commit(($) => {
      $.modelData = { ...$.modelData, ...styleObject.model }
    })
    //this.event.emit('style:changed', styleObject)

    // this.templateMaker.style = styleObject
    // this.canvas.setProperties({
    //   ...this.templateMaker.makeNodeTemplates(),
    //   ...this.templateMaker.makeLinkTemplate(),
    //   ...this.templateMaker.makeGroupTemplate()
    // })
    // this.applyStyle(styleObject)
    // this.event.emit('style:changed', this.style)
    // this.canvas.requestUpdate()
    //this.toolMaker.changeStyleObject(styleObject, this.canvas)
    //this.templateMaker.changeStyleObject(styleObject, this.canvas)

  }

  /**
   * 应用样式对象
   * @param {*} styleObject 
   */
  applyStyle(styleObject) {
    // var styleModel = mixinSettingToStyle(styleObject.model, this.setting)

    // var rootStyle = _.get(styleModel, 'root') || {}
    // var background = _.get(rootStyle, 'background')

    // if (!_.isEmpty(background)) {
    //   setCanvasWrapperStyle(this.canvas, 'background', background)
    // }
  }

  /**
   * 
   * @param {Captures} member 
   */
  capture(member, padding = 20) {
    var rect = this.canvas.documentBounds;
    var { x, y, width, height, centerX, centerY } = rect;
    var offset = Math.max(width, height) + padding;
    var left = centerX - offset / 2 - padding;
    var top = centerY - offset / 2 - padding;

    var position = new go.Point(left, top);
    var size = new go.Size(
      offset + padding * 2,
      offset + padding * 2
    );
    var background =
      _.get(this.setting, "root.background") ||
      _.get(this.style, "model.root.background") ||
      "#fff";

    return new Promise((resolve, reject) => {
      switch (member) {
        case Captures.PNG:
          this.canvas.makeImageData({
            scale: 1,
            type: "image/png",
            background,
            position,
            size,
            returnType: "blob",
            callback(imageData) {
              // FileSaver.saveAs(imageData, fileName);
              resolve(imageData)
            }
          });
          break;

        case Captures.BASE64:
          this.canvas.makeImageData({
            scale: 1,
            type: "image/png",
            background,
            position,
            size,
            callback(imageData) {
              // FileSaver.saveAs(imageData, fileName);
              resolve(imageData)
            }
          });
          break;

        case Captures.SVG:
          var html = this.map.canvas.makeSvg({
            position: new go.Point(NaN, NaN),
            background,
            position,
            size
          });

          var blob = new Blob([html.outerHTML], {
            type: "text/plain;charset=utf-8"
          });
          //FileSaver.saveAs(blob, fileName);
          resolve(blob)

          break;
      }
    })
  }

  unmount() {
    if (this.canvas) {
      this.canvas.div = null
      //this.canvas = null
      // this.setting = null
      // this.style = null
      // this.canvas = null
      // this.model = null
      // this.toolMaker = null
      // this.templateMaker = null
      // this.actionList = null
      // this.allowActions = null
      // this.event = null

      // delete this.setting
      // delete this.style
      // delete this.canvas
      // delete this.model
      // delete this.toolMaker
      // delete this.templateMaker
      // delete this.actionList
      // delete this.allowActions
      // delete this.event
      // delete this.canvas
    }
    //this.canvas = null
    //delete this.canvas
  }
}

Maps.Captures = Captures


export default Maps
