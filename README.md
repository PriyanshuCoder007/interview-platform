# Interview Platform (Next.js)

## Overview
This is a Next.js-based Interview Platform designed to facilitate online interviews. It includes features like real-time collaboration, user authentication, and a responsive UI for seamless interaction between interviewers and candidates.

## Features
- **Real-time Collaboration**: Supports live interaction using tools like Convex for backend data sync.
- **User Authentication**: Secure authentication system integrated into the app.
- **Responsive Design**: Built with Tailwind CSS for a mobile-friendly and desktop-optimized experience.
- **TypeScript Support**: Fully typed codebase for better development experience and fewer runtime errors.
- **App Router**: Utilizes Next.js's App Router for modern routing and data fetching.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Backend Sync**: Convex
- **Linting**: ESLint
- **Build Tools**: PostCSS

## Prerequisites
- Node.js (v16 or higher)
- npm or yarn

## Installation
1. **Clone the repository**:
   ```bash
   git clone https://github.com/priyanshu-Maxah/interview-platform.git
   cd interview-platform
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory and add the necessary variables (e.g., for Convex or other services):
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   CONVEX_DEPLOYMENT=your_convex_deployment_id
   NEXT_PUBLIC_CONVEX_URL=your_public_convex_url
   NEXT_PUBLIC_STREAM_API_KEY=your_stream_api_key
   STREAM_SECRET_KEY=your_stream_secret_key
   ```

4. **Run the development server**:
   - **Frontend**: 
     ```bash
     npm run dev
     ```
     The application will be available at `http://localhost:3000`.
   - **Backend**: Start the Convex backend with:
     ```bash
     npx convex dev
     ```

## Usage
1. **Start the app**: Run the development server and backend as described above.
2. **Access the platform**: Open `http://localhost:3000` in your browser.
3. **Register/Login**: Create an account or log in to access the interview features.
4. **Conduct Interviews**: Use the platform to schedule and join interview sessions with real-time collaboration.

## Project Structure
- `src/app/`: Main application routes using Next.js App Router.
- `src/components/`: Reusable React components.
- `src/hooks/`: Custom React hooks.
- `src/lib/`: Utility functions and libraries.
- `src/constant/`: Constant values used across the app.
- `src/action/`: Server actions for handling backend logic.
- `convex/`: Convex backend integration for real-time data syncing.

## Scripts
- `npm run dev`: Start the development server.
- `npm run build`: Build the app for production.
- `npm run start`: Start the production server.
- `npm run lint`: Run ESLint to check for code issues.

## Contributing
We welcome contributions! To contribute:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes and commit (`git commit -m "Add feature"`).
4. Push to the branch (`git push origin feature-branch`).
5. Create a Pull Request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact
For any queries, reach out to [priyanshu.maxah@example.com](mailto:priyanshuchauhan9852@gmail.com).
