# Testing Guide

## Struktura testów

```
./src
├── test/
│   ├── setup.ts           # Konfiguracja globalna dla Vitest
│   └── README.md          # Ten plik
├── **/*.test.ts           # Testy jednostkowe TypeScript
├── **/*.test.tsx          # Testy jednostkowe React
└── **/*.spec.ts           # Testy integracyjne

./e2e
├── fixtures/
│   └── base.ts            # Bazowe fixtures dla Playwright
├── pages/
│   └── HomePage.ts        # Page Object Models
└── *.spec.ts              # Testy E2E
```

## Testy jednostkowe (Vitest)

### Uruchamianie testów

```bash
# Tryb watch (automatyczne uruchamianie przy zmianach)
npm run test

# Jednorazowe uruchomienie
npm run test:run

# UI mode (wizualna inspekcja testów)
npm run test:ui

# Z pokryciem kodu
npm run test:coverage
```

### Pisanie testów

```typescript
import { describe, it, expect, vi } from "vitest";

describe("Feature name", () => {
  it("should do something", () => {
    expect(true).toBe(true);
  });
});
```

### Testowanie komponentów React

```typescript
import { render, screen } from '@testing-library/react'
import { userEvent } from '@testing-library/user-event'

it('should render and handle clicks', async () => {
  const user = userEvent.setup()
  render(<Button>Click me</Button>)

  const button = screen.getByRole('button', { name: /click me/i })
  await user.click(button)
})
```

### Mockowanie

```typescript
import { vi } from "vitest";

// Mock funkcji
const mockFn = vi.fn();

// Spy na istniejącej funkcji
const spy = vi.spyOn(object, "method");

// Mock modułu
vi.mock("./module", () => ({
  default: vi.fn(),
}));
```

## Testy E2E (Playwright)

### Uruchamianie testów

```bash
# Uruchom wszystkie testy E2E
npm run test:e2e

# UI mode (wizualna inspekcja)
npm run test:e2e:ui

# Debug mode (krok po kroku)
npm run test:e2e:debug

# Codegen (generowanie testów)
npm run test:e2e:codegen
```

### Pisanie testów z Page Object Model

```typescript
import { test, expect } from "./fixtures/base";
import { HomePage } from "./pages/HomePage";

test("should navigate", async ({ page }) => {
  const homePage = new HomePage(page);
  await homePage.goto();
  await expect(homePage.heading).toBeVisible();
});
```

### Best practices

1. **Używaj selektorów zorientowanych na użytkownika**
   - `getByRole()` - preferowany
   - `getByLabel()` - dla formularzy
   - `getByText()` - dla treści
   - Unikaj selektorów CSS/XPath

2. **Implementuj Page Object Model**
   - Enkapsulacja logiki strony
   - Łatwiejsze utrzymanie
   - Reużywalność

3. **Używaj asercji Playwright**
   - `await expect(locator).toBeVisible()`
   - `await expect(page).toHaveTitle()`
   - `await expect(locator).toHaveText()`

4. **Izolacja testów**
   - Każdy test powinien być niezależny
   - Używaj `test.beforeEach()` do setupu
   - Używaj browser contexts do izolacji

## Debugging

### Vitest

```bash
# UI mode z interaktywnym debuggerem
npm run test:ui

# Debug konkretnego testu
npm run test -- -t "test name"
```

### Playwright

```bash
# Debug mode z krokiem po kroku
npm run test:e2e:debug

# Trace viewer (po uruchomieniu testów)
npx playwright show-trace trace.zip
```

## CI/CD Integration

Testy są uruchamiane automatycznie w pipeline CI/CD:

- Testy jednostkowe: przy każdym pushu
- Testy E2E: przed wdrożeniem na produkcję

## Pokrycie kodu

Minimalne wymagane pokrycie:

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

Uruchom `npm run test:coverage` aby sprawdzić aktualne pokrycie.
