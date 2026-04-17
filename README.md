<div align="center">
  <a href="https://github.com/yourusername/wandii">
    <img src="https://via.placeholder.com/1000x300/1B1F23/FFFFFF?text=Wandii+-+Your+Ultimate+Travel+Companion+(Insert+Banner+Here)" alt="Wandii Banner" width="100%">
  </a>

  <h3 align="center">Wandii</h3>

  <p align="center">
    A full-stack, collaborative travel application built to streamline trip planning, manage group finances, and dynamically capture memories.
    <br />
    <br />
  </p>
</div>

<div align="center">
  <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-1B1F23?style=for-the-badge&logo=expo&logoColor=white" alt="Expo" />
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/React_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="React Query" />
</div>

---

## 📖 About The Project

Wandii takes the friction out of group travel. Instead of juggling spreadsheets, mapping apps, and shared photo albums, Wandii unifies the entire lifecycle of a trip into a single, cohesive mobile experience. 

From the initial planning stages and collaborative budget tracking to reliving the journey through auto-generated video recaps, Wandii provides a seamless, cross-platform experience powered by React Native and Supabase.

## ✨ Features

### 🎬 Trip Relive Engine
Automatically generates a dynamic, vertical-scrolling video recap of your journey using trip data and uploaded media. Built with `react-native-reanimated` and `expo-video` for a smooth, zero-lag playback experience.

https://github.com/user-attachments/assets/04b1ec6d-e246-4bca-a563-a81500195e5f

### 🗺 Interactive Itineraries & Mapping
Plan seamlessly with a timeline and interactive map view. Integrated with `react-native-maps` and the Google Places API for real-time location searching, custom map markers, and route visualizations.

https://github.com/user-attachments/assets/7eb57662-fe48-430e-a746-49c2bca8e7ff

### 💰 Shared Group Wallet
Keep track of group expenses in real-time. Features complex data relation splitting to calculate exactly who owes whom. State and data caching are managed efficiently with `@tanstack/react-query` to ensure instant optimistic UI updates.

https://github.com/user-attachments/assets/226fe999-98c8-428e-9923-4121e68e7de4

### 🤝 Collaborative Planning Wizards
A multi-step wizard to create trips, set budgets, and invite friends utilizing `react-native-calendars`. Built leveraging secure authentication and real-time database syncing.


https://github.com/user-attachments/assets/72d72f94-b9a1-4b3e-a0ac-773cdbc64ec5


### 📸 Shared Album & Trip Journal
A dedicated space for the group to upload photos and write journal entries. Utilizes `expo-image` for heavy image caching and `expo-camera` / `expo-image-picker` for seamless hardware integration.


https://github.com/user-attachments/assets/ec9c0ad2-39f6-4ffc-b038-ffa905868d43


---

## 🛠 Tech Stack

**Client:**
* Framework: [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (SDK 54+)
* Routing: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
* State/Data Fetching: [TanStack Query v5](https://tanstack.com/query/latest)
* Animations: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)

**Backend (BaaS):**
* Database & Auth: [Supabase](https://supabase.com/) (PostgreSQL)
* Storage: Supabase Storage for high-res media

**Key Integrations:**
* `react-native-maps` & `expo-location` (Geolocation)
* `expo-camera` (Hardware API)
* `react-native-google-places-autocomplete` (Location Intelligence)

---

## 🎨 Design & Prototyping

Wandii was meticulously planned and prototyped before a single line of code was written. This approach ensured a consistent design language, smooth user flows, and a highly polished final product.

You can view the complete UI/UX design board, component libraries, and feature mockups here:

[![Figma Badge](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/design/SG5oEjtCMv8mV3t8HkhBRi/Feature-Pages-Board?node-id=634-78&t=EK4OGc0LwpmkYBFe-1)

---

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps. **Note:** This project utilizes custom native modules (via Dev Builds) and cannot be run inside the standard Expo Go client.

### Prerequisites

* Node.js (v18+)
* Xcode (for iOS compilation) or Android Studio (for Android compilation)
* CocoaPods (for iOS dependencies)
* A [Supabase](https://supabase.com/) account and project.

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/wandii.git](https://github.com/yourusername/wandii.git)
   cd wandii
