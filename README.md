# 📺 TV Show Guide

> A modern TypeScript-powered web application for tracking and managing television shows across streaming platforms.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/Node.js-%3E%3D18.0.0-green.svg)](https://nodejs.org/)

## 🚀 Features

- **📊 Comprehensive Show Tracking** - Track 32+ popular TV shows across ABC, NBC, CBS, FOX
- **🎯 Smart Scheduling** - Weekly episode calendars with automatic date calculations
- **📱 Mobile Responsive** - Optimized for desktop, tablet, and mobile viewing
- **🔍 Advanced Search** - Fuzzy search with relevance scoring across titles, networks, and platforms
- **🏷️ Platform Integration** - Support for Hulu, Peacock, and Paramount+ streaming services
- **📅 Season Management** - Track season numbers, premiere dates, episode counts, and cancellation status
- **💾 Data Persistence** - Local storage with import/export capabilities
- **♿ Accessibility** - WCAG compliant with screen reader support
- **⚡ Performance Optimized** - Fast rendering with efficient data structures
- **🛡️ Type Safe** - Full TypeScript implementation with comprehensive error handling

## 🖥️ Screenshots

### All Shows View

Display all tracked shows with season information, streaming platforms, and returning status.

### Weekly Schedule View

Interactive calendar showing which shows air on which days, with episode tracking.

## 🎯 Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/dreamstarter/tv-show-guide.git
   cd tv-show-guide
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

4. **Open in browser**

   Navigate to `http://localhost:3000`

### Development Workflow

```bash
# 🔧 Development Commands
npm run dev          # Start TypeScript compiler in watch mode
npm run build        # Compile TypeScript to JavaScript
npm run serve        # Start local development server
npm run start        # Alias for serve

# 🧹 Code Quality
npm run type-check   # Type checking without emitting files
npm run lint         # ESLint code analysis
npm run format       # Prettier code formatting

# 🧽 Maintenance
npm run build:clean  # Clean build directory and rebuild
```

## 🏗️ Architecture

### Technology Stack

- **Frontend**: HTML5, CSS3, TypeScript
- **Build System**: TypeScript Compiler, custom build scripts
- **Development Tools**: ESLint, Prettier, http-server
- **Type System**: Comprehensive TypeScript definitions
- **Error Handling**: Custom error classes with validation

### Project Structure

```text
tv-show-guide/
├── src/                          # TypeScript source code
│   ├── types/                    # Type definitions
│   │   └── index.ts             # Core types and interfaces
│   ├── script.ts                # Main application logic
│   └── validation.ts            # Data validation and error handling
├── dist/                        # Compiled JavaScript output
├── docs/                        # Documentation
│   ├── TYPESCRIPT_GUIDE.md     # TypeScript development guide
│   ├── ERROR_HANDLING_GUIDE.md # Error handling documentation
│   └── IMPROVEMENTS.md         # Project roadmap and improvements
├── index.html                   # Main HTML file
├── styles.css                   # Application styles
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── .eslintrc.json              # ESLint configuration
└── .prettierrc.json            # Prettier configuration
```

### Key Components

- **Show Database**: 32 pre-configured TV shows with complete metadata
- **Search Engine**: Fuzzy search with relevance scoring algorithm
- **Date Calculator**: Automatic episode date calculation based on premiere dates
- **Filter System**: Multi-criteria filtering by platform, status, and network
- **Validation Layer**: Comprehensive data validation with custom error types
- **Type System**: 200+ lines of TypeScript definitions for type safety

## 📖 Usage Guide

### Basic Navigation

1. **All Shows View**: Browse complete list of tracked shows
2. **Weekly View**: See what's airing each day of the week
3. **Search**: Use the search bar to find specific shows
4. **Filters**: Toggle platforms and show returning/cancelled series

### Managing Show Data

1. **Editing**: Click the editor tab to modify show information
2. **Import/Export**: Use JSON import/export for data backup and sharing
3. **Season Updates**: Update premiere dates, episode counts, and air days

### Advanced Features

- **Episode Estimation**: Automatically estimate episode counts based on network patterns
- **Date Calculation**: Automatic end date calculation from start date and episode count
- **Search Highlighting**: Visual highlighting of search terms in results
- **Responsive Tables**: Mobile-optimized table views with horizontal scrolling

## 🔧 Configuration

### TypeScript Configuration

The project uses strict TypeScript settings for maximum type safety:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Development Environment

- **ES2020** target for modern JavaScript features
- **Strict mode** TypeScript for enhanced type checking
- **ESLint** with TypeScript-specific rules
- **Prettier** for consistent code formatting

## 🧪 Testing

The application includes comprehensive validation and error handling:

- **Type Safety**: Full TypeScript coverage with strict checking
- **Data Validation**: Custom validation classes for show data
- **Error Handling**: Graceful error recovery with user notifications
- **Browser Testing**: Cross-browser compatibility testing

### Manual Testing

```bash
# Start development server
npm run serve

# Test different views and functionality
# - All Shows view rendering
# - Weekly calendar functionality  
# - Search and filtering
# - Data import/export
# - Responsive design on different screen sizes
```

## 🤝 Contributing

### Contributing Workflow

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/tv-show-guide.git
   cd tv-show-guide
   npm install
   ```

2. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make Changes**
   - Follow TypeScript best practices
   - Run `npm run lint` and `npm run format`
   - Test changes with `npm run serve`

4. **Commit and Push**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**

### Code Standards

- **TypeScript**: Use strict typing, avoid `any`
- **ESLint**: Follow configured linting rules
- **Prettier**: Format code before committing
- **Comments**: Document complex logic and type definitions
- **Error Handling**: Use custom error classes for validation

### Adding New Shows

1. Update the `shows` database in `src/script.ts`
2. Add season data to `preloadSeasonData` if available
3. Test search and filtering functionality
4. Update documentation if needed

## 📚 Documentation

- **[TypeScript Guide](TYPESCRIPT_GUIDE.md)** - Complete development environment setup
- **[Error Handling Guide](ERROR_HANDLING_GUIDE.md)** - Validation and error management
- **[Improvements](IMPROVEMENTS.md)** - Project roadmap and enhancement plans

## 🗺️ Roadmap

### Phase 1: Foundation ✅ Complete

- [x] Mobile responsive layout improvements
- [x] Accessibility enhancements  
- [x] Error handling and validation
- [x] Performance optimizations
- [x] TypeScript setup

### Phase 2: Architecture (Planned)

- [ ] Component-based architecture
- [ ] State management improvements
- [ ] API integration capabilities
- [ ] Advanced filtering options
- [ ] User preferences system

### Phase 3: Enhancement (Future)

- [ ] Real-time data synchronization
- [ ] Social features and sharing
- [ ] Advanced analytics
- [ ] Mobile app development
- [ ] Cloud data storage

## 🏷️ Versioning

We use [Semantic Versioning](http://semver.org/) for version management. For available versions, see the [tags on this repository](https://github.com/dreamstarter/tv-show-guide/tags).

**Current Version**: 1.0.0

- Complete TypeScript implementation
- Full feature set with search, filtering, and data management
- Mobile responsive design
- Comprehensive error handling

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

### Getting Help

- **Documentation**: Check the guides in the `docs/` directory
- **Issues**: [Create an issue](https://github.com/dreamstarter/tv-show-guide/issues) for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and community support

### Common Issues

1. **TypeScript Compilation Errors**: Run `npm run type-check` for detailed error information
2. **Build Issues**: Try `npm run build:clean` to rebuild from scratch
3. **Development Server**: Ensure port 3000 is available or modify the serve script

---

### About This Project

Built with ❤️ using TypeScript and modern web technologies

Last Updated: November 2025
