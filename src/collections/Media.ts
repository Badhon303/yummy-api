import type { CollectionConfig } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  labels: {
    singular: '🏜️ Media',
    plural: '🏜️ Media',
  },
  admin: {
    group: '⚙️ Settings',
  },
  upload: {
    staticDir: path.resolve(dirname, '../../media'),
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    imageSizes: [
      { name: 'thumbnail', width: 300, height: 300, crop: 'center' },
      { name: 'card', width: 600, height: 400, crop: 'center' },
      { name: 'hero', width: 1920, height: 1080 },
    ],
    adminThumbnail: 'thumbnail',
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
    },
  ],
}
