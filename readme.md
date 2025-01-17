# User Management System with JWT and GraphQL

## Introduction
This project is a web-based application designed for user authentication, sorting, and searching functionalities. The system is built using **Node.js**, **Express.js**, and integrates **MySQL** for database management. Key features include user signup, login, **JWT-based authentication**, and **GraphQL** queries and mutations for enhanced data interaction. The application also supports pagination and sorting of data stored in the MySQL database.

## Prerequisites
To run this project, ensure that you have the following installed on your system:

- **Node.js**: v20.12.2 or later
- **MySQL**: A MySQL database setup for user management
- **NPM**: Latest version for package management

## Tech Stack
- **Node.js**: Backend runtime environment for executing JavaScript code on the server-side
- **Express.js**: Web framework for building the REST API
- **EJS**: Templating engine used for rendering views (optional for UI)
- **MySQL**: Relational database for storing user data, such as email, username, and password
- **JWT (JSON Web Token)**: Used for secure user authentication by generating tokens for logged-in users
- **GraphQL**: A query language for flexible and efficient API data fetching
- **bcrypt.js**: For hashing and comparing user passwords securely
- **body-parser**: Middleware for parsing incoming request bodies
- **express-validator**: Middleware for validating incoming user inputs

## Version Details
- **Node.js**: v20.12.2
- **MySQL**: v8.0
- **Express.js**: v4.18.2
- **bcrypt.js**: v5.0.1
- **express-validator**: v6.14.0
- **jsonwebtoken (JWT)**: v9.0.0

## Features and Functionalities

### 1. **Authentication**
JWT-based authentication is implemented to secure certain routes. Upon successful login, a JWT token is generated and stored in the user's browser as a cookie. Middleware is used to validate the token for protected routes.

### 2. **User Signup and Login**
- **Signup**: User input such as email, username, and password is validated. Passwords are hashed using bcrypt.js before being stored in the MySQL database.
- **Login**: Validates the user's credentials (email, password, username) and issues a JWT token for authenticated users.

### 3. **Search and Sort Functionality**
- Users can search for other users by their **username**.
- **Sorting** is available for fields such as **email**, **username**, or **id**.

### 4. **GraphQL Integration**
GraphQL is used to manage queries and mutations:
- **Queries**:
    - `getallusers`: Fetch all users.
    - `getuserbyemail`: Fetch a user by email.
    - `getuserbyusername`: Fetch a user by username.
- **Mutations**:
    - `createuser`: Creates a new user with email, password, and username.
    - `deleteuser`: Deletes a user based on email and username.
    - `updateusername`: Updates the username of a user.

### 5. **Pagination**
Pagination is implemented with a limit of **5 users per page**, ensuring smooth retrieval of user data in chunks.

### 6. **Database**
The system uses **MySQL** to store user information, including email, username, and password. The database is connected using the `mysql2` library.

## JWT Authentication
JWT tokens are used to protect routes and ensure that only authenticated users can access restricted features. The token is generated upon login and is required for accessing secured routes.

## GraphQL Queries and Mutations

### **Queries**:
- **getallusers**: Fetch all users.
- **getuserbyemail**: Retrieve a specific user by their email.
- **getuserbyusername**: Retrieve a specific user by their username.

### **Mutations**:
- **createuser**: Create a new user with email, password, and username.
- **deleteuser**: Delete an existing user by email and username.
- **updateusername**: Update a user's username based on their email.

## How to Use

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
