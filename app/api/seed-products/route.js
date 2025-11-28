import clientPromise from '@/lib/mongodb'

export async function POST(request) {
  try {
    const client = await clientPromise
    const db = client.db('gucci-store')
    const products = db.collection('products')

    // Sample products
    const sampleProducts = [
      {
        name: 'Gucci Marmont Matelassé Shoulder Bag',
        description: 'Crafted from Matelassé leather, this iconic shoulder bag features the signature GG Marmont hardware.',
        price: 2200,
        category: 'women',
        image: '/gu.avif',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'GG Supreme Canvas Tote',
        description: 'A versatile tote bag made from GG Supreme canvas with leather trim. Perfect for everyday use.',
        price: 1950,
        category: 'women',
        image: '/gu.avif',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gucci Soho Leather Disco Bag',
        description: 'The iconic Soho Disco bag in premium leather with a chain strap and tassel detail.',
        price: 1890,
        category: 'women',
        image: '/gu.avif',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gucci Brixton Loafer',
        description: 'A luxurious loafer crafted from premium leather with the signature Horsebit hardware.',
        price: 790,
        category: 'men',
        image: '/mens-bag-gu.avif',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'GG Marmont Leather Belt',
        description: 'A versatile leather belt featuring the iconic GG Marmont buckle in antique gold.',
        price: 450,
        category: 'men',
        image: '/mens-bag-gu.avif',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gucci Dionysus Medium Shoulder Bag',
        description: 'An elegant shoulder bag featuring the distinctive Dionysus hardware in aged gold-toned metal.',
        price: 2400,
        category: 'women',
        image: '/gu.avif',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gucci Jackie 1961 Small Shoulder Bag',
        description: 'A tribute to a vintage style, this shoulder bag combines heritage with contemporary design.',
        price: 2100,
        category: 'women',
        image: '/men.avif',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Gucci Messenger Bag',
        description: 'A practical yet stylish messenger bag crafted from premium GG canvas with leather accents.',
        price: 1650,
        category: 'men',
        image: '/mens-bag-gu.avif',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]

    // Check if products already exist
    const existingProducts = await products.countDocuments()
    
    if (existingProducts > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Products already seeded'
      }), { status: 400 })
    }

    // Insert sample products
    const result = await products.insertMany(sampleProducts)

    return new Response(JSON.stringify({
      success: true,
      message: `${result.insertedIds.length} products created successfully`,
      insertedCount: result.insertedIds.length
    }), { status: 201 })

  } catch (error) {
    console.error('Seed products error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to seed products: ' + error.message
    }), { status: 500 })
  }
}
