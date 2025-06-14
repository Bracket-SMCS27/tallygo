# TallyGO

In order to build and run this repository on your own computer, you'll need two things: Node.js version 18+ or 20+ and a Mistral API key to facilitate model requests.

Once you've cloned the repository and navigated into its root, run `npm install` followed by `npm run dev` to install required packages and build and run the web application to run locally.

For the AI calls to work, you'll need to create a `.env` file in the root of your project and paste in `VITE_APP_MISTRAL_API_KEY=<api_key_here>` with a working API key in `<api_key_here>`.
