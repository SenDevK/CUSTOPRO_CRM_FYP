/**
 * API service for customer operations
 */

import { Customer } from "@/types";

// Using Vite's proxy feature to avoid CORS issues in development
const API_BASE_URL = '/api';
const CUSTOMER_API_URL = `${API_BASE_URL}/customers`;

// Define pagination response type
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

/**
 * Get all customers with pagination
 * @param page Page number (1-based)
 * @param limit Number of items per page
 * @param search Optional search term
 * @param segment Optional segment filter
 * @param marketingStatus Optional marketing status filter
 * @returns Promise with paginated customer data
 */
export const getCustomers = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  segment?: string,
  marketingStatus?: string
): Promise<PaginatedResponse<Customer>> => {
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) {
      params.append('search', search);
    }

    if (segment && segment !== 'all') {
      params.append('segment', segment);
    }

    if (marketingStatus && marketingStatus.startsWith('marketing_status_')) {
      const status = marketingStatus.replace('marketing_status_', '');
      params.append('marketing_status', status);
    }

    // Add cache-busting parameter to prevent browser caching
    params.append('_t', Date.now().toString());
    console.log(`Fetching customers from: ${CUSTOMER_API_URL}?${params.toString()}`);
    const response = await fetch(`${CUSTOMER_API_URL}?${params.toString()}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch customers: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Received customer data:', data);

    return {
      items: data.customers || [],
      total: data.total || 0,
      page: data.page || page,
      limit: data.limit || limit,
      pages: data.pages || 0
    };
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
};

/**
 * Get a single customer by ID
 * @param id Customer ID
 * @returns Promise with customer data
 */
export const getCustomerById = async (id: string): Promise<Customer | null> => {
  try {
    console.log(`Fetching customer ${id} from: ${CUSTOMER_API_URL}/${id}`);
    const response = await fetch(`${CUSTOMER_API_URL}/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch customer ${id}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Transform data if needed to match the Customer interface
    const customer: Customer = {
      id: data.id,
      firstName: data.firstName || data.full_name?.split(' ')[0] || 'Unknown',
      lastName: data.lastName || (data.full_name?.split(' ').slice(1).join(' ') || ''),
      email: data.email || '',
      phone: data.phone || data.contact_number || '',
      address: data.address || '',
      city: data.city || '',
      segment: data.segment || 'low_value',
      lastPurchase: data.lastPurchase || data.last_purchase || '',
      totalSpent: data.totalSpent || data.total_spent || 0,
      purchaseCount: data.purchaseCount || data.purchase_count || 0,
      consentGiven: data.consentGiven || data.consent_given || false,
      consentDate: data.consentDate || data.consent_date || '',
      notes: data.notes || '',
      createdAt: data.createdAt || data.created_date || new Date().toISOString(),
      marketing_status: data.marketing_status || 'active',
      opt_out_date: data.opt_out_date || undefined,
      opt_out_reason: data.opt_out_reason || undefined
    };

    return customer;
  } catch (error) {
    console.error(`Error fetching customer ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new customer
 * @param customer Customer data without ID
 * @returns Promise with created customer data
 */
export const createCustomer = async (
  customer: Omit<Customer, 'id' | 'createdAt'>
): Promise<Customer> => {
  try {
    const response = await fetch(CUSTOMER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create customer');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
};

/**
 * Update an existing customer
 * @param id Customer ID
 * @param customer Updated customer data
 * @returns Promise with updated customer data
 */
export const updateCustomer = async (
  id: string,
  customer: Partial<Customer>
): Promise<Customer> => {
  try {
    const response = await fetch(`${CUSTOMER_API_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customer),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update customer ${id}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating customer ${id}:`, error);
    throw error;
  }
};

/**
 * Get a customer's opt-out status
 * @param phone Customer phone number
 * @returns Promise with customer status data
 */
export const getCustomerOptOutStatus = async (phone: string): Promise<{
  phone: string;
  status: 'active' | 'opted_out' | 'deleted';
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/marketing/customer-status?phone=${encodeURIComponent(phone)}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to get status for ${phone}`);
    }

    const data = await response.json();
    return data.customer;
  } catch (error) {
    console.error(`Error getting opt-out status for ${phone}:`, error);
    // Return default status
    return {
      phone,
      status: 'active'
    };
  }
};

/**
 * Update a customer's opt-out status
 * @param phone Customer phone number
 * @param status New status
 * @returns Promise with success message
 */
export const updateCustomerOptOutStatus = async (
  phone: string,
  status: 'active' | 'opted_out' | 'deleted'
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/marketing/customer-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, status }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to update status for ${phone}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating opt-out status for ${phone}:`, error);
    throw error;
  }
};

/**
 * Delete a customer
 * @param id Customer ID
 * @returns Promise with success status
 */
export const deleteCustomer = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${CUSTOMER_API_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Failed to delete customer ${id}`);
    }

    return true;
  } catch (error) {
    console.error(`Error deleting customer ${id}:`, error);
    throw error;
  }
};
