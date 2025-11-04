# Diagram Autentykacji - HealthyMeal MVP

Ten diagram przedstawia kompletną architekturę autentykacji dla aplikacji HealthyMeal, obejmując wszystkie scenariusze przepływu użytkownika.

## Opis Architektury

### Aktorzy Systemu

1. **Użytkownik** - osoba korzystająca z aplikacji
2. **Przeglądarka** - klient frontendowy (React components w Astro)
3. **Middleware** - warstwa ochrony tras (src/middleware.ts)
4. **Formularze React** - RegisterForm, LoginForm, OnboardingForm
5. **Astro API** - endpointy serwerowe (/api/auth/callback, /api/onboarding/complete)
6. **Supabase Auth** - system autentykacji
7. **Google OAuth** - zewnętrzny dostawca autentykacji
8. **Baza Danych** - tabela profiles z preferencjami użytkownika

### Scenariusze Pokryte przez Diagram

1. **Rejestracja Email + Onboarding** - nowy użytkownik tworzy konto przez email i wypełnia preferencje
2. **Logowanie Google OAuth** - użytkownik loguje się przez Google, system sprawdza czy wymaga onboardingu
3. **Dostęp do Chronionej Strony** - middleware weryfikuje sesję przed dostępem do /dashboard
4. **Resetowanie Hasła** - pełny przepływ odzyskiwania hasła przez email
5. **Wylogowanie** - zakończenie sesji użytkownika

### Kluczowe Mechanizmy Bezpieczeństwa

- **Middleware Protection** - każde żądanie przechodzi przez middleware weryfikujący sesję
- **Row Level Security (RLS)** - użytkownicy mogą modyfikować tylko własny profil
- **HTTP-Only Cookies** - tokeny przechowywane bezpiecznie, niedostępne dla JavaScript
- **Walidacja Serwerowa** - wszystkie API endpoints walidują dane z Zod
- **Onboarding Flag** - flag `onboarding_completed` zapewnia że nowi użytkownicy wypełnią preferencje

### Technologie

- **Astro SSR** - server-side rendering z Node adapter
- **React 19** - interaktywne komponenty formularzy
- **Supabase Auth** - zarządzanie autentykacją i sesjami
- **Zod** - walidacja schematów danych
- **Tailwind CSS + Shadcn/ui** - stylowanie komponentów

---

## Diagram Sekwencji

