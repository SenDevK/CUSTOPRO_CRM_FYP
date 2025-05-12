/**
 * API service for segmentation operations
 */

// Using Vite's proxy feature to avoid CORS issues in development
const API_BASE_URL = '/api';
// For segmentation operations, we use the /segment endpoint which is proxied to the segmentation server
const SEGMENT_API_URL = `${API_BASE_URL}/segment`;

/**
 * Run comprehensive segmentation on all customer data
 * @returns Promise with the segmentation results
 */
// Sample data for when the backend is not available
export const getSampleSegmentationData = () => {
  return {
    summary: {
      demographic: {
        Male: 250,
        Female: 200,
        Other: 50
      },
      age_distribution: {
        'Age_Under_18': 42,
        'Age_18_24': 120,
        'Age_25_34': 235,
        'Age_35_44': 180,
        'Age_45_54': 98,
        'Age_55_Plus': 75
      },
      value_based_rfm: {
        "Champions": 100,
        "Loyal Customers": 150,
        "Potential Loyalists": 80,
        "At Risk": 70,
        "Lost Customers": 56
      },
      preference: {
        "Fashion Enthusiasts": 120,
        "Casual Shoppers": 180,
        "Seasonal Buyers": 90,
        "Brand Loyalists": 66
      }
    },
    details: {
      value_based_rfm_details: {
        avg_values: {
          "Champions": { recency: 5, frequency: 12, monetary: 25000 },
          "Loyal Customers": { recency: 15, frequency: 8, monetary: 18000 },
          "Potential Loyalists": { recency: 30, frequency: 3, monetary: 10000 },
          "At Risk": { recency: 60, frequency: 2, monetary: 8000 },
          "Lost Customers": { recency: 120, frequency: 1, monetary: 5000 }
        }
      },
      preference_details: {
        profiles: {
          "Fashion Enthusiasts": { favorite_category: "Clothing", preferred_material: "Cotton" },
          "Casual Shoppers": { favorite_category: "Footwear", preferred_material: "Leather" },
          "Seasonal Buyers": { favorite_category: "Accessories", preferred_material: "Synthetic" },
          "Brand Loyalists": { favorite_category: "Electronics", preferred_material: "N/A" }
        },
        distribution: {
          "Fashion Enthusiasts": 120,
          "Casual Shoppers": 180,
          "Seasonal Buyers": 90,
          "Brand Loyalists": 66
        }
      }
    },
    customer_count: 500
  };
};

export const runComprehensiveSegmentation = async (): Promise<any> => {
  try {
    console.log(`Attempting to fetch comprehensive segmentation from ${SEGMENT_API_URL}/comprehensive`);

    const response = await fetch(`${SEGMENT_API_URL}/comprehensive`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // Empty request body
    });

    console.log(`Response status for comprehensive segmentation:`, response.status, response.statusText);

    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.error(`Error data for comprehensive segmentation:`, errorData);
        throw new Error(errorData.error || 'Failed to run segmentation');
      } catch (jsonError) {
        // If response is not valid JSON
        console.error(`Failed to parse error response for comprehensive segmentation:`, jsonError);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    try {
      const data = await response.json();
      console.log(`Successfully received comprehensive segmentation data:`, data);
      return data;
    } catch (jsonError) {
      console.error('Failed to parse JSON response:', jsonError);
      throw new Error('Invalid response from segmentation server');
    }
  } catch (error) {
    console.error('Error running segmentation:', error);
    // Remove fallback mechanism to display real data only
    throw error;
  }
};

/**
 * Run specific segmentation type on customer data
 * @param segmentType The type of segmentation to run (demographic, preference, rfm)
 * @param options Optional parameters for the segmentation
 * @returns Promise with the segmentation results
 */
