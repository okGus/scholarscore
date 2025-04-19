# Scolarscore

This project is bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Description

This project provides an interactive application that integrates reviews from Rate My Professor using a combination of web scraping and AI-based query processing. Utilizing Next.js, this application allows users to search for professor reviews and interact with an AI assistant to receive personalized recommendations.

## Features

* **Rate My Professor Integration:** The application allows you to fetch and display reviews for professors using the `scrapegraphai` library. It leverages a Pinecone vector database for semantic search and retrieval.
* **Chat Interface:** The application includes a chat interface powered by OpenAI's GPT-4o-mini model. You can type in your professor-related questions, and the AI will respond with recommendations based on the reviews.
* **Customizable System Prompt:** The system prompt provides the AI with clear instructions on how to behave, including specific examples of questions to address, how to retrieve information, and how to format its responses.

## Installation

To install the project and its dependencies, follow these steps:

1. Clone the repository.
2. Navigate into the project directory.
3. Install the required dependencies:

```bash
npm install
```

4. Set up environment variables by creating a `.env` file and including your `OPENAI_API_KEY`, `PINECONE_API_KEY`, and other relevant configuration parameters just follow the `.env.example` file.

## Usage

To run the application in development mode, execute the following command:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file. 

Use the chat interface to ask questions about professors and fetch reviews by entering the desired professor’s Rate My Professor link into the input field.

## API Routes

* `/api/scrape`: This route is used to fetch and display reviews from Rate My Professor. It sends a POST request with a URL to ratemyprofessor.com. The API call is asynchronous and utilizes a `scrapegraphai` script to parse the reviews and return results.

## Deployment

The project is designed to be deployed using Vercel. Follow the deployment guide on the Vercel platform to set up production hosting.