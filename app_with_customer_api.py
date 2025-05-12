"""
Modified version of app.py that includes customer API endpoints.
To use this file, rename it to app.py after backing up the original.
"""

import os
import io
import json
import pandas as pd
import re
from datetime import datetime, timezone
from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from werkzeug.utils import secure_filename
from bson.objectid import ObjectId

# --- Configuration ---
MONGODB_URI = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")
DATABASE_NAME = "CustoPro_db"
CUSTOMER_COLLECTION = "customers"
UPLOAD_FOLDER = os.environ.get("UPLOAD_FOLDER", "uploads")
ALLOWED_EXTENSIONS = set(os.environ.get("ALLOWED_EXTENSIONS", "csv,xlsx,json").split(','))

# --- Flask App Initialization ---
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024 # 16 MB limit for uploads

# Create upload folder if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# --- MongoDB Connection ---
client = None
customers_collection = None
try:
    client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000) # Add timeout
    db = client[DATABASE_NAME]
    customers_collection = db[CUSTOMER_COLLECTION]
    # Test connection
    client.admin.command('ping')
    print("Successfully connected to MongoDB.")
except Exception as e:
    print(f"Error connecting to MongoDB: {e}")
    # Explicitly set to None on failure
    client = None
    customers_collection = None

# --- Helper Functions ---
def allowed_file(filename):
    """Checks if the file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Helper function to convert MongoDB document to JSON serializable format
def serialize_document(doc):
    if doc and "_id" in doc:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
    return doc

# --- Customer API Routes ---
@app.route('/customers', methods=['GET'])
def get_customers():
    """API endpoint to retrieve customer data with pagination, search, and filtering."""
    # Check database connection
    if client is None or customers_collection is None:
        print("Error: Attempted to retrieve customers but database connection is not available.")
        return jsonify({"error": "Database connection not available. Please check MongoDB connection and restart the server."}), 500

    try:
        # Get query parameters
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        segment = request.args.get('segment', '')

        # Calculate skip value for pagination
        skip = (page - 1) * limit

        # Build query filter
        query_filter = {}
        
        # Add search filter if provided
        if search:
            # Search in multiple fields
            query_filter['$or'] = [
                {'full_name': {'$regex': search, '$options': 'i'}},
                {'email': {'$regex': search, '$options': 'i'}},
                {'contact_number': {'$regex': search, '$options': 'i'}}
            ]
        
        # Add segment filter if provided
        if segment:
            # Map segment values to query conditions
            if segment == 'high_value':
                # Example: Customers with total spent > 100000
                query_filter['total_spent'] = {'$gt': 100000}
            elif segment == 'medium_value':
                # Example: Customers with total spent between 50000 and 100000
                query_filter['total_spent'] = {'$gte': 50000, '$lte': 100000}
            elif segment == 'low_value':
                # Example: Customers with total spent < 50000
                query_filter['total_spent'] = {'$lt': 50000}
            elif segment == 'at_risk':
                # Example: Customers who haven't made a purchase in the last 90 days
                # This would require additional logic based on your data structure
                pass

        # Count total matching documents
        total = customers_collection.count_documents(query_filter)
        
        # Calculate total pages
        total_pages = (total + limit - 1) // limit
        
        # Retrieve customers with pagination
        cursor = customers_collection.find(query_filter).skip(skip).limit(limit)
        
        # Convert MongoDB documents to JSON serializable format
        customers = []
        for doc in cursor:
            customer = serialize_document(doc)
            
            # Calculate derived fields if needed
            if 'transactions' in customer:
                # Calculate total spent
                total_spent = sum(float(tx.get('total_amount_lkr', 0)) for tx in customer['transactions'] if 'total_amount_lkr' in tx)
                customer['totalSpent'] = total_spent
                
                # Calculate purchase count
                customer['purchaseCount'] = len(customer['transactions'])
                
                # Get last purchase date
                if customer['transactions']:
                    last_purchase = max((tx.get('purchase_datetime') for tx in customer['transactions'] if 'purchase_datetime' in tx), default=None)
                    if last_purchase:
                        customer['lastPurchase'] = last_purchase
            else:
                # Default values if no transactions
                customer['totalSpent'] = 0
                customer['purchaseCount'] = 0
            
            # Map fields to match frontend expectations
            if 'full_name' in customer:
                # Split full name into first and last name
                name_parts = customer['full_name'].split(' ', 1)
                customer['firstName'] = name_parts[0]
                customer['lastName'] = name_parts[1] if len(name_parts) > 1 else ''
            else:
                # Default values if no name
                customer['firstName'] = 'Unknown'
                customer['lastName'] = ''
            
            # Add segment based on total spent (simplified example)
            if 'totalSpent' in customer:
                if customer['totalSpent'] > 100000:
                    customer['segment'] = 'high_value'
                elif customer['totalSpent'] > 50000:
                    customer['segment'] = 'medium_value'
                else:
                    customer['segment'] = 'low_value'
            
            # Add consent information
            customer['consentGiven'] = customer.get('consent_given', False)
            customer['consentDate'] = customer.get('consent_date')
            
            # Add created date
            if 'created_date' in customer:
                customer['createdAt'] = customer['created_date']
            else:
                customer['createdAt'] = datetime.now().isoformat()
            
            # Add city if available
            if 'address' in customer and 'city' not in customer:
                # Extract city from address if possible
                address = customer['address']
                if isinstance(address, str) and ',' in address:
                    customer['city'] = address.split(',')[-1].strip()
            
            # Ensure all required fields are present
            if 'email' not in customer:
                customer['email'] = ''
            if 'phone' not in customer and 'contact_number' in customer:
                customer['phone'] = customer['contact_number']
            elif 'phone' not in customer:
                customer['phone'] = ''
            
            customers.append(customer)
        
        # Return paginated results
        return jsonify({
            'customers': customers,
            'total': total,
            'page': page,
            'limit': limit,
            'pages': total_pages
        }), 200
    
    except Exception as e:
        print(f"Error retrieving customers: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"An error occurred while retrieving customers: {str(e)}"}), 500

@app.route('/customers/<customer_id>', methods=['GET'])
def get_customer(customer_id):
    """API endpoint to retrieve a single customer by ID."""
    # Check database connection
    if client is None or customers_collection is None:
        print("Error: Attempted to retrieve customer but database connection is not available.")
        return jsonify({"error": "Database connection not available. Please check MongoDB connection and restart the server."}), 500

    try:
        # Find customer by ID
        # Try to convert to ObjectId if it looks like one
        if len(customer_id) == 24:
            try:
                query = {"_id": ObjectId(customer_id)}
            except:
                # If conversion fails, search by ID as string
                query = {"id": customer_id}
        else:
            # If not ObjectId format, search by ID as string
            query = {"id": customer_id}
        
        customer = customers_collection.find_one(query)
        
        # If not found by ID, try contact_number
        if not customer:
            customer = customers_collection.find_one({"contact_number": customer_id})
        
        if not customer:
            return jsonify({"error": "Customer not found"}), 404
        
        # Convert MongoDB document to JSON serializable format
        customer = serialize_document(customer)
        
        # Process customer data (similar to get_customers)
        # ... (similar processing as in get_customers)
        
        return jsonify(customer), 200
    
    except Exception as e:
        print(f"Error retrieving customer {customer_id}: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"An error occurred while retrieving customer: {str(e)}"}), 500

# --- Main Execution ---
if __name__ == '__main__':
    # Set debug=True for development, but turn off in production
    app.run(debug=True, host='0.0.0.0', port=5000)
