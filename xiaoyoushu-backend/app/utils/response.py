from flask import jsonify

def success(data=None, message="success", code=0):
    return jsonify({
        "code": code,
        "message": message,
        "data": data
    })

def fail(message="error", code=400, data=None, status_code=400):
    response = jsonify({
        "code": code,
        "message": message,
        "data": data
    })
    response.status_code = status_code
    return response