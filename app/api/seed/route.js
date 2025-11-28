import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const client = await clientPromise
    const db = client.db('gucci-store')
    const users = db.collection('users')

    // Check if superadmin already exists
    const existingSuperAdmin = await users.findOne({ email: 'admin@gucci.com' })
    
    if (existingSuperAdmin) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Superadmin already exists'
      }), { status: 400 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('SuperAdmin@2025', 12)

    // Create superadmin user
    const superAdmin = {
      name: 'Gucci Admin',
      email: 'admin@gucci.com',
      password: hashedPassword,
      role: 'superadmin',
      createdAt: new Date()
    }

    const result = await users.insertOne(superAdmin)

    return new Response(JSON.stringify({
      success: true,
      message: 'Superadmin created successfully',
      credentials: {
        email: 'admin@gucci.com',
        password: 'SuperAdmin@2025',
        role: 'superadmin'
      },
      userId: result.insertedId
    }), { status: 201 })

  } catch (error) {
    console.error('Seed error:', error)
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to create superadmin: ' + error.message
    }), { status: 500 })
  }
}
