# AgriNet

AgriNet is a web-based agricultural marketplace designed to connect local farmers with consumers in Lucena City. The platform provides farmers with a digital space to showcase their agricultural products while allowing consumers to discover products, find nearby farmers, and communicate directly with sellers.

The system is designed to support local agricultural commerce by making it easier for consumers to discover locally available products and for farmers to reach potential customers.

## Features

### 👨‍🌾 Farmer

* Create and manage a farmer profile
* Add, edit, and manage agricultural products
* Upload product images
* Set product prices and availability
* View product inquiries
* Communicate with consumers through messaging
* Receive ratings and reviews

### 🛒 Consumer

* Browse available agricultural products
* Search and filter products
* Filter products based on category, price, availability, rating, and distance
* View farmer profiles
* Find nearby farmers using an interactive map
* Send product inquiries
* Communicate directly with farmers
* Leave reviews and ratings

### 👑 Administrator

* Manage users and platform data
* Monitor farmers and consumers
* Manage system content
* Help maintain the integrity of the marketplace

### 💬 Messaging and Inquiries

AgriNet includes a real-time messaging system that allows consumers and farmers to communicate directly.

Consumers can send an inquiry about a specific product. Farmers can then review and respond to the inquiry, providing a more organized way of handling potential transactions.

### 📍 Nearby Farmers

AgriNet uses location data to help consumers discover farmers near their location. An interactive map displays participating farmers and provides distance-based filtering.

### ⭐ Reviews and Ratings

Consumers can provide ratings and reviews for farmers and products. These reviews help other consumers make more informed decisions when choosing whom to purchase from.

---

## Technology Stack

### Frontend

* **React.js** - Used to build the user interface using reusable components.
* **Vite** - Used as the frontend development and build tool.
* **React Router** - Handles client-side navigation and routing.
* **Tailwind CSS** - Used for responsive styling and UI design.
* **JavaScript (ES6+)** - Primary programming language for the frontend.

### Backend and Database

* **Firebase Authentication** - Handles user registration, login, and authentication.
* **Cloud Firestore** - NoSQL database used to store users, farmers, products, conversations, messages, inquiries, and reviews.
* **Firebase Security Rules** - Used to control access to Firestore data based on authenticated users and their roles.

### Cloud Services

* **Cloudinary** - Used for storing and managing uploaded images such as product images and profile pictures.

### Maps and Location

* **Leaflet** - Used to create interactive maps.
* **OpenStreetMap** - Provides map data used by the Leaflet-based map interface.
* **Browser Geolocation API** - Used to obtain the consumer's location for nearby-farmer discovery.

### Development Tools

* **Git** - Version control.
* **GitHub** - Repository hosting and source-code management.
* **Visual Studio Code** - Primary development environment.
* **npm** - Package management and dependency installation.

---

## System Architecture

AgriNet follows a client-side web application architecture.

```text
                    ┌──────────────────────┐
                    │      AgriNet Web     │
                    │   React + Vite       │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
              ▼                ▼                ▼
       Firebase Auth      Firestore         Cloudinary
              │                │                │
              │                │                │
        Authentication    Application Data    Images
              │                │                │
              └────────────────┼────────────────┘
                               │
                               ▼
                       AgriNet Application
                               │
                    ┌──────────┴──────────┐
                    │                     │
                 Farmers              Consumers
                    │                     │
                    └──────────┬──────────┘
                               │
                          Messaging
                         & Inquiries
```

---

## Firestore Collections

The application uses Cloud Firestore as its primary database.

| Collection        | Purpose                                                  |
| ----------------- | -------------------------------------------------------- |
| `users`           | Stores general user information and roles                |
| `farmers`         | Stores farmer-specific profiles and location information |
| `products`        | Stores agricultural product listings                     |
| `conversations`   | Stores conversation information between users            |
| `messages`        | Stores messages exchanged between users                  |
| `inquiries`       | Stores product-related consumer inquiries                |
| `reviews`         | Stores farmer ratings and reviews                        |
| `product-reviews` | Stores product ratings and reviews                       |

---

## User Roles

AgriNet supports three main user roles:

```text
              AgriNet
                 │
       ┌─────────┼─────────┐
       │         │         │
     Farmer   Consumer   Admin
       │         │         │
   Products   Browse    Manage
   Inquiries  Products   System
   Messages   Messages   Users
   Reviews    Reviews
```

### Farmer

Farmers use AgriNet to promote their agricultural products, communicate with consumers, and manage product inquiries.

### Consumer

Consumers use AgriNet to discover agricultural products and nearby farmers, communicate with sellers, and submit reviews.

### Administrator

Administrators are responsible for managing and monitoring the platform.

---

## Project Structure

The frontend is organized around React components, pages, hooks, contexts, constants, and service modules.

```text
src/
├── assets/
├── components/
├── constants/
├── context/
├── hooks/
├── pages/
├── services/
├── utils/
├── App.jsx
└── main.jsx
```

The application uses service modules to separate Firebase and external-service operations from the UI components.

For example:

```text
services/
├── user.service.js
├── farmer.service.js
├── product.service.js
├── message.service.js
├── conversation.service.js
├── inquiry.service.js
├── farmer-review.service.js
├── product-review.service.js
└── cloudinary.service.js
```

This structure makes the application easier to maintain and allows individual features to be modified without placing database logic directly inside UI components.

### Firestore indexes

The required composite indexes are versioned in `firestore.indexes.json`. Deploy them with the Firebase CLI alongside your existing security rules:

```bash
firebase deploy --only firestore:indexes
```

---

## Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd AgriNet
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root and add the required Firebase and Cloudinary configuration.

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
# Optional: use separate unsigned upload presets by image type.
VITE_CLOUDINARY_PROFILE_PRESET=your_profile_upload_preset
VITE_CLOUDINARY_PRODUCT_PRESET=your_product_upload_preset
```

Do not commit private credentials or environment files containing sensitive configuration to the repository.

### 4. Start the development server

```bash
npm run dev
```

The application will then be available through the local development URL provided by Vite.

---

## Production Build

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Security

AgriNet uses Firebase Authentication and Firestore Security Rules to protect application data.

Access to resources should be determined by:

* Authentication status
* User identity
* User role
* Ownership of the resource
* Appropriate read/write permissions

For example, a farmer should only be able to modify their own products, while consumers should not be able to modify another user's profile or product listings.

---

## Project Goals

AgriNet aims to:

1. Provide farmers with an accessible online marketplace.
2. Help consumers discover locally available agricultural products.
3. Improve communication between farmers and consumers.
4. Promote local agricultural commerce.
5. Provide location-based discovery of nearby farmers.
6. Provide a structured system for product inquiries and communication.
7. Create a more convenient way for consumers to find and evaluate local agricultural sellers.

---

## Scope

AgriNet focuses primarily on **product discovery, communication, and marketplace interaction**.

The current system does **not** directly process online payments or provide integrated delivery and shipment services. Transactions and arrangements between farmers and consumers are handled outside the platform.

---

## Status

**AgriNet is currently under development.**

The project is being developed as an academic/capstone project with a focus on creating a functional local agricultural marketplace for Lucena City.

## License

This project is developed for academic purposes.

---

## Authors

**AgriNet Development Team**

Bachelor in Industrial Technology
Major in Computer Technology
Southern Luzon State University
