import clientPromise from '@/lib/mongodb'
import bcrypt from 'bcryptjs'

export async function POST(request) {
  try {
    const { email, password } = await request.json()
    
    const client = await clientPromise
    const db = client.db('gucci-store')
    const users = db.collection('users')
    
    const user = await users.findOne({ email })
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid credentials' 
      }), { status: 401 })
    }
    
    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Invalid credentials' 
      }), { status: 401 })
    }
    
    const { password: _, ...userWithoutPassword } = user
    
    return new Response(JSON.stringify({ 
      success: true, 
      user: userWithoutPassword 
    }), { status: 200 })
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error' 
    }), { status: 500 })
  }
}