from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import asyncio
from scraper import run_scrapegraph

app = Flask(__name__)
CORS(app)

@app.route('/api/scrape', methods=['POST'])
async def scrape():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        # Run Scrapegraphai asynchronously
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(None, run_scrapegraph, url)
        # result = run_scrapegraph(url)
    except Exception as e:
        print(f'Error running ScrapeGraphAI: {e}')
        return jsonify({'error': 'Internal server error'}), 500

    print(json.dumps(result, indent=4))

    return jsonify({'message': 'in /api/scrape'})

if __name__ == '__main__':
    try:
        app.run(host='127.0.0.1', port=5000, debug=True)
    except Exception as e:
        print(f"Error running Flask server: {e}")