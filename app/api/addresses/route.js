import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User ID is required',
      }), { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('gucci-store')
    const addresses = db.collection('addresses')

    const userAddresses = await addresses
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    return new Response(JSON.stringify({
      success: true,
      addresses: userAddresses,
    }), { status: 200 })
  } catch (error) {
    console.error('Error fetching addresses:', error)
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to fetch addresses',
    }), { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { userId, firstName, lastName, email, phone, street, city, state, zipCode, country, countryCode, isDefault } = await request.json()

    if (!userId || !firstName || !lastName || !email || !phone || !street || !city || !state || !zipCode) {
      return new Response(JSON.stringify({
        success: false,
        message: 'All fields are required',
      }), { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('gucci-store')
    const addresses = db.collection('addresses')

    // If this is set as default, unset all other defaults for this user
    if (isDefault) {
      await addresses.updateMany(
        { userId },
        { $set: { isDefault: false } }
      )
    }

    const result = await addresses.insertOne({
      userId,
      firstName,
      lastName,
      email,
      phone,
      street,
      city,
      state,
      zipCode,
      country: country || '',
      countryCode: countryCode || '',
      isDefault: isDefault || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    return new Response(JSON.stringify({
      success: true,
      message: 'Address saved successfully',
      addressId: result.insertedId,
    }), { status: 201 })
  } catch (error) {
    console.error('Error saving address:', error)
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to save address',
    }), { status: 500 })
  }
}
