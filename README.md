# Genmap.ai 🗺️

AI-powered location discovery tool that helps you explore fascinating places around the world.

## Features

- 🌍 Discover unique locations worldwide
- 🔍 Smart location filtering by country
- 🎲 Random exploration suggestions
- 🗺️ Interactive map visualization
- ✨ AI-powered location descriptions
- 🏷️ Rarity indicators for each location

## Tech Stack

- Next.js 13 (App Router)
- TypeScript
- Tailwind CSS
- OpenAI API
- Leaflet Maps
- Framer Motion

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/genmap.git
cd genmap
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```
Then edit `.env.local` with your API keys:
- Get an OpenAI API key from [OpenAI Platform](https://platform.openai.com)
- Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com)

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Your Google Maps API key

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push this repository to GitHub
2. Import the repository in Vercel
3. Add the environment variables
4. Deploy!

## License

MIT License - feel free to use this project for any purpose.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
