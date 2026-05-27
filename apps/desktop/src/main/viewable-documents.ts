import {
  defaultViewableDocumentExtensions,
  isViewableDocumentPath as isPathViewable,
  normalizeDocumentExtension,
  normalizeViewableDocumentExtensions
} from '../shared/viewable-documents'
import { getAppSettings } from './settings'

export {
  defaultViewableDocumentExtensions,
  normalizeDocumentExtension,
  normalizeViewableDocumentExtensions
}

export function getViewableDocumentExtensions(): string[] {
  return getAppSettings().viewableDocumentExtensions
}

export function isViewableDocumentPath(filePath: string): boolean {
  return isPathViewable(filePath, getViewableDocumentExtensions())
}
