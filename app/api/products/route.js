import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('gucci-store')
    const products = db.collection('products')
    
    const allProducts = await products.find({}).toArray()
    
    return new Response(JSON.stringify({ 
      success: true, 
      products: allProducts 
    }), { status: 200 })
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error' 
    }), { status: 500 })
  }
}

export async function POST(request) {
  try {
    const product = await request.json()
    
    const client = await clientPromise
    const db = client.db('gucci-store')
    const products = db.collection('products')
    
    const newProduct = {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await products.insertOne(newProduct)
    
    return new Response(JSON.stringify({ 
      success: true, 
      product: { ...newProduct, _id: result.insertedId } 
    }), { status: 201 })
    
  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error' 
    }), { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { productId, name, description, price, category, image } = await request.json()
    
    const client = await clientPromise
    const db = client.db('gucci-store')
    const products = db.collection('products')
    
    const result = await products.findOneAndUpdate(
      { _id: new ObjectId(productId) },
      {
        $set: {
          name,
          description,
          price,
          category,
          image,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    )
    
    return new Response(JSON.stringify({ 
      success: true, 
      product: result.value
    }), { status: 200 })
    
  } catch (error) {
    console.error('Update error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error' 
    }), { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const { productId } = await request.json()
    
    const client = await clientPromise
    const db = client.db('gucci-store')
    const products = db.collection('products')
    
    const result = await products.deleteOne({ _id: new ObjectId(productId) })
    
    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: 'Product not found' 
      }), { status: 404 })
    }
    
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Product deleted'
    }), { status: 200 })
    
  } catch (error) {
    console.error('Delete error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      message: 'Server error' 
    }), { status: 500 })
  }
}