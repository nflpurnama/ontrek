# Ontrek Development Phases Document

**Project:** Ontrek - Personal Net Worth Tracker with Receipt Scanning  
**Version:** 1.0 (Initial)  
**Last Updated:** July 13, 2026  
**Document Type:** Software Development Lifecycle (SDLC) Plan  

---

## Executive Summary

Ontrek is a privacy-first, offline-only personal net worth tracking application built natively for Android using Kotlin. The app uses on-device ML Kit OCR to scan receipts and automatically extract transaction data, eliminating manual entry while maintaining complete privacy. This document outlines the structured development phases from initial setup through production readiness.

### Key Principles
- **Privacy-first**: No external APIs, no cloud storage, all data on-device
- **Receipt-first input**: Primary transaction entry via camera OCR scanning
- **Net worth focus**: Dashboard shows total net worth (cash + investments)
- **Offline-only**: Works without internet connection
- **Native Android**: Built with Kotlin, not cross-platform frameworks

### Technology Stack
- **Language**: Kotlin
- **Architecture**: MVI (Model-View-Intent)
- **Database**: Room (SQLite abstraction)
- **OCR**: Google ML Kit (on-device, no cloud API calls)
- **Build System**: Gradle with Kotlin DSL
- **UI**: Material Design 3 components
- **Min SDK**: 28 (Android 9.0)
- **Target SDK**: 36 (Android 15)

### Project Structure
```
app/src/main/
├── java/com/kenali/ontrek/
│   ├── core/          # Shared utilities, extensions, constants
│   ├── data/          # Data layer (Room entities, DAOs, repositories)
│   ├── domain/        # Business logic (use cases, models)
│   └── ui/            # Presentation layer (screens, viewmodels, composables)
├── res/               # Resources (layouts, drawables, strings)
└── AndroidManifest.xml
```

---

## Phase 1: Foundation & Core Infrastructure 🔲 PLANNED

**Status:** Not Started  
**Timeline:** Weeks 1-4  
**Deliverable:** Basic project structure with database and core architecture

### Objectives
Establish the foundational architecture, database schema, and core infrastructure components.

### Deliverables
- [ ] Complete MVI architecture setup
- [ ] Room database configuration with migrations
- [ ] Core data models:
  - Transaction (id, date, amount, type, category, merchant, receiptImageUri)
  - Account (id, name, type [cash/investment], balance, currency)
  - Category (id, name, icon, color, type [income/expense])
  - Investment (id, accountId, symbol, shares, purchasePrice, currentPrice)
- [ ] Repository interfaces and implementations
- [ ] Dependency injection setup (Hilt or Koin)
- [ ] Base ViewModel and UI state management
- [ ] Navigation component setup
- [ ] Theme system with Material Design 3

### Acceptance Criteria
- [ ] Database creates successfully on first launch
- [ ] All core entities can be created, read, updated, deleted
- [ ] Repository pattern properly separates data access from business logic
- [ ] DI container provides dependencies correctly
- [ ] Navigation between screens works
- [ ] App builds without errors

### Technical Decisions
- **MVI over MVVM**: Better state management for complex UI flows
- **Room over raw SQLite**: Type-safe queries, compile-time verification
- **On-device ML Kit**: Privacy-compliant OCR without network calls
- **Material Design 3**: Modern Android UI guidelines

### Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Room migration complexity | Medium | Version migrations from day one, test thoroughly |
| ML Kit OCR accuracy | High | Provide manual correction UI, train user expectations |
| State management complexity | Medium | Strict MVI patterns, sealed classes for states |

---

## Phase 2: Receipt Scanning & OCR Integration 🔲 PLANNED

**Status:** Not Started  
**Timeline:** Weeks 5-8  
**Deliverable:** Working receipt scanner with text extraction

### Objectives
Implement camera-based receipt scanning with on-device OCR text extraction.

### Deliverables
- [ ] Camera permission handling
- [ ] Camera preview UI with capture button
- [ ] Image capture and storage (local file system)
- [ ] ML Kit Text Recognition integration
- [ ] Receipt image preprocessing (rotation, cropping, enhancement)
- [ ] OCR result parsing:
  - Date extraction
  - Total amount extraction
  - Merchant name extraction
  - Line items extraction (optional)
