# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/88e99277-1619-4eba-b825-6826d2b8ec16

# 🐝 SelBee – College Marketplace

SelBee is a modern, college-focused online marketplace built using **React and Tailwind CSS**.  
It allows students to **buy, sell, auction, and manage items** within their campus in a smooth and visually engaging way.

## 📌 Features

- 🛒 Buy and sell college items  
- 📝 Easy product listing creation  
- 🔍 Browse and search marketplace items  
- 🔨 Auction system for bidding  
- 👤 Personal user profiles  
- 🎨 Friendly UI with animations and hover effects  

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/88e99277-1619-4eba-b825-6826d2b8ec16) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🛠️ Technologies Used
### Frontend
- **React (Vite)** – Component-based UI
- **TypeScript** – Type-safe development
- **Tailwind CSS** – Utility-first styling
- **ShadCN UI** – Modern pre-built components
- **Lucide Icons** – Clean and modern icons

- ### Fonts
- **Google Font – Fredoka**

```html
<link
  href="https://fonts.googleapis.com/css2?family=Fredoka:wght@300..700&display=swap"
  rel="stylesheet"/>

📁 Folder Structure & Description

📂 public/ : Contains static assets such as:
  favicon.ico

  📂 src/ : Main application source code written in React + TypeScript.

📁 src/components/:
Reusable UI components used across multiple pages.
Navbar.tsx
Top navigation bar
Reused on all pages
Handles authentication-based UI (login/logout)

📁 src/pages/
Each file represents a separate page in the application.

Home.tsx
Landing page
Hero section
Feature cards
Animations and hover effects

Marketplace.tsx
Displays all listed items
Search functionality using React state

AddListing.tsx
Form to add new items/products
Styled with Tailwind and Fredoka font

Auction.tsx
Auction and bidding interface
Interactive and animated layout

Auth.tsx
User authentication (login/signup)
Handles user access

Profile.tsx
User profile page
Displays user details and listings

📄 App.tsx
Main application component
Handles routing and page structure
Connects all pages and shared components

📄 main.tsx
Entry point of the React app
Renders the App component into the DOM

📄 index.css
Global styles
Tailwind CSS base styles
Font and theme setup

📂 supabase/
Supabase backend configuration Used for:
Authentication
Database
Backend services

🎨 Tailwind CSS Configuration (SelBee)
This file customizes Tailwind CSS to match SelBee’s college-friendly honey theme, smooth animations, and modern UI.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/88e99277-1619-4eba-b825-6826d2b8ec16) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
