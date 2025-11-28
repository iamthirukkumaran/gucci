'use client';

import { useState } from 'react';

interface AdminCredentials {
  email: string;
  password: string;
  role: string;
}

export default function Setup() {
  const [seedingAdmin, setSeedingAdmin] = useState(false);
  const [seedingProducts, setSeedingProducts] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [productsMessage, setProductsMessage] = useState('');
  const [adminCredentials, setAdminCredentials] = useState<AdminCredentials | null>(null);

  const seedAdmin = async () => {
    setSeedingAdmin(true);
    setAdminMessage('');
    try {
      const response = await fetch('/api/seed', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setAdminMessage('✅ Superadmin created successfully!');
        setAdminCredentials(data.credentials);
      } else {
        setAdminMessage('❌ ' + data.message);
      }
    } catch (error) {
      setAdminMessage('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSeedingAdmin(false);
    }
  };

  const seedProducts = async () => {
    setSeedingProducts(true);
    setProductsMessage('');
    try {
      const response = await fetch('/api/seed-products', { method: 'POST' });
      const data = await response.json();
      
      if (data.success) {
        setProductsMessage(`✅ ${data.insertedCount} products created successfully!`);
      } else {
        setProductsMessage('❌ ' + data.message);
      }
    } catch (error) {
      setProductsMessage('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setSeedingProducts(false);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-light tracking-widest text-black mb-12">GUCCI STORE SETUP</h1>
        
        <div className="space-y-8">
          {/* Admin Setup */}
          <div className="border border-gray-200 p-8">
            <h2 className="text-2xl font-light tracking-widest text-black mb-4">1. Create Superadmin</h2>
            <p className="text-gray-600 mb-6">Click the button below to create a superadmin account in your database.</p>
            
            <button
              onClick={seedAdmin}
              disabled={seedingAdmin}
              className="bg-black text-white px-8 py-3 font-light tracking-widest text-sm hover:bg-gray-800 disabled:bg-gray-400 transition-colors duration-300 cursor-pointer"
            >
              {seedingAdmin ? 'Creating...' : 'Create Superadmin'}
            </button>

            {adminMessage && (
              <div className="mt-6 p-4 border border-gray-200 bg-gray-50">
                <p className="text-sm">{adminMessage}</p>
              </div>
            )}

            {adminCredentials && (
              <div className="mt-6 p-6 border border-green-200 bg-green-50 rounded-lg">
                <h3 className="font-light text-lg tracking-widest mb-4">Superadmin Credentials:</h3>
                <div className="space-y-2 font-mono text-sm">
                  <p><strong>Email:</strong> {adminCredentials.email}</p>
                  <p><strong>Password:</strong> {adminCredentials.password}</p>
                  <p><strong>Role:</strong> {adminCredentials.role}</p>
                </div>
                <p className="text-xs text-gray-600 mt-4">⚠️ Save these credentials securely. You'll need them to log in as admin.</p>
              </div>
            )}
          </div>

          {/* Products Setup */}
          <div className="border border-gray-200 p-8">
            <h2 className="text-2xl font-light tracking-widest text-black mb-4">2. Seed Sample Products</h2>
            <p className="text-gray-600 mb-6">Click the button below to add sample products to your database.</p>
            
            <button
              onClick={seedProducts}
              disabled={seedingProducts}
              className="bg-black text-white px-8 py-3 font-light tracking-widest text-sm hover:bg-gray-800 disabled:bg-gray-400 transition-colors duration-300 cursor-pointer"
            >
              {seedingProducts ? 'Seeding...' : 'Seed Sample Products'}
            </button>

            {productsMessage && (
              <div className="mt-6 p-4 border border-gray-200 bg-gray-50">
                <p className="text-sm">{productsMessage}</p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="border border-gray-200 p-8 bg-gray-50">
            <h2 className="text-2xl font-light tracking-widest text-black mb-4">3. Next Steps</h2>
            <ul className="list-disc list-inside space-y-3 text-gray-700">
              <li>Use your superadmin credentials to log in</li>
              <li>Access the admin dashboard to manage products</li>
              <li>Navigate to the homepage to view your store</li>
              <li>Test the shopping cart and checkout functionality</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm">You can safely delete this page after setup is complete</p>
        </div>
      </div>
    </div>
  );
}
