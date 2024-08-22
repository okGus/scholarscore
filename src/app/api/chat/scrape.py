import requests
from bs4 import BeautifulSoup
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
from pinecone import Pinecone, ServerlessSpec
import os

def scrape_reviews(url):
    try:
        # Send a request to the website
        response = requests.get(url)
        response.raise_for_status()  # Check for HTTP errors

        # Parse the content with BeautifulSoup
        soup = BeautifulSoup(response.text, 'html.parser')

        # Find reviews (adjust the selector based on the website structure)
        reviews = []
        review_elements = soup.select('.Comments__StyledComments-dzzyvm-0.gRjWel')  # Replace '.review-class' with the actual CSS selector for reviews

        for element in review_elements:
            review_text = element.get_text(strip=True)
            reviews.append(review_text)
        
        stars = []
        star_elements = soup.select('.CardNumRating__CardNumRatingNumber-sc-17t4b9u-2.gcFhmN')  # Replace '.star-class' with the actual CSS selector for stars

        for element in star_elements:
            star_text = element.get_text(strip=True)
            stars.append(star_text)
        
        name = None
        name_elements = soup.select('#root > div > div > div.PageWrapper__StyledPageWrapper-sc-3p8f0h-0.lcpsHk > div.TeacherRatingsPage__TeacherBlock-sc-1gyr13u-1.jMpSNb > div.TeacherInfo__StyledTeacher-ti1fio-1.kFNvIp > div:nth-child(2) > div.NameTitle__Name-dowf0z-0.cfjPUG span')  # Replace '.name-class' with the actual CSS selector for name

        # Combine names if multiple elements are found
        if name_elements:
            name = ' '.join([element.get_text(strip=True) for element in name_elements])

        
        subject = None

        subject_elements = soup.select('.NameTitle__Title-dowf0z-1.iLYGwn')

        if subject_elements:
            full_text = ' '.join([element.get_text(strip=True) for element in subject_elements])
            print(f"Full text: {full_text}")  # Debug print

            # Extract subject using a simple approach
            # Assuming the subject comes between "Professor in the" and "department"
            start = full_text.find("Professor in the") + len("Professor in the")
            end = full_text.find("department")

            if start != -1 and end != -1:
                subject = full_text[start:end].strip()
        

        process_data = []
        client = OpenAI()

        response = client.embeddings.create(
            input=reviews,
            model='text-embedding-3-small',
        )
        embedding = response.data[0].embedding
        process_data.append({
            'values': embedding,
            'id': name,
            'metadata': {
                'review': reviews,
                'subject': subject,
                'stars': stars
            }
        })

        pinecone_ = Pinecone(api_key=os.getenv('PINECONE_API_KEY'))

        index = pinecone_.Index('rag')
        index.upsert(
            vectors=process_data,
            namespace=''
)

        return reviews

    except requests.RequestException as e:
        print(f"Request error: {e}")
        return None

    except Exception as e:
        print(f"Error: {e}")
        return None


app = Flask(__name__)
CORS(app)

@app.route('/api/scrape', methods=['POST'])
def scrape():
    data = request.json
    url = data.get('url')
    
    if not url:
        return jsonify({"error": "URL is required"}), 400
    
    reviews = scrape_reviews(url)
    
    if reviews is None:
        return jsonify({"error": "Failed to scrape reviews"}), 500
    
    return jsonify({"reviews": reviews})

if __name__ == '__main__':
    app.run(debug=True)
