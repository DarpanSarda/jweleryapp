"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, User, MapPin, Phone, MessageCircle, Trash2, Plus, Minus } from "lucide-react";
import toast from "react-hot-toast";
import { getCart, updateCartItemQuantity, removeFromCart, clearCart, addToCart } from "@/lib/cart";

const BUSINESS_PHONE = "919023530845"; // Replace with actual business number
const BUSINESS_NAME = "vezura";

// Helper function to fetch product by ID
async function fetchProductById(productId) {
  try {
    const response = await fetch(`/api/products`);
    if (!response.ok) return null;
    const products = await response.json();
    return products.find(p => p.id === productId) || null;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("productId");
  const quantity = parseInt(searchParams.get("quantity") || "1");

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState(null);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  // Load product from URL params or database cart
  useEffect(() => {
    async function loadCart() {
      if (productId) {
        // Load single product from URL params and add to cart
        const product = await fetchProductById(productId);
        if (product) {
          setCartItems([{ product, quantity: quantity }]);
          // Add to cart to create cart in database for order
          try {
            const cart = await addToCart(productId, quantity);
            if (cart && cart._id) {
              setCartId(cart._id);
            }
          } catch (error) {
            console.error('Error adding product to cart:', error);
          }
        }
      } else {
        // Load cart from database
        try {
          const cart = await getCart();
          if (cart && cart.items && cart.items.length > 0) {
            // Store cart ID for order creation
            setCartId(cart._id);

            // Transform database cart items to match the structure expected by the UI
            const cartItemsWithProducts = cart.items.map(item => ({
              product: {
                id: item.product_id._id,
                name: item.product_name,
                image: item.product_image,
                price: item.price,
                category: item.product_id?.category_id?.name || 'Uncategorized',
                emoji: item.product_id?.category_id?.emoji || '',
                originalPrice: item.product_id?.original_price
              },
              quantity: item.quantity,
              _id: item._id // Store the cart item ID for updates
            }));
            setCartItems(cartItemsWithProducts);
          } else {
            setCartItems([]);
          }
        } catch (error) {
          console.error('Error loading cart:', error);
          setCartItems([]);
        }
      }
      setLoading(false);
    }

    loadCart();
  }, [productId, quantity]);

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const discount = cartItems.reduce(
    (sum, item) =>
      sum +
      ((item.product.originalPrice || 0) - item.product.price) *
        item.quantity,
    0
  );

  const total = subtotal;

  // Handle quantity change
  const updateQuantity = async (index, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      // Update in database
      await updateCartItemQuantity(cartItems[index].product.id, newQuantity);

      // Update local state
      const newCartItems = [...cartItems];
      newCartItems[index].quantity = newQuantity;
      setCartItems(newCartItems);

      // Trigger cart update event for Header
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error(error.message || 'Failed to update quantity');
    }
  };

  // Remove item from cart
  const removeItem = async (index) => {
    try {
      // Remove from database
      await removeFromCart(cartItems[index].product.id);

      // Update local state
      const newCartItems = cartItems.filter((_, i) => i !== index);
      setCartItems(newCartItems);

      // Trigger cart update event for Header
      window.dispatchEvent(new Event("cart-updated"));
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error(error.message || 'Failed to remove item');
    }
  };

  // Handle WhatsApp order
  const handleWhatsAppOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      // Save order to database first
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_id: cartId,
          customer_name: customerInfo.name,
          customer_mobile: customerInfo.phone,
          customer_email: '',
          customer_address: customerInfo.address,
          customer_city: customerInfo.city,
          customer_state: '',
          customer_pincode: customerInfo.pincode,
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        if (errorData.details && errorData.details.length > 0) {
          // Stock validation errors
          toast.error(errorData.details.join(', '));
        } else {
          toast.error(errorData.error || 'Failed to place order');
        }
        return;
      }

      const order = await orderResponse.json();

      // Build order message with order number
      let message = `🛍️ *NEW ORDER FROM ${BUSINESS_NAME.toUpperCase()}*\n\n`;
      message += `📋 *Order Number: ${order.order_number}*\n\n`;
      message += `👤 *Customer Details:*\n`;
      message += `Name: ${customerInfo.name}\n`;
      message += `Phone: ${customerInfo.phone}\n`;
      message += `Address: ${customerInfo.address}, ${customerInfo.city} - ${customerInfo.pincode}\n\n`;

      message += `📦 *Order Details:*\n`;
      message += `─────────────────\n`;

      cartItems.forEach((item, index) => {
        message += `${index + 1}. *${item.product.name}* ${item.product.emoji}\n`;
        message += `   Price: ₹${item.product.price} × ${item.quantity}\n`;
        message += `   Subtotal: ₹${item.product.price * item.quantity}\n\n`;
      });

      message += `─────────────────\n`;
      message += `💰 *Total Amount: ₹${total}*\n\n`;

      if (discount > 0) {
        message += `✨ *You Save: ₹${discount}*\n\n`;
      }

      message += `Thank you for shopping with ${BUSINESS_NAME}! 🎉\n`;
      message += `We will contact you shortly to confirm your order.`;

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);
      const whatsappURL = `https://wa.me/${BUSINESS_PHONE}?text=${encodedMessage}`;

      // Show success toast
      toast.success(`Order ${order.order_number} placed! Redirecting to WhatsApp...`);

      // Open WhatsApp in new tab
      window.open(whatsappURL, "_blank");

      // Trigger cart update event for Header
      window.dispatchEvent(new Event("cart-updated"));

      // Redirect to home after 2 seconds
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-pink-500 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Cart Items & Customer Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cart Items */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShoppingBag size={24} />
                Your Cart ({cartItems.length})
              </h2>

              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">Your cart is empty</p>
                  <Link
                    href="/"
                    className="inline-block bg-gray-900 text-white px-6 py-2 rounded-full font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item, index) => (
                    <div
                      key={index}
                      className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      {/* Product Image */}
                      <div className="relative w-24 h-24 flex-shrink-0 bg-white rounded-lg overflow-hidden">
                        <Image
                          src={item.product.image}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                          {item.product.name} {item.product.emoji}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.product.category}
                        </p>

                        {/* Price & Quantity */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              ₹{item.product.price}
                            </span>
                            {item.product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through">
                                ₹{item.product.originalPrice}
                              </span>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(index, item.quantity - 1)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(index, item.quantity + 1)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              onClick={() => removeItem(index)}
                              className="p-1 hover:bg-red-100 rounded transition-colors ml-2"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Customer Information Form */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User size={24} />
                Customer Information
              </h2>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={customerInfo.name}
                    onChange={(e) =>
                      setCustomerInfo({ ...customerInfo, name: e.target.value })
                    }
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone
                      size={20}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          phone: e.target.value,
                        })
                      }
                      placeholder="Enter your phone number"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Address *
                  </label>
                  <div className="relative">
                    <MapPin
                      size={20}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          address: e.target.value,
                        })
                      }
                      placeholder="Enter your complete address"
                      rows="3"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      required
                    />
                  </div>
                </div>

                {/* City & Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.city}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          city: e.target.value,
                        })
                      }
                      placeholder="City"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.pincode}
                      onChange={(e) =>
                        setCustomerInfo({
                          ...customerInfo,
                          pincode: e.target.value,
                        })
                      }
                      placeholder="PIN Code"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-green-600 font-medium">FREE</span>
                </div>

                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                {discount > 0 && (
                  <div className="bg-green-50 text-green-800 px-3 py-2 rounded-lg text-sm text-center">
                    You save ₹{discount} on this order!
                  </div>
                )}
              </div>

              {/* WhatsApp Order Button */}
              <button
                onClick={handleWhatsAppOrder}
                className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-3 shadow-md hover:shadow-lg border-2 border-[#128C7E]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Order via WhatsApp
              </button>

              <p className="text-xs text-gray-600 text-center mt-3">
                By clicking "Order via WhatsApp", you agree to our Terms &
                Conditions. We'll contact you to confirm your order.
              </p>

              {/* Trust Badges */}
              <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span>Secure payment via WhatsApp</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span>Free shipping on all orders</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 text-xs">✓</span>
                  </div>
                  <span>7 days easy returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading checkout...</p>
        </div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
