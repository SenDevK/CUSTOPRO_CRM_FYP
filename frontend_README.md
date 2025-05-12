# CUSTOPRO Frontend

This repository contains the frontend application for Lanka Smart CRM Hub (CUSTOPRO), a comprehensive CRM solution designed for Sri Lankan retail businesses.

## Technology Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS
- **State Management**: React Query for server state
- **Routing**: React Router
- **Data Visualization**: Recharts
- **Form Handling**: React Hook Form with Zod validation
- **Internationalization**: i18next with support for English and Sinhala

## Features

- **Customer Management**: View, search, and manage customer profiles
- **Data Import**: Import customer data from CSV/Excel files with column mapping
- **Segmentation**: View RFM and demographic segmentation with interactive visualizations
- **Custom Segments**: Create and manage custom segments with rule-based criteria
- **Marketing Campaigns**: Create and manage SMS and email marketing campaigns
- **Analytics**: Interactive dashboards for customer and revenue analytics
- **Multilingual Support**: Toggle between English and Sinhala interfaces
- **Dark/Light Mode**: Theme customization for user preference

## Getting Started

### Prerequisites

- Node.js 16.0 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/YOUR_USERNAME/REPO_NAME.git
   cd REPO_NAME
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:8082`

### Backend Configuration

The frontend is configured to connect to the following backend services:

- Data Ingestion API: `http://localhost:5000`
- Segmentation API: `http://localhost:8000`
- Segment Storing API: `http://localhost:5003`
- Marketing API: `http://localhost:5002`
- Revenue Models API: `http://localhost:5001`

These proxy settings are configured in `vite.config.ts`.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── ui/           # Base UI components from shadcn/ui
│   ├── layout/       # Layout components (Header, Sidebar, etc.)
│   ├── customers/    # Customer-related components
│   ├── segmentation/ # Segmentation-related components
│   └── marketing/    # Marketing-related components
├── pages/            # Page components for each route
├── hooks/            # Custom React hooks
├── lib/              # Utility functions and helpers
├── data/             # Data fetching and API functions
├── types/            # TypeScript type definitions
├── styles/           # Global styles and Tailwind configuration
├── i18n/             # Internationalization setup
├── App.tsx           # Main application component
└── main.tsx          # Application entry point
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint to check for code issues

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Related Repositories

- [CUSTOPRO Backend](https://github.com/YOUR_USERNAME/CUSTOPRO_Backend) - Backend microservices for the CUSTOPRO system
