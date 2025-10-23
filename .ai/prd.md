<conversation_summary> <decisions> Na podstawie analizy i zaleceń, na potrzeby PRD przyjęto następujące założenia (decyzje projektowe):

Wprowadzanie przepisów: Użytkownicy będą ręcznie wklejać tekst przepisu (tytuł, składniki, instrukcje) do dedykowanego formularza.

Zakres AI: W MVP, AI będzie służyć wyłącznie do modyfikacji istniejącego, wklejonego przez użytkownika przepisu. Nie będzie generować przepisów od zera.

Preferencje (Zakres MVP): Profil użytkownika będzie obsługiwał trzy kategorie preferencji: Alergeny (lista wyboru), Diety (lista wyboru) i Nielubiane składniki (pole tekstowe).

Definicja sukcesu (Profil): Metryka 90% zostanie osiągnięta, gdy użytkownik zdefiniuje co najmniej jedną preferencję. Aby to osiągnąć, krok ten będzie częścią onboardingu.

Prezentacja modyfikacji AI: AI będzie generować nową kopię przepisu, nigdy nie nadpisując oryginału. Rozważone zostanie dołączenie listy wprowadzonych zmian.

Zarządzanie ryzykiem AI: Każdy wynik generowany przez AI będzie opatrzony wyraźnym disclaimerem dotyczącym konieczności weryfikacji (szczególnie w kontekście alergii).

Definicja sukcesu (Użycie AI): Metryka 75% będzie mierzona jako odsetek tygodniowych aktywnych użytkowników (WAU), którzy użyli funkcji modyfikacji.

System kont: Oprócz logowania e-mail/hasło, MVP wdroży co najmniej jedną opcję logowania społecznościowego (np. Google), aby zmniejszyć barierę wejścia.

Zarządzanie przepisami (CRUD): Użytkownik będzie miał możliwość niezależnego zapisywania i usuwania zarówno wersji oryginalnej, jak i wersji zmodyfikowanych przez AI.

</decisions>

<matched_recommendations> Poniższe rekomendacje zostały uznane za kluczowe dla zdefiniowania zakresu MVP i są zgodne z głównym celem projektu (dostosowywanie przepisów):

Rekomendacja (dot. Wprowadzania): Potwierdzenie ręcznego wklejania jako najprostszego sposobu wprowadzania danych, co jest zgodne z wykluczeniem importu z URL w MVP.

Rekomendacja (dot. AI): Skupienie się na modyfikacji (a nie generowaniu), co bezpośrednio adresuje zdefiniowany "Główny problem" (dostosowywanie dostępnych przepisów).

Rekomendacja (dot. Preferencji): Zawężenie preferencji do trzech kategorii (Alergeny, Diety, Nielubiane) w celu uproszczenia profilu użytkownika w MVP.

Rekomendacja (dot. Modyfikacji AI): Tworzenie kopii przepisu zamiast nadpisywania, co zapewnia lepsze UX i bezpieczeństwo danych użytkownika.

Rekomendacja (dot. Metryk): Doprecyzowanie metryk sukcesu (definiowanie "wypełnionego profilu" oraz bazowanie metryki zaangażowania na WAU), aby zapewnić ich mierzalność i adekwatność. </matched_recommendations>

<prd_planning_summary>

Podsumowanie Planowania PRD dla HealthyMeal (MVP)
1. Główne Wymagania Funkcjonalne
   System Kont Użytkowników:

Rejestracja i logowanie poprzez e-mail/hasło.

Rejestracja i logowanie przez dostawcę zewnętrznego (np. Google).

Onboarding:

Proces wprowadzający nowego użytkownika.

Musi zawierać krok konfiguracji preferencji żywieniowych (wymagane ustawienie min. 1 preferencji, aby osiągnąć cel 90%).

Profil Użytkownika:

Zarządzanie preferencjami żywieniowymi w trzech kategoriach: Alergeny (do wyboru), Diety (do wyboru), Nielubiane składniki (wpisywane ręcznie).

Zarządzanie Przepisami (CRUD):

Tworzenie nowego przepisu: Formularz z polami na Tytuł, Składniki, Instrukcje (obsługujący ręczne wklejanie treści).

Odczytywanie/Przeglądanie: Widok zapisanego przepisu (zarówno oryginału, jak i wersji AI).

Usuwanie: Możliwość usunięcia dowolnego zapisanego przepisu.

Funkcjonalność AI (Modyfikacja):

W widoku przepisu dostępny przycisk "Dostosuj do moich preferencji".

Wywołanie AI, które analizuje przepis i preferencje użytkownika, a następnie generuje nową wersję (kopię) przepisu.

Wyświetlenie wyraźnego disclaimera przy wyniku AI.

Opcja zapisu zmodyfikowanej wersji w bibliotece użytkownika.

2. Kluczowe Historie Użytkownika (User Stories)
   Rejestracja i Onboarding: "Jako nowy użytkownik, chcę móc szybko założyć konto przez Google i od razu ustawić moje alergie na orzechy i gluten, aby aplikacja rozumiała moje kluczowe ograniczenia."

Dodawanie Przepisu: "Jako użytkownik, chcę móc skopiować przepis z mojego ulubionego bloga i wkleić go do aplikacji, aby mieć go w swojej bibliotece."

Modyfikacja AI: "Jako użytkownik na diecie wegetariańskiej, chcę wcisnąć przycisk 'Dostosuj', aby aplikacja pokazała mi, jak mogę zmodyfikować przepis na gulasz wołowy, używając roślinnych zamienników."

Zarządzanie Przepisami: "Jako użytkownik, po wygenerowaniu modyfikacji AI, chcę zapisać zarówno oryginalny przepis (dla rodziny), jak i wersję zmodyfikowaną (dla mnie), aby móc łatwo wrócić do obu."

3. Kryteria Sukcesu i Mierniki
   Aktywacja Użytkownika: 90% nowo zarejestrowanych użytkowników zdefiniuje co najmniej jedną preferencję (alergię, dietę lub nielubiany składnik) w swoim profilu (mierzone podczas onboardingu).

Zaangażowanie (Core Value): 75% tygodniowych aktywnych użytkowników (WAU) skorzysta z funkcji modyfikacji AI co najmniej jeden raz w ciągu danego tygodnia.

Retencja (Pośrednio): Monitorowanie wskaźnika WAU/MAU (jako ogólny wskaźnik "lepkości" produktu).

Wskaźnik Biznesowy/Ryzyka: Śledzenie średniego kosztu API AI na aktywnego użytkownika tygodniowo.

</prd_planning_summary>

<unresolved_issues> Następujące kwestie wymagają dalszych ustaleń przed finalizacją PRD:

Dostawca AI i Koszty: Nie dokonano jeszcze wyboru konkretnego dostawcy modelu AI (np. OpenAI GPT-4/Turbo, Google Gemini). Konieczna jest pilna estymacja kosztów API w przeliczeniu na aktywnego użytkownika, aby potwierdzić rentowność modelu operacyjnego MVP.

Szczegóły UI/UX Modyfikacji: Nie zdecydowano, w jaki sposób zmiany sugerowane przez AI będą prezentowane użytkownikowi (czy będzie to tylko tekst zastępczy, czy zmiany zostaną np. podświetlone w nowej wersji przepisu, czy AI zwróci osobną listę zmian). </unresolved_issues> </conversation_summary>
