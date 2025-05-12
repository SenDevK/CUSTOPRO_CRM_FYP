/**
 * API service for dashboard customization
 */

// Local storage key for dashboard configurations
const DASHBOARD_CONFIGS_KEY = 'crm_dashboard_configs';

// Dashboard configuration interface
export interface DashboardConfig {
  id?: string;
  name: string;
  description: string;
  layout: 'grid' | 'list';
  isDefault: boolean;
  items: DashboardItem[];
  createdAt?: string;
  updatedAt?: string;
}

// Dashboard item interface
export interface DashboardItem {
  id: string;
  type: 'segment' | 'combined' | 'trend';
  title: string;
  visualizationType: 'pie' | 'bar' | 'line' | 'area';
  filters?: any[];
  segments?: any[];
}

/**
 * Get all dashboard configurations
 * @returns Promise with all dashboard configurations
 */
export const getDashboardConfigs = async (): Promise<DashboardConfig[]> => {
  try {
    // In a real application, this would be an API call
    const storedConfigs = localStorage.getItem(DASHBOARD_CONFIGS_KEY);
    return storedConfigs ? JSON.parse(storedConfigs) : [];
  } catch (error) {
    console.error('Error getting dashboard configurations:', error);
    return [];
  }
};

/**
 * Get a dashboard configuration by ID
 * @param id Dashboard configuration ID
 * @returns Promise with the dashboard configuration
 */
export const getDashboardConfigById = async (id: string): Promise<DashboardConfig | null> => {
  try {
    // In a real application, this would be an API call
    const storedConfigs = localStorage.getItem(DASHBOARD_CONFIGS_KEY);
    const configs = storedConfigs ? JSON.parse(storedConfigs) : [];
    return configs.find((config: DashboardConfig) => config.id === id) || null;
  } catch (error) {
    console.error(`Error getting dashboard configuration ${id}:`, error);
    return null;
  }
};

/**
 * Get the default dashboard configuration
 * @returns Promise with the default dashboard configuration
 */
export const getDefaultDashboardConfig = async (): Promise<DashboardConfig | null> => {
  try {
    // In a real application, this would be an API call
    const storedConfigs = localStorage.getItem(DASHBOARD_CONFIGS_KEY);
    const configs = storedConfigs ? JSON.parse(storedConfigs) : [];
    return configs.find((config: DashboardConfig) => config.isDefault) || null;
  } catch (error) {
    console.error('Error getting default dashboard configuration:', error);
    return null;
  }
};

/**
 * Save a dashboard configuration
 * @param config Dashboard configuration to save
 * @returns Promise with the saved dashboard configuration
 */
export const saveDashboardConfig = async (config: DashboardConfig): Promise<DashboardConfig> => {
  try {
    // In a real application, this would be an API call
    const storedConfigs = localStorage.getItem(DASHBOARD_CONFIGS_KEY);
    const configs = storedConfigs ? JSON.parse(storedConfigs) : [];
    
    const now = new Date().toISOString();
    
    // If this is set as default, unset any other defaults
    if (config.isDefault) {
      configs.forEach((c: DashboardConfig) => {
        if (c.id !== config.id) {
          c.isDefault = false;
        }
      });
    }
    
    // Update existing or add new
    if (config.id) {
      const index = configs.findIndex((c: DashboardConfig) => c.id === config.id);
      if (index !== -1) {
        configs[index] = {
          ...config,
          updatedAt: now
        };
      }
    } else {
      configs.push({
        ...config,
        id: `dashboard-${Date.now()}`,
        createdAt: now,
        updatedAt: now
      });
    }
    
    localStorage.setItem(DASHBOARD_CONFIGS_KEY, JSON.stringify(configs));
    
    // Return the saved config
    return config.id 
      ? configs.find((c: DashboardConfig) => c.id === config.id)
      : configs[configs.length - 1];
  } catch (error) {
    console.error('Error saving dashboard configuration:', error);
    throw error;
  }
};

/**
 * Delete a dashboard configuration
 * @param id Dashboard configuration ID
 * @returns Promise with success status
 */
export const deleteDashboardConfig = async (id: string): Promise<boolean> => {
  try {
    // In a real application, this would be an API call
    const storedConfigs = localStorage.getItem(DASHBOARD_CONFIGS_KEY);
    const configs = storedConfigs ? JSON.parse(storedConfigs) : [];
    
    const newConfigs = configs.filter((config: DashboardConfig) => config.id !== id);
    
    localStorage.setItem(DASHBOARD_CONFIGS_KEY, JSON.stringify(newConfigs));
    
    return true;
  } catch (error) {
    console.error(`Error deleting dashboard configuration ${id}:`, error);
    throw error;
  }
};