```mermaid
---
title: HealthyMeal - Architektura Autentykacji
---

sequenceDiagram
    autonumber
    participant U as Użytkownik
    participant B as Przeglądarka
    participant M as Middleware
    participant RF as RegisterForm
    participant LF as LoginForm
    participant OF as OnboardingForm
    participant API as Astro API
    participant SA as Supabase Auth
    participant GO as Google OAuth
    participant DB as Baza Danych

    Note over U,DB: SCENARIUSZ 1: Rejestracja Email + Onboarding

    U->>B: Wejście na /register
    B->>M: GET /register
    M->>M: Sprawdź sesję w cookies
    alt Brak sesji
        M->>B: Renderuj stronę /register
        B->>RF: Załaduj RegisterForm
        RF->>U: Wyświetl formularz
        U->>RF: Wypełnia email, hasło
        RF->>RF: Walidacja kliencka (Zod)
        RF->>SA: signUp(email, password)
        activate SA
        SA->>SA: Tworzy konto w auth.users
        SA->>DB: Trigger: INSERT INTO profiles
        DB-->>SA: Profil utworzony
        SA->>B: Ustawia auth cookies
        SA-->>RF: Success
        deactivate SA
        RF->>B: window.location.href = '/onboarding'
    else Sesja istnieje
        M->>B: Redirect /dashboard
    end

    B->>M: GET /onboarding
    M->>SA: getSession() z cookies
    SA-->>M: Sesja ważna
    M->>B: Renderuj /onboarding
    B->>OF: Załaduj OnboardingForm
    OF->>U: Wyświetl formularz preferencji
    U->>OF: Wybiera alergeny, diety
    OF->>OF: Walidacja: min. 1 preferencja
    OF->>API: POST /api/onboarding/complete
    activate API
    API->>SA: auth.getUser()
    SA-->>API: User ID
    API->>API: Walidacja danych (Zod)
    API->>DB: UPDATE profiles SET<br/>allergens, diets,<br/>onboarding_completed=true
    DB-->>API: Success
    API-->>OF: 200 OK
    deactivate API
    OF->>B: window.location.href = '/dashboard'
    B->>U: Wyświetla Dashboard

    Note over U,DB: SCENARIUSZ 2: Logowanie Google OAuth

    U->>B: Wejście na /login
    B->>LF: Załaduj LoginForm
    LF->>U: Wyświetl przycisk Google
    U->>LF: Klik "Zaloguj przez Google"
    LF->>SA: signInWithOAuth(provider: 'google')
    activate SA
    SA->>GO: Przekierowanie do Google
    GO->>U: Okno popup autoryzacji
    U->>GO: Zatwierdza dostęp
    GO->>API: GET /api/auth/callback?code=xyz
    deactivate SA
    activate API
    API->>SA: exchangeCodeForSession(code)
    SA->>SA: Weryfikuje kod
    SA->>B: Ustawia auth cookies
    SA-->>API: Session
    API->>DB: SELECT onboarding_completed<br/>FROM profiles
    DB-->>API: onboarding_completed
    alt onboarding_completed = false
        API->>B: Redirect /onboarding
        Note over B,OF: Przepływ onboardingu<br/>jak w scenariuszu 1
    else onboarding_completed = true
        API->>B: Redirect /dashboard
    end
    deactivate API

    Note over U,DB: SCENARIUSZ 3: Dostęp do chronionej strony

    U->>B: Próba dostępu /dashboard
    B->>M: GET /dashboard
    activate M
    M->>M: Sprawdź czy trasa chroniona
    M->>SA: getSession() z cookies
    alt Sesja nieważna lub brak
        SA-->>M: Brak sesji
        M->>B: Redirect /login
        M-->>U: Przekierowano do logowania
    else Sesja ważna
        SA-->>M: Session
        M->>M: context.locals.session = session
        M->>B: Kontynuuj żądanie
        B->>U: Wyświetla Dashboard
    end
    deactivate M

    Note over U,DB: SCENARIUSZ 4: Resetowanie hasła

    U->>B: Wejście na /password-recovery
    B->>U: Formularz odzyskiwania hasła
    U->>B: Wpisuje email
    B->>SA: resetPasswordForEmail(email)
    activate SA
    SA->>SA: Generuje reset token
    SA->>U: Wysyła email z linkiem:<br/>localhost:3000/update-password
    SA-->>B: Success
    deactivate SA
    B->>U: Komunikat: Sprawdź email

    U->>U: Otwiera email, klika link
    U->>B: GET /update-password#access_token=...
    B->>U: Formularz nowego hasła
    U->>B: Wpisuje nowe hasło
    B->>SA: updateUser({password: new})
    SA->>SA: Weryfikuje token z URL
    SA->>SA: Aktualizuje hasło
    SA-->>B: Success
    B->>B: Redirect /login
    B->>U: Logowanie z nowym hasłem

    Note over U,DB: SCENARIUSZ 5: Wylogowanie

    U->>B: Klik "Wyloguj" w UserNav
    B->>SA: signOut()
    activate SA
    SA->>B: Usuwa auth cookies
    SA->>SA: Unieważnia sesję
    SA-->>B: Success
    deactivate SA
    B->>B: window.location.href = '/'
    B->>U: Przekierowanie do strony głównej
```

---

## Notatki Implementacyjne

### Middleware (src/middleware.ts)

- Uruchamia się na **każde żądanie** przed renderowaniem strony
- Tworzy server-side Supabase client z cookies
- Weryfikuje sesję: `supabase.auth.getSession()`
- Chroni trasy: `/dashboard`, `/profile`, `/onboarding`
- Przekierowuje niezalogowanych do `/login`
- Przekierowuje zalogowanych z `/login` i `/register` do `/dashboard`

### Database Trigger

Automatyczne tworzenie profilu po rejestracji:

```sql
CREATE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.create_profile_for_new_user();
```

### Konfiguracja Supabase

**Redirect URLs:**

- Lokalne: `http://localhost:3000/api/auth/callback`
- Produkcja: `https://[DOMENA]/api/auth/callback`

**Email Templates:**

- Password reset redirect: `http://localhost:3000/update-password`
- Język: Polski
- Email confirmation: **WYŁĄCZONE** (zgodnie z wymaganiem "szybko założyć konto")

### Metryka Sukcesu (PRD)

- **90% aktywacji**: Walidacja onboardingu wymaga wypełnienia min. 1 preferencji
- **Wsparcie Google OAuth**: Zmniejsza barierę wejścia dla nowych użytkowników
- **Błyskawiczny onboarding**: Email verification wyłączone, onboarding zaraz po rejestracji

---

## Referencje

- `prd.md` - wymagania produktowe
- `auth-spec.md` - specyfikacja techniczna modułu autentykacji
- `CLAUDE.md` - wytyczne projektu

**Data utworzenia**: 2025-11-04
**Wersja specyfikacji**: 1.0 (po aktualizacji portów i API endpoints)
