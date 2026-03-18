# BPTracker

Individual/Group Blueprint Tracker for ARC Raiders.

## Overview
BPTracker is an application I designed to help players of ARC Raiders track blueprint acquisitions across their playgroup. After realizing that my friends and I were constantly asking each other if anyone had seen a certain blueprint drop and then proceeding to waste time checking each other's collections, I searched for a solution and noticed that while there are several apps that allow you to track your own progress, none of them allow you to track your progress in relation to other players so I decided to build my own.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL
- **Deployment**: Nginx (Reverse Proxy)

## Features
- Track acquired blueprints.
- Share tracking data among a group.
- Fast and reliable API backend.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd BPTracker
   ```
2. Install dependencies for the root and server:
   ```bash
   npm install
   cd server
   npm install
   cd ..
   ```
3. Configure environment variables in `.env`.
4. Run the application locally using `run.bat` or by starting the frontend and backend separately.