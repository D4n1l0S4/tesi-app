# 🧬 Sistema di Gestione Pedigree Genetici

> **Progetto di Tesi** - Sistema web completo per la gestione pazienti, creazione e analisi di alberi genealogici in ambito medico-genetico

[![Angular](https://img.shields.io/badge/Angular-19.0.5-red?style=flat&logo=angular)](https://angular.io/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.4-green?style=flat&logo=spring)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![PedigreeJS](https://img.shields.io/badge/PedigreeJS-v4.0.0--rc1-orange?style=flat)](https://github.com/CCGE-BOADICEA/pedigreejs)

## 📋 Indice

- [🎯 Panoramica](#-panoramica)
- [✨ Funzionalità Principali](#-funzionalità-principali)
- [🏗️ Architettura](#️-architettura)
- [🛠️ Tecnologie Utilizzate](#️-tecnologie-utilizzate)
- [📦 Installazione](#-installazione)
- [🚀 Avvio del Sistema](#-avvio-del-sistema)
- [📖 Utilizzo](#-utilizzo)
- [🔧 Configurazione](#-configurazione)
- [📁 Struttura del Progetto](#-struttura-del-progetto)

- [📊 Export e Formati Supportati](#-export-e-formati-supportati)
- [🤝 Contributi](#-contributi)
- [📄 Licenza](#-licenza)

## 🎯 Panoramica

Il **Sistema di Gestione Pedigree Genetici** è una piattaforma web completa sviluppata per supportare professionisti sanitari nella gestione pazienti, creazione e analisi di alberi genealogici in ambito medico-genetico. Il sistema integra la potente libreria **PedigreeJS**, sviluppata dal team del **Centre for Cancer Genetic Epidemiology** dell'Università di Cambridge, con un'interfaccia moderna e intuitiva.

### 🎯 Obiettivi del Progetto

- **Digitalizzazione** dei processi di raccolta dati genealogici
- **Standardizzazione** secondo formati medici internazionali (BOADICEA, CanRisk)
- **Miglioramento** dell'efficienza nella consulenza genetica
- **Facilitazione** dell'analisi del rischio ereditario

## ✨ Funzionalità Principali

### 👥 Gestione Pazienti
- ✅ **Operazioni CRUD complete** (Create, Read, Update, Delete)
- ✅ **Anagrafica dettagliata** pazienti
- ✅ **Gestione caregiver** - Assegnazione e gestione assistenti/familiari
- ✅ **Dashboard intuitiva** per navigazione rapida
- ✅ **Ricerca e filtri** avanzati

### 🌳 Editor Pedigree Avanzato
- ✅ **Creazione interattiva** di alberi genealogici
- ✅ **Pannello laterale personalizzato** per editing dettagli
- ✅ **Validazione real-time** dei dati inseriti
- ✅ **Gestione gemelli** (monozigoti/dizigoti)
- ✅ **Controllo modifiche non salvate** con guard di navigazione

### 📊 Import/Export Professionale
- ✅ **Export PNG/SVG** ad alta risoluzione
- ✅ **Export BOADICEA v4** (standard medico internazionale)
- ✅ **Export CanRisk v4.0** (analisi rischio genetico)
- ✅ **Export JSON** (formato nativo)
- ✅ **Stampa PDF** professionale
- ✅ **Import** da formati medici standard

### 🔍 Funzionalità Mediche Specializzate
- ✅ **Diagnosi oncologiche** con età di insorgenza
- ✅ **Storia riproduttiva** (aborti, stillbirth, interruzioni)
- ✅ **Stato adozione** (adottato/dato in adozione)
- ✅ **Validazione coerenza** dati medici

## 🏗️ Architettura

Il sistema segue un'architettura **client-server** moderna con separazione netta tra front-end e back-end:

```
┌─────────────────┐    HTTP/REST    ┌─────────────────┐    JPA/Hibernate    ┌─────────────────┐
│                 │ ◄──────────────► │                 │ ◄──────────────────► │                 │
│   Angular 19    │                 │  Spring Boot    │                     │   PostgreSQL    │
│   (Front-end)   │                 │   (Back-end)    │                     │   (Database)    │
│                 │                 │                 │                     │                 │
└─────────────────┘                 └─────────────────┘                     └─────────────────┘
        │                                   │
        │                                   │
        ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   PedigreeJS    │                 │  Spring Data    │
│   (Rendering)   │                 │      JPA        │
└─────────────────┘                 └─────────────────┘
```

## 🛠️ Tecnologie Utilizzate

### 🎨 Front-end
- **Angular 19.0.5** - Framework principale
- **Bootstrap 5.3.3** - UI Framework
- **PedigreeJS v4.0.0-rc1** - Rendering pedigree
- **D3.js** - Visualizzazioni grafiche
- **jQuery 3.7.1** - Manipolazione DOM
- **FontAwesome 6.7.2** - Iconografia
- **ApexCharts 3.49.2** - Grafici e statistiche

### ⚙️ Back-end
- **Spring Boot 3.4.4** - Framework principale
- **Spring Data JPA** - Persistenza dati
- **Spring Security** - Autenticazione e autorizzazione
- **Spring Validation** - Validazione dati
- **Java 17** - Linguaggio di programmazione
- **Maven** - Gestione dipendenze
- **Lombok** - Riduzione boilerplate code

### 🗄️ Database
- **PostgreSQL** - Database relazionale principale
- **Hibernate** - ORM (Object-Relational Mapping)

### 🔧 Strumenti di Sviluppo
- **Git** - Controllo versione
- **GitHub** - Repository hosting
- **ESLint** - Linting JavaScript/TypeScript
- **Prettier** - Code formatting

## 📦 Installazione

### 📋 Prerequisiti

- **Node.js** (versione 18+ consigliata) - Include npm automaticamente
- **Java 17+** (JDK, non solo JRE)
- **Maven 3.6+** (opzionale - il progetto include Maven Wrapper)
- **PostgreSQL 12+**
- **Git**

### 🔧 Setup Database

1. **Installa PostgreSQL** (se non già presente)

2. **Importa il database** dal dump incluso:
```bash
# Crea il database
createdb [nome_db]

# Importa il dump
psql -d [nome_db] -f db/medical_db_dump.sql
```

3. **Configura le credenziali** in `back-end/crud/src/main/resources/application.properties`

### 📥 Clonazione Repository

```bash
git clone https://github.com/D4n1l0S4/tesi-app.git
cd tesi-app
```

### 🎨 Setup Front-end

```bash
cd front-end/angular
npm install
```

### ⚙️ Setup Back-end

```bash
cd back-end/crud

# Opzione 1: Se hai Maven installato
mvn clean install

# Opzione 2: Usando Maven Wrapper (raccomandato)
# Su Linux/macOS:
./mvnw clean install

# Su Windows:
mvnw.cmd clean install
```

## 🚀 Avvio del Sistema

### 1. 🗄️ Avvia Database
```bash
# Assicurati che PostgreSQL sia in esecuzione
sudo service postgresql start
# oppure su macOS: brew services start postgresql
# oppure su Windows: net start postgresql-x64-XX
```

### 2. ⚙️ Avvia Back-end
```bash
cd back-end/crud

# Su Windows:
.\mvnw.cmd spring-boot:run

# Su Linux/macOS:
./mvnw spring-boot:run

# Se hai Maven installato globalmente:
mvn spring-boot:run
```
Il server sarà disponibile su: `http://localhost:8085`

### 3. 🎨 Avvia Front-end
```bash
cd front-end/angular
npm start
```
L'applicazione sarà disponibile su: `http://localhost:4200`

> **⚠️ Nota:** Servono **2 terminali separati** - uno per il back-end e uno per il front-end.

### 🛑 Fermare i Servizi
- **Ctrl + C** in entrambi i terminali per fermare i servizi
- Verifica: `netstat -ano | findstr ":4200 :8085"` (nessun output = servizi fermati)

## 📖 Utilizzo

### 🔐 Accesso al Sistema
1. Naviga su `http://localhost:4200`
2. **Effettua il login** con le credenziali di test:
   - **Username**: `user`
   - **Password**: `12345678`
3. Accedi alla dashboard principale

### 👥 Gestione Pazienti
1. **Sezione "Pazienti"** → Visualizza lista completa
2. **"Aggiungi Paziente"** → Inserisci nuova anagrafica
3. **Modifica/Elimina** → Gestisci pazienti esistenti
4. **Gestione Caregiver** → Assegna assistenti/familiari ai pazienti
5. **Ricerca e filtri** → Trova rapidamente pazienti specifici

### 🧬 Creazione Pedigree
1. **Sezione "Genetica"** → Seleziona paziente
2. **"Crea Pedigree"** → Avvia editor interattivo
3. **Aggiungi familiari** → Usa widget PedigreeJS
4. **Pannello laterale** → Modifica dettagli persona selezionata
5. **Salva** → Persisti nel database

### 📊 Export Dati
1. **Apri pedigree esistente**
2. **Toolbar Export** → Scegli formato desiderato
3. **Download automatico** del file generato

## 🔧 Configurazione

### 🗄️ Database (application.properties)
```properties
server.port=8085
spring.datasource.url=jdbc:postgresql://localhost:5432/[nome_db]
spring.datasource.username=[username_db]
spring.datasource.password=[password_db]
spring.jpa.hibernate.ddl-auto=update
```

### 🌐 CORS (per sviluppo)
```properties
cors.allowed.origins=http://localhost:4200
```

### 🎨 Angular Environment
```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8085/api/v1'
};
```

## 📁 Struttura del Progetto

```
tesi-app/
├── 📁 front-end/
│   └── 📁 angular/
│       ├── 📁 src/
│       │   ├── 📁 app/
│       │   │   ├── 📁 components/
│       │   │   │   ├── 📁 genetica/           # Dashboard genetica
│       │   │   │   └── 📁 pedigree-viewer/    # Editor pedigree
│       │   │   ├── 📁 services/               # Servizi Angular
│       │   │   ├── 📁 models/                 # Modelli TypeScript
│       │   │   └── 📁 guards/                 # Route guards
│       │   └── 📁 assets/
│       └── 📁 libs/
│           └── 📁 pedigreejs/                 # Libreria PedigreeJS
├── 📁 back-end/
│   └── 📁 crud/
│       ├── 📁 src/main/java/
│       │   └── 📁 it/uniba/crud/
│       │       ├── 📁 controller/             # REST Controllers
│       │       ├── 📁 service/                # Business Logic
│       │       ├── 📁 repository/             # Data Access
│       │       ├── 📁 model/                  # Entità JPA
│       │       └── 📁 dto/                    # Data Transfer Objects
│       └── 📁 src/main/resources/
├── 📁 db/                                     # Database dump e script
│   └── medical_db_dump.sql                   # Dump completo del database
└── 📄 README.md
```


## 📊 Export e Formati Supportati

### 📋 Formati di Export

| Formato | Descrizione | Uso Clinico |
|---------|-------------|-------------|
| **PNG** | Immagine ad alta risoluzione | Documentazione medica |
| **SVG** | Grafico vettoriale scalabile | Pubblicazioni scientifiche |
| **JSON** | Formato nativo del sistema | Backup e interoperabilità |
| **BOADICEA v4** | Standard internazionale | Analisi rischio breast/ovarian cancer |
| **CanRisk v4.0** | Formato CanRisk | Valutazione rischio multi-cancer |
| **PDF** | Documento stampabile | Referti e documentazione |

### 🔄 Formati di Import

- ✅ **JSON** (formato nativo)
- ✅ **BOADICEA** (standard medico)
- ✅ **CanRisk** (formato rischio)
- ✅ **PED** (formato genealogico)

## 🤝 Contributi

Questo progetto è stato sviluppato come **progetto di tesi**. Per contributi o segnalazioni:

1. 🍴 Fork del repository
2. 🌿 Crea feature branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit delle modifiche (`git commit -m 'Add AmazingFeature'`)
4. 📤 Push del branch (`git push origin feature/AmazingFeature`)
5. 🔄 Apri Pull Request

## 📄 Licenza

Questo progetto è sviluppato per scopi **accademici** come parte di un progetto di tesi universitaria.

### 📚 Librerie Terze Parti

- **PedigreeJS**: GPL-3.0-or-later (Centre for Cancer Genetic Epidemiology, University of Cambridge)
- **Angular**: MIT License
- **Spring Boot**: Apache License 2.0
- **Bootstrap**: MIT License

---

## 👨‍💻 Autore

**Danilo Santo**
- 🎓 Università: Università degli Studi di Bari Aldo Moro, Dipartimento di Informatica.
- 📧 Email: d4n1l0.id.apple@gmail.com
- 💼 LinkedIn: https://www.linkedin.com/in/danilo-santo-1107a2358/

---

## 🙏 Ringraziamenti

- **Centre for Cancer Genetic Epidemiology, University of Cambridge** per lo sviluppo della libreria PedigreeJS
- **Relatore di tesi** per la supervisione e guida durante lo sviluppo
- **Community open source** per le librerie utilizzate

---

<div align="center">

**⭐ Se questo progetto ti è stato utile, lascia una stella! ⭐**

*Sviluppato con ❤️ per la comunità medico-genetica*

</div>
