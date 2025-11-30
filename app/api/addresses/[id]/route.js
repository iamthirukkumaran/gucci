import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const { firstName, lastName, email, phone, street, city, state, zipCode, country, countryCode, isDefault } = await request.json()

    if (!id || !firstName || !lastName || !email || !phone || !street || !city || !state || !zipCode) {
      return new Response(JSON.stringify({
        success: false,
        message: 'All fields are required',
      }), { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('gucci-store')
    const addresses = db.collection('addresses')

    const address = await addresses.findOne({ _id: new ObjectId(id) })
    if (!address) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Address not found',
      }), { status: 404 })
    }

    // If this is set as default, unset all other defaults for this user
    if (isDefault) {
      await addresses.updateMany(
        { userId: address.userId, _id: { $ne: new ObjectId(id) } },
        { $set: { isDefault: false } }
      )
    }

    const result = await addresses.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
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
          updatedAt: new Date(),
        },
      }
    )

    return new Response(JSON.stringify({
      success: true,
      message: 'Address updated successfully',
    }), { status: 200 })
  } catch (error) {
    console.error('Error updating address:', error)
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to update address',
    }), { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Address ID is required',
      }), { status: 400 })
    }

    const client = await clientPromise
    const db = client.db('gucci-store')
    const addresses = db.collection('addresses')

    const result = await addresses.deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Address not found',
      }), { status: 404 })
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Address deleted successfully',
    }), { status: 200 })
  } catch (error) {
    console.error('Error deleting address:', error)
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to delete address',
    }), { status: 500 })
  }
}
