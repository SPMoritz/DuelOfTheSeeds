# Gesamtkonzept: Duel of the Seeds — Mobile PWA mit Seeds, Bot und Ghost

## 1. Vision

**Duel of the Seeds** ist ein mobiles Pixel-Art-Spiel für kurze, kompetitive Runden auf einem gemeinsamen Handy. Mehrere Spieler treten nacheinander gegeneinander an, nicht gleichzeitig. Jeder Spieler spielt denselben Level-Seed, gegen denselben Bot und gegen den aktuellen besten Ghost.

Das Spiel soll sich anfühlen wie ein Mischung aus:

* Speedrun-Jump’n’Run
* Arena-Challenge
* lokalem Partyspiel
* „Nur noch ein Versuch“-Highscore-Spiel

Die erste Version konzentriert sich bewusst auf einen einzigen starken Modus: ein vertikales Jump’n’Run-Rennen gegen Bot und Ghost. Spätere Versionen können daraus 2D-Arena-Duelle und später Netzwerk-Multiplayer entwickeln.

---

## 2. Grundprinzip

Das Spiel funktioniert über **reproduzierbare Seeds**.

Ein Seed erzeugt immer wieder denselben Level mit denselben Eigenschaften:

* Plattformen
* Hindernisse
* Fallen
* Zielposition
* Bot-Route oder Bot-Verhalten
* Schwierigkeitsgrad
* mögliche optimale Route

Dadurch kann ein Spieler sagen:

> „Spiel mal Seed WOLF-99. Meine Bestzeit ist 36 Sekunden.“

Das Spiel braucht für die erste Version keinen Server. Alles läuft als statische Website beziehungsweise installierbare PWA im Browser.

---

## 3. Zielplattform

Die erste Version ist für Smartphones im Hochformat gedacht.

Das Spiel nutzt die Vertikalität des Bildschirms bewusst aus:

* Start unten
* Ziel oben
* Plattformen in einem Turm oder Arena-Schacht
* Hindernisse zwischen Start und Ziel
* Ghost und Bot sichtbar im Level
* große Touch-Flächen für die Steuerung

Das Spiel soll sich auch auf einem Handy sofort verständlich anfühlen.

---

## 4. Spielmodus v1: Jump Trial

### Kernidee

Mehrere Spieler spielen nacheinander denselben vertikalen Jump’n’Run-Level.

Jeder Spieler versucht:

* schneller als der Bot zu sein
* schneller als der Ghost zu sein
* die beste lokale Zeit aufzustellen
* den Seed als „guten Seed“ zu bewerten oder abzulehnen

### Ablauf einer Runde

1. Spieler wählt oder erhält einen Seed.
2. Das Spiel generiert daraus einen Level.
3. Der Level wird geprüft, ob er schaffbar und interessant ist.
4. Spieler startet den Versuch.
5. Bot läuft gleichzeitig als Gegner mit.
6. Der bisher beste Lauf erscheint als Ghost.
7. Nach dem Ziel wird die Zeit gespeichert.
8. Spieler kann den Seed bewerten.
9. Nächster Spieler versucht denselben Seed.

---

## 5. Pass-and-Play-Prinzip

In v1 teilen sich mehrere Spieler ein Handy.

Das Spiel ist kein gleichzeitiges Multiplayer-Spiel, sondern ein lokales Turnier:

* Spieler 1 spielt zuerst.
* Spieler 2 spielt danach denselben Seed.
* Spieler 3 kann ebenfalls antreten.
* Der beste Lauf wird als Ghost angezeigt.
* Die lokale Rangliste wird nach jedem Versuch aktualisiert.

Dieses Prinzip ist wichtig, weil es sehr einfach zu verstehen ist und ohne Server funktioniert.

---

## 6. Ghost-System

Der Ghost ist ein zentrales Feature.

Er zeigt den aktuell besten gespeicherten Lauf auf demselben Gerät und demselben Seed.

Der Ghost soll:

* leicht transparent dargestellt werden
* die Route des besten Spielers zeigen
* Motivation erzeugen
* als „lebender Highscore“ wirken
* dem Spieler zeigen, wo Zeit gewonnen oder verloren wird

Der Ghost ist kein Gegner, der den Spieler blockiert. Er ist nur eine visuelle Referenz.

Optional können später mehrere Ghosts auswählbar sein:

* eigener bester Lauf
* bester Spieler auf dem Gerät
* Bot-Ghost
* importierter Ghost von einem Freund

---

## 7. Bot-System

Der Bot ist in v1 ein sichtbarer Rivalen-Läufer.

Er soll Druck erzeugen, aber nicht zu komplex sein. Der Spieler soll das Gefühl haben:

