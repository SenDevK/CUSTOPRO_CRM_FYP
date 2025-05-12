# Customer API Setup Guide

This guide explains how to add customer API endpoints to the CRM Data Ingestion service to support the Customers tab in the frontend.

## Overview

The current data ingestion service only supports uploading and processing customer data files, but doesn't provide API endpoints for retrieving customer data. This update adds two new endpoints:

1. `GET /customers` - Retrieve a paginated list of customers with search and filtering
2. `GET /customers/<customer_id>` - Retrieve a single customer by ID

## Installation Options

You have two options to implement these changes:

### Option 1: Replace the entire app.py file

1. Backup your current app.py file:
   ```
   copy app.py app.py.backup
   ```

2. Replace it with the new version:
   ```
   copy app_with_customer_api.py app.py
   ```

3. Restart the data ingestion service:
   ```
   python app.py
   ```

### Option 2: Add the customer API as a Blueprint (Recommended)

This approach is more modular and doesn't require replacing the entire app.py file.

1. Keep the `customer_api.py` file in the same directory as app.py

2. Modify your app.py file to register the Blueprint:
   
   Add these imports at the top of app.py:
   ```python
   from customer_api import customer_bp
   ```

   Add this line after creating the Flask app:
   ```python
   app.register_blueprint(customer_bp)
   ```

3. Restart the data ingestion service:
   ```
   python app.py
   ```

## Testing the API

After implementing the changes, you can test the API endpoints:

1. List customers:
   ```
   curl http://localhost:5000/customers?page=1&limit=10
   ```

2. Search customers:
   ```
   curl http://localhost:5000/customers?search=john
   ```

3. Filter by segment:
   ```
   curl http://localhost:5000/customers?segment=high_value
   ```

4. Get a single customer:
   ```
   curl http://localhost:5000/customers/customer_id
   ```

## API Documentation

### GET /customers

Retrieves a paginated list of customers.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search term to filter customers by name, email, or phone
- `segment` (optional): Filter by segment (high_value, medium_value, low_value, at_risk)

**Response:**
```json
{
  "customers": [
    {
      "id": "customer_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "phone": "+94771234567",
      "city": "Colombo",
      "segment": "high_value",
      "totalSpent": 235000,
      "purchaseCount": 12,
      "consentGiven": true,
      "consentDate": "2023-01-15",
      "createdAt": "2023-01-15"
    },
    // More customers...
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "pages": 10
}
```

### GET /customers/:id

Retrieves a single customer by ID.

**Response:**
```json
{
  "id": "customer_id",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+94771234567",
  "city": "Colombo",
  "segment": "high_value",
  "totalSpent": 235000,
  "purchaseCount": 12,
  "consentGiven": true,
  "consentDate": "2023-01-15",
  "createdAt": "2023-01-15",
  "transactions": [
    // Transaction details...
  ],
  "survey_responses": [
    // Survey response details...
  ],
  "preferences": {
    // Preference details...
  }
}
```

## Troubleshooting

If you encounter any issues:

1. Check the console output for error messages
2. Verify that MongoDB is running and accessible
3. Ensure the correct database and collection names are being used
4. Check that the data in MongoDB matches the expected format

If the API returns empty results, it may be because:
- There are no customers in the database
- The search or filter criteria don't match any customers
- The field names in the database don't match what the API is expecting
