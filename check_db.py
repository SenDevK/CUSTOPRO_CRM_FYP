from pymongo import MongoClient
import json
import pprint

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['CustoPro_db']
coll = db['customers']

# Get one document to check structure
doc = coll.find_one()

if doc:
    # Print document structure (field names and types)
    print("Document structure:")
    structure = {k: str(type(v)) for k, v in doc.items()}
    print(json.dumps(structure, indent=2))
    
    # Print sample values (truncated for readability)
    print('\nSample values:')
    for k, v in doc.items():
        if isinstance(v, dict) or isinstance(v, list):
            print(f"{k}: {str(v)[:100]}..." if len(str(v)) > 100 else f"{k}: {v}")
        else:
            print(f"{k}: {v}")
    
    # Check if there are RFM values
    rfm_fields = [field for field in doc.keys() if 'rfm' in field.lower()]
    if rfm_fields:
        print("\nRFM fields found:", rfm_fields)
    else:
        print("\nNo explicit RFM fields found")
    
    # Check for loyalty or customer status indicators
    loyalty_fields = [field for field in doc.keys() if any(term in field.lower() for term in ['loyal', 'status', 'type', 'segment'])]
    if loyalty_fields:
        print("\nLoyalty/status fields found:", loyalty_fields)
    else:
        print("\nNo explicit loyalty/status fields found")
    
    # Check for demographic data
    demographic_fields = [field for field in doc.keys() if any(term in field.lower() for term in ['age', 'gender', 'demographic', 'birth'])]
    if demographic_fields:
        print("\nDemographic fields found:", demographic_fields)
    else:
        print("\nNo explicit demographic fields found")
    
    # Check for geographic data
    geographic_fields = [field for field in doc.keys() if any(term in field.lower() for term in ['address', 'city', 'location', 'country', 'geo'])]
    if geographic_fields:
        print("\nGeographic fields found:", geographic_fields)
    else:
        print("\nNo explicit geographic fields found")
    
    # Check for transaction data
    transaction_fields = [field for field in doc.keys() if any(term in field.lower() for term in ['transaction', 'purchase', 'order', 'spent'])]
    if transaction_fields:
        print("\nTransaction fields found:", transaction_fields)
        
        # If transactions exist, print a sample transaction
        if 'transactions' in doc and isinstance(doc['transactions'], list) and len(doc['transactions']) > 0:
            print("\nSample transaction structure:")
            sample_tx = doc['transactions'][0]
            print(json.dumps({k: str(type(v)) for k, v in sample_tx.items()}, indent=2))
            print("\nSample transaction values:")
            for k, v in sample_tx.items():
                print(f"{k}: {v}")
    else:
        print("\nNo explicit transaction fields found")
    
    # Count total documents
    total_docs = coll.count_documents({})
    print(f"\nTotal customer documents: {total_docs}")
    
    # Check for missing data
    print("\nFields with missing data:")
    for field in doc.keys():
        missing_count = coll.count_documents({field: {"$exists": False}})
        if missing_count > 0:
            print(f"  {field}: missing in {missing_count} documents ({missing_count/total_docs*100:.1f}%)")
else:
    print("No documents found in the collection")

# Close connection
client.close()