> „Ich renne gegen jemanden.“

Nicht:

> „Ich kämpfe gegen eine perfekte künstliche Intelligenz.“

### Einstellbare Bot-Schwierigkeit

Die Schwierigkeit des Bots ist einstellbar.

Mögliche Stufen:

* Einfach
* Normal
* Schwer
* Perfekt

Oder spielerischer formuliert:

* Anfänger
* Herausforderer
* Champion
* Perfekter Bot

### Bot-Verhalten

Der Bot kann je nach Schwierigkeit:

* langsamer oder schneller laufen
* bessere oder schlechtere Routen wählen
* mehr oder weniger Fehler machen
* kürzere oder längere Pausen haben
* Hindernisse unterschiedlich gut meistern

Der Bot soll fair wirken. Ein schwerer Bot darf stark sein, aber nicht unfair.

---

## 8. Level-Generierung

Die Level werden aus Seeds generiert.

Das Ziel ist nicht, möglichst zufällige Level zu erzeugen, sondern möglichst gute, spielbare und erinnerbare Level.

Ein guter Level ist:

* schaffbar
* lesbar
* fair
* nicht langweilig
* nicht zu lang
* nicht zu kurz
* mit mehreren kleinen Entscheidungen
* mit klar erkennbarem Ziel
* gut für Speedruns geeignet

### Schaffbarkeit

Jeder generierte Level soll möglichst automatisch geprüft werden.

Eine mögliche Designidee:

Ein perfekter Bot oder idealer Testläufer spielt den Level intern in stark beschleunigter Form, mindestens mit 100-facher Geschwindigkeit. Wenn der Bot den Level schafft, gilt der Level grundsätzlich als schaffbar.

Falls der Bot scheitert, wird der Level verworfen und ein neuer Kandidat aus demselben oder einem neuen Seed erzeugt.

Dadurch entstehen nur Level, die theoretisch lösbar sind.

### Qualitätsprüfung

Schaffbar allein reicht nicht. Ein Level kann schaffbar, aber trotzdem langweilig sein.

Darum sollte das Spiel später zusätzlich bewerten können:

* Gibt es genug Sprünge?
* Gibt es genug Timing-Elemente?
* Gibt es zu viele tote Bereiche?
* Ist die Route klar?
* Gibt es interessante Abkürzungen?
* Ist die durchschnittliche Laufzeit passend?
* Ist der Level für die gewählte Schwierigkeit angemessen?

---

## 9. Seed-Bewertung

Spieler können Seeds bewerten.

Gute Seeds können gespeichert oder hochgewertet werden.

Schlechte Seeds können abgewertet werden.

### Gute Seeds

Ein Seed ist gut, wenn er:

* Spaß macht
* fair ist
* spannende Rennen erzeugt
* gute Speedrun-Möglichkeiten bietet
* wiederholt gespielt werden kann
* nicht frustrierend ist

### Schlechte Seeds

Ein Seed ist schlecht, wenn er:

* langweilig ist
* zu einfach ist
* zu schwer ist
* sich unfair anfühlt
* unschaffbar wirkt
* zu lange dauert
* keinen Flow erzeugt

### Lokale Seed-Sammlung

In v1 können Bewertungen lokal gespeichert werden:

* Lieblings-Seeds
* zuletzt gespielte Seeds
* abgelehnte Seeds
* Seeds mit Bestzeiten
* Seeds mit mehreren Spielern

Später können Seeds exportiert, geteilt oder importiert werden.

---

## 10. Highscores und lokale Daten

Da v1 frontend-only funktioniert, werden alle Daten lokal auf dem Gerät gespeichert.

Gespeichert werden können:

* Spielernamen
* lokale Bestzeiten
* Seed-Historie
* Ghost-Daten
* Bot-Schwierigkeit
* Lieblings-Seeds
* abgelehnte Seeds
* Turnierergebnisse
* Einstellungen

Das Spiel soll auch ohne Login funktionieren.

Wichtig ist: Der lokale Charakter ist Teil des Konzepts. Es soll sofort spielbar sein, ohne Registrierung, ohne Server, ohne Setup.

---

## 11. Sharing und Backup

In v1 ist das Spiel lokal. Später sollen einfache Sharing- und Backup-Möglichkeiten entstehen.

### Mögliche Sharing-Funktionen

Spieler können teilen:

* Seed
* eigene Bestzeit
* Screenshot des Ergebnisses
* Challenge-Text
* Ghost-Code oder Replay-Daten

Zum Beispiel per WhatsApp:

> „Ich habe WOLF-99 in 36.782 Sekunden geschafft. Schlägst du mich?“

