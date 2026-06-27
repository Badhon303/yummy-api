import { getPayload } from 'payload'
import config from '../payload.config'

async function seed() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding database...')

  // --- Admin user ---
  const existingAdmin = await payload.find({
    collection: 'users',
    where: { email: { equals: 'admin@yummybakery.com' } },
    limit: 1,
  })

  if (!existingAdmin.docs.length) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@yummybakery.com',
        password: 'Password123!',
        role: 'admin',
      },
    })
    payload.logger.info('Created admin user: admin@yummybakery.com / Password123!')
  } else {
    payload.logger.info('Admin user already exists, skipping.')
  }

  // --- Branches ---
  const branches = [
    { name: 'Gulshan', location: 'Gulshan 2, Dhaka', phone: '+8801700000001' },
    { name: 'Dhanmondi', location: 'Dhanmondi 27, Dhaka', phone: '+8801700000002' },
    { name: 'Banani', location: 'Banani 11, Dhaka', phone: '+8801700000003' },
  ]

  const branchIds: number[] = []
  for (const branch of branches) {
    const existing = await payload.find({
      collection: 'branches',
      where: { name: { equals: branch.name } },
      limit: 1,
    })
    if (existing.docs.length) {
      branchIds.push((existing.docs[0] as any).id)
    } else {
      const created = await payload.create({
        collection: 'branches',
        data: { ...branch, isActive: true },
      })
      branchIds.push(created.id)
    }
  }
  payload.logger.info(`Branches ready: ${branchIds.length}`)

  // --- Categories ---
  const categories = [
    { name: 'Cakes', description: 'Birthday, wedding & custom cakes' },
    { name: 'Pastries', description: 'Fresh pastries and patties' },
    { name: 'Breads', description: 'Artisan breads and buns' },
    { name: 'Cookies', description: 'Cookies and biscuits' },
    { name: 'Cupcakes', description: 'Mini treats for any occasion' },
  ]

  const categoryIds: number[] = []
  for (const cat of categories) {
    const existing = await payload.find({
      collection: 'categories',
      where: { name: { equals: cat.name } },
      limit: 1,
    })
    if (existing.docs.length) {
      categoryIds.push((existing.docs[0] as any).id)
    } else {
      const created = await payload.create({
        collection: 'categories',
        data: { ...cat } as any,
        overrideAccess: true,
      })
      categoryIds.push(created.id)
    }
  }
  payload.logger.info(`Categories ready: ${categoryIds.length}`)

  // --- Products ---
  const products = [
    {
      name: 'Chocolate Truffle Cake',
      shortDescription: 'Rich chocolate cake with ganache',
      basePrice: 1200,
      category: categoryIds[0],
    },
    {
      name: 'Vanilla Sponge Cake',
      shortDescription: 'Light vanilla sponge with cream',
      basePrice: 900,
      category: categoryIds[0],
    },
    {
      name: 'Red Velvet Cake',
      shortDescription: 'Classic red velvet with cream cheese',
      basePrice: 1100,
      category: categoryIds[0],
    },
    {
      name: 'Chicken Patty',
      shortDescription: 'Flaky pastry with chicken filling',
      basePrice: 60,
      category: categoryIds[1],
    },
    {
      name: 'Beef Patty',
      shortDescription: 'Flaky pastry with beef filling',
      basePrice: 70,
      category: categoryIds[1],
    },
    {
      name: 'Garlic Bread',
      shortDescription: 'Freshly baked garlic bread',
      basePrice: 150,
      category: categoryIds[2],
    },
    {
      name: 'Butter Croissant',
      shortDescription: 'Buttery, flaky croissant',
      basePrice: 80,
      category: categoryIds[2],
    },
    {
      name: 'Chocolate Chip Cookie',
      shortDescription: 'Soft-baked chocolate chip cookies',
      basePrice: 50,
      category: categoryIds[3],
    },
    {
      name: 'Vanilla Cupcake',
      shortDescription: 'Vanilla cupcake with buttercream',
      basePrice: 120,
      category: categoryIds[4],
    },
  ]

  const productIds: number[] = []
  for (const product of products) {
    const existing = await payload.find({
      collection: 'products',
      where: { name: { equals: product.name } },
      limit: 1,
    })
    if (existing.docs.length) {
      productIds.push((existing.docs[0] as any).id)
    } else {
      const created = await payload.create({
        collection: 'products',
        data: { ...product, isActive: true } as any,
        overrideAccess: true,
      })
      productIds.push(created.id)
    }
  }
  payload.logger.info(`Products ready: ${productIds.length}`)

  // --- BranchProducts (stock per branch) ---
  for (const productId of productIds) {
    for (const branchId of branchIds) {
      const existing = await payload.find({
        collection: 'branch-products',
        where: {
          and: [{ product: { equals: productId } }, { branch: { equals: branchId } }],
        },
        limit: 1,
      })
      if (!existing.docs.length) {
        await payload.create({
          collection: 'branch-products',
          data: {
            product: productId,
            branch: branchId,
            stockQuantity: Math.floor(Math.random() * 50) + 10,
            lowStockThreshold: 5,
            isAvailable: true,
          },
        })
      }
    }
  }
  payload.logger.info('Branch products (stock) created')

  // --- Site Settings global ---
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      siteName: 'Yummy Bakery',
      tagline: 'Happiness in Every Bite',
      phone: '+880 1700-000000',
      email: 'hello@yummybakery.com',
      socialLinks: {
        facebook: 'https://facebook.com/yummybakery',
        instagram: 'https://instagram.com/yummybakery',
      },
      footerText: '© 2025 Yummy Bakery. All rights reserved.',
      deliveryFee: 60,
      freeDeliveryThreshold: 1000,
    },
  })
  payload.logger.info('Site settings updated')

  // --- Homepage global ---
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      hero: {
        headline: 'Freshly Baked, Delivered to You',
        subheadline: 'Order from our bakery branches across Dhaka',
      },
      featuredCategories: categoryIds,
      aboutTeaser: {
        heading: 'Our Story',
        body: 'Since 2010, Yummy Bakery has been crafting delicious treats with the finest ingredients.',
        ctaText: 'Learn More',
      },
      stats: {
        happyCustomers: 10000,
        bakeryItems: 50,
        cityOutlets: 3,
        yearsOfBaking: 15,
      },
    },
  })
  payload.logger.info('Homepage updated')

  payload.logger.info('Seed complete!')
  process.exit(0)
}

seed().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
