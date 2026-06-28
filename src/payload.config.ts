import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Outlets } from './collections/Outlets'
import { Categories } from './collections/Categories'
import { Products } from './collections/Products'
import { BranchProducts } from './collections/BranchProducts'
import { Addresses } from './collections/Addresses'
import { Orders } from './collections/Orders'
import { Payments } from './collections/Payments'
import { Deliveries } from './collections/Deliveries'
import { Reviews } from './collections/Reviews'

// import { SiteSettings } from './globals/SiteSettings'
// import { Homepage } from './globals/Homepage'

import { allowedOrigins } from './utils/cors/corsHandler'

import { bkashInitiate } from './endpoints/payment/bkash/initiate'
import { bkashCallback } from './endpoints/payment/bkash/callback'
import { bkashVerify } from './endpoints/payment/bkash/verify'
import { nagadInitiate } from './endpoints/payment/nagad/initiate'
import { nagadCallback } from './endpoints/payment/nagad/callback'
import { nagadVerify } from './endpoints/payment/nagad/verify'
import { sslInitiate } from './endpoints/payment/sslcommerz/initiate'
import { sslSuccess } from './endpoints/payment/sslcommerz/success'
import { sslFail } from './endpoints/payment/sslcommerz/fail'
import { sslCancel } from './endpoints/payment/sslcommerz/cancel'
import { trackOrder } from './endpoints/orders/track'
import { revalidateWebhook } from './endpoints/webhooks/revalidate'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      beforeNavLinks: ['./components/DashboardNavLink'],
      beforeDashboard: ['./components/DashboardWidget#default'],
      afterLogin: ['./components/PoweredBy'],
      logout: {
        Button: './components/PoweredByAfterLogout',
      },
      graphics: {
        Icon: '/graphics/Icon/index.tsx#Icon',
        Logo: '/graphics/Logo/index.tsx#Logo',
      },
    },
    meta: {
      description: 'Yummy Admin Panel',
      icons: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          url: '/assets/favicon.ico',
        },
      ],
      titleSuffix: 'Yummy - Happiness in every bite',
    },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [
    Users,
    Media,
    Outlets,
    Categories,
    Products,
    BranchProducts,
    Addresses,
    Orders,
    Payments,
    Deliveries,
    Reviews,
  ],
  // globals: [SiteSettings, Homepage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    disable: true,
  },
  endpoints: [
    { path: '/payment/bkash/initiate', method: 'post', handler: bkashInitiate },
    { path: '/payment/bkash/callback', method: 'get', handler: bkashCallback },
    { path: '/payment/bkash/verify', method: 'post', handler: bkashVerify },
    { path: '/payment/nagad/initiate', method: 'post', handler: nagadInitiate },
    { path: '/payment/nagad/callback', method: 'post', handler: nagadCallback },
    { path: '/payment/nagad/verify', method: 'post', handler: nagadVerify },
    { path: '/payment/sslcommerz/initiate', method: 'post', handler: sslInitiate },
    { path: '/payment/sslcommerz/success', method: 'post', handler: sslSuccess },
    { path: '/payment/sslcommerz/fail', method: 'post', handler: sslFail },
    { path: '/payment/sslcommerz/cancel', method: 'post', handler: sslCancel },
    { path: '/orders/track', method: 'get', handler: trackOrder },
    { path: '/webhooks/revalidate', method: 'post', handler: revalidateWebhook },
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  cors: allowedOrigins,
  csrf: allowedOrigins,
  cookiePrefix: 'yummy',
})