### Mögliche Backup-Funktionen

Später könnten lokale Daten exportiert und wieder importiert werden:

* Highscores
* Lieblings-Seeds
* Ghosts
* Spielerprofile

Das kann zunächst sehr einfach gehalten werden.

---

## 12. Spielgefühl

Das Spiel soll sofort verständlich, schnell und motivierend sein.

Wichtige Gefühle:

* „Ich weiß, dass ich schneller sein kann.“
* „Der Ghost ist knapp vor mir.“
* „Ich probiere noch einen Versuch.“
* „Dieser Seed ist richtig gut.“
* „Der Bot ist schwer, aber schlagbar.“
* „Ich will meinem Freund diesen Seed schicken.“

Der Fokus liegt auf kurzen, wiederholbaren Versuchen.

Eine Runde sollte nicht zu lange dauern. Ideal sind kurze Runs, die man mehrfach hintereinander spielen möchte.

---

## 13. Steuerung

Die Steuerung soll auf dem Handy einfach und direkt sein.

Für v1 reichen wenige Aktionen:

* nach links bewegen
* nach rechts bewegen
* springen
* optional dashen

Die Touch-Flächen müssen groß genug sein, damit das Spiel nicht frustrierend wird.

Das wichtigste Qualitätskriterium von v1 ist das Spielgefühl beim Springen. Wenn Bewegung und Sprünge nicht gut funktionieren, tragen Seeds, Ghosts und Bots das Spiel nicht.

---

## 14. Visueller Stil

Das Spiel soll als Pixel-Art-Spiel gestaltet sein.

Der Stil sollte klar, lesbar und charmant sein.

Wichtige visuelle Elemente:

* vertikaler Arena-Turm
* Steinplattformen
* Flaggen oder Banner
* sichtbares Zielportal
* Bot mit anderer Farbe
* Ghost halbtransparent
* einfache, starke UI
* klare Zeit- und Ranglistenanzeige

Die Grafik muss nicht komplex sein. Wichtiger ist, dass Hindernisse, Plattformen und Bewegungen sofort lesbar sind.

---

## 15. v1 MVP

Die erste wirklich spielbare Version sollte bewusst klein bleiben.

### Muss enthalten sein

* vertikales Jump’n’Run-Level
* Seed-Eingabe oder Seed-Auswahl
* reproduzierbare Level
* automatische Schaffbarkeitsprüfung
* Spieler läuft gegen Bot
* einstellbare Bot-Schwierigkeit
* Zeitmessung
* lokaler Highscore
* bester Lauf als Ghost
* mehrere Spieler nacheinander auf demselben Gerät
* lokale Speicherung
* PWA-fähig als statische Website

### Sollte möglichst enthalten sein

* Seed speichern
* Seed bewerten
* gute Seeds markieren
* schlechte Seeds ablehnen
* Ergebnisbildschirm
* einfacher Teilen-Text

### Muss nicht in v1 enthalten sein

* Online-Multiplayer
* Accounts
* globale Ranglisten
* Netzwerk-Synchronisierung
* komplexe Kampfmechaniken
* Schwertkampf
* Bogenschießen
* mehrere Spielmodi

---

## 16. Roadmap

## v1: Jump Trial

Der erste Modus ist ein vertikales Jump’n’Run-Rennen.

Ziele:

* gutes Movement
* gute Seeds
* Bot als Rivalen-Läufer
* Ghost des besten Spielers
* lokale Highscores
* Pass-and-Play auf einem Gerät
* frontend-only PWA

Erfolgskriterium:

> Spieler wollen denselben Seed mehrfach wiederholen, um ihre Zeit zu verbessern.

---

## v2: 2D Arena-Duelle gegen Bot

In v2 wird aus dem Jump’n’Run-Fundament ein 2D-Arena-Kampf.

Die gesamte Map ist auf dem Bildschirm sichtbar.

Das Spielgefühl orientiert sich an schnellen Arena-Duellen, aber in 2D und mobil verständlich.

### Grundidee

Ein Spieler kämpft gegen einen Bot in einer kleinen Arena.

Die Map enthält:

* Plattformen
* Höhenunterschiede
* Waffen oder Angriffsarten
* Ausweichmöglichkeiten
* klare Sicht auf das ganze Geschehen

### Integration der ursprünglichen Disziplinen

Die drei Disziplinen werden in v2 zu Kernfähigkeiten:

* Jump’n’Run = Movement und Positionierung
* Schwertkampf = Nahkampf
* Bogenschießen = Fernkampf

### Ziel von v2

Nicht mehr nur schneller sein, sondern den Bot im Duell besiegen.

