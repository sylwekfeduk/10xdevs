### Kompleksowy Plan Testów dla Aplikacji "HealthyMeal"

---

**Wersja dokumentu:** 1.0

**Data:** 4 listopada 2025

**Autor:** Gemini - Inżynier QA

---

### 1. Wprowadzenie i Cele Testowania

#### 1.1. Wprowadzenie

Niniejszy dokument przedstawia kompleksowy plan testów dla aplikacji internetowej "HealthyMeal". Aplikacja ta jest narzędziem do zarządzania przepisami kulinarnymi, umożliwiającym użytkownikom tworzenie, przechowywanie i modyfikowanie przepisów z wykorzystaniem sztucznej inteligencji (AI) w celu dostosowania ich do indywidualnych preferencji dietetycznych, alergii i nielubianych składników.

Projekt oparty jest na nowoczesnym stosie technologicznym, w skład którego wchodzą Astro, React, TypeScript, Supabase jako backend (BaaS), Tailwind CSS do stylizacji oraz zewnętrzna usługa OpenRouter do obsługi modyfikacji AI.

#### 1.2. Cele Testowania

Głównym celem procesu testowania jest zapewnienie wysokiej jakości, niezawodności, bezpieczeństwa i użyteczności aplikacji "HealthyMeal" przed jej wdrożeniem produkcyjnym.

**Szczegółowe cele:**

- **Weryfikacja funkcjonalna:** Upewnienie się, że wszystkie funkcje aplikacji działają zgodnie z założeniami, w tym zarządzanie kontem użytkownika, operacje CRUD na przepisach oraz kluczowa funkcjonalność modyfikacji AI.
- **Zapewnienie bezpieczeństwa:** Weryfikacja, że dane użytkowników, w szczególności ich przepisy i preferencje dietetyczne, są odpowiednio chronione i dostępne tylko dla autoryzowanych osób.
- **Ocena niezawodności:** Sprawdzenie stabilności aplikacji, w tym jej odporności na błędy, poprawnego zarządzania stanem oraz obsługi błędów pochodzących z usług zewnętrznych (np. API OpenRouter).
- **Zapewnienie jakości UI/UX:** Weryfikacja, że interfejs użytkownika jest intuicyjny, responsywny i spójny wizualnie na różnych urządzeniach i w popularnych przeglądarkach.
- **Identyfikacja i raportowanie defektów:** Systematyczne wykrywanie, dokumentowanie i śledzenie błędów w celu ich sprawnej eliminacji przez zespół deweloperski.

---

### 2. Zakres Testów

#### 2.1. Funkcjonalności objęte testami (In-Scope)

- **Moduł uwierzytelniania i autoryzacji:**
  - Rejestracja nowego użytkownika.
  - Logowanie i wylogowywanie.
  - Proces odzyskiwania i aktualizacji hasła.
  - Ochrona tras i endpointów API przed nieautoryzowanym dostępem (middleware).
- **Onboarding użytkownika:**
  - Proces wprowadzania preferencji dietetycznych, alergii i nielubianych składników po pierwszej rejestracji.
- **Zarządzanie profilem użytkownika:**
  - Wyświetlanie i edycja danych profilowych (imię, awatar, preferencje).
- **Zarządzanie przepisami (CRUD):**
  - Tworzenie nowego przepisu.
  - Wyświetlanie listy przepisów z paginacją, sortowaniem i filtrowaniem.
  - Wyświetlanie szczegółów pojedynczego przepisu.
  - Usuwanie przepisu.
- **Modyfikacja przepisu z wykorzystaniem AI:**
  - Inicjowanie procesu modyfikacji.
  - Obsługa stanów ładowania i błędów (np. niedostępność usługi AI).
  - Wyświetlanie porównania "przed" i "po" modyfikacji.
  - Wyświetlanie podsumowania zmian i ostrzeżeń dotyczących AI.
  - Zapisywanie zmodyfikowanego przepisu jako nowej wersji.
  - Odrzucanie zmian.
- **API Backendu (Endpointy):**
  - Wszystkie endpointy w `src/pages/api/` zostaną przetestowane pod kątem logiki biznesowej, walidacji danych wejściowych i obsługi błędów.

#### 2.2. Funkcjonalności wyłączone z testów (Out-of-Scope)

