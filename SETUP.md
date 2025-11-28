# Gucci Luxury Store - Setup Instructions

## Database Setup

### 1. MongoDB Connection
Make sure your `.env.local` file contains:
```
MONGODB_URI=your_mongodb_connection_string
```

### 2. Initialize Database with Superadmin & Products

Visit: `http://localhost:3000/setup`

This page provides two buttons:

#### Step 1: Create Superadmin Account
- Click "Create Superadmin" to add an admin user to your database
- **Credentials:**
  - Email: `admin@gucci.com`
  - Password: `SuperAdmin@2025`
  - Role: `superadmin`

#### Step 2: Seed Sample Products
- Click "Seed Sample Products" to add 8 sample products
- Products include women's and men's collections
- All products have names, descriptions, prices, and categories

### 3. Login with Superadmin

1. Go to homepage: `http://localhost:3000`
2. Click on "MENU" button
3. Click "Login"
4. Enter superadmin credentials:
   - Email: `admin@gucci.com`
   - Password: `SuperAdmin@2025`

### 4. Access Admin Dashboard

Once logged in as superadmin:
1. Click "MENU" again
2. Look for "Admin Dashboard" option
3. From the dashboard, you can:
   - Add new products
   - Manage existing products
   - View user information

### 5. View Products

After seeding products, they will appear:
- On the homepage in "FEATURED COLLECTIONS"
- On the "Women" collection page
- On the "Men" collection page
- On the "Products" page with filtering and sorting options

## API Endpoints

### Seed Superadmin
```
POST /api/seed
```
Creates a superadmin user in the database.

### Seed Sample Products
```
POST /api/seed-products
```
Adds 8 sample luxury products to the database.

### Get All Products
```
GET /api/products
```
Fetches all products from the database.

### Create Product
```
POST /api/products
Body: {
  name: string,
  description: string,
  price: number,
  category: "women" | "men",
  image: string
}
```

### User Registration
```
POST /api/auth/register
Body: {
  name: string,
  email: string,
  password: string,
  confirmPassword: string
}
```

### User Login
```
POST /api/auth/login
Body: {
  email: string,
  password: string
}
```

## Important Notes

⚠️ **Security Reminder:**
- The setup page exposes superadmin credentials in plaintext
- This is only for development purposes
- In production, use proper authentication and environment variables
- Consider deleting the `/setup` page after initial setup

## Features

✅ User Authentication (Register, Login, Logout)
✅ Role-based Access Control (User, Superadmin)
✅ Product Management (CRUD operations)
✅ Product Filtering (by category, price, search)
✅ Shopping Cart
✅ Responsive Design
✅ Luxury UI with animations

## Troubleshooting

**Products not showing?**
- Ensure MongoDB URI is correct in `.env.local`
- Run the seed-products endpoint again
- Check browser console for errors

**Can't login as admin?**
- Verify the superadmin was created by visiting `/setup`
- Use correct email: `admin@gucci.com`
- Password: `SuperAdmin@2025`

**Dashboard not showing?**
- Ensure you're logged in as superadmin (role: "superadmin")
- Refresh the page after login
