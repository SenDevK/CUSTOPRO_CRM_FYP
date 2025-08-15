# Customer Data Mapping Fix

## Overview

This document outlines the issues identified with customer data mapping between the MongoDB database and the frontend application, along with the necessary fixes to ensure customer details are properly displayed in the customer tab.

## Problem Identification

The customer tab is currently displaying empty fields or zero values for customer details. After investigation, the following issues were identified:

1. **Field Name Case Sensitivity**: MongoDB data contains fields like `total_amount_LKR` (uppercase), but the backend code is looking for `total_amount_lkr` (lowercase).

2. **Missing Field Transformations**: Some fields in the MongoDB documents aren't being properly transformed to match what the frontend expects.

3. **Incomplete Data Processing**: The backend is not fully processing all the fields that the frontend expects, particularly for transaction data and segmentation information.

4. **Missing Default Values**: When certain fields are missing in the MongoDB data, appropriate default values aren't being provided.

## Current Data Structure

### MongoDB Customer Document Example

```json
{
  "_id": ObjectId("680261786e3c2b63eeb3061c"),
  "contact_number": 5527635995,
  "email": "brian79@hotmail.com",
  "favorite_category": "Accessories",
  "full_name": "Russell Gibson",
  "gender": "Male",
  "preferred_material": "Denim",
  "transactions": [
    {
      "transaction_id": UUID("081d71c5-6eae-4da3-afd3-8844fe57c696"),
      "purchase_datetime": "2025-04-16 05:05:42",
      "items_purchased": "Shoes, Shirt, Jacket",
      "total_amount_LKR": 20183,
      "payment_method": "Cash",
      "store_location": "Kandy"
    },
    // Additional transactions...
  ],
  "demographic_segment": "Gender_Male_Age_Unknown",
  "rfm_data": {
    "recency": 27,
    "frequency": 5,
    "monetary": 63209.0,
    "r_score": 3,
    "f_score": 4,
    "m_score": 5,
    "rfm_score": "345",
    "last_calculated": datetime.datetime(2025, 5, 13, 20, 58, 27, 5000)
  },
  "value_segment": "Loyal Customers",
  "preferences": {
    "favorite_categories": ["Accessories"],
    "preferred_materials": ["Denim"]
  },
  "preference_segment": "Preference Group 3",
  "gender_segment": "Gender_Male"
}
```

### Frontend Expected Customer Type

```typescript
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  segment?: 'high_value' | 'medium_value' | 'low_value' | 'at_risk';
  lastPurchase?: string;
  totalSpent: number;
  purchaseCount: number;
  consentGiven: boolean;
  consentDate?: string;
  notes?: string;
  createdAt: string;
  marketing_status?: 'active' | 'opted_out' | 'deleted' | 'inactive';
  opt_out_date?: string;
  opt_out_reason?: string;
}
```

## Required Fixes

### 1. Update Field Name Case Handling

The backend code needs to be updated to handle both uppercase and lowercase field names in transaction data:

```python
# Calculate total spent - handle both uppercase and lowercase field names
total_spent = sum(float(tx.get('total_amount_lkr', tx.get('total_amount_LKR', 0))) 
                 for tx in customer['transactions'])
```

### 2. Improve Data Transformation Logic

Update the data transformation logic to properly map MongoDB fields to frontend expected fields:

```python
# In the get_customer function in customer_api.py

# Fix the transaction amount field name case sensitivity
if 'transactions' in customer:
    # Calculate total spent - handle both uppercase and lowercase field names
    total_spent = sum(float(tx.get('total_amount_lkr', tx.get('total_amount_LKR', 0))) 
                     for tx in customer['transactions'])
    customer['totalSpent'] = total_spent
    
    # Calculate purchase count
    customer['purchaseCount'] = len(customer['transactions'])
    
    # Get last purchase date
    if customer['transactions']:
        purchase_dates = []
        for tx in customer['transactions']:
            if 'purchase_datetime' in tx:
                purchase_dates.append(tx['purchase_datetime'])
        if purchase_dates:
            customer['lastPurchase'] = max(purchase_dates)
else:
    # Default values if no transactions
    customer['totalSpent'] = 0
    customer['purchaseCount'] = 0

# Add createdAt field if missing
if 'createdAt' not in customer:
    customer['createdAt'] = datetime.now().isoformat()

# Add segment if missing
if 'segment' not in customer:
    if 'value_segment' in customer:
        customer['segment'] = 'high_value' if customer['value_segment'] in ['Champions', 'Loyal Customers'] else 'medium_value'
    elif 'rfm_data' in customer and 'rfm_score' in customer['rfm_data']:
        rfm_score = int(customer['rfm_data']['rfm_score'])
        customer['segment'] = 'high_value' if rfm_score >= 444 else 'medium_value' if rfm_score >= 333 else 'low_value'
    else:
        customer['segment'] = 'low_value'

# Ensure phone field is present
if 'phone' not in customer and 'contact_number' in customer:
    customer['phone'] = str(customer['contact_number'])
```

