# 📋 **Funzionalità Import/Export PedigreeJS - Documentazione**

## 🎯 **Panoramica**

Il componente PedigreeViewerComponent è stato esteso con funzionalità complete di **Import/Export** per supportare diversi formati di file utilizzati nell'analisi genetica e nella ricerca medica.

## 🚀 **Funzionalità Implementate**

### **📤 EXPORT (Esportazione)**

#### **1. Export PNG** 
- **Formato**: Immagine PNG ad alta risoluzione (4x)
- **Uso**: Stampa, presentazioni, documentazione medica
- **Qualità**: Ottimizzata per stampa professionale
- **Attivazione**: Pulsante "PNG" nella toolbar I/O

#### **2. Export SVG**
- **Formato**: Grafico vettoriale scalabile
- **Uso**: Pubblicazioni scientifiche, web, editing grafico
- **Vantaggi**: Scalabile senza perdita di qualità
- **Attivazione**: Pulsante "SVG" nella toolbar I/O

#### **3. Export JSON**
- **Formato**: Dati strutturati con metadati completi
- **Contenuto**: 
  - Dati pedigree completi
  - Metadati paziente
  - Timestamp esportazione
  - Versione PedigreeJS
- **Uso**: Backup, trasferimento dati, integrazione sistemi
- **Attivazione**: Pulsante "JSON" nella toolbar I/O

#### **4. Export BOADICEA v4**
- **Formato**: Standard medico per analisi rischio cancro
- **Compatibilità**: Software di analisi genetica professionale
- **Contenuto**: 
  - Dati genealogici standardizzati
  - Informazioni mediche (cancri, età diagnosi)
  - Test genetici (BRCA1, BRCA2, PALB2, ATM, CHEK2)
  - Marcatori patologici
- **Uso**: Analisi rischio, ricerca oncogenetica
- **Attivazione**: Pulsante "BOADICEA" nella toolbar I/O

#### **5. Export CanRisk**
- **Formato**: CanRisk v4.0 format
- **Utilizzo**: Analisi di rischio oncogenetico avanzata con supporto per fattori di rischio estesi
- **Caratteristiche**:
  - Supporto per test genetici multipli (BRCA1, BRCA2, PALB2, ATM, CHEK2, BARD1, RAD51D, RAD51C, BRIP1, HOXB13)
  - Marcatori patologici (ER, PR, HER2, CK14, CK56)
  - Metadati per fattori di rischio (età, etnia, storia familiare)
  - Compatibilità con software CanRisk per calcoli di rischio personalizzati
- **Implementazione**: 
  - Utilizza `pedigreejs_canrisk_file.get_pedigree()` quando disponibile
  - Fallback con generazione manuale del formato
- **File generato**: `pedigree_canrisk_[nome]_[cognome]_[timestamp].txt`

### **📥 IMPORT (Importazione)**

#### **Formati Supportati**
- **JSON**: File esportati dal sistema o compatibili
- **BOADICEA v4**: File standard medici
- **CanRisk**: Formato esteso per analisi rischio
- **PED (Linkage)**: Formato genetica classica

#### **Rilevamento Automatico**
- Il sistema rileva automaticamente il formato del file
- Parsing intelligente con validazione dati
- Gestione errori con messaggi informativi

#### **Processo Import**
1. Click su "Importa File"
2. Selezione file dal computer
3. Rilevamento automatico formato
4. Parsing e validazione
5. Caricamento nel viewer
6. Passaggio automatico in modalità EDIT

## 🎨 **Interfaccia Utente**

### **Toolbar I/O**
- **Posizione**: Subito sotto l'header principale del card
- **Design**: Sfondo grigio chiaro con pulsanti colorati per categoria
- **Organizzazione**: 
  - **Export**: Pulsanti blu/verde (PNG, SVG, JSON, BOADICEA, CanRisk)
  - **Import**: Pulsante arancione (Importa File)

### **Messaggi di Stato**
- **Successo**: Alert verde con icona check
- **Errore**: Alert rosso con icona warning
- **Info**: Alert blu con icona info
- **Auto-hide**: Messaggi di successo scompaiono dopo 5 secondi

### **Validazioni**
- Pulsanti disabilitati quando pedigree non inizializzato
- Controllo formato file durante import
- Gestione errori con messaggi specifici

## 🔧 **Implementazione Tecnica**

### **Metodi Principali**