Mögliche Wertung:

* Sieg oder Niederlage
* Zeit bis zum Sieg
* Restleben
* Trefferquote
* gewählte Schwierigkeit

Erfolgskriterium:

> Das Duell gegen den Bot fühlt sich taktisch, schnell und wiederholbar an.

---

## v3: Netzwerk-Multiplayer

In v3 werden echte Duelle zwischen Spielern über Netzwerk möglich.

Das ist bewusst erst v3, weil Netzwerk-Multiplayer deutlich komplexer ist.

### Ziel

Zwei Spieler treten gleichzeitig auf unterschiedlichen Geräten gegeneinander an.

### Neue Anforderungen

* Räume oder Match-Codes
* Synchronisierung
* Verbindungsqualität
* Abbruch- und Wiederverbindungslogik
* faire Match-Regeln
* optional globale Ranglisten

### Wiederverwendbare Grundlagen aus v1 und v2

* Seed-System
* Arena-Design
* Movement
* Bot-Logik
* Ghost-/Replay-Ideen
* lokale Datenstruktur
* mobile Steuerung
* Spielbalance

Erfolgskriterium:

> Das Spiel funktioniert als echtes schnelles 1v1-Duell zwischen zwei Geräten.

---

## 17. Warum diese Reihenfolge sinnvoll ist

Die Roadmap reduziert Risiko.

### v1 beantwortet:

> Macht ein seed-basiertes Jump’n’Run mit Bot und Ghost Spaß?

### v2 beantwortet:

> Funktionieren Arena-Duelle mit Movement, Nahkampf und Fernkampf gegen Bots?

### v3 beantwortet:

> Funktioniert das Ganze auch als echtes Multiplayer-Spiel?

Wenn v1 keinen Spaß macht, sollte man nicht zu früh v2 oder v3 bauen.

Wenn v1 stark ist, kann v2 auf einem guten Fundament entstehen.

Wenn v2 stark ist, lohnt sich v3.

---

## 18. Offene Designentscheidungen

Diese Punkte sollten später bewusst entschieden werden:

* Wie lang soll ein idealer v1-Run dauern?
* Wie schwer darf ein normaler Seed sein?
* Soll der Bot sichtbar direkt neben dem Spieler laufen oder eher als Zeitgegner wirken?
* Wie stark soll der Ghost im Vordergrund stehen?
* Soll ein Seed eher kurz und merkbar oder sehr eindeutig und länger sein?
* Wie einfach soll das Teilen per Nachricht sein?
* Wie viel Bewertung von Seeds passiert automatisch und wie viel durch Spieler?
* Wie viele Spielerprofile braucht Pass-and-Play in v1?

---

## 19. Leitprinzipien für die Entwicklung

1. **Erst Spielgefühl, dann Umfang.**

   Das Movement muss Spaß machen, bevor zusätzliche Modi gebaut werden.

2. **Seeds sind das Herzstück.**

   Gute Seeds machen das Spiel teilbar und wiederholbar.

3. **Ghost schlägt Menükomplexität.**

   Der beste Vergleich ist direkt im Spiel sichtbar.

4. **Frontend-only ist ein Vorteil.**

   Kein Login, kein Server, sofort spielbar.

5. **Bot-Schwierigkeit macht das Spiel zugänglich.**

   Anfänger und starke Spieler sollen beide passende Herausforderungen finden.

6. **Schaffbarkeit ist Pflicht.**

   Ein automatisch generierter Level darf nicht unfair oder unmöglich sein.

7. **Bewertungen verbessern die Seed-Welt.**

   Spieler sollen gute Seeds behalten und schlechte aussortieren können.

8. **v1 muss nicht alles sein.**

   Eine starke erste Disziplin ist besser als drei unfertige Modi.

---

## 20. Kurzfassung

**Duel of the Seeds v1** ist ein mobiles, frontend-only Pixel-Art-Jump’n’Run als PWA.

Mehrere Spieler spielen nacheinander denselben generierten Seed auf einem Handy. Der beste Lauf erscheint als Ghost. Ein Bot läuft als einstellbarer Rivale mit. Levels werden aus merkbaren Seeds erzeugt und automatisch auf Schaffbarkeit geprüft. Gute Seeds können gespeichert oder upgevotet werden, schlechte oder langweilige Seeds können downgevotet werden. Highscores und Ghosts werden lokal gespeichert. Später können Seeds, Ergebnisse oder Backups geteilt werden, zum Beispiel per WhatsApp.

Die Roadmap führt danach zu 2D-Arena-Duellen gegen Bots und später zu echtem Netzwerk-Multiplayer.
