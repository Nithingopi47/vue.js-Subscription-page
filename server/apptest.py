@app.route("/plans", methods=["GET"])
def get_all_plans():
    try:
        # Define the order of plans we want to return
        plan_order = [
            "plan_Q7qkkiaBkypLek",  # Basic Plan
            "plan_QBKMIS4rIFWgOG",  # Professional Plan
            "plan_QBKreMzkSNck8V"   # Enterprise Plan
        ]
        
        # Create a list of plans in the specified order
        ordered_plans = [PLANS[plan_id] for plan_id in plan_order]
        
        return jsonify({
            "statusCode": 200,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": {
                "status": "success",
                "data": {
                    "entity": "collection",
                    "count": len(ordered_plans),
                    "items": ordered_plans
                }
            }
        })
    except Exception as e:
        logger.error(f"Error retrieving plans: {str(e)}")
        return jsonify({
            "statusCode": 500,
            "headers": {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            },
            "body": {
                "status": "error",
                "message": str(e)
            }
        }), 500 