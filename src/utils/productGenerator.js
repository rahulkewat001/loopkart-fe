const categories = ['Electronics', 'Fashion', 'Beauty', 'Home', 'Grocery', 'Accessories'];

const productNames = {
  Electronics: ['Wireless Headphones', 'Smart Watch', 'Bluetooth Speaker', 'Laptop Stand', 'USB-C Hub', 'Webcam', 'Keyboard', 'Mouse', 'Monitor', 'Phone Case'],
  Fashion: ['Cotton T-Shirt', 'Denim Jeans', 'Leather Jacket', 'Sneakers', 'Sunglasses', 'Backpack', 'Watch', 'Belt', 'Wallet', 'Cap'],
  Beauty: ['Face Serum', 'Lipstick', 'Moisturizer', 'Perfume', 'Nail Polish', 'Eye Shadow', 'Foundation', 'Mascara', 'Face Mask', 'Hair Oil'],
  Home: ['Table Lamp', 'Wall Clock', 'Cushion Cover', 'Photo Frame', 'Candle Set', 'Vase', 'Rug', 'Curtains', 'Bedsheet', 'Towel Set'],
  Grocery: ['Organic Honey', 'Green Tea', 'Olive Oil', 'Almonds', 'Protein Bar', 'Dark Chocolate', 'Oats', 'Peanut Butter', 'Coffee Beans', 'Quinoa'],
  Accessories: ['Phone Holder', 'Cable Organizer', 'Power Bank', 'Earbuds Case', 'Laptop Sleeve', 'Card Holder', 'Key Chain', 'Pen Set', 'Notebook', 'Water Bottle']
};

const badges = ['SALE', 'BEST SELLER', 'TOP RATED', null, null, null];

const unsplashCategories = {
  Electronics: 'technology',
  Fashion: 'fashion',
  Beauty: 'beauty',
  Home: 'interior',
  Grocery: 'food',
  Accessories: 'accessories'
};

export const generateProducts = (count = 1000) => {
  const products = [];
  
  for (let i = 1; i <= count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const names = productNames[category];
    const name = names[Math.floor(Math.random() * names.length)];
    const originalPrice = Math.floor(Math.random() * 9000) + 1000;
    const discount = [10, 15, 20, 25, 30, 35, 40, 45, 50][Math.floor(Math.random() * 9)];
    const price = Math.floor(originalPrice * (1 - discount / 100));
    const rating = (Math.random() * 2 + 3).toFixed(1);
    const reviews = Math.floor(Math.random() * 5000) + 100;
    const badge = badges[Math.floor(Math.random() * badges.length)];
    const unsplashCategory = unsplashCategories[category];
    
    products.push({
      id: i,
      name: `${name} ${i}`,
      category,
      image: `https://source.unsplash.com/400x400/?${unsplashCategory}&sig=${i}`,
      price,
      originalPrice,
      discount,
      rating: parseFloat(rating),
      reviews,
      badge,
      inStock: Math.random() > 0.1
    });
  }
  
  return products;
};

export const getProductById = (products, id) => {
  return products.find(p => p.id === parseInt(id));
};

export const filterProducts = (products, { category, search, minPrice, maxPrice, minRating, sortBy }) => {
  let filtered = [...products];
  
  if (category && category !== 'All') {
    filtered = filtered.filter(p => p.category === category);
  }
  
  if (search) {
    const query = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.category.toLowerCase().includes(query)
    );
  }
  
  if (minPrice !== undefined) {
    filtered = filtered.filter(p => p.price >= minPrice);
  }
  
  if (maxPrice !== undefined) {
    filtered = filtered.filter(p => p.price <= maxPrice);
  }
  
  if (minRating !== undefined) {
    filtered = filtered.filter(p => p.rating >= minRating);
  }
  
  // Sort
  switch (sortBy) {
    case 'price-low':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }
  
  return filtered;
};
