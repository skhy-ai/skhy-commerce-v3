# Mission Architect: Technical Guide

The **Mission Architect** is a state-driven wizard for planning industrial drone missions. It was recently reworked to decouple simulation physics from the shopping cart and to provide a "Phase-Locked" workflow.

## 🏗 State Architecture

### `MissionStateContext`
The core state management resides in `src/contexts/MissionStateContext.tsx`. This context tracks:
- **Platform Configuration**: Real-time selections for Frames, Motors, Batteries, Cameras, and Edge Devices across three platforms (Multirotor, Fixed-Wing, Rover).
- **Completion Tracking**: A `completedPhases` object that tracks which stages of the mission have been "Committed."

### Decoupling from `CartContext`
Previously, selections were added to the cart immediately, making the cart the "source of truth" for the simulation. 
**Now**: Selections live entirely in `MissionStateContext` until the user explicitly clicks **"Commit to Mission."** This prevents the cart from being cluttered during the experimentation phase.

---

## 🔄 Workflow & Phase Control

### The "Commit" Flow
When a user completes a simulation phase (e.g., Heavy Lift Design):
1. The user clicks **"Commit Configuration."**
2. The current BOM (Bill of Materials) is calculated and added to the `CartContext`.
3. The phase is marked as complete in `MissionStateContext`.
4. **UI Impact**: The simulator sidebar for that phase becomes "Locked" (read-only), preventing accidental changes that would drift from the cart state.

### The "Unlock / Edit" Flow
If a user needs to modify a previously committed phase:
1. They click **"Unlock Phase."**
2. The system automatically **purges** the specific items for that phase from the `CartContext`.
3. The UI sidebar is unlocked for editing.
4. This ensures that the cart always matches the latest *committed* simulation design.

---

## 🚀 Platform Specifics

### 1. Multirotor (Heavy Lift)
- **Hook**: `useHeavyLiftSimulation.ts`
- **Logic**: Physics-driven thrust-to-weight and endurance calculations based on motor efficiency and battery Wh.
- **Integration**: Uses `parseProductSpecs.ts` to extract real specs from Marketplace products.

### 2. Fixed-Wing
- **Hook**: `useFixedWingSimulation.ts`
- **Logic**: Aerodynamic range mapping and cruise efficiency. 
- **Navigation**: Integrated with the `MissionArchitect` step controller to handle specific Fixed-Wing positioning results.

### 3. Rover
- **Component**: `RoverSimulator.tsx`
- **Logic**: Ground-based navigation and mission planning. Uses `ROVER_CORE_SYSTEM` data for edge compute simulations.

---

## 🛠 Integration with Marketplace

The Mission Architect is powered by the **Marketplace Cache** (`src/data/cachedMarketplace.ts`). 
- It fetches all products where `is_active=true` using the `service_role` key during build.
- This allows the simulator to offer "Technical Only" products that might be hidden from the public storefront.