- [ ] Manual correction interface for OCR results
- [ ] Receipt image gallery/thumbnail view

### Acceptance Criteria
- [ ] Camera opens and captures images successfully
- [ ] OCR extracts text from receipt images
- [ ] Date, amount, and merchant are extracted with reasonable accuracy
- [ ] Users can manually correct OCR mistakes
- [ ] Receipt images stored locally and accessible
- [ ] Works offline (no network required for OCR)

### Technical Implementation Notes
```kotlin
// ML Kit Text Recognition setup
val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)
recognizer.process(imageBitmap)
    .addOnSuccessListener { visionText ->
        // Parse structured data from visionText.text
    }
```

### OCR Accuracy Targets
- Date extraction: ≥ 85% accuracy
- Amount extraction: ≥ 90% accuracy
- Merchant name: ≥ 70% accuracy (varies by receipt format)

### Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| Poor OCR accuracy on low-quality images | High | Image preprocessing, user guidance for photo quality |
| Varied receipt formats | High | Flexible parsing rules, manual override always available |
| ML Kit model size | Low | On-device model is ~10MB, acceptable |

---

## Phase 3: Transaction Management 🔲 PLANNED

**Status:** Not Started  
**Timeline:** Weeks 9-12  
**Deliverable:** Full CRUD operations for transactions with categorization

### Objectives
Enable users to create, view, edit, and delete transactions with proper categorization.

### Deliverables
- [ ] Transaction creation form (manual entry)
- [ ] Transaction list screen with filtering/sorting
- [ ] Transaction detail screen
- [ ] Edit transaction functionality
- [ ] Delete transaction with confirmation
- [ ] Category management:
  - Default categories pre-populated
  - Custom category creation
  - Category icons and colors
- [ ] Transaction search by date, amount, merchant, category
- [ ] Bulk operations (delete multiple, recategorize)

### Acceptance Criteria
- [ ] Users can manually create transactions
- [ ] Transactions from OCR can be edited before saving
- [ ] Transaction list displays with proper sorting (default: newest first)
- [ ] Filtering works by date range, category, amount range
- [ ] Search finds transactions by merchant name or notes
- [ ] Categories can be customized
- [ ] All CRUD operations persist to database

### UI Components
- Transaction list item: Date, merchant, amount (color-coded by type), category icon
- Transaction form: Date picker, amount input, category selector, merchant field, notes
- Category picker: Grid of icons with names

---

## Phase 4: Account & Investment Tracking 🔲 PLANNED

**Status:** Not Started  
**Timeline:** Weeks 13-16  
**Deliverable:** Multi-account support with investment tracking

### Objectives
Support multiple account types (cash, investment) and track investment holdings.

### Deliverables
- [ ] Account creation/editing:
  - Cash accounts (checking, savings, wallet)
  - Investment accounts (brokerage, retirement)
- [ ] Account balance tracking
- [ ] Investment position tracking:
  - Symbol/ticker
  - Number of shares
  - Purchase price
  - Current price (manual update or API if added later)
  - Unrealized gains/losses calculation
- [ ] Transfer between accounts
- [ ] Account summary screen

### Acceptance Criteria
- [ ] Users can create multiple accounts of different types
- [ ] Account balances update when transactions are added
- [ ] Investment positions can be added and tracked
- [ ] Unrealized gains/losses calculated correctly
- [ ] Transfers between accounts don't affect net worth
- [ ] Account summary shows total balances by type

### Data Model Considerations
```kotlin
data class Investment(
    val id: String,
    val accountId: String,
    val symbol: String,
    val shares: Double,
    val purchasePrice: Double,
    val currentPrice: Double,
    val lastUpdated: Long
)
```

---

## Phase 5: Net Worth Dashboard 🔲 PLANNED

**Status:** Not Started  
**Timeline:** Weeks 17-20  
**Deliverable:** Visual dashboard showing total net worth and trends

### Objectives
Create an intuitive dashboard displaying net worth composition and historical trends.

