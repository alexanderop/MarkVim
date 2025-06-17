## Refactoring Plan: From Composables to a Modular Monolith

The current architecture effectively uses Vue composables (`useDocuments`, `useColorTheme`, etc.) to encapsulate logic and state, primarily persisting data with `useLocalStorage`. This is a good starting point.

The goal of this refactor is to evolve this into a more robust and scalable pattern by introducing Pinia as the official state management layer. This will give us:
* **True Encapsulation:** A clear separation between private state and the public API.
* **Centralized State:** Better devtools integration and a single source of truth for module state.
* **Clearer Dependencies:** Modules will explicitly depend on the public API of other modules, not their implementation details.

---

### **Step 1: Refactor the `documents` Module to a Pinia Store**

This is the most significant piece of state. We'll start here to establish the pattern.

#### **Action Plan:**
1.  **Create a Pinia Store:** Create a new file at `src/modules/documents/store.ts`. This file will house both the private and public stores for the `documents` module.
2.  **Define the Private Store:** Inside `store.ts`, create a non-exported `_useDocumentsInternalStore`. This store will manage the raw, mutable state currently handled by `useLocalStorage` in `useDocuments.ts`.
3.  **Define the Public Store:** Create the exported `useDocumentsStore`. This store will be the module's public-facing API. It will instantiate the internal store and expose a curated set of `computed` properties (getters) and functions (actions).
4.  **Migrate Logic:** Move all the business logic (creating, updating, deleting documents) from `composables/useDocuments.ts` into the `useDocumentsStore`. Actions in the public store will be the *only* functions that can mutate the private store's state.
5.  **Update Consumers:** Replace all usages of the old `useDocuments()` composable with the new `useDocumentsStore()` store across the application (e.g., in `AppShell.vue`, `DocumentList.vue`, `useDocumentDeletion.ts`).
6.  **Cleanup:** Once all references are updated, delete the old file `src/modules/documents/composables/useDocuments.ts`.

#### **🤖 AI Prompt for Step 1**
> I want to refactor my Nuxt 3 application to use Pinia for state management, following a "Modular Monolith" architecture with a private state pattern. Please perform the following actions for the `documents` module.
>
> 1.  **Create a new Pinia store file** at `src/modules/documents/store.ts`.
> 2.  **Analyze the existing composable** in `src/modules/documents/composables/useDocuments.ts`.
> 3.  **Implement the private state pattern in `store.ts`**:
>     * Create a non-exported `_useDocumentsInternalStore` (`id: 'documents-internal'`).
>     * Move the reactive state from `useDocuments.ts` into this internal store. This includes the `documentsStorage` (`useLocalStorage`) and `activeDocumentId` (`useLocalStorage`). Rename them to `_documents` and `_activeDocumentId` respectively. Return them from the store's setup function.
>     * Create an exported `useDocumentsStore` (`id: 'documents'`). Inside it, get an instance of the internal store.
> 4.  **Migrate Logic to the Public Store**:
>     * Re-implement the `computed` properties (`documents`, `activeDocument`) and all functions (`createDocument`, `setActiveDocument`, `updateDocument`, `deleteDocument`, `getDocumentTitle`) from `useDocuments.ts` into `useDocumentsStore`.
>     * Actions in the public store must mutate the state of the internal store.
>     * Ensure the `onDataReset` logic is also moved into the public store's setup function.
> 5.  **Expose the Public API**: The `useDocumentsStore` should return *only* its public computed properties and actions. Do not expose the internal store instance.
> 6.  **Update All Consumers**:
>     * Refactor `src/app/AppShell.vue` to use `useDocumentsStore` instead of `useDocuments`.
>     * Refactor `src/modules/documents/composables/useDocumentDeletion.ts` to use `useDocumentsStore`.
>     * Check `src/modules/documents/components/DocumentList.vue` and update it if it uses the composable directly.
> 7.  **Cleanup**: After verifying the application works, delete the old `src/modules/documents/composables/useDocuments.ts` file.

---

### **Step 2: Refactor the `colorTheme` Module**

Next, we'll apply the same pattern to the color theme, which has app-wide effects.

#### **Action Plan:**
1.  **Create Store:** Create `src/modules/color-theme/store.ts`.
2.  **Implement Stores:** Define `_useColorThemeInternalStore` to hold the `theme` ref from `useLocalStorage` and the public `useColorThemeStore`.
3.  **Migrate Logic:**
    * The public store will expose the `theme` as a `readonly` computed property.
    * Actions like `updateColor`, `resetToDefaults`, `exportTheme`, and `importTheme` will be moved to the public store.
    * The crucial `watchEffect` that updates the global CSS variables will reside within the setup function of the public store, ensuring it runs when the store is initialized.
4.  **Update Consumers:** Refactor `ColorThemeModal.vue` and any other component using `useColorTheme` to use the new `useColorThemeStore`.
5.  **Cleanup:** Delete `src/modules/color-theme/composables/useColorTheme.ts`.

