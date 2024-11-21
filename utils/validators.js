import validator from 'validator'

validator.isCommonName = function (value) {

  return !value || /^[\w\-\(\)\u4e00-\u9fa5]+$/g.test(value)
}

validator.isPassword = function (value) {
  return !value || /^[\w\-\_(\)\!@#\$\%\^\&\*]+$/g.test(value)
}

validator.isEqual = function (value, { value: v }) {
  return !value || value == v
}

const messages = {
  isPassword: '只能输入字母、数字、特殊字符 ! @ # $ % ^ & * - _',
  isCommonName: '请输入字母，数字或中文符号或符号 ( ) - _',
  isNotEmpty: '必填',
  isAfter: '时间需要在 $date 之后',
  isAlpha: '只能输入字母',
  isAlphanumeric: '只能输入字母或数字',
  isBefore: '时间需要在 $date 之前',
  isCurrency: '货币格式不正确',
  isDecimal: '只能输入数, 小数点后 $decimal_digits 位',
  isEmail: '邮箱格式不正确',
  isEmpty: '必须为空',
  isEqual: ({ label }) => `必须与 ${label} 相同`,
  isIn: (values) => '必须在范围 [' + values.map(value => value).join(',') + '] 之内',
  isInt: '不是一个数字',
  isLength: ({ min, max }) => {
    if (max === undefined) {
      return `长度不能小于 ${min}`
    } else {
      if (max === min) {
        return `长度应为 ${min}`
      } else {
        return `长度不能小于 ${min}, 且不能大于 ${max}`
      }
    }
  },
  isLowercase: '请输入小写字母',
  isMobilePhone: '号码格式不正确',
  isNumeric: '数字格式不正确',
  isURL: '地址格式不正确',
  matches: '格式不正确'
}

export default {
  validate (validateName, options) {
    var one = function (name, value, customMessage) {
      var isPass = false

      switch (name) {
        case 'isNotEmpty':
          isPass = !validator.isEmpty(value || '')
          break;

        default:
          if (validator.hasOwnProperty(name)) {
            isPass = validator[name](value || '', options)
          }
          break;
      }

      if (!isPass) {
        var message = messages[name]
        if (customMessage) {
          return customMessage
        }
        else {
          if (typeof (message) === 'string') {
            return message
          } else if (typeof (message) === 'function') {
            return message(options)
          } else {
            return '格式不正确'
          }
        }
      }

      return true
    }

    return (value = '') => {
      var isSuccess = false
      var errorMessage = null
      var result = false
      var [validation, customMessage] = validateName.split(':')
      var names = validation.split('|')

      names.some((name) => {
        result = one(name, value, customMessage)

        if (result === true) {
          isSuccess = true
        } else {
          errorMessage = errorMessage || result
        }

        return isSuccess
      })

      return isSuccess || errorMessage
    }

  },
  install (vue) {
    vue.prototype.$validate = this.validate
  }
}