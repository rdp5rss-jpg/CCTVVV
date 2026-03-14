import { supabase, isSupabaseConfigured } from './supabase';

export const seedDemoData = async () => {
  if (!isSupabaseConfigured) {
    console.log('Supabase not configured, skipping seed.');
    return;
  }
  try {
    // Check if categories already exist
    const { data: existingCategories, error: catCheckError } = await supabase
      .from('categories')
      .select('id')
      .limit(1);

    if (catCheckError) {
      console.error('Error checking categories:', catCheckError);
      return;
    }

    // If we already have data, don't seed
    if (existingCategories && existingCategories.length > 0) {
      console.log('Database already has data, skipping seed.');
      return;
    }

    console.log('Seeding demo data...');

    // 1. Seed Categories
    const categories = [
      { name: 'Smartphones', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&q=80' },
      { name: 'Laptops', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&q=80' },
      { name: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80' },
      { name: 'Wearables', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80' }
    ];

    const { error: catError } = await supabase.from('categories').insert(categories);
    if (catError) console.error('Error seeding categories:', catError);

    // 2. Seed Products
    const products = [
      {
        name: 'Mi Phone 15 Pro',
        description: 'The latest flagship smartphone with an incredible camera system and all-day battery life.',
        price: 89999,
        category: 'Smartphones',
        image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&q=80',
        rating: 4.8,
        stock: 50
      },
      {
        name: 'Mi Book Air 14',
        description: 'Ultra-thin, lightweight laptop perfect for professionals on the go.',
        price: 65999,
        category: 'Laptops',
        image: 'https://images.unsplash.com/photo-1531297172868-944ce3e52222?w=500&q=80',
        rating: 4.6,
        stock: 30
      },
      {
        name: 'Mi SoundBuds Pro',
        description: 'Active noise cancelling true wireless earbuds with immersive audio.',
        price: 4999,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&q=80',
        rating: 4.5,
        stock: 100
      },
      {
        name: 'Mi Watch Series 5',
        description: 'Advanced health tracking and fitness metrics on your wrist.',
        price: 12999,
        category: 'Wearables',
        image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80',
        rating: 4.7,
        stock: 45
      },
      {
        name: 'Mi Bluetooth Speaker',
        description: 'Portable waterproof speaker with 24-hour playtime.',
        price: 2999,
        category: 'Audio',
        image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=500&q=80',
        rating: 4.3,
        stock: 80
      }
    ];

    const { error: prodError } = await supabase.from('products').insert(products);
    if (prodError) console.error('Error seeding products:', prodError);

    // 3. Seed Banners
    const banners = [
      {
        title: 'New Arrivals',
        image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1000&q=80',
        link: '/products'
      },
      {
        title: 'Audio Sale',
        image: 'https://images.unsplash.com/photo-1511335532688-dd54a20e6bb2?w=1000&q=80',
        link: '/products'
      }
    ];

    const { error: bannerError } = await supabase.from('banners').insert(banners);
    if (bannerError) console.error('Error seeding banners:', bannerError);

    console.log('Demo data seeded successfully!');
  } catch (err) {
    console.error('Unexpected error during seeding:', err);
  }
};