#### **🤖 AI Prompt for Step 2**
> Now, let's apply the same Pinia private state pattern to the `colorTheme` module.
>
> 1.  **Create the store file**: `src/modules/color-theme/store.ts`.
> 2.  **Analyze the existing composable**: `src/modules/color-theme/composables/useColorTheme.ts`.
> 3.  **Implement the private/public store pattern**:
>     * Internal store `_useColorThemeInternalStore` (`id: 'color-theme-internal'`) will hold the `theme` state from `useLocalStorage`.
>     * Public store `useColorThemeStore` (`id: 'color-theme'`).
> 4.  **Migrate Logic**:
>     * In the public store, expose a `readonly` computed property for the `theme`.
>     * Move all actions (`updateColor`, `resetToDefaults`, `exportTheme`, `importTheme`) and the `oklchToString` helper function to the public store.
>     * The `watchEffect` that updates all CSS variables must be placed inside the setup function of the `useColorThemeStore`.
> 5.  **Update Consumers**: Refactor `src/modules/color-theme/components/ColorThemeModal.vue` to use `useColorThemeStore` instead of `useColorTheme`.
> 6.  **Cleanup**: Once complete, delete `src/modules/color-theme/composables/useColorTheme.ts`.

---

### **Step 3: Refactor Other Core Composables**

Apply the established pattern to other core state management composables.

#### **Action Plan:**
1.  **Refactor `useEditorSettings`:** Create `src/modules/editor/store.ts` and migrate the logic from `composables/useEditorSettings.ts`. Update consumers like `AppShell.vue` and `SettingsModal.vue`.
2.  **Refactor `useViewMode`:** Create `src/modules/layout/store.ts` (as view mode is a layout concern) and migrate logic from `composables/useViewMode.ts`. Update consumers.
3.  **Continue for others:** Repeat for `useResizablePanes`, `useShortcuts`, etc., creating stores within the most appropriate module directory.

#### **🤖 AI Prompt for Step 3**
> Please continue the refactoring for `useEditorSettings` and `useViewMode`.
>
> 1.  **For `useEditorSettings`**:
>     * Create `src/modules/editor/store.ts`.
>     * Migrate logic from `src/modules/editor/composables/useEditorSettings.ts` into a new `useEditorSettingsStore` using the private state pattern.
>     * Update `AppShell.vue`, `MarkdownEditor.vue`, and `SettingsModal.vue` to use the new store.
>     * Delete the old composable.
>
> 2.  **For `useViewMode`**:
>     * Create a new store file at `src/modules/layout/store.ts`.
>     * Migrate the logic from `src/modules/layout/composables/useViewMode.ts` into a `useViewModeStore` using the private state pattern.
>     * Update `AppShell.vue` and any other consumers.
>     * Delete the old composable.

---

### **Step 4: Introduce the Event Bus for Decoupled Communication**

To fully implement the architecture, we need to add the asynchronous communication pattern.

#### **Action Plan:**
1.  **Create the Event Bus:** Create the file `src/shared/utils/eventBus.ts` using `@vueuse/core`'s `useEventBus` to define and export a typed, global event bus.
2.  **Identify an Event:** The `deleteDocument` action is a perfect candidate. The `documents` module's job is to delete the document and announce that it happened. It should not be responsible for showing a UI notification.
3.  **Emit the Event:** In the `documents` store, after a document is deleted, emit a `document:deleted` event with the relevant data.
4.  **Listen for the Event:** Create a new, simple `notifications` module (`src/modules/notifications/store.ts`). This store's only job is to listen for application-wide events (like `document:deleted`) and trigger UI feedback (like a toast notification).
5.  **Activate the Listener:** Ensure the `useNotificationsStore` is initialized in `AppShell.vue` so that it's active and listening for events.

#### **🤖 AI Prompt for Step 4**
> Now, let's implement an event bus for decoupled communication between modules.
>
> 1.  **Create the Event Bus**:
>     * Create a file at `src/shared/utils/eventBus.ts`.
>     * Inside, use `@vueuse/core`'s `useEventBus` to define and export a typed event bus named `AppEvents`.
>     * Define a type for the `document:deleted` event payload: `export type DocumentDeletedPayload = { deletedId: string; documentTitle: string; };`.
> 2.  **Emit Event on Deletion**:
>     * In the `documents` Pinia store (`src/modules/documents/store.ts`), modify the `deleteDocument` action.
>     * After deleting a document, import `AppEvents` and emit a `'document:deleted'` event with the deleted document's ID and title.
> 3.  **Create a Notification Listener**:
>     * Create a new module `src/modules/notifications/` with a store file `store.ts`.
>     * Define a `useNotificationsStore` (`id: 'notifications'`). In its setup function, listen for the `AppEvents` `'document:deleted'` event.
>     * For this task, simply `console.log` a confirmation message like: `console.log('Document deleted via event bus:', payload.documentTitle)`.
> 4.  **Activate the Listener**: In `src/app/AppShell.vue`, import and call `useNotificationsStore()` in the setup script to ensure the notification listener is running.