This plan outlines the evolution of "Vettooth" into a modular, TypeScript-based SaaS. We will adopt a "Strangler Fig" pattern: building new features in the new architecture (`src/modules`) while keeping the existing app running until replaced.

## Phase 1: Foundation & Architecture (TypeScript & Structure)
**Goal:** Prepare the codebase for scalable development without breaking the current build.
1.  **TypeScript Setup:** Add `typescript`, `@types/react`, `@types/node` and configure `tsconfig.json`.
2.  **Directory Structure:** Create the new modular layout:
    *   `src/modules/` (Feature-based: Auth, Patient, Attendance, Inventory, Finance)
    *   `src/domain/` (Pure business logic & interfaces)
    *   `src/shared/` (Reusable UI components like Tables, Modals, Form inputs)
3.  **Core Domain Types:** Define the interfaces provided (`Patient`, `Owner`, `Property`, `Attendance`, `InventoryItem`, etc.) in `src/domain/types.ts`.
4.  **State Management (Mock Backend):** Create a `GlobalStore` or specific contexts (`PatientContext`, `InventoryContext`) to simulate the database relationships and persistence (using LocalStorage for persistence across reloads).

## Phase 2: Registration Module (Patient/Owner/Property)
**Goal:** Implement the complex relational registration flow.
1.  **Smart Forms:** Create a unified registration wizard:
    *   **Step 1: Owner (Tutor):** Search existing or create new.
    *   **Step 2: Property:** If Owner selected, show linked properties or create new (Required for Horses).
    *   **Step 3: Patient:** Link to Owner + Property.
2.  **Autocomplete Component:** Implement a reusable generic Autocomplete component for searching Owners/Patients.
3.  **Validation:** Ensure no duplicate patients for the same owner.

## Phase 3: Inventory Evolution (Units & Fractions)
**Goal:** Support consumable tracking for the Attendance flow.
1.  **Refactor Inventory:** Update the data model to support `unit` (ml, un, frasco).
2.  **Consumption Logic:** Create a domain function `calculateConsumption(stockItem, amountUsed)` to handle validations (e.g., ensuring you can't use 150ml if only 100ml remains).

## Phase 4: Attendance Flow (The Core)
**Goal:** Connect Patients, Clinical Data, and Stock.
1.  **New Attendance Page:**
    *   **Entry:** Select Patient (Autocomplete).
    *   **Clinical Form:** Anamnesis, Vitals, Exam request.
    *   **Prescription/Consumption:** "Add Item from Stock" button. Select item -> Input quantity (e.g., "20ml" of Dipyrone).
2.  **The "Finish" Transaction:** Implement the `finishAttendance()` service method:
    *   **Action A:** Update Attendance status to 'finished'.
    *   **Action B:** Deduct used items from Inventory (decrement stock).
    *   **Action C:** Generate a `Receivable` entry in Finance module (Service Fee + Consumed Materials).

## Phase 5: Finance & Dashboard Integration
**Goal:** Close the loop (Medical -> Financial).
1.  **Receivables View:** A list of pending payments generated from Attendances.
2.  **Cashier Action:** "Mark as Paid" button (Receptionist role).
3.  **Dashboard Update:** Update the main dashboard metrics to reflect real data from our new stores.

## Phase 6: RBAC (Role-Based Access Control)
**Goal:** Security and User Roles.
1.  **Auth Context:** Simulate login for `Vet`, `Secretary`, `Admin`.
2.  **Route Guards:** Protect specific routes (e.g., only Vets can see "My Attendances", only Admin can edit Stock).
3.  **Sidebar Logic:** Dynamically render menu items based on the active role.

## Execution Strategy
I will start by setting up TypeScript and the core types (Phase 1), effectively "installing" the new engine alongside the old one. Then I will build the Registration module (Phase 2) as the first strict-typed feature.
