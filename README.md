# 🛰️ Zumap – The Cartography of Community Power

Zumap is a local-first, browser-based AR map for the Zuitzerland community. It lets you drop geolocated messages, images, or PDFs — and collect them via map or AR overlay. 

In a world where maps are controlled and monetized by corporate empires, Zumap reclaims the ground beneath our feet. It uses open-source, censorship-resistant cartography, empowering people to not only read the map — but to write it.

---

## 🧬 Core Purpose
Zumap acts as the shared memory of Zuitzerland, letting participants:
- Leave encrypted messages, AR Easter eggs, or data drops anywhere in physical space
- Attach images, PDFs, or text to real-world coordinates
- Trigger raffles, community events, and lore-driven scavenger hunts
- Access secrets only when physically present at the right coordinates — a Web3-enabled geocache

All of this happens without centralized control, logins, or tracking. Access is gated by presence in the Zuitzerland VPN mesh, turning cyberspace into a private, augmented layer atop physical reality.

---

## 🌐 Infrastructure & Values
Zumap is built to uphold the sovereign ideals of the Zuitzerland community:

- 🗺️ **Open Map Stack:** Uses Leaflet.js and OpenStreetMap tiles for open, censorship-resistant mapping.
- 🧠 **No Surveillance:** No logins, no Google APIs. Identity is presence, not paperwork.
- 📦 **Codex.Storage Integration:** Content can be pinned to codex.storage (IPFS-based), ensuring drops are permanent, uncensorable, and interoperable with decentralized protocols.
- 📍 **Geo-anchored Content:** Drops are only visible through AR when you're physically present.
- 🎭 **Community Lore:** Raffles, quests, hidden files — anyone can place, everyone can hunt. Shared, anonymous culture rooted in real ground.

---

## 🌐 Use Cases
- 🎉 Flash raffles at gatherings
- 🧩 Hide encrypted files or puzzles
- 📖 Decentralized education: PDFs, essays, or local lore left in public AR locations
- 🎥 IRL short films or audio, triggered on-location
- 🎁 Hackathon bounties dropped at specific sites

---

## 🛠️ Powered by…
- 🌐 **Leaflet.js** – Open map stack, OSM tiles (MapLibre planned)
- 🧩 **A-Frame + AR.js** – Browser-based AR with geolocation
- 🔥 **Firebase** – Real-time database (for MVP, can migrate later)
- 📦 **Codex.Storage** – IPFS storage for decentralized file permanence
- 🧬 **Zuitzerland VPN** – The only "login" is presence in the mesh

---

## 🚀 Getting Started
1. **Install dependencies:** `npm install`
2. **Start dev server:** `npm run dev`
3. **Open in your mobile browser** (or desktop for testing)

### .env Example (for Firebase):
```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_DATABASE_URL=...
```

---

## 📁 Structure
- `/src/components` — UI components
- `/src/utils` — Data layer, Codex, helpers

---

## 🛡️ Why it Matters
Zumap is cartographic autonomy — a living map of intent, encoded by the network state and legible only to those within it. There is no central authority to approve, censor, or rewrite the terrain. 

Welcome to Zuitzerland’s spatial substrate.
Welcome to Zumap.