export const runSpecificSegmentation = async (
  segmentType: 'demographic' | 'preference' | 'rfm',
  options?: {
    referenceDate?: string;
    minClusters?: number;
    maxClusters?: number;
  }
): Promise<any> => {
  try {
    console.log(`Attempting to fetch ${segmentType} segmentation from ${SEGMENT_API_URL}/${segmentType}`);

    const response = await fetch(`${SEGMENT_API_URL}/${segmentType}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reference_date: options?.referenceDate,
        min_clusters: options?.minClusters,
        max_clusters: options?.maxClusters,
      }),
    });

    console.log(`Response status for ${segmentType} segmentation:`, response.status, response.statusText);

    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.error(`Error data for ${segmentType} segmentation:`, errorData);
        throw new Error(errorData.error || `Failed to run ${segmentType} segmentation`);
      } catch (jsonError) {
        // If response is not valid JSON
        console.error(`Failed to parse error response for ${segmentType} segmentation:`, jsonError);
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
    }

    try {
      const data = await response.json();
      console.log(`Successfully received ${segmentType} segmentation data:`, data);
      return data;
    } catch (jsonError) {
      console.error(`Failed to parse JSON response for ${segmentType} segmentation:`, jsonError);
      throw new Error('Invalid response from segmentation server');
    }
  } catch (error) {
    console.error(`Error running ${segmentType} segmentation:`, error);
    // Remove fallback mechanism to display real data only
    throw error;
  }
};

/**
 * Transform segmentation data from API format to front-end format
 * @param apiData The data returned from the segmentation API
 * @returns Formatted data for front-end visualization
 */
export const transformSegmentationData = (apiData: any) => {
  // Define a consistent color palette
  const colors = ['#8B5CF6', '#A78BFA', '#C4B5FD', '#F87171', '#60A5FA', '#34D399', '#10B981', '#FBBF24', '#EC4899'];

  // Transform demographic segmentation data
  const demographicSegments = apiData.summary?.demographic || {};
  const demographicData = Object.entries(demographicSegments).map(([name, value], index) => {
    return {
      name: name.replace('Gender_', ''), // Remove prefix if needed
      value: typeof value === 'number' ? value : Number(value),
      color: colors[index % colors.length],
    };
  });

  // Extract age distribution data if available
  const ageDistribution = apiData.summary?.age_distribution || {};
  const ageData = Object.entries(ageDistribution).map(([ageGroup, count], index) => {
    return {
      name: ageGroup,
      value: typeof count === 'number' ? count : Number(count),
      color: colors[index % colors.length],
    };
  });

  // Transform RFM segmentation data
  const rfmSegments = apiData.summary?.value_based_rfm || {};
  const rfmData = Object.entries(rfmSegments).map(([name, value], index) => {
    return {
      name,
      value: typeof value === 'number' ? value : Number(value),
      color: colors[index % colors.length],
    };
  });

  // Transform preference segmentation data
  const preferenceSegments = apiData.summary?.preference || {};
  const preferenceData = Object.entries(preferenceSegments).map(([name, value], index) => {
    return {
      name,
      value: typeof value === 'number' ? value : Number(value),
      color: colors[index % colors.length],
    };
  });

  // Extract preference profiles for detailed analysis
  const preferenceProfiles = apiData.details?.preference_details?.profiles || {};

  // Extract unique categories and materials from profiles
  const categories = new Set<string>();
  const materials = new Set<string>();

  Object.values(preferenceProfiles).forEach((profile: any) => {
    if (profile.favorite_category && profile.favorite_category !== 'N/A' && profile.favorite_category !== 'Unknown') {
      categories.add(profile.favorite_category);
    }
    if (profile.preferred_material && profile.preferred_material !== 'N/A' && profile.preferred_material !== 'Unknown') {
      materials.add(profile.preferred_material);
    }
  });

  // Create category and material distribution data
  const categoryDistribution = Array.from(categories).map((category, index) => {
    // Count customers with this category
    let count = 0;
    Object.entries(preferenceProfiles).forEach(([group, profile]: [string, any]) => {
      if (profile.favorite_category === category) {
        count += apiData.details?.preference_details?.distribution?.[group] || 0;
      }
    });

    return {
      name: category,
      value: count,
      color: colors[index % colors.length],
    };
  });

  const materialDistribution = Array.from(materials).map((material, index) => {
    // Count customers with this material
    let count = 0;
    Object.entries(preferenceProfiles).forEach(([group, profile]: [string, any]) => {
      if (profile.preferred_material === material) {
        count += apiData.details?.preference_details?.distribution?.[group] || 0;
      }
    });

    return {
      name: material,
      value: count,
      color: colors[index % colors.length],
    };
  });

  // Calculate segment trends (this would need real historical data)
  // For now, we'll create mock trend data based on the current distribution
  const segmentTrendData = rfmData.slice(0, 4).map((segment, index) => {
    // Generate some random trend data
    const baseValue = segment.value;
    const trendData = Array(6).fill(0).map((_, i) => {
      // Create a trend that ends with the current value
      const startValue = Math.max(5, baseValue - Math.random() * 10);
      const step = (baseValue - startValue) / 5;
      return Math.round(startValue + step * i);
    });

    return {
      label: segment.name,
      data: trendData,
    };
  });

  // Determine which data to use based on the active tab
  let segmentData;
  if (apiData.details?.value_based_rfm_details) {
    segmentData = rfmData;
  } else if (apiData.details?.preference_details) {
    segmentData = preferenceData;
  } else {
    segmentData = demographicData;
  }

  return {
    segmentData,
    demographicData,
    rfmData,
    preferenceData,
    categoryDistribution,
    materialDistribution,
    segmentTrendData,
    ageData, // Add age data to the return object
    rawApiData: apiData, // Include raw data for debugging
  };
};
