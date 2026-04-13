// Helper functions for cart operations

// Get or generate session ID from localStorage
export function getSessionId() {
  if (typeof window === 'undefined') return null;

  let sessionId = localStorage.getItem('cart_session_id');

  if (!sessionId) {
    sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('cart_session_id', sessionId);
  }

  return sessionId;
}

// Get cart from database
export async function getCart() {
  try {
    const sessionId = getSessionId();
    if (!sessionId) {
      throw new Error('No session ID');
    }

    const response = await fetch(`/api/cart?session_id=${sessionId}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cart');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching cart:', error);
    return null;
  }
}

// Add item to cart
export async function addToCart(productId, quantity = 1) {
  try {
    const sessionId = getSessionId();
    if (!sessionId) {
      throw new Error('No session ID');
    }

    const response = await fetch(`/api/cart?session_id=${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product_id: productId,
        quantity: quantity
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add to cart');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
}

// Update cart item quantity
export async function updateCartItemQuantity(productId, quantity) {
  try {
    const sessionId = getSessionId();
    if (!sessionId) {
      throw new Error('No session ID');
    }

    const response = await fetch(`/api/cart?session_id=${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'update_quantity',
        product_id: productId,
        quantity: quantity
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update cart');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating cart:', error);
    throw error;
  }
}

// Remove item from cart
export async function removeFromCart(productId) {
  try {
    const sessionId = getSessionId();
    if (!sessionId) {
      throw new Error('No session ID');
    }

    const response = await fetch(`/api/cart?session_id=${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'remove_item',
        product_id: productId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to remove item');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
}

// Clear cart
export async function clearCart() {
  try {
    const sessionId = getSessionId();
    if (!sessionId) {
      throw new Error('No session ID');
    }

    const response = await fetch(`/api/cart?session_id=${sessionId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'clear_cart'
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to clear cart');
    }

    return await response.json();
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
}

// Calculate total items in cart
export function getCartItemCount(cart) {
  if (!cart || !cart.items) return 0;
  return cart.items.reduce((sum, item) => sum + item.quantity, 0);
}
