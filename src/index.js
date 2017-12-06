import Preview from './Preview'

import getScreen from 'user-media-screenshot';
import {clipboard, nativeImage} from 'electron'

import styles from './Preview/styles.css'
import iconPath from './icon.png'

const fn = ({ term, display, actions, settings }) => {
  if (term.match(/^screenshot\s?$/i)) {
    document.documentElement.style.display = "none"
    getScreen((image) => {
      const imageObj = nativeImage.createFromDataURL(image)
      document.documentElement.style.display = "inline"
      display({
        title: `Screenshot preview`,
        getPreview: () => <Preview data={image} settings={settings} />,
        icon: iconPath
      })
    })
  }
}

export default {
  name: 'Take screenshot',
  icon: iconPath,
  fn,
  keyword: 'screenshot',
  settings: {
    notifications: {
      label: 'Notifications',
      description: 'Notification settings',
      type: 'option',
      options: [{
        value: "off",
        label: "Off"
      }, {
        value: "silent",
        label: "Silent - No sound"
      }, {
        value: "on",
        label: "On"
      }],
      defaultValue: "on"
    }
  }
}