### Deliverables
- [ ] Net worth calculation (sum of all account balances)
- [ ] Dashboard home screen with:
  - Total net worth (large, prominent display)
  - Breakdown by account type (cash vs investments)
  - Pie chart of asset allocation
  - Recent transactions list
- [ ] Historical net worth tracking:
  - Daily/weekly/monthly snapshots
  - Line chart showing trend over time
  - Selectable time ranges (1M, 3M, 6M, 1Y, All)
- [ ] Month-over-month comparison
- [ ] Spending by category breakdown
- [ ] Income vs expense summary

### Acceptance Criteria
- [ ] Net worth calculates correctly from all accounts
- [ ] Dashboard loads quickly (< 2 seconds)
- [ ] Charts render smoothly
- [ ] Historical data persists and displays accurately
- [ ] Time range filters work correctly
- [ ] Category breakdown matches actual transactions

### Visualization Libraries
- MPAndroidChart or similar for charts
- Material Design components for cards and lists

---

## Phase 6: Budgeting & Financial Insights 🔲 PLANNED

**Status:** Not Started  
**Timeline:** Weeks 21-24  
**Deliverable:** Optional budgeting features and spending insights

### Objectives
Add optional budgeting capabilities and automated financial insights.

### Deliverables
- [ ] Monthly budget setup:
  - Total monthly budget
  - Per-category budgets
- [ ] Budget progress tracking:
  - Visual progress bars per category
  - Over-budget warnings (informational only)
  - Remaining budget display
- [ ] Spending insights:
  - "You've spent X% more than last month"
  - Top spending categories
  - Unusual spending detection
- [ ] Savings goals (optional):
  - Goal name and target amount
  - Progress tracking
  - Target date

### Acceptance Criteria
- [ ] Users can set monthly budgets (optional feature)
- [ ] Budget progress updates in real-time as transactions are added
- [ ] Insights are accurate and helpful
- [ ] Over-budget indicators are clear but non-blocking
- [ ] Savings goals track progress correctly

### Design Principle
Budgeting remains optional - app works fully without it. Insights are informational, not prescriptive.

---

## Phase 7: Polish & Performance Optimization 🔲 PLANNED

**Status:** Not Started  
**Timeline:** Weeks 25-28  
**Deliverable:** Production-ready app with refined UX and performance

### Objectives
Refine user experience, optimize performance, and prepare for production release.

### Deliverables
- [ ] UI polish:
  - Consistent spacing and typography
  - Smooth animations and transitions
  - Dark mode support
  - Accessibility improvements (content descriptions, contrast ratios)
- [ ] Performance optimization:
  - Database query optimization
  - Image compression for receipts
  - Lazy loading for large lists
  - Memory usage profiling
- [ ] Error handling:
  - Graceful error messages
  - Retry mechanisms for failed operations
  - Crash reporting (optional, opt-in)
- [ ] Onboarding flow:
  - Welcome screens explaining app philosophy
  - Tutorial for first-time users
  - Sample data option
- [ ] Settings screen:
  - Currency selection
  - Date format preferences
  - Export data option
  - Backup/restore (local file)

### Acceptance Criteria
- [ ] App runs smoothly on minimum spec devices (SDK 28)
- [ ] No ANRs (Application Not Responding) errors
- [ ] Memory usage stays under 100MB typical usage
- [ ] All screens accessible via TalkBack
- [ ] Dark mode works throughout app
- [ ] Onboarding completes in < 2 minutes

---

## Phase 8: Testing & Quality Assurance 🔲 PLANNED

**Status:** Not Started  
**Timeline:** Weeks 29-32  
**Deliverable:** Comprehensive test coverage and bug fixes

### Objectives
Ensure app reliability through thorough testing across device configurations.

### Deliverables
- [ ] Unit tests:
  - Domain logic (use cases, models)
  - Repository implementations
  - Utility functions
- [ ] Integration tests:
  - Database operations
  - OCR processing pipeline
  - Navigation flows
- [ ] UI tests:
  - Critical user journeys
  - Screen rendering
  - User interactions
