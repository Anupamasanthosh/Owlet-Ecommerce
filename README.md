# 🛒 E-Commerce Application

A full-featured e-commerce platform with separate user and admin modules. The application is built using Node.js, Express, and Handlebars, with MongoDB as the database. It provides a robust session management system, real-time payments, and responsive design.


## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [User Module](#user-module)
  - [Admin Module](#admin-module)
- [Technologies Used](#technologies-used)
- [Setup](#setup)
- [Usage](#usage)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## 📖 Overview

This application serves as a comprehensive platform for both users and administrators, featuring user account management, product browsing, cart and wishlist functionality, payment processing, and administrative tools for managing products, orders, and users.

## ✨ Features

### User Module 🛍️

- **Account Management**: Users can create an account and log in using sessions and cookies.
- **Product Browsing**: Users can view products, filter by category, and add products to their wishlist or cart.
- **Profile Management**: Users can update their profile information.
- **Cart & Wishlist**: Users can add products to their cart, apply coupons, and manage their wishlist.
- **Order Management**: Users can view their orders, track the status, and request returns with a message after delivery.
- **Payment Integration**: Real-time payment processing via Razorpay.

### Admin Module 🛠️

- **User Management**: Admins can view, edit, block, and manage users.
- **Analytics**: Admins can view graphs showing user interactions and product sales using Chart.js.
- **Product Management**: Admins can manage products, categories, and brands.
- **Order Management**: Admins can view and update order statuses.
- **Coupons & Offers**: Admins can manage different coupons and offers on products and categories.

## 🛠️ Technologies Used

- **Node.js**: JavaScript runtime for building server-side applications.
- **Express**: Web application framework for Node.js.
- **Handlebars**: View engine for rendering dynamic HTML.
- **MongoDB**: NoSQL database for storing data.
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js.
- **Multer**: Middleware for handling image uploads.
- **Chart.js**: JavaScript library for creating charts and graphs.
- **Razorpay**: Payment gateway for real-time transactions.

## 🔧 Setup

Prerequisites 📋
 - Node.js
 - MongoDB

Installation 🛠️

To run the application locally:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/your-repository.git
   
2. **Install Dependencies**:
   ```bash
     npm install
     
4. **Configure Environment Variables: Create a .env file in the root directory**:
   ```bash
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   RAZORPAY_KEY=your_razorpay_key
   RAZORPAY_SECRET=your_razorpay_secret

5

