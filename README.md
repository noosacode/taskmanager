# crudtemplate

A simple reusable Express + MongoDB CRUD template.

## What it contains

- Express server
- MongoDB / Mongoose
- User login
- JWT authentication
- Password hashing with bcrypt
- Generic CRUD document model
- Simple CRUD frontend
- Vercel deployment

## Project structure

backend/
├── middleware/
│   └── auth.js
└── models/
    ├── CrudDocument.js
    └── User.js

public/
├── css/
│   └── styles.css
├── js/
│   ├── crud.js
│   ├── login.js
│   └── logout.js
└── index.html

server.js

## Local setup

1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file.
4. Add `MONGODB_URI`.
5. Add `JWT_SECRET`.
6. Run `npm start`.
7. Open `http://localhost:3000`.

## Environment variables

The `.env` file should contain:

MONGODB_URI=your MongoDB connection string
JWT_SECRET=your secret key

Do not commit `.env` to GitHub.

## CRUD API

GET    /api/documents
POST   /api/documents
GET    /api/documents/:id
PUT    /api/documents/:id
DELETE /api/documents/:id

All document endpoints require authentication.

## Authentication

Users log in through:

POST /login

The server checks the username and password, then returns a JWT.

The token is stored by the frontend and sent with authenticated CRUD requests.

## Using this as a template

Clone this project when starting a new application.

The `CrudDocument` model currently contains:

- title
- description
- createdAt
- updatedAt

For a larger project, this model can be replaced or expanded to suit the new application's data.

The existing authentication system can be retained.

The simple one-page CRUD interface can also be expanded into separate pages if the project becomes large enough to benefit from it.

## Deployment

The project can be deployed to Vercel.

Add these environment variables to the Vercel project:

- MONGODB_URI
- JWT_SECRET

Make sure the MongoDB Atlas configuration allows the deployed application to connect.