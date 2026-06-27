import type { GlobalConfig } from 'payload'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    { name: 'siteName', type: 'text', defaultValue: 'Yummy Bakery' },
    { name: 'tagline', type: 'text', defaultValue: 'Happiness in Every Bite' },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'logo', type: 'upload', relationTo: 'media' },
    { name: 'favicon', type: 'upload', relationTo: 'media' },
    {
      name: 'socialLinks',
      type: 'group',
      fields: [
        { name: 'facebook', type: 'text' },
        { name: 'instagram', type: 'text' },
      ],
    },
    { name: 'footerText', type: 'textarea' },
    {
      name: 'deliveryFee',
      type: 'number',
      defaultValue: 60,
      admin: { description: 'Standard delivery fee in BDT' },
    },
    {
      name: 'freeDeliveryThreshold',
      type: 'number',
      defaultValue: 500,
      admin: { description: 'Order amount above which delivery is free (BDT)' },
    },
  ],
}
