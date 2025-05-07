---
title: "New OTA reservation handling"
slug: new-ota-reservation
tags: ["lib-crs", "new-ota"]
---

# W jaki sposób przygotować?

pobierz sobie w/w projekty (najnowszą wersję) oraz zaciągnij wszystkie wymagane zmiany (zastosuj się do: 
[CHM-PUB] Przygotowanie środowiska developerskiego / produkcyjnego , 
[CHM-R] Przygotowanie środowiska developerskiego / produkcyjnego )

w obu projektach posiadasz pod ścieżką: vendor/profitroom/lib-crs i utwórz tam swój kanał, czyli utwórz nowy katalog wewnątrz: Channels/<nazwakanału>

oczywiście zalecam pracę najpierw nad jednym Engine (np. odbiór rezerwacji) a później pracę na drugim Engine (np. publikację) i wówczas na drugim projekcie zaciągasz już tylko brancha, którego zbudowałeś pracując wcześniej

w katalogu utworzyć plik Channel.class.php z klasą o nazwie <nazwakanału>Channel dziedziczącą z klasy AbstractChannelV2

oczywiście wypełnij kontrakty, interfejsy komunikacją z OTA (czytaj niżej odnośnie wskazówek)

należy utworzyć nowy kanał OTA; dzięki temu uzyskasz unikalny identyfikator tzw. ChannelID → więcej informacji w dokumencie: 
[KB] Tworzenie nowego kanału OTA 

## Jak ma wyglądać output rezerwacji?
```
$output = [
   [
      // Obsługa danych podstawowych:
      SourceReference => pole obowiązkowe, identyfikator rezerwacji w kanale OTA
      SourceRatePlanCode => pole obowiązkowe, identyfikator cennika (rateplanu) OTA, na który wpadała rezerwacja
      Status => pole obowiązkowe, status rezerwacji w kanale OTA, dostepne wartości: "confirmed", "modified", "cancelled"
      // Reprezentacja czasów
      DateBooked => pole obowiązkowe, string (YYYY-MM-DD HH:II:SS), data złożenia rezerwacji w kanale OTA
      DateCheckin => pole obowiązkowe, string (YYYY-MM-DD), data zameldowania
      DateCheckout => pole obowiązkowe, string (YYYY-MM-DD), data wymeldowania
      // Reprezentacja informacji o bookerze
      BookerName => właściciel (tzw. booker) rezerwacji, imię oraz nazwisko
      BookerEmail => adres e-mail właściciela (bookera)
      BookerPhone => telefon kontaktowy właściciela (bookera)
      BookerAddress => adres (ulica) zamieszkania właściciela (bookera)
      BookerCity => miasto zamkesznia właściciela (bookera)
      BookerPostalCode => kod pocztowy właściciela (bookera)
      BookerCountry => kraj zamieszkania właściciela (bookera) (np. PL, DE)
      // Waluta
      PriceTotal => kwota reprezentowana jako string, pełna kwota (np. 155.55), żadnej reprezentacji w groszach, itp.
      Currency => waluta, w której została złożona rezerwacja
      // Obsługa kart kredytowych
      CardEncryption => Array( // <------- pole kluczowe dla wyszarzania danych karty w logach, musi być wypełnione by dane nie były widoczne (Holder, Number, Cvc), w przypadku braku danych nie przekazuj w ogóle tego klucza albo przekaż go w wartości NULL
        Type => 'typ karty kredytowej np. Visa', // null lub string
        Cvc  => 'numer CVC karty kredytowej', // null lub string
        Number => 'numer karty kredytowej', // null lub string
        Holder => 'imię i nazwisko posiadacza karty kredytowej', // null lub string
        ExpireAt => 'data wygaśnięcia karty w formacie: YYYY-MM-DD', // null lub string (jeżeli posiadasz tylko miesiąc/dzień to przekaż tą wartość, retriever sam wypełni resztę danych)
     )
      // Pokoje
      Rooms => [
        [
            // dane podstawowe
            SourceRoomCode => pole obowiązkowe, (string), identyfikator pokoju w kanale OTA
            SourceRatePlanCode => identyfikator cennika (rateplanu) OTA, na który została złożona rezerwacja (nie jest to pole obowiązkowe, jak OTA wspiera multi rate plan to wówczas trzeba wypełnić)
            RoomSourceReference => identyfikator pokoju w kanale OTA
            // informacje nt. gościu (guest)
            AdultOccupancy => wartość numeryczna (number) ile jest osób dorosłych w pokoju,
            ChildOccupancy => wartość numeryczna (number) ile jest dzieci w pokoju
            ChildAges => wiek dzieci (o ile są), (string) przekazywane w formacie: {FROM}-{TO} (np. 10-14) lub samo "10", w przypadku kilku pozyzycji należy użyć separatora: ";" (np. "8-10;11-16" lub "8;10;11;16")
            GuestName => imię i nazwisko gościa w pokoju
            // informacje dodatkowe
            Comment => (string), komentatz do pokoju od gościa (nie myl z komentarzem do rezerwacji)
            RoomPrice => cena pokoju (nie całej rezerwacji), kwota reprezentowana jako string, pełna kwota (np. 155.55), żadnej reprezentacji w groszach, itp.
            RoomDateCheckin => YYYY-MM-DD (string), data zameldowania gościa w danym pokoju
            RoomDateCheckout => YYYY-MM-DD (string), data wymeldowania gościa w danym pokoju 
            RoomAdditionalData => (string) informacje dodatkowe o pokoju
        ],
        [
          // każdy nowy element to następny pokój, który przynależy do danej rezerwacji
        ]
      ]
      // Cena za dzień tzw. Price Break Down
      PriceBreakdown => array()
      // Pozostałe informacje
      SourceData => do celów audytowych potrzebujemy XML/JSON z którego podchodzi dana ta konkretna rezerwacja
      Comment => string, komentarz do rezerwacji (nie myl z komentarzem do pokoju)
      AdditionalData => string, dodatkowe informacje do rezerwacji
      TravelAgentName => nazwa agencji podróżniczej
      PropertyCode => pole obowiązkowe jeśli integracja wspiera multi property (string), jest to kod ChannelSiteCode aka PropertyCode obiektu
      ExtraParameters -> dodatkowe informacje nt rezerwacji         
   ],
   [
      // ... każdy nowy element, to nowa rezerwacja
   ]
];
```