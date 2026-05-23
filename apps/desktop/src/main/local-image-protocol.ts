import { net, protocol } from 'electron'
import { pathToFileURL } from 'url'
import {
  getLocalImageIdFromUrl,
  getRegisteredLocalImagePath,
  isSupportedLocalImageFile,
  LOCAL_IMAGE_SCHEME
} from './local-images'

export function registerLocalImageScheme(): void {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: LOCAL_IMAGE_SCHEME,
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true
      }
    }
  ])
}

export function registerLocalImageProtocol(): void {
  protocol.handle(LOCAL_IMAGE_SCHEME, (request) => {
    const id = getLocalImageIdFromUrl(request.url)
    const filePath = id ? getRegisteredLocalImagePath(id) : null

    if (!filePath || !isSupportedLocalImageFile(filePath)) {
      return new Response(null, { status: 404 })
    }

    return net.fetch(pathToFileURL(filePath).href)
  })
}
