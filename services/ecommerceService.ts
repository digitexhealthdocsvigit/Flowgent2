import { insforge } from '../lib/insforge';

// Types for our e-commerce data
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string;
  image_key?: string;
  category: string;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  user_id: string;
  created_at: string;
}

interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  created_at: string;
}

// Product operations
export const productOperations = {
  getAll: async (): Promise<Product[]> => {
    try {
      const { data, error } = await insforge.database
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Product | null> => {
    try {
      const { data, error } = await insforge.database
        .from('products')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching product:', error);
      return null;
    }
  },

  create: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> => {
    try {
      const { data, error } = await insforge.database
        .from('products')
        .insert([product])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  },

  update: async (id: string, updates: Partial<Product>): Promise<boolean> => {
    try {
      const { error } = await insforge.database
        .from('products')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating product:', error);
      return false;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await insforge.database
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      return false;
    }
  },

  // Upload product image
  uploadImage: async (file: File): Promise<{ url: string; key: string } | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      
      const { data, error } = await insforge.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = await insforge.storage
        .from('product-images')
        .getPublicUrl(data.path);

      return {
        url: urlData.publicUrl,
        key: data.path
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  }
};

// Cart operations
export const cartOperations = {
  getItems: async (userId: string): Promise<CartItem[]> => {
    try {
      const { data, error } = await insforge.database
        .from('cart_items')
        .select('*, product:products(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching cart items:', error);
      return [];
    }
  },

  addItem: async (userId: string, productId: string, quantity: number = 1): Promise<boolean> => {
    try {
      // Check if item already exists in cart
      const { data: existingItems } = await insforge.database
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .limit(1);

      if (existingItems && existingItems.length > 0) {
        // Update quantity
        const { error } = await insforge.database
          .from('cart_items')
          .update({ quantity: existingItems[0].quantity + quantity })
          .eq('id', existingItems[0].id);

        if (error) throw error;
      } else {
        // Add new item
        const { error } = await insforge.database
          .from('cart_items')
          .insert([{ user_id: userId, product_id: productId, quantity }]);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return false;
    }
  },

  updateItem: async (itemId: string, quantity: number): Promise<boolean> => {
    try {
      const { error } = await insforge.database
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return false;
    }
  },

  removeItem: async (itemId: string): Promise<boolean> => {
    try {
      const { error } = await insforge.database
        .from('cart_items')
        .delete()
        .eq('id', itemId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing cart item:', error);
      return false;
    }
  },

  clearCart: async (userId: string): Promise<boolean> => {
    try {
      const { error } = await insforge.database
        .from('cart_items')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }
};

// Order operations
export const orderOperations = {
  create: async (
    userId: string,
    items: { product_id: string; quantity: number; price: number }[],
    shippingAddress: string,
    paymentMethod: string
  ): Promise<Order | null> => {
    try {
      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Create order
      const { data: order, error: orderError } = await insforge.database
        .from('orders')
        .insert([{
          user_id: userId,
          total_amount: totalAmount,
          status: 'pending',
          shipping_address: shippingAddress,
          payment_method: paymentMethod
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price
      }));

      const { error: itemsError } = await insforge.database
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      await cartOperations.clearCart(userId);

      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  },

  getUserOrders: async (userId: string): Promise<Order[]> => {
    try {
      const { data, error } = await insforge.database
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user orders:', error);
      return [];
    }
  },

  getOrderDetails: async (orderId: string): Promise<{ order: Order; items: OrderItem[] } | null> => {
    try {
      // Get order
      const { data: order, error: orderError } = await insforge.database
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      // Get order items with product details
      const { data: items, error: itemsError } = await insforge.database
        .from('order_items')
        .select('*, product:products(*)')
        .eq('order_id', orderId);

      if (itemsError) throw itemsError;

      return { order, items: items || [] };
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  },

  updateStatus: async (orderId: string, status: Order['status']): Promise<boolean> => {
    try {
      const { error } = await insforge.database
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      return false;
    }
  }
};