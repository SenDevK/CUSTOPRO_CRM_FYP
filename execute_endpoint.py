# Add this to routes/campaign_routes.py after the delete_campaign function and before the schedule_campaign function

@campaign_bp.route("/campaigns/<campaign_id>/execute", methods=["POST"])
def execute_campaign(campaign_id):
    """Execute a campaign immediately"""
    try:
        # Execute the campaign
        result = campaign_service.execute_campaign(campaign_id)

        if "error" in result:
            return jsonify({"error": result["error"]}), 500

        # Get the updated campaign
        db = get_db()
        updated_campaign = db.campaigns.find_one({"_id": ObjectId(campaign_id)})

        # Convert ObjectId to string for JSON serialization
        serialized_campaign = serialize_document(updated_campaign)

        # Transform for frontend
        transformed_campaign = campaign_service._transform_campaign_for_frontend(serialized_campaign)

        return jsonify(transformed_campaign), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