### 3. Add Comprehensive Field Mapping

Implement a more comprehensive field mapping function to ensure all frontend expected fields are properly populated:

```python
def map_customer_fields(customer_doc):
    """Map MongoDB customer document to frontend expected format."""
    customer = serialize_document(customer_doc)  # Convert _id to id
    
    # Basic information
    if 'full_name' in customer:
        name_parts = customer['full_name'].split(' ', 1)
        customer['firstName'] = name_parts[0]
        customer['lastName'] = name_parts[1] if len(name_parts) > 1 else ''
    else:
        customer['firstName'] = customer.get('firstName', 'Unknown')
        customer['lastName'] = customer.get('lastName', '')
    
    # Contact information
    customer['email'] = customer.get('email', '')
    customer['phone'] = str(customer.get('contact_number', customer.get('phone', '')))
    customer['address'] = customer.get('address', '')
    customer['city'] = customer.get('city', '')
    
    # Transaction data
    if 'transactions' in customer:
        # Calculate total spent
        total_spent = sum(float(tx.get('total_amount_lkr', tx.get('total_amount_LKR', 0))) 
                         for tx in customer['transactions'])
        customer['totalSpent'] = total_spent
        
        # Calculate purchase count
        customer['purchaseCount'] = len(customer['transactions'])
        
        # Get last purchase date
        if customer['transactions']:
            purchase_dates = []
            for tx in customer['transactions']:
                if 'purchase_datetime' in tx:
                    purchase_dates.append(tx['purchase_datetime'])
            if purchase_dates:
                customer['lastPurchase'] = max(purchase_dates)
    else:
        # Use RFM data if available
        if 'rfm_data' in customer:
            customer['totalSpent'] = float(customer['rfm_data'].get('monetary', 0))
            customer['purchaseCount'] = int(customer['rfm_data'].get('frequency', 0))
        else:
            customer['totalSpent'] = 0
            customer['purchaseCount'] = 0
    
    # Segmentation
    if 'segment' not in customer:
        if 'value_segment' in customer:
            high_value_segments = ['Champions', 'Loyal Customers', 'Potential Loyalists']
            at_risk_segments = ['At Risk', 'Hibernating', 'Lost Customers']
            
            if customer['value_segment'] in high_value_segments:
                customer['segment'] = 'high_value'
            elif customer['value_segment'] in at_risk_segments:
                customer['segment'] = 'at_risk'
            else:
                customer['segment'] = 'medium_value'
        elif 'rfm_data' in customer and 'rfm_score' in customer['rfm_data']:
            rfm_score = customer['rfm_data']['rfm_score']
            if isinstance(rfm_score, str):
                rfm_score = int(rfm_score) if rfm_score.isdigit() else 0
            
            customer['segment'] = 'high_value' if rfm_score >= 444 else 'medium_value' if rfm_score >= 333 else 'low_value'
        else:
            customer['segment'] = 'low_value'
    
    # Other fields
    customer['consentGiven'] = customer.get('consentGiven', customer.get('consent_given', False))
    customer['consentDate'] = customer.get('consentDate', customer.get('consent_date', ''))
    customer['notes'] = customer.get('notes', '')
    customer['createdAt'] = customer.get('createdAt', customer.get('created_at', datetime.now().isoformat()))
    customer['marketing_status'] = customer.get('marketing_status', 'active')
    
    return customer
```

## Implementation Steps

1. **Update customer_api.py**:
   - Add the comprehensive `map_customer_fields` function
   - Update the `/api/customers` and `/api/customers/<customer_id>` endpoints to use this function

2. **Test the API Endpoints**:
   - Test the `/api/customers` endpoint to ensure it returns properly formatted customer data
   - Test the `/api/customers/<customer_id>` endpoint with a specific customer ID

3. **Verify Frontend Display**:
   - Check the customer tab to ensure all customer details are properly displayed
   - Verify that transaction data, segmentation information, and other fields are correctly shown

## Conclusion

By implementing these fixes, the customer details should be properly displayed in the customer tab. The key is to ensure that the data from MongoDB is correctly transformed to match the frontend's expected format, handling field name case sensitivity, providing appropriate default values, and mapping segmentation data correctly.
