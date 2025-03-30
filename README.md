# MyPlayer Backend

MyPlayer is a backend system for a video streaming application, built using **Node.js**, **Express.js**, **MongoDB (Mongoose)**, **JWT authentication**, and **Cloudinary** for media handling. It follows the **MVC (Model-View-Controller)** architecture to ensure scalability and maintainability.

## Features
- User authentication (Sign Up, Login, JWT-based authentication)
- Playlist management (Create, Edit, Delete, Fetch playlists)
- Cloudinary integration for media storage
- Secure token-based authentication with access and refresh tokens
- Proper error handling and validation

## Technologies Used
- **Node.js** - Backend runtime environment
- **Express.js** - Web framework for Node.js
- **MongoDB & Mongoose** - NoSQL database and ODM for MongoDB
- **JWT (JSON Web Tokens)** - Authentication mechanism
- **Cloudinary** - Media storage and retrieval
- **Dotenv** - For environment variable management
- **Cors & Helmet** - Security enhancements

## Project Structure
```
MyPlayer/
│── src/
│   ├── controllers/        # Business logic for handling requests
│   │   ├── auth.controllers.js
│   │   ├── playlist.controllers.js
│   │   ├── user.controllers.js
│   ├── models/             # Mongoose schemas for MongoDB
│   │   ├── user.model.js
│   │   ├── playlist.model.js
│   ├── routes/             # API routes
│   │   ├── auth.routes.js
│   │   ├── playlist.routes.js
│   │   ├── user.routes.js
│   ├── middleware/         # Middleware functions (e.g., authentication)
│   ├── utils/              # Utility functions (e.g., token generation)
│   ├── config/             # Configuration files
│   ├── index.js            # Main entry point
│── .env                    # Environment variables (ignored in Git)
│── package.json            # Dependencies and scripts
│── README.md               # Documentation
```

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/myplayer-backend.git
   cd myplayer-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up the **.env** file:
   ```
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```
   The server will run on **http://localhost:5000** (default).

### **Playlist Management**
| Method | Endpoint               | Description             |
|--------|------------------------|-------------------------|
| GET    | /api/playlists         | Get all playlists      |
| POST   | /api/playlists         | Create a new playlist  |
| GET    | /api/playlists/:id     | Get a specific playlist |
| PUT    | /api/playlists/:id     | Update a playlist      |
| DELETE | /api/playlists/:id     | Delete a playlist      |

### **User Management**
| Method | Endpoint         | Description      |
|--------|-----------------|------------------|
| GET    | /api/users/:id  | Get user details |

## Security Measures
- **JWT Authentication**: Ensures secure user sessions.
- **CORS Policy**: Configured to prevent unauthorized cross-origin requests.
- **Helmet**: Enhances HTTP security headers.

## Contact
For any queries, reach out to vanshpratapsingh1121@gmil.com or visit the [GitHub Repository](https://github.com/Vansh12970/Backend-Of-Myplayer).


