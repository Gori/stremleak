# MovieLeaks Stremio Addon

A Stremio addon that brings the latest movie leaks from [r/MovieLeaks](https://reddit.com/r/MovieLeaks) directly to your Stremio library.

![MovieLeaks Logo](/images/logo.webp)

## Features

- **Latest Leaks**: Automatically fetches and displays the newest high-quality movie leaks.
- **Top Monthly**: Browse the most popular leaks from the last 30 days.
- **Metadata Integration**: Enriched with movie details (posters, descriptions, release dates) via TMDB.
- **Direct Links**: One-click access to the Reddit discussion threads.
- **Fast & Reliable**: Powered by Convex for caching and real-time updates.

## Installation

### Public Version
You can install the public version of this addon by visiting:
[https://stremleak.vercel.app/](https://stremleak.vercel.app/)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/oskarsundberg/stremleak.git
   cd stremleak
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Copy `.env.template` to `.env.local` and fill in the required values.
   ```bash
   cp .env.template .env.local
   ```

   You will need:
   - **Reddit API Credentials**: Create an app at [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps) (script type).
   - **Convex URL**: Sign up at [Convex.dev](https://convex.dev) and create a project.
   - **TMDB API Key**: Get an API key from [The Movie Database](https://www.themoviedb.org/).

   To generate a Reddit Refresh Token, run:
   ```bash
   node scripts/get_token.js
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   The addon will be available at `http://localhost:3000`.

## Deployment

This project is designed to be deployed on **Vercel** with a **Convex** backend.

1. **Deploy to Vercel:**
   Import the project into Vercel and set the environment variables.

2. **Deploy Convex:**
   ```bash
   npx convex deploy
   ```

## License

This project is open source and available under the [MIT License](LICENSE).
