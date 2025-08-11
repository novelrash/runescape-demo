#!/usr/bin/env python3
"""
Simple app.py wrapper for Render.com deployment
This imports the demo app to satisfy gunicorn's app:app requirement
"""

from app_demo import app

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)
