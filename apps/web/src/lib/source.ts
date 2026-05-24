import { loader } from 'fumadocs-core/source'
import { docs } from '../../.source/server'

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: '/docs',
  i18n: {
    parser: 'none',
    languages: ['en', 'zh'],
    defaultLanguage: 'en',
    hideLocale: 'always'
  }
})
