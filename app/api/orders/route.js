import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: 'User ID is required' }),
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('gucci-store')
    const orders = db.collection('orders')

    const userOrders = await orders
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    return new Response(
      JSON.stringify({ success: true, orders: userOrders }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Get orders error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Server error' }),
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const orderData = await request.json()

    const {
      userId,
      orderId,
      items,
      shippingAddress,
      deliveryOption,
      paymentMethod,
      total,
    } = orderData

    // Validate required fields
    if (!userId || !orderId || !items || !shippingAddress || !deliveryOption || !paymentMethod || total === undefined) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required fields' }),
        { status: 400 }
      )
    }

    const client = await clientPromise
    const db = client.db('gucci-store')
    const orders = db.collection('orders')

    const newOrder = {
      userId,
      orderId,
      items,
      shippingAddress,
      deliveryOption,
      paymentMethod,
      total,
      status: 'Processing', // pending, processing, shipped, delivered
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await orders.insertOne(newOrder)

    return new Response(
      JSON.stringify({
        success: true,
        order: { ...newOrder, _id: result.insertedId },
      }),
      { status: 201 }
    )
  } catch (error) {
    console.error('Create order error:', error)
    return new Response(
      JSON.stringify({ success: false, message: 'Server error' }),
      { status: 500 }
    )
  }
}