- Wewnętrzna logika i wydajność usług zewnętrznych (Supabase, OpenRouter AI). Testowane będą jedynie interfejsy i kontrakty z tymi usługami.
- Szczegółowe testy wydajnościowe i obciążeniowe (wykraczające poza podstawową weryfikację czasów odpowiedzi).
- Infrastruktura hostingowa i bazodanowa Supabase.
- Testy A/B interfejsu użytkownika.

---

### 3. Typy Testów

W projekcie zostaną przeprowadzone następujące typy testów w celu zapewnienia kompleksowego pokrycia:

- **Testy jednostkowe (Unit Tests):** Skupione na weryfikacji małych, izolowanych fragmentów kodu, takich jak funkcje pomocnicze (`utils.ts`), logika w customowych hookach React (`src/components/hooks/`) oraz funkcje serwisowe (`src/lib/services/`).
- **Testy integracyjne (Integration Tests):** Weryfikacja współpracy pomiędzy różnymi modułami. Obejmuje to testowanie:
  - Komponentów React wraz z ich hookami (np. formularz i jego logika zapisu).
  - Endpointów API w celu sprawdzenia, czy poprawnie komunikują się z warstwą serwisową i bazą danych.
- **Testy End-to-End (E2E):** Symulacja pełnych scenariuszy użytkownika w przeglądarce, od logowania po modyfikację przepisu. Celem jest weryfikacja przepływu danych i interakcji w całej aplikacji.
- **Testy komponentów UI (Component Tests):** Testowanie poszczególnych komponentów UI w izolacji w celu weryfikacji ich wyglądu i zachowania w różnych stanach.
- **Testy bezpieczeństwa (Security Tests):** Manualne i automatyczne testy mające na celu weryfikację mechanizmów autoryzacji – np. próby dostępu do danych innego użytkownika przez modyfikację zapytań API.
- **Testy kompatybilności (Compatibility Tests):** Manualna weryfikacja poprawnego działania i wyświetlania aplikacji w najnowszych wersjach popularnych przeglądarek internetowych.
- **Testy manualne i eksploracyjne (Manual & Exploratory Tests):** Ręczne testowanie aplikacji w celu odkrycia nieoczywistych błędów i oceny ogólnej użyteczności (UX).

---

### 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

#### 4.1. Uwierzytelnianie i Onboarding

- **TC1.1:** Użytkownik może pomyślnie zarejestrować się przy użyciu prawidłowego adresu e-mail i hasła, po czym jest przekierowywany na stronę onboardingu.
- **TC1.2:** System uniemożliwia rejestrację z nieprawidłowym adresem e-mail lub zbyt krótkim hasłem.
- **TC1.3:** Użytkownik może zalogować się przy użyciu poprawnych danych i jest przekierowywany do panelu głównego.
- **TC1.4:** Użytkownik nie może zalogować się przy użyciu nieprawidłowych danych.
- **TC1.5:** Użytkownik po wylogowaniu traci dostęp do chronionych zasobów.
- **TC1.6:** Użytkownik może zresetować hasło, otrzymując link na e-mail.
- **TC1.7:** Na stronie onboardingu użytkownik musi wybrać co najmniej jedną preferencję, aby kontynuować.
- **TC1.8:** Po zakończeniu onboardingu, preferencje są zapisywane w profilu, a użytkownik jest przekierowywany do panelu głównego.

#### 4.2. Zarządzanie Przepisami (CRUD)

- **TC2.1:** Zalogowany użytkownik może utworzyć nowy przepis, wypełniając wszystkie wymagane pola.
- **TC2.2:** System waliduje dane w formularzu nowego przepisu, uniemożliwiając zapis z pustymi polami.
- **TC2.3:** Użytkownik widzi listę swoich przepisów.
- **TC2.4:** Funkcje sortowania ("po tytule", "po dacie") i paginacji na liście przepisów działają poprawnie.
- **TC2.5:** Użytkownik może otworzyć stronę szczegółów przepisu, klikając na jego kartę.
- **TC2.6:** Użytkownik może trwale usunąć swój przepis po potwierdzeniu w oknie modalnym.

#### 4.3. Modyfikacja Przepisu z AI

