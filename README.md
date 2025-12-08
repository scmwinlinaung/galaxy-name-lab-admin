# Galaxy Name Lab Admin Dashboard

A modern admin dashboard built with React, TypeScript, Tailwind CSS, and Vite. This project is configured for deployment on Vercel.

## Features

- 🔐 Authentication with login page (connects to your API at `http://18.139.99.95/name-lab/api/auth/login`)
- 📊 Dashboard with statistics cards and charts
- 🎨 Beautiful UI with Tailwind CSS
- 📱 Responsive design
- 🚀 Fast development with Vite
- 📈 Charts using Recharts
- 🎯 Icons using Lucide React

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **Charts**: Recharts
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository or extract the project files
2. Install dependencies:

```bash
npm install
```

### Development

Start the development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### Building for Production

Build the project for production:

```bash
npm run build
```

This will create an optimized production build in the `dist` folder.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

## Deployment

### Vercel

The project is already configured for Vercel deployment with the included `vercel.json` file.

To deploy:

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Vercel will automatically detect the project settings and deploy

### Manual Vercel Deployment

Alternatively, you can use the Vercel CLI:

```bash
npm install -g vercel
vercel
```

## Project Structure

```
src/
├── components/
│   ├── Dashboard.tsx      # Main dashboard component
│   ├── StatsCard.tsx      # Statistics card component
│   └── ChartComponent.tsx # Chart component using Recharts
├── App.tsx                # Main app component with auth logic
├── main.tsx              # App entry point
├── index.css             # Tailwind CSS imports
└── App.css               # Additional styles
```

## Configuration

### API Endpoint

The login API endpoint is configured in `src/App.tsx`:
```typescript
const response = await fetch('http://18.139.99.95/name-lab/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(loginData),
})
```

Update this URL to match your actual API endpoint.

### Tailwind CSS

The Tailwind configuration is in `tailwind.config.js`. You can customize the theme, colors, and extend the configuration as needed.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

This project is open source and available under the [MIT License](LICENSE).