```typescript
// Export Methods
exportToPNG(): void          // Export PNG alta risoluzione
exportToSVG(): void          // Export SVG vettoriale  
exportToJSON(): void         // Export JSON con metadati
exportToBoadicea(): void     // Export BOADICEA v4
exportToCanRisk(): void      // Export CanRisk

// Import Methods
importFromFile(event): void  // Gestione upload file
importFromJSON(): void       // Parser JSON
importFromMedicalFormat(): void // Parser BOADICEA/CanRisk
importFromPEDFormat(): void  // Parser PED/Linkage

// Utility Methods
downloadFile(): void         // Download automatico file
showIOMessage(): void        // Gestione messaggi stato
convertToBoadiceaFormat(): void // Conversione formato medico
```

### **Integrazione PedigreeJS**
- Utilizza API native PedigreeJS per export immagini
- Accesso diretto ai dati del pedigree tramite cache
- Compatibilità con parser esistenti per import
- Gestione eventi DOM per file upload

### **Gestione Errori**
- Try-catch su tutte le operazioni I/O
- Messaggi di errore specifici e informativi
- Rollback automatico in caso di import fallito
- Logging dettagliato per debugging

## 📊 **Formati File Dettagliati**

### **JSON Export Structure**
```json
{
  "metadata": {
    "exportDate": "2024-01-15T10:30:00.000Z",
    "patientName": "Mario Rossi", 
    "patientId": 123,
    "mode": "EDIT",
    "version": "PedigreeJS v4.0.0-rc1"
  },
  "pedigreeData": [
    {
      "name": "Mario_Rossi",
      "display_name": "Mario Rossi",
      "sex": "M",
      "age": 45,
      "yob": 1979,
      "proband": true,
      "top_level": true
      // ... altri dati
    }
  ]
}
```

### **BOADICEA v4 Export Structure**
```
BOADICEA import pedigree file format 4.0
FamID	Name	Target	IndivID	FathID	MothID	Sex	MZtwin	Dead	Age	Yob	1stBrCa	2ndBrCa	OvCa	ProCa	PanCa	Ashkn	BRCA1t	BRCA1r	BRCA2t	BRCA2r	PALB2t	PALB2r	ATMt	ATMr	CHEK2t	CHEK2r	ER	PR	HER2	CK14	CK56
FAM_123	Mario Rossi	1	Mario_Rossi	0	0	M	0	0	45	1979	0	0	0	0	0	0	0:0	0:0	0:0	0:0	0:0	0:0	0	0	0	0	0
```

## 🎯 **Casi d'Uso**

### **Scenario 1: Backup Dati**
1. Medico completa pedigree paziente
2. Export JSON per backup sicuro
3. File archiviato con cartella clinica

### **Scenario 2: Condivisione Colleghi**
1. Export BOADICEA per analisi genetica
2. Invio a laboratorio specializzato
3. Import risultati aggiornati

### **Scenario 3: Presentazione Caso**
1. Export PNG alta risoluzione
2. Inserimento in presentazione PowerPoint
3. Discussione caso clinico

### **Scenario 4: Ricerca Scientifica**
1. Export SVG per pubblicazione
2. Editing grafico se necessario
3. Inserimento in paper scientifico

## ⚠️ **Note Importanti**

### **Sicurezza**
- Tutti i file sono processati localmente nel browser
- Nessun dato inviato a server esterni durante I/O
- Validazione rigorosa input per prevenire XSS

### **Performance**
- Export PNG/SVG utilizzano API native PedigreeJS (ottimizzate)
- Import file limitato a dimensioni ragionevoli
- Gestione memoria efficiente per file grandi

### **Compatibilità**
- Funziona su tutti i browser moderni
- File export compatibili con software medici standard
- Import robusto con fallback per formati non standard

## 🔄 **Prossimi Sviluppi**

### **Fase 2 (Futura)**
- Export PDF con layout professionale
- Import da database esterni
- Batch processing per multiple famiglie
- API REST per integrazione sistemi esterni

### **Miglioramenti UX**
- Drag & drop per import file
- Preview anteprima prima dell'import
- Wizard guidato per export personalizzato
- Cronologia import/export

---

**Implementato da**: AI Assistant  
**Data**: Gennaio 2024  
**Versione**: 1.0  
**Compatibilità**: PedigreeJS v4.0.0-rc1, Angular 15+ 