# GAME DESIGN DOCUMENT: THAYAM (Ancient Strategy Reborn)

**Version:** 1.0.0  
**Genre:** Competitive Tactical Strategy Board Game  
**Theme:** Ancient Tamil Cyber Fantasy ("Ancient Tamil Civilization meets Cyberpunk AAA Esports Arena")  
**Target Audience:** Strategy game players, board game enthusiasts, competitive esports players  

---

## 1. VISION & DESIGN PRINCIPLES

### 1.1 Core Concept
**Thayam** is a modernization of the ancient Tamil board game *Dayakattai*, reimagined as an esports-grade digital strategy experience. The game fuses the strategic depth and probability-based tactical movement of the traditional game with a high-fidelity visual aesthetic inspired by ancient Dravidian temples, cybernetic neon accents, and futuristic data dashboards.

### 1.2 Design Pillars
*   **Cultural Fusion:** Fusing ancient Tamil iconography, sacred geometry, and brass artifacts with cyberpunk hologram panels, neon lighting, and high-tech UI grids.
*   **Tactical Probability:** Maximizing agency over random elements (dice rolls) by allowing players to stack rolls and distribute them across multiple pieces.
*   **Esports Dashboard:** Emphasizing information design, real-time analytics overlays (win probabilities, heatmaps, and move suggestions), and dynamic visual effects.

---

## 2. GAMEPLAY MECHANICS & CORE LOOP

### 2.1 The Core Loop
```
[ Roll Cowrie Shells ]
          │
          ▼
[ Evaluate Move Options ] ──(AI Suggestions & Path Previews)
          │
          ▼
[ Execute Movements ] ──(Calculate Blocks, Safe Zones & Captures)
          │
          ▼
[ Check Bonus Turns ] ──(If 1 or 4 rolled, or an opponent is cut)
          │
          ▼
[ Victory Check / Turn Handover ]
```

### 2.2 Board Configuration (5x5 Grid)
The game board is a 5x5 grid. Cells are defined by coordinate tuples `(row, col)` from `(0,0)` to `(4,4)`:
*   **Center Goal (HOME):** `(2,2)` is the final cell that all pieces must reach.
*   **Safe Zones:** Designated cells where pieces are immune to capture:
  *   `(4, 2)` - Bottom Edge Middle (Player 1 Start/Entry Zone)
  *   `(2, 0)` - Left Edge Middle (Player 2 Start/Entry Zone)
  *   `(0, 2)` - Top Edge Middle (Player 3 Start/Entry Zone)
  *   `(2, 4)` - Right Edge Middle (Player 4 Start/Entry Zone)
  *   `(2, 2)` - Center (Goal Zone)

### 2.3 The Path System
Each player starts off-board at their Base. When they roll a **1 (Thayam)**, they can spawn a piece onto the board at their respective start cell. From there, the piece follows a specific, clockwise path of **25 steps** (including the Goal):

1.  **Outer Track (Steps 0 - 15):** The piece travels clockwise around the perimeter of the 5x5 grid (16 outer cells).
2.  **Inner Track (Steps 16 - 23):** The piece spirals inward, traveling clockwise around the 8 cells surrounding the center.
3.  **Goal (Step 24):** The piece moves into the center `(2,2)` home.

#### Player Path Details (Rotating Entrance):
*   **Player 1 (Red):**
    *   *Start:* `(4, 2)` -> moves left: `(4,1) -> (4,0) -> (3,0) -> (2,0) -> (1,0) -> (0,0) -> (0,1) -> (0,2) -> (0,3) -> (0,4) -> (1,4) -> (2,4) -> (3,4) -> (4,4) -> (4,3)` (Outer Ring)
    *   *Inner Ring Entry:* `(3,3) -> (3,2) -> (3,1) -> (2,1) -> (1,1) -> (1,2) -> (1,3) -> (2,3)`
    *   *Goal:* `(2,2)`
*   **Player 2 (Blue), Player 3 (Green), Player 4 (Yellow):** Paths are symmetrically rotated by 90, 180, and 270 degrees respectively, ensuring each player enters from their home quadrant and circles the board.

---

## 3. GAME RULES & LOGIC

### 3.1 Dice Roll Probability (4 Cowrie Shells)
The game uses 4 cowrie shells thrown simultaneously. Each shell lands either **Open (mouth up)** or **Closed (mouth down)**.