- **TC3.1 (Happy Path):** Użytkownik klika "Modyfikuj z AI", widzi stan ładowania, a następnie ekran porównania z oryginalnym i zmodyfikowanym przepisem oraz listą zmian.
- **TC3.2:** Na stronie modyfikacji zawsze widoczne jest ostrzeżenie o treściach generowanych przez AI.
- **TC3.3:** Użytkownik może zapisać zmodyfikowany przepis, co tworzy nowy wpis na liście przepisów oznaczony jako "AI-Modified".
- **TC3.4:** Oryginalny przepis pozostaje niezmieniony po zapisaniu wersji zmodyfikowanej przez AI.
- **TC3.5:** Użytkownik może odrzucić zmiany, co powoduje powrót do strony szczegółów oryginalnego przepisu bez zapisywania modyfikacji.
- **TC3.6 (Error Handling):** Gdy usługa AI jest niedostępna (symulowany błąd 503), użytkownik widzi odpowiedni komunikat o błędzie z opcją ponowienia próby.
- **TC3.7 (Not Found):** Próba modyfikacji nieistniejącego przepisu (np. przez bezpośredni URL) skutkuje wyświetleniem strony błędu.

---

### 5. Środowisko Testowe

- **Infrastruktura:** Osobny projekt Supabase dedykowany do celów testowych (staging/testing), z wyizolowaną bazą danych. Pozwoli to na przeprowadzanie testów bez wpływu na dane deweloperskie i produkcyjne.
- **Dane testowe:** Przygotowany zestaw danych (seed data) zawierający użytkowników z różnymi preferencjami dietetycznymi oraz przykładowe przepisy.
- **Zmienne środowiskowe:** Dedykowany plik `.env.test` z kluczami API i URL do testowego projektu Supabase.
- **Przeglądarki:**
  - Google Chrome (najnowsza wersja)
  - Mozilla Firefox (najnowsza wersja)
  - Apple Safari (najnowsza wersja)

---

### 6. Narzędzia do Testowania

- **Framework do testów jednostkowych i integracyjnych:** **Vitest** – ze względu na szybkość i kompatybilność z ekosystemem Vite, używanym przez Astro.
- **Biblioteka do testowania komponentów:** **React Testing Library** – do testowania komponentów React i customowych hooków w sposób symulujący interakcję użytkownika.
- **Framework do testów E2E:** **Playwright** – do automatyzacji scenariuszy użytkownika w przeglądarce (konfiguracja z Chromium). Zapewnia niezawodne i szybkie testy E2E.
- **Testowanie API:** **Supertest** (w połączeniu z Vitest) do testowania endpointów API lub **Postman/Bruno** do testów manualnych.
- **Zarządzanie jakością kodu:** **ESLint** i **Prettier** (już zintegrowane) do utrzymania spójności i jakości kodu.
- **CI/CD:** **GitHub Actions** do automatycznego uruchamiania testów jednostkowych i integracyjnych przy każdym pushu do repozytorium oraz testów E2E przed wdrożeniem na produkcję.

#### 6.1. Konfiguracja środowiska testowego

**Zainstalowane pakiety:**

- `vitest` - Framework do testów jednostkowych i integracyjnych
- `@vitest/ui` - Wizualna inspekcja testów
- `jsdom` - Symulacja DOM dla testów
- `@testing-library/react` - Testowanie komponentów React
- `@testing-library/jest-dom` - Dodatkowe matchery dla testów DOM
- `@testing-library/user-event` - Symulacja interakcji użytkownika
- `@playwright/test` - Framework do testów E2E
- `playwright` - Automatyzacja przeglądarki

**Pliki konfiguracyjne:**

- `vitest.config.ts` - Konfiguracja Vitest z setupem jsdom, aliasami i pokryciem kodu
- `playwright.config.ts` - Konfiguracja Playwright z Chromium, trace viewer i screenshot
- `src/test/setup.ts` - Globalna konfiguracja testów (cleanup, mocks)

**Struktura katalogów:**

```
./src/test/              # Setup i dokumentacja testów jednostkowych
./e2e/                   # Testy E2E
  ├── fixtures/          # Bazowe fixtures dla Playwright
  └── pages/             # Page Object Models
```

**Dostępne skrypty:**

```bash
npm run test              # Testy jednostkowe w trybie watch
npm run test:ui           # UI mode dla testów jednostkowych
npm run test:run          # Jednorazowe uruchomienie testów
npm run test:coverage     # Testy z pokryciem kodu
npm run test:e2e          # Testy E2E
npm run test:e2e:ui       # UI mode dla testów E2E
npm run test:e2e:debug    # Debug mode dla testów E2E
npm run test:e2e:codegen  # Generator testów Playwright
```

