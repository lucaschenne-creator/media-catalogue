import { z } from 'zod'
import type { Catalog } from '../types'

type ItemWithIdAndTags = { id: string; tags: string[] }

export const timestampSchema = z.string().datetime({ offset: true })
export const tagsSchema = z.array(z.string().trim().min(1, '標籤不可為空白字串'))
export const httpUrlSchema = z.url('sourceUrl 必須是有效網址').refine(
  (value) => {
    const protocol = new URL(value).protocol
    return protocol === 'http:' || protocol === 'https:'
  },
  'sourceUrl 必須是 HTTP 或 HTTPS 網址',
)

export function createCatalogSchema<T extends ItemWithIdAndTags>(itemSchema: z.ZodType<T>): z.ZodType<Catalog<T>> {
  return z.object({ version: z.literal(1), updatedAt: timestampSchema, items: z.array(itemSchema) })
    .superRefine((catalog, context) => {
      const ids = new Set<string>()
      catalog.items.forEach((item, itemIndex) => {
        if (ids.has(item.id)) {
          context.addIssue({ code: 'custom', message: `item id「${item.id}」重複`, path: ['items', itemIndex, 'id'] })
        }
        ids.add(item.id)
        const tags = new Set<string>()
        item.tags.forEach((tag, tagIndex) => {
          if (tags.has(tag)) {
            context.addIssue({ code: 'custom', message: `item id「${item.id}」的標籤「${tag}」重複`, path: ['items', itemIndex, 'tags', tagIndex] })
          }
          tags.add(tag)
        })
      })
    })
}