- [ ] Device testing:
  - Multiple screen sizes (phone, tablet)
  - Different Android versions (28-36)
  - Various manufacturers (Samsung, Pixel, OnePlus, etc.)
- [ ] Performance testing:
  - Load testing with 1000+ transactions
  - Battery usage profiling
  - Storage usage monitoring
- [ ] Security review:
  - Data encryption at rest (if sensitive)
  - Permission minimization
  - No unnecessary network calls

### Acceptance Criteria
- [ ] Unit test coverage ≥ 70% for domain layer
- [ ] All critical paths have UI tests
- [ ] App tested on ≥ 5 different devices
- [ ] No critical or high-severity bugs remaining
- [ ] Performance meets targets on minimum spec devices

### Test Tools
- JUnit 5 for unit tests
- Mockito for mocking
- Espresso for UI tests
- LeakCanary for memory leak detection

---

## Phase 9: Production Release 🔲 PLANNED

**Status:** Not Started  
**Timeline:** Weeks 33-36  
**Deliverable:** App published on Google Play Store

### Objectives
Prepare and submit app for public release on Google Play Store.

### Deliverables
- [ ] Google Play Console setup
- [ ] App signing key generation and secure storage
- [ ] Release build configuration:
  - ProGuard/R8 rules
  - Version code/name management
  - Build variants (debug, release)
- [ ] Store listing preparation:
  - App title and description
  - Screenshots (phone and tablet)
  - Feature graphic
  - Privacy policy
  - Content rating questionnaire
- [ ] Beta testing:
  - Internal testing track
  - Closed testing with 10-20 users
  - Feedback collection and iteration
- [ ] Production submission
- [ ] Post-launch monitoring:
  - Crash reports
  - User reviews
  - Analytics (if added, opt-in only)

### Acceptance Criteria
- [ ] App approved by Google Play review
- [ ] App available for download publicly
- [ ] Crash-free rate > 99% in first week
- [ ] User rating ≥ 4.0 stars
- [ ] Privacy policy compliant with regulations

### Build Configuration
```kotlin
// app/build.gradle.kts
android {
    defaultConfig {
        versionCode = 1
        versionName = "1.0.0"
    }
    
    buildTypes {
        release {
            isMinifyEnabled = true
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
        }
    }
}
```

### Version Management
- `versionCode`: Integer, must increment with each release
- `versionName`: Semantic versioning (e.g., "1.0.0")

---

## Quality Assurance Strategy

### Testing Pyramid
```
        /\
       /  \  E2E/UI Tests (Espresso)
      /----\
     /      \  Integration Tests
    /--------\
   /          \  Unit Tests (JUnit)
  /------------\
```

### Test Coverage Targets
- **Unit Tests**: ≥ 70% coverage for domain and data layers
- **Integration Tests**: All repository methods tested
- **UI Tests**: All critical user journeys covered

### Manual Testing Checklist
Before each release:
- [ ] Install fresh on clean device
- [ ] Complete onboarding flow
- [ ] Add 10+ transactions via OCR
- [ ] Add 5+ transactions manually
- [ ] Create/edit/delete accounts
- [ ] View dashboard with data
- [ ] Test all navigation paths
- [ ] Verify dark mode
- [ ] Test on minimum SDK device
- [ ] Check battery usage
- [ ] Verify offline functionality

---

## Risk Management

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| ML Kit OCR accuracy varies by receipt | High | High | Manual correction UI, user education on photo quality |
| Room database corruption | Low | High | Regular backups, migration testing, error recovery |
| Performance degradation with large datasets | Medium | Medium | Pagination, indexing, query optimization |
| Android fragmentation | High | Low | Test on multiple devices, responsive layouts |
| ML Kit model compatibility | Low | Medium | Pin ML Kit version, test on min SDK |

### Business Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Low user adoption | Medium | High | Clear value proposition, privacy messaging |
| Competitor with better OCR | High | Medium | Focus on privacy advantage, continuous improvement |
| App store rejection | Low | High | Follow guidelines, pre-submission checklist |
| Negative reviews due to OCR errors | Medium | Medium | Set expectations, provide easy correction flow |

---

## Success Metrics

