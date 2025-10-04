# Mockvue - Document Management UI

A modern, beautiful document management application built with React, TypeScript, and TailwindCSS.

## Tech Stack

- **Frontend & UI:** React + TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Desktop:** Electron
- **Data:** SQLite (to be integrated)
- **Packaging:** electron-builder ✅
- **Testing:** Jest and Playwright (to be integrated)

## Getting Started

### Installation

```bash
npm install
```

### Development

#### Web Development Mode
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

#### Electron Development Mode
```bash
npm run electron:dev
```
This will start both the Vite dev server and Electron app

### Build

#### Build for Web
```bash
npm run build
```

#### Build Electron App
```bash
# Build for current platform
npm run electron:build

# Build for specific platforms
npm run electron:build:mac
npm run electron:build:win
npm run electron:build:linux
```

Built applications will be in the `release` directory.

### Preview Production Build

```bash
npm run preview
```

## Features (UI Only - No Functionality Yet)

- **Electron Desktop App**: Native desktop application for macOS, Windows, and Linux
- **Recently Opened Documents**: Quick access to your most recent files
- **Progress Dashboard**: Visual representation of interview progress with circular chart
- **Calendar Widget**: Today's scheduled events with color-coded priorities
- **Document Grid**: Organized view of all documents with search and filter options
- **Modern Design**: Clean, responsive interface following best UX practices
- **IPC Communication**: Secure communication between main and renderer processes

## Project Structure

```
src/
├── components/
│   ├── DocumentCard.tsx       # Individual document card component
│   ├── RecentlyOpened.tsx     # Recently opened documents section
│   ├── ProgressChart.tsx      # Circular progress chart widget
│   ├── CalendarWidget.tsx     # Calendar events widget
│   └── DocumentGrid.tsx       # Main documents grid with search
├── types.ts                   # TypeScript type definitions
├── electron.d.ts              # Electron API type definitions
├── App.tsx                    # Main application component
├── main.tsx                   # React entry point
└── index.css                  # Global styles with Tailwind

electron/
├── main.ts                    # Electron main process
└── preload.ts                 # Preload script for secure IPC
```

## Design Principles

- **Clean & Modern**: Minimalist design with ample whitespace
- **Responsive**: Works seamlessly across different screen sizes
- **Accessible**: Proper semantic HTML and ARIA labels
- **Performance**: Optimized with Vite for fast development and builds
- **Type-Safe**: Full TypeScript coverage for better DX

## Next Steps

1. Integrate SQLite database for data persistence
2. Add document CRUD functionality
3. Implement search and filter logic
4. Set up Electron for desktop packaging
5. Add Jest and Playwright for testing
6. Implement calendar integration
7. Add user authentication

## License

MIT

