// src/services/revenueApi.ts
const API_BASE_URL = '/api';

// Get overall revenue statistics
export const getOverallRevenue = async () => {
  try {
    console.log('Fetching overall revenue from:', `${API_BASE_URL}/revenue/overall`);
    const response = await fetch(`${API_BASE_URL}/revenue/overall`);

    if (!response.ok) {
      console.error('Revenue API error:', response.status, response.statusText);
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch overall revenue');
      } catch (jsonError) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Revenue data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching overall revenue:', error);
    throw error; // Propagate the error to the component
  }
};

// Get revenue trends
export const getRevenueTrends = async (period = 'M') => {
  try {
    console.log('Fetching revenue trends from:', `${API_BASE_URL}/revenue/trends?period=${period}`);
    const response = await fetch(`${API_BASE_URL}/revenue/trends?period=${period}`);

    if (!response.ok) {
      console.error('Revenue trends API error:', response.status, response.statusText);
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch revenue trends');
      } catch (jsonError) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Revenue trends data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching revenue trends:', error);
    throw error; // Propagate the error to the component
  }
};

// Get revenue by segment
export const getRevenueBySegment = async (segmentField = 'value_segment') => {
  try {
    console.log('Fetching revenue by segment from:', `${API_BASE_URL}/revenue/by-segment?segment_field=${segmentField}`);
    const response = await fetch(`${API_BASE_URL}/revenue/by-segment?segment_field=${segmentField}`);

    if (!response.ok) {
      console.error('Revenue by segment API error:', response.status, response.statusText);
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch revenue by segment');
      } catch (jsonError) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('Revenue by segment data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching revenue by segment:', error);
    throw error; // Propagate the error to the component
  }
};

// Get all revenue metrics
export const getAllRevenueMetrics = async (period = 'M') => {
  try {
    console.log('Fetching all revenue metrics from:', `${API_BASE_URL}/revenue/all?period=${period}`);
    const response = await fetch(`${API_BASE_URL}/revenue/all?period=${period}`);

    if (!response.ok) {
      console.error('All revenue metrics API error:', response.status, response.statusText);
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch all revenue metrics');
      } catch (jsonError) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    const data = await response.json();
    console.log('All revenue metrics data received:', data);
    return data;
  } catch (error) {
    console.error('Error fetching all revenue metrics:', error);
    throw error; // Propagate the error to the component
  }
};
