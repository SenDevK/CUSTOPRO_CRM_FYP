# Vite Configuration Update for Marketing Backend

## Overview

This document outlines the changes needed in the Vite configuration to properly connect the frontend with the marketing backend.

## Current Configuration

The current Vite configuration in `vite.config.ts` may be missing a proxy configuration for the marketing backend or pointing to the wrong port.

## Required Configuration

Add or update the following proxy configuration in `vite.config.ts`:

```javascript
'/api/marketing': {
  target: 'http://localhost:5001', // marketing backend
  changeOrigin: true,
  secure: false,
},
```

## Complete Proxy Configuration

Your complete proxy configuration should look like this:

```javascript
proxy: {
  '/api/segments': {
    target: 'http://localhost:5000',   // segment customization
    changeOrigin: true,
  },
  '/api/segment': {
    target: 'http://localhost:8000', // segmentation
    changeOrigin: true,
  },
  '/api/revenue': {
    target: 'http://localhost:5001', // revenue model
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path,
  },
  '/api/marketing': {
    target: 'http://localhost:5001', // marketing backend
    changeOrigin: true,
    secure: false,
  },
  '/api': {
    target: 'http://localhost:5000', // data ingesting
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

## Implementation Steps

1. Open `vite.config.ts` in your code editor
2. Locate the proxy configuration section
3. Add or update the marketing backend proxy configuration
4. Ensure it's placed before the catch-all `/api` configuration
5. Save the file
6. Restart the frontend development server

## Verification

After making this change, verify that:

1. The frontend can connect to the marketing backend
2. No CORS errors appear in the console
3. API requests to `/api/marketing/*` endpoints are properly proxied to the marketing backend

## Troubleshooting

If you still encounter issues after updating the configuration:

1. **Verify Backend is Running**:
   - Check that the marketing backend is running on port 5001
   - Test the backend directly by visiting `http://localhost:5001/health`

2. **Check Network Requests**:
   - Open the browser's developer tools
   - Go to the Network tab
   - Look for requests to `/api/marketing/*`
   - Check for any errors in the response

3. **Clear Browser Cache**:
   - Clear your browser cache
   - Restart the browser
   - Try again

4. **Restart Servers**:
   - Restart both the frontend and backend servers
   - This ensures all configuration changes are applied

## Additional Notes

- The marketing backend is configured to run on port 5001 as specified in the `.env` file
- The order of proxy configurations is important - more specific routes should come before catch-all routes
- CORS is enabled on the backend, but the proxy configuration should handle CORS issues automatically
