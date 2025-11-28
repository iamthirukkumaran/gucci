import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { name, email, password, role = 'user' } = await request.json()
    
    const client = await clientPromise
    const db = client.db('gucci-store')
    const users = db.collection('users')
    
    const existingUser = await users.findOne({ email })
    
    if (existingUser) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'User already exists' 
      }), { status: 400 })
    }
    
    const hashedPassword = await bcrypt.hash(password, 12)
    
    const newUser = {
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date()
    }
    
    await users.insertOne(newUser)
    
    const { password: _, ...userWithoutPassword } = newUser
    
    return new Response(JSON.stringify({ 
      success: true, 
      user: userWithoutPassword 
    }), { status: 201 })
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error' 
    }), { status: 500 })
  }
}