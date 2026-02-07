import enUS from './en-US.js'
import zhTW from './zh-TW.js'
import sharedMessages from '@sylvia-iot/shared/i18n'

export default {
  'en-US': { ...enUS, ...sharedMessages['en-US'] },
  'zh-TW': { ...zhTW, ...sharedMessages['zh-TW'] },
}
