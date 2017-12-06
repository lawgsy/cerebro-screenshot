import { Component } from 'react'
import PropTypes from 'prop-types'
import { Loading, KeyboardNav, KeyboardNavItem, Button } from 'cerebro-ui'
import styles from './styles.css'

import { clipboard, nativeImage, remote, shell } from 'electron'
import fs from 'fs'

import axios from 'axios'

const imgurApi = axios.create({
  baseURL: "https://api.imgur.com/3",
  headers: {'authorization': 'Client-ID a7c00db34d6219f'}
})

class Preview extends Component {
  render() {
    const { data, settings } = this.props
    const showNotifications = settings.notifications!=="off"
    const silentMode = settings.notifications==="silent"
    const opts = { silent: silentMode }

    const imageObj = nativeImage.createFromDataURL(data)

    const navItems = [ {
      id: "image",
      text: "Copy as image",
      select: () => {
        clipboard.writeImage(imageObj)
        if (showNotifications) new Notification("Copied as image", opts)
      }
    }, {
      id: "dataURL",
      text: "Copy as data URL",
      select: () => {
        clipboard.writeText(data)
        if (showNotifications) {
          new Notification("Copied as data URL", opts)
            .onclick = () => { shell.openItem(data) }
        }
      }
    }, {
      id: "file",
      text: "Save as PNG",
      select: () => {
        remote.getCurrentWindow().hide()
        remote.dialog.showSaveDialog({
          title: "Choose screenshot location...",
          defaultPath: `*/screenshot-${(new Date).toLocaleDateString()}.png`
        }, (fileUrl) => {
          fs.writeFile(fileUrl, imageObj.toPng(), function (err) {
            if (err) throw err

            if (showNotifications) {
              const additionalOptions = {
                title: "Saved screenshot",
                body: fileUrl
              }
              // using spread (...) operator instead of Object.assign
              new Notification({ ...opts, ...additionalOptions })
                .onclick = () => { shell.openItem(fileUrl) }
            }
          })
        })
      }
    }, {
      id: "imgur",
      text: "Upload to Imgur + copy link",
      select: () => {
        new Notification("Uploading to imgur...", opts)
        const postObj = { image: data.split(',')[1], type: "base64" }
        imgurApi.post("/image", postObj).then((response) => {
          clipboard.writeText(response.data.data.link)
          new Notification("Uploaded to imgur and copied to clipboard", opts)
        }).catch((error) => {
          console.error(error)
          new Notification("Failed to upload to imgur (check console)", opts)
        })
      }
    }
  ]

  return (
    <div>
      <img src={data} /> <br /> <br />
      <KeyboardNav>
        <ul className={styles.list}>
        { navItems.map(item => (
        <KeyboardNavItem key={item.id} tagName={'li'} onSelect={item.select}>
          {item.text}
        </KeyboardNavItem>
        )) }
        </ul>
      </KeyboardNav>
    </div>
  )
  }
}

Preview.propTypes = {
  data: PropTypes.string.isRequired,
  settings: PropTypes.object.isRequired
}

export default Preview
