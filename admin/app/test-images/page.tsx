'use client';

import { useState, useEffect } from 'react';

export default function TestImagesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/products?limit=10')
      .then(res => res.json())
      .then(data => {
        console.log('Products data:', data);
        setProducts(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test Image Display</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border rounded-lg p-4 shadow">
            <h3 className="font-semibold mb-2">{product.name}</h3>
            
            {product.images && product.images.length > 0 ? (
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-gray-600">Raw URL:</p>
                  <code className="text-xs bg-gray-100 p-1 block break-all">
                    {product.images[0].url}
                  </code>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600">Full URL:</p>
                  <code className="text-xs bg-gray-100 p-1 block break-all">
                    {`http://localhost:5000${product.images[0].url}`}
                  </code>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-1">Image:</p>
                  <img
                    src={`http://localhost:5000${product.images[0].url}`}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded"
                    onError={(e) => {
                      console.error('Image failed to load:', product.images[0].url);
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Error';
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully:', product.images[0].url);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="bg-gray-200 h-48 rounded flex items-center justify-center">
                <p className="text-gray-500">No image</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
