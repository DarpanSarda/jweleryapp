"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, MapPin, Phone, User, Plus, Minus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";

const BUSINESS_PHONE = "919023530845"; // Replace with actual business number
const BUSINESS_NAME = "vezura";

export default function BuyNowModal({ product, initialQuantity, onClose }) {
  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
  });

  // Get max quantity from product stock
  const maxQuantity = product.stock_quantity || 10;

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const totalPrice = product.price * quantity;

  const handleWhatsAppOrder = async () => {
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address || !customerInfo.city || !customerInfo.pincode) {
      toast.error("Please fill in all required fields!");
      return;
    }

    // Show loading toast
    toast.loading("Processing order...");

    try {
      // First, create cart in database
      const cartResponse = await fetch(`/api/cart?session_id=buy_now_${Date.now()}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: quantity
        })
      });

      if (!cartResponse.ok) {
        throw new Error('Failed to create cart');
      }

      const cart = await cartResponse.json();

      // Create order in database
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cart_id: cart._id,
          customer_name: customerInfo.name,
          customer_mobile: customerInfo.phone,
          customer_email: '',
          customer_address: customerInfo.address,
          customer_city: customerInfo.city,
          customer_state: '',
          customer_pincode: customerInfo.pincode,
          customer_notes: 'Order placed via Buy Now (WhatsApp)'
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const order = await orderResponse.json();

      // Clear loading toast
      toast.dismiss();

      // Build order message with order number
      let message = `🛍️ *NEW ORDER FROM ${BUSINESS_NAME.toUpperCase()}*\n\n`;
      message += `📋 *Order Number: ${order.order_number}*\n\n`;
      message += `👤 *Customer Details:*\n`;
      message += `Name: ${customerInfo.name}\n`;
      message += `Phone: ${customerInfo.phone}\n`;
      message += `Address: ${customerInfo.address}, ${customerInfo.city} - ${customerInfo.pincode}\n\n`;

      message += `📦 *Order Details:*\n`;
      message += `1. *${product.name}* ${product.emoji}\n`;
      message += `   Price: ₹${product.price} × ${quantity}\n`;
      message += `   Subtotal: ₹${totalPrice}\n\n`;

      message += `💰 *Total Amount: ₹${totalPrice}*\n\n`;
      message += `Thank you for shopping with ${BUSINESS_NAME}! 🎉\n`;
      message += `We will contact you shortly to confirm your order.`;

      // Encode message for URL
      const encodedMessage = encodeURIComponent(message);
      const whatsappURL = `https://wa.me/${BUSINESS_PHONE}?text=${encodedMessage}`;

      // Show success toast
      toast.success(`Order ${order.order_number} placed! Redirecting to WhatsApp...`);

      // Trigger cart update event for Header
      window.dispatchEvent(new Event("cart-updated"));

      // Open WhatsApp in new tab
      window.open(whatsappURL, "_blank");

      // Close modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      // Clear loading toast
      toast.dismiss();
      console.error('Error creating order:', error);
      toast.error(error.message || 'Failed to place order. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Quick Buy</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Product Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Product Card */}
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 200px"
                  />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  {product.name} {product.emoji}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-gray-900">
                    ₹{product.price}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Quantity
                </label>
                <div className="flex items-center justify-between bg-white rounded-lg border border-gray-300 p-2">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <span className="text-lg font-semibold text-gray-900 px-4">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= maxQuantity}
                    className="p-2 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Max: {maxQuantity} · Total: ₹{totalPrice}
                </p>
              </div>
            </div>

            {/* Right Column - Customer Form */}
            <div className="lg:col-span-2">
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Customer Information
                </h3>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <User size={16} />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, name: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone size={16} />
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                      <MapPin size={16} />
                      Delivery Address *
                    </label>
                    <textarea
                      value={customerInfo.address}
                      onChange={(e) =>
                        setCustomerInfo({ ...customerInfo, address: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all resize-none"
                      placeholder="Enter your complete address"
                    />
                  </div>

                  {/* City and Pincode */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        City
                      </label>
                      <input
                        type="text"
                        value={customerInfo.city}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, city: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                        placeholder="City"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={customerInfo.pincode}
                        onChange={(e) =>
                          setCustomerInfo({ ...customerInfo, pincode: e.target.value })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent outline-none transition-all"
                        placeholder="Pincode"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-700">Total Amount:</span>
            <span className="text-2xl font-bold text-gray-900">₹{totalPrice}</span>
          </div>
          <button
            onClick={handleWhatsAppOrder}
            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-4 px-6 rounded-xl font-semibold transition-all hover:scale-[1.02] flex items-center justify-center gap-3 shadow-md hover:shadow-lg border-2 border-[#128C7E]"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Order via WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
