import json
from scrapegraphai.graphs import SmartScraperGraph
import os
from dotenv import load_dotenv
load_dotenv()

def run_scrapegraph(url):
    openai_api_key = os.getenv('OPENAI_API_KEY')
    # Define the configuration for the scraping pipeline
    graph_config = {
        "llm": {
            "api_key": openai_api_key,  # Replace with your actual API key
            "model": "gpt-4o-mini",
        },
        "verbose": True,
        "headless": True,
    }

    # Create the SmartScraperGraph instance
    smart_scraper_graph = SmartScraperGraph(
        prompt="Get reviews, the reviews will be under Textbook: Yes/No, with professor, subject, stars (or level of difficulty), review",
        source=url,
        config=graph_config
    )

    # Run the pipeline and get the result
    result = smart_scraper_graph.run()

    # Return the result as JSON
    # print(result)
    return result