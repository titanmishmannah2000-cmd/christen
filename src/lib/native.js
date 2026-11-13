import { Capacitor } from '@capacitor/core'
import { App as NativeApp } from '@capacitor/app'

// The Android and iPhone apps (Capacitor). On the web none of this runs.
export const isNative = () => Capacitor.isNativePlatform()

// Android's Back button steps out of whatever is open, one layer at a time:
// the top sheet first, then the Atlas, then back through the chapters read,
// and only then leaves the app. Without this, Back left the app or changed
// chapter while a sheet was still open on top.
export function setupNative() {
  if (!isNative()) return
  NativeApp.addListener('backButton', ({ canGoBack }) => {
    const dialogs = [...document.querySelectorAll('dialog[open]')]
    const top = dialogs[dialogs.length - 1]
    if (top) {
      // The same path as Escape: each sheet's own close, with its exit animation.
      const cancel = new Event('cancel', { cancelable: true })
      top.dispatchEvent(cancel)
      if (!cancel.defaultPrevented) top.close()
      return
    }
    const atlasClose = document.querySelector('#atlas .atlas-tools .atlas-word:last-child')
    if (atlasClose) { atlasClose.click(); return }
    if (canGoBack) window.history.back()
    else NativeApp.exitApp()
  })
}
