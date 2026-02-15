import enUS from './en-US.js'
import zhTW from './zh-TW.js'
import sharedMessages from '@sylvia-iot/shared/i18n'
import coreMessages from '@sylvia-iot/mfe-core/i18n'
import dataMessages from '@sylvia-iot/mfe-data/i18n'

export default {
  'en-US': { ...enUS, ...sharedMessages['en-US'], ...coreMessages['en-US'], ...dataMessages['en-US'] },
  'zh-TW': { ...zhTW, ...sharedMessages['zh-TW'], ...coreMessages['zh-TW'], ...dataMessages['zh-TW'] },
}
