from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import asyncio
from scraper import run_scrapegraph
import os
from dotenv import load_dotenv
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec

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
    except Exception as e:
        print(f'Error running ScrapeGraphAI: {e}')
        return jsonify({'error': 'Internal server error'}), 500

    print(json.dumps(result, indent=4))
    load_dotenv()

    process_data = []
    client = OpenAI()

    # Create embedding from data
    for review in result['reviews']:
        response = client.embeddings.create(
            input=review['review'],
            model='text-embedding-3-small',
        )
        embedding = response.data[0].embedding
        process_data.append({
            'values': embedding,
            'id': review['professor'],
            'metadata': {
                'review': review['review'],
                'subject': review['subject'],
                'stars': review['stars']
            }
        })

    pinecone_ = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))
    index = pinecone_.Index(os.getenv('PINECONE_INDEX'))

    # Insert data
    index.upsert(
        vectors=process_data,
        namespace=os.getenv('PINECONE_NAMESPACE')
    )

    return jsonify({'message': 'Successful scrape of reviews'}), 200

if __name__ == '__main__':
    try:
        app.run(host='127.0.0.1', port=5000, debug=True)
    except Exception as e:
        print(f"Error running Flask server: {e}")