### Phase 3 (Transaction Management)
- OCR accuracy: ≥ 85% for amounts, ≥ 80% for dates
- Manual correction time: < 30 seconds per transaction
- User can add transaction in < 1 minute (OCR + correction)

### Phase 5 (Dashboard)
- Dashboard load time: < 2 seconds
- Chart rendering: < 500ms
- User can understand net worth at a glance

### Phase 9 (Production Release)
- App approved and live on Google Play Store
- ≥ 100 downloads in first month
- Crash-free rate > 99%
- User rating ≥ 4.0 stars
- Retention at 30 days ≥ 30%

---

## Resource Requirements

### Development Team
- 1 Android developer (Kotlin expertise)
- Optional: 1 QA tester for device testing
- Optional: 1 UI/UX designer for polish phase

### Infrastructure
- Google Play Console account ($25 one-time fee)
- GitHub Pages or similar for privacy policy
- Physical test devices (≥ 3 different models)
- Android Emulators for additional testing

### Third-Party Services
- **None required** (privacy-first principle)
- Optional: Firebase Crashlytics (opt-in only, anonymized)
- Optional: Google Play Billing (if monetization added later)

---

## Timeline Overview

```
Weeks 1-4:   Phase 1 - Foundation & Core Infrastructure
Weeks 5-8:   Phase 2 - Receipt Scanning & OCR Integration
Weeks 9-12:  Phase 3 - Transaction Management
Weeks 13-16: Phase 4 - Account & Investment Tracking
Weeks 17-20: Phase 5 - Net Worth Dashboard
Weeks 21-24: Phase 6 - Budgeting & Financial Insights
Weeks 25-28: Phase 7 - Polish & Performance Optimization
Weeks 29-32: Phase 8 - Testing & Quality Assurance
Weeks 33-36: Phase 9 - Production Release
```

**Total Estimated Timeline:** 36 weeks (~9 months)

---

## Change Log

| Date | Version | Changes |
|------|---------|---------|
| 2026-07-13 | 1.0.0 | Initial SDLC document creation based on actual project structure |

---

## Appendix A: Build Commands

### Debug Build
```bash
./gradlew assembleDebug
```

### Release Build
```bash
./gradlew assembleRelease
```

### Run on Device
```bash
./gradlew installDebug
```

### Clean Build
```bash
./gradlew clean
```

### Run Tests
```bash
./gradlew test
./gradlew connectedAndroidTest
```

---

## Appendix B: File Locations

| Purpose | Location |
|---------|----------|
| Domain models | `app/src/main/java/com/kenali/ontrek/domain/model/` |
| Use cases | `app/src/main/java/com/kenali/ontrek/domain/usecase/` |
| Repository interfaces | `app/src/main/java/com/kenali/ontrek/data/repository/` |
| Room entities/DAOs | `app/src/main/java/com/kenali/ontrek/data/local/` |
| ViewModels | `app/src/main/java/com/kenali/ontrek/ui/viewmodel/` |
| Screens (Composables) | `app/src/main/java/com/kenali/ontrek/ui/screens/` |
| OCR service | `app/src/main/java/com/kenali/ontrek/core/ocr/` |
| Tests | `app/src/test/` and `app/src/androidTest/` |
| Database migrations | `app/src/main/java/com/kenali/ontrek/data/local/migrations/` |
| App config | `app/build.gradle.kts` |
| Manifest | `app/src/main/AndroidManifest.xml` |

---

## Appendix C: Glossary

- **MVI (Model-View-Intent)**: Architecture pattern where UI emits intents, ViewModel processes them and emits states, View renders states
- **OCR (Optical Character Recognition)**: Technology to extract text from images
- **ML Kit**: Google's on-device machine learning library
- **Room**: Android's SQLite abstraction layer providing compile-time verified SQL queries
- **Net Worth**: Total assets minus total liabilities (in this app: sum of all account balances)
- **On-device processing**: All computation happens on the user's device, no data sent to servers

---

*This document follows industry-standard SDLC documentation practices including phased delivery, clear acceptance criteria, risk management, and success metrics. It reflects the actual native Android Kotlin project structure.*
