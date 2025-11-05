# E2E Tests - Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Environment Setup

Create `.env.test` file in the root directory:

```env
SUPABASE_URL=your-test-supabase-url
SUPABASE_KEY=your-test-supabase-anon-key
OPENROUTER_API_KEY=your-openrouter-api-key
```

### Step 2: Install Dependencies (if not already done)

```bash
npm install
```

### Step 3: Run Tests

```bash
# Interactive UI mode (RECOMMENDED for first run)
npm run test:e2e:ui

# Or run all tests in terminal
npm run test:e2e
```

## 📊 What Gets Tested?

### ✅ Authentication (8 tests)
- User registration
- Login/logout
- Password recovery
- Onboarding flow

### ✅ Recipe Management (6 tests)
- Create recipes
- View recipe list
- Sorting & pagination
- Delete recipes

### ✅ AI Features (8 tests)
- AI recipe modification
- Save/discard changes
- Error handling
- Original recipe preservation

**Total: 22 automated test cases**

## 🎯 Test Modes

### UI Mode (Recommended)
```bash
npm run test:e2e:ui
```
- Visual test runner
- Watch tests execute
- Time travel debugging
- Easy to run individual tests

### Headless Mode (CI/CD)
```bash
npm run test:e2e
```
- Runs in background
- Generates HTML report
- Perfect for automation

### Debug Mode
```bash
npm run test:e2e:debug
```
- Step through tests
- Inspect elements
- Set breakpoints

## 📁 Test Files

```
e2e/
├── auth-onboarding.spec.ts        # Registration, login, onboarding
├── recipe-crud.spec.ts            # Create, view, delete recipes
└── recipe-ai-modification.spec.ts # AI features and error handling
```

## 🔍 View Results

After running tests:

```bash
# View HTML report
npx playwright show-report

# View trace (for debugging failures)
npx playwright show-trace trace.zip
```

## 💡 Tips

1. **First Time?** Use UI mode (`npm run test:e2e:ui`)
2. **Test Failing?** Check if dev server is running on port 3000
3. **Need Help?** See full [README.md](./README.md)

## 🛠️ Generate New Tests

Record interactions to generate test code:

```bash
npm run test:e2e:codegen
```

## ⚡ Quick Commands

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run all tests |
| `npm run test:e2e:ui` | Interactive UI mode |
| `npm run test:e2e:debug` | Debug mode |
| `npx playwright test auth-onboarding` | Run specific suite |
| `npx playwright test --headed` | See browser |
| `npx playwright show-report` | View results |

## 🎓 Learn More

- Full documentation: [README.md](./README.md)
- Implementation details: [TEST-IMPLEMENTATION-SUMMARY.md](./TEST-IMPLEMENTATION-SUMMARY.md)
- Test plan: [../.ai/test-plan.md](../.ai/test-plan.md)

---

Happy Testing! 🧪