---

### 7. Harmonogram Testów

Testowanie będzie procesem ciągłym, zintegrowanym z cyklem rozwoju oprogramowania (CI/CD).

- **Sprint (rozwój):** Deweloperzy piszą testy jednostkowe i integracyjne równolegle z implementacją nowych funkcji. Testy te są uruchamiane automatycznie w pipeline CI.
- **Koniec sprintu/przed wdrożeniem:** Inżynier QA przeprowadza testy E2E dla kluczowych ścieżek, testy regresji oraz testy eksploracyjne na środowisku stagingowym.
- **Po wdrożeniu:** Wykonywany jest "smoke test" na środowisku produkcyjnym, aby upewnić się, że krytyczne funkcjonalności działają poprawnie.

---

### 8. Kryteria Akceptacji Testów

#### 8.1. Kryteria wejścia (rozpoczęcia testów)

- Funkcjonalność została zaimplementowana i wdrożona na środowisku testowym.
- Testy jednostkowe i integracyjne dla danej funkcjonalności przechodzą pomyślnie.
- Dostępna jest dokumentacja techniczna lub opis wymagań dla testowanej funkcji.

#### 8.2. Kryteria wyjścia (zakończenia testów)

- Wszystkie zdefiniowane scenariusze testowe (jednostkowe, integracyjne, E2E) dla danego wydania przechodzą pomyślnie.
- Pokrycie kodu testami jednostkowymi dla krytycznej logiki biznesowej (warstwa serwisowa) wynosi co najmniej 85%.
- Brak nierozwiązanych błędów o priorytecie krytycznym (Blocker) lub wysokim (Critical).
- Wszystkie zgłoszone błędy zostały przeanalizowane i odpowiednio sklasyfikowane.

---

### 9. Role i Odpowiedzialności

- **Deweloperzy:**
  - Implementacja i utrzymanie testów jednostkowych i integracyjnych.
  - Naprawa błędów zgłoszonych przez zespół QA.
  - Uczestnictwo w przeglądach kodu pod kątem testowalności.
- **Inżynier QA:**
  - Tworzenie, utrzymanie i egzekucja planu testów.
  - Projektowanie i implementacja testów E2E.
  - Przeprowadzanie testów manualnych i eksploracyjnych.
  - Zarządzanie procesem raportowania i śledzenia błędów.
  - Raportowanie stanu jakości oprogramowania.
- **Product Owner / Manager:**
  - Dostarczanie kryteriów akceptacyjnych dla nowych funkcjonalności.
  - Priorytetyzacja naprawy błędów.
  - Ostateczna akceptacja funkcjonalności po zakończeniu testów.

---

### 10. Procedury Raportowania Błędów

- **Narzędzie:** Wszystkie błędy będą raportowane i śledzone w systemie **GitHub Issues**.
- **Struktura raportu o błędzie:** Każdy zgłoszony błąd musi zawierać:
  - **Tytuł:** Krótki, zwięzły opis problemu.
  - **Środowisko:** Wersja aplikacji, przeglądarka, system operacyjny.
  - **Kroki do odtworzenia:** Numerowana lista kroków prowadzących do wystąpienia błędu.
  - **Oczekiwany rezultat:** Co powinno się wydarzyć.
  - **Rzeczywisty rezultat:** Co faktycznie się wydarzyło.
  - **Dowody:** Zrzuty ekranu, nagrania wideo, logi z konsoli.
  - **Priorytet/Waga:** Określenie wpływu błędu na działanie aplikacji.

- **Poziomy priorytetów:**
  - **Blocker:** Błąd uniemożliwiający dalsze testowanie lub korzystanie z kluczowej funkcjonalności.
  - **Critical:** Błąd powodujący awarię systemu, utratę danych lub naruszenie bezpieczeństwa.
  - **Major:** Błąd w kluczowej funkcjonalności, który ma znaczący wpływ na UX, ale istnieje obejście.
  - **Minor:** Błąd o niewielkim wpływie, np. literówka, drobny problem z UI.
  - **Trivial:** Błąd kosmetyczny lub sugestia usprawnienia.
