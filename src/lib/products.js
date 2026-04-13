export async function fetchProducts({ category = 'all', featured = false, search = '' } = {}) {
  try {
    const params = new URLSearchParams();

    if (category !== 'all') {
      params.append('category', category);
    }

    if (featured) {
      params.append('featured', 'true');
    }

    if (search) {
      params.append('search', search);
    }

    const queryString = params.toString();
    const url = `/api/products${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      cache: 'no-store' // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const products = await response.json();
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchProductBySlug(slug) {
  try {
    const response = await fetch(`/api/products/${slug}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

export async function fetchCategories() {
  try {
    const response = await fetch('/api/categories', {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [
      { name: "all products", slug: "all", emoji: "" }
    ];
  }
}

export async function createOrder(orderData) {
  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}
