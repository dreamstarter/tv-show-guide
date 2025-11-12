# TypeScript Development Guide

## 🚀 Getting Started

The TV Show Guide application has been enhanced with TypeScript for better type safety and development experience.

### Prerequisites

- Node.js 18+ and npm 9+
- TypeScript knowledge (basic to intermediate)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Verify TypeScript setup:**
   ```bash
   npm run type-check
   ```

## 📁 Project Structure

```
tv-show-guide/
├── src/                          # TypeScript source files
│   ├── types/                    # Type definitions
│   │   └── index.ts             # Core types and interfaces
│   ├── validation.ts            # Validation and error handling
│   └── script.ts               # Main application logic (when converted)
├── dist/                        # Compiled JavaScript output
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies and scripts
├── .eslintrc.json             # ESLint configuration
├── .prettierrc.json           # Prettier configuration
└── build.mjs                  # Custom build script
```

## 🛠️ Development Workflow

### Available Scripts

```bash
# Development with watch mode
npm run dev                     # Compile TS in watch mode

# Building
npm run build                   # Compile TypeScript
npm run build:clean            # Clean and rebuild

# Code Quality
npm run type-check             # Type checking only
npm run lint                   # ESLint validation
npm run format                 # Prettier formatting

# Testing
npm run serve                  # Local development server
npm start                      # Alias for serve
```

### Development Process

1. **Start development mode:**
   ```bash
   npm run dev
   ```
   This will watch for TypeScript changes and recompile automatically.

2. **Make changes to `.ts` files in the `src/` directory**

3. **Build for testing:**
   ```bash
   npm run build
   npm run serve
   ```

4. **Code quality checks:**
   ```bash
   npm run lint
   npm run format
   npm run type-check
   ```

## 📝 TypeScript Features

### Type Safety

All major data structures are strongly typed:

```typescript
import { Show, Platform, Network, FilterState } from './types/index.js';

const show: Show = {
  id: "123",
  title: "Example Show",
  c: "hulu",        // Platform type enforced
  n: "NBC",         // Network type enforced
  air: "Friday",    // DayOfWeek type enforced
  returning: true
};
```

### Error Handling

Enhanced error handling with custom error types:

```typescript
import { ShowValidationError, ErrorHandler } from './validation.js';

try {
  // Some operation
} catch (error) {
  if (error instanceof ShowValidationError) {
    console.error(`Validation failed for ${error.field}: ${error.message}`);
  }
}
```

### Validation System

Comprehensive validation with type safety:

```typescript
import { validators } from './validation.js';

const result = validators.validateShow(showData);
if (!result.isValid) {
  result.errors.forEach(error => {
    console.error(`${error.field}: ${error.message}`);
  });
}
```

## 🔧 Configuration

### TypeScript Configuration (`tsconfig.json`)

Key settings:
- **Target**: ES2020 for modern browser support
- **Strict mode**: Enabled for maximum type safety
- **Source maps**: Generated for debugging
- **Declaration files**: Generated for library usage

### ESLint Configuration

- TypeScript-specific rules enabled
- Strict type checking
- Unused variable detection
- Consistent coding standards

### Prettier Configuration

- Consistent code formatting
- Single quotes
- No trailing commas
- 100 character line width

## 🚨 Common Issues & Solutions

### Import Errors

**Problem**: Module resolution errors
```typescript
// ❌ Wrong
import { Show } from '../types';

// ✅ Correct
import { Show } from './types/index.js';
```

**Solution**: Always use `.js` extension for imports (TypeScript resolves to `.ts`)

### Type Errors

**Problem**: `Property 'x' does not exist on type 'y'`

**Solution**: Check type definitions in `src/types/index.ts` and ensure correct typing

### Build Errors

**Problem**: Compilation fails with type errors

**Solution**:
1. Run `npm run type-check` to see all type errors
2. Fix errors one by one
3. Use `// @ts-ignore` sparingly for complex cases

## 📊 Type Coverage

Current TypeScript coverage:
- ✅ **Type definitions**: 100% complete
- ✅ **Validation system**: Fully typed
- 🔄 **Main application**: In progress
- ⏳ **Event handling**: Planned

## 🎯 Best Practices

### 1. Type Definitions

```typescript
// ✅ Good: Specific types
interface FilterOptions {
  platforms: Platform[];
  showNonReturning: boolean;
}

// ❌ Avoid: Any types
interface FilterOptions {
  platforms: any[];
  showNonReturning: any;
}
```

### 2. Error Handling

```typescript
// ✅ Good: Specific error types
catch (error) {
  if (error instanceof ShowValidationError) {
    // Handle validation errors
  } else if (error instanceof ShowOperationError) {
    // Handle operation errors
  }
}

// ❌ Avoid: Generic error handling
catch (error) {
  console.error(error);
}
```

### 3. Type Guards

```typescript
// ✅ Good: Type guards for runtime checking
function isShow(obj: unknown): obj is Show {
  return typeof obj === 'object' && 
         obj !== null && 
         'title' in obj;
}

// Usage
if (isShow(data)) {
  // TypeScript knows data is Show type here
  console.log(data.title);
}
```

### 4. Utility Types

```typescript
// ✅ Good: Use utility types
type PartialShow = Partial<Show>;
type RequiredShow = Required<Show>;
type ShowTitle = Pick<Show, 'title'>;
```

## 🔄 Migration Progress

### Phase 1: Foundation ✅
- [x] TypeScript configuration
- [x] Type definitions
- [x] Validation system conversion
- [x] Build tooling setup

### Phase 2: Core Application (In Progress)
- [ ] Main script conversion (`script.js` → `script.ts`)
- [ ] Event handling improvements
- [ ] Data processing enhancements

### Phase 3: Advanced Features (Planned)
- [ ] Module system implementation
- [ ] Component architecture
- [ ] Testing framework integration

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript ESLint Rules](https://typescript-eslint.io/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)

## 🆘 Getting Help

1. **Type Errors**: Check `src/types/index.ts` for available types
2. **Build Issues**: Run `npm run type-check` for detailed errors
3. **Runtime Issues**: Check browser console and error handling logs
4. **Performance**: Use source maps for debugging compiled code

---

*This guide will be updated as the TypeScript migration progresses.*