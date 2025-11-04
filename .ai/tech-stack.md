Frontend - Astro z React dla komponentów interaktywnych:

- Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
- React 19 zapewni interaktywność tam, gdzie jest potrzebna
- TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
- Tailwind 4 pozwala na wygodne stylowanie aplikacji
- Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

Backend - Supabase jako kompleksowe rozwiązanie backendowe:

- Zapewnia bazę danych PostgreSQL
- Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
- Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
- Posiada wbudowaną autentykację użytkowników

AI - Komunikacja z modelami przez usługę Openrouter.ai:

- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

Testowanie - Kompleksowy stack do testowania jednostkowego, integracyjnego i E2E:

- Vitest jako główny framework do testów jednostkowych i integracyjnych
  - Natywne wsparcie dla ESM (ECMAScript Modules)
  - Kompatybilność z ekosystemem Vite, używanym przez Astro
  - Wbudowane wsparcie dla TypeScript
  - Szybkie wykonywanie testów
- React Testing Library do testowania komponentów React
  - Podejście skoncentrowane na użytkowniku (user-centric testing)
  - Testowanie komponentów i customowych hooków
  - Integracja z Vitest
- Cypress lub Playwright do testów End-to-End
  - Automatyzacja przeglądarki do symulacji pełnych scenariuszy użytkownika
  - Niezawodne i szybkie wykonywanie testów E2E
  - Możliwość testowania na różnych przeglądarkach
- Supertest do testowania endpointów API
  - Integracja z Vitest
  - Walidacja odpowiedzi HTTP
  - Testowanie logiki biznesowej w endpointach

CI/CD i Hosting:

- Github Actions do tworzenia pipeline'ów CI/CD
  - Automatyczne uruchamianie testów jednostkowych i integracyjnych przy każdym pushu
  - Testy E2E przed wdrożeniem na produkcję
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker
