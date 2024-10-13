# Node.js Express MySQL Project

## Introduction

This project is a web-based application that allows user authentication, sorting, and searching functionality. The application is built using Node.js, Express.js, and integrates MySQL for database management. The project includes features like user signup, login, JWT-based authentication, and GraphQL queries and mutations for enhanced data interactions. It also includes functionality for pagination and sorting data in the MySQL database. 

## Prerequisites

To run this project, you need to have the following installed on your system:
- **Node.js**: v20.12.2 or later
- **MySQL**: Database setup for user management
- **NPM**: Latest version to manage packages

## Tech Stack

- **Node.js**: Backend runtime environment
- **Express.js**: Web framework
- **EJS**: Template engine for rendering views
- **MySQL**: Relational database for storing user data
- **JWT (JSON Web Token)**: For secure user authentication
- **GraphQL**: For flexible query and mutation handling
- **bcrypt.js**: For hashing passwords
- **body-parser**: For parsing incoming request bodies
- **express-validator**: For request validation

## Version Details

- **Node.js**: v20.12.2
- **MySQL**: v8.0
- **Express.js**: v4.18.2
- **bcrypt.js**: v5.0.1
- **express-validator**: v6.14.0
- **jsonwebtoken (JWT)**: v9.0.0

## Features and Functionalities

### 1. Authentication
   - JWT-based authentication is used to protect specific routes. A user logs in, and upon successful validation, a JWT token is issued and stored as a cookie.
   - Middleware (`auth.js`) is used to validate the token for protected routes.

### 2. User Signup and Login
   - **Signup**: Validates user input such as email, username, and password. Passwords are hashed before being stored in the database.
   - **Login**: Validates user credentials and issues a JWT token for authenticated users.

### 3. Search and Sort Functionality
   - Users can search for other users by their username.
   - Sorting functionality is provided for sorting by `email`, `username`, or `id`.

### 4. GraphQL Integration
   - Provides various GraphQL queries and mutations:
     - Queries for fetching all users, fetching a user by email or username.
     - Mutations for creating, deleting, and updating users.

### 5. Pagination
   - Pagination is implemented with a limit of 5 users per page, allowing for smooth data retrieval in chunks.

### 6. Database
   - MySQL is used to store user data including email, username, and password. The database connection is managed using `mysql2` library.

## JWT Authentication

JWT is used for securing routes and ensuring that only authenticated users can access certain functionalities. The token is generated during login and is required to access restricted routes.

## GraphQL Queries and Mutations

- **Queries:**
  - `getallusers`: Fetches all users.
  - `getuserbyemail`: Fetches a specific user by email.
  - `getuserbyusername`: Fetches a specific user by username.
  
- **Mutations:**
  - `createuser`: Creates a new user with the given email, password, and username.
  - `deleteuser`: Deletes a user by email and username.
  - `updateusername`: Updates a user's username based on their email.

## How to Use

1. Clone the repository.
2. Run `npm install` to install all dependencies.
3. Set up your MySQL database and configure the `database.js` file with your MySQL credentials.
4. Run the server using the following command:
   ```bash
   node index.js
   ```
5. Navigate to `http://localhost:8080/` to use the application.

## Standard Usage

- **Routes**:
  - `GET /`: Renders the home page.
  - `POST /login`: Allows users to login.
  - `POST /signup`: Registers a new user.
  - `GET /search`: Searches for users by username.
  - `GET /sort`: Sorts users by email, username, or ID.
  - `GET /pagination`: Displays paginated user data.
  
- **GraphQL Endpoint**:
  - Visit `/graphql` to interact with GraphQL queries and mutations.