| Open Shells | Closed Shells | Result Name | Score (Steps) | Extra Turn? | Probability |
| :---: | :---: | :---: | :---: | :---: | :---: |
| 1 | 3 | **Thayam (1)** | **1** | **Yes** | 4/16 (25%) |
| 2 | 2 | **2** | **2** | No | 6/16 (37.5%) |
| 3 | 1 | **3** | **3** | No | 4/16 (25%) |
| 4 | 0 | **4** | **4** | **Yes** | 1/16 (6.25%) |
| 0 | 4 | **Ettu (8)** | **8** | No | 1/16 (6.25%) |

#### Rule Exceptions & Stacking:
*   If a player rolls **1** or **4**, they append the roll value to their turn's **Roll Stack** and roll again.
*   Once a non-extra roll is thrown (2, 3, or 8), their rolling phase ends.
*   They must then distribute all the values in their Roll Stack across their pieces (e.g. if they rolled `[1, 4, 3]`, they can move one piece by 1, another by 4, and a third by 3, or combine them).

### 3.2 Spawning Pieces
*   A piece starts in the off-board base (inactive).
*   A player can only move a piece from their base to their starting cell (Step 0) by using a **1 (Thayam)** roll.

### 3.3 Capture (Cutting) Logic
*   If a piece finishes a movement segment exactly on a cell containing an opponent's piece, the opponent's piece is **cut** (sent back to base).
*   **Immunity:** Pieces located on **Safe Zones (X)** cannot be cut.
*   **Reward:** Successfully cutting an enemy piece grants the player an **extra turn** after their current turn's movements are fully resolved.

### 3.4 Defensive Block System (Wall)
*   When a player has **two or more friendly pieces** on the same cell, they form a **Blockade (Wall)**.
*   No opponent piece can pass *through* or land *on* a blockade cell.
*   This blockade is broken only if the occupying player moves one of their pieces off the cell, or if they are forced to do so. Friendly pieces can pass through their own blockades freely.

### 3.5 Winning Condition
*   The first player to move all **4 pieces** exactly into the **Goal (HOME)** wins the match.
*   Movements into the Goal must be by exact count.

---

## 4. ART & USER INTERFACE SPECIFICATION

### 4.1 UI Style Guide
*   **Background:** Deep obsidian blue (`#0B0F1A`)
*   **Panels:** Sleek metallic charcoal (`#111827`)
*   **Ornaments:** Gilded temple gold (`#F5B041`)
*   **Primary Accent:** Cyberpunk cobalt (`#00C2FF`)
*   **Warning Glow:** Ember orange (`#FF6B00`)
*   **Victory/Success:** Jade emerald (`#10B981`)
*   **Typography:**
    *   *Titles:* `Cinzel` (ancient, serif, authoritative)
    *   *UI Labels & Numbers:* `Orbitron` (futuristic, techno)
    *   *Body text:* `Inter` (neutral, high legibility)

### 4.2 HUD Layout (Tactical Esports Dashboard)
1.  **Top Navigation:** Translucent bar with links, quick statistics (players online, live games), and "Play Browser Client" CTA.
2.  **Left Sidebar (Tactical Squad Info):** Detailed status indicators for each player (Active indicators, pieces remaining at base, active board coordinates, finished pieces, and custom name tags).
3.  **Center Board Canvas:**
    *   Sleek metal-brushed 5x5 board with glowing gold coordinates.
    *   Animated paths that light up when hovering over eligible tokens.
    *   Interactive cowrie thrower panel in the center of the UI, displaying simulated 3D spinning shells.
4.  **Right Sidebar (Esports Analytics & Console):**
    *   **AI Move Advisor:** Renders live win percentage bars and highlights the recommended move coordinates.
    *   **Rolls Stack Queue:** Displays pending moves (e.g. `[Thayam (1), 4, 3]`).
    *   **Action Log:** Chronological feed of match activities.
    *   **Emote Wheel:** Allows triggers for quick animations.

---

## 5. SYSTEM ARCHITECTURE & IMPLEMENTATION STACK

### 5.1 Technology Stack
*   **Frontend:** React, Vite, TypeScript
*   **Styling:** TailwindCSS, Custom CSS Keyframes
*   **Sound FX:** Web Audio API synthesizer (`src/utils/audio.ts`)
*   **State Management:** React Context + Custom Hooks
*   **Deployment:** Vercel (for instant global CDN distribution)
