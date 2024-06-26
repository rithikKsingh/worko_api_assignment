# Worko Assignment

## Installation

Use the following command to install all dependencies using npm:

npm install


## Usage

Ensure you have an .env file in the root directory with the following variables:

MONGO_URI=""
PORT=4000
JWT_SECRET=""

**Note** .env file is already present in the project


You can use Postman or any other API development tools to test the following APIs.

### Public Routes (Do not require authentication)

1. **Create User**
   - **Method:** POST
   - **URL:** `http://localhost:4000/api/worko/user`
   - **Body:** Provide data in JSON format:
     ```json
     {
         "name": "rohan",
         "email": "rohan@gmail.com",
         "age": 45,
         "city": "delhi",
         "zipCode": "110057",
         "password": "12334",
         "isAdmin": true // Optional; default is false
     }
     ```

2. **Login User**
   - **Method:** POST
   - **URL:** `http://localhost:4000/api/worko/user/login`
   - **Body:** Provide data in JSON format:
     ```json
     {
         "email": "rohan@gmail.com",
         "password": "12334"
     }
     ```
   - **Note:** Upon successful login, a JWT token will be stored in the cookie.

### Authenticated Routes (Require login)

**Note:** All routes below require authentication.

3. **Update User**
   - **Method:** PUT
   - **URL:** `http://localhost:4000/api/worko/user/:id`
   - **Note:** Replace `:id` with the user's ID obtained after creating the user.
   - **Body:** Provide updated data in JSON format, including fields not being updated:
     ```json
     {
         "name": "rohan",
         "email": "rohan@gmail.com",
         "age": 45,
         "city": "delhi",
         "zipCode": "110057",
         "password": "12334",
         "isAdmin": true // Optional; default is false
     }
     ```

### Admin Only Routes (Require admin privileges)

**Note:** Only users with admin privileges can access the routes below.

4. **Get Users**
   - **Method:** GET
   - **URL:** `http://localhost:4000/api/worko/users`
   - **Query Parameters:** Optional parameters for filtering or sorting:
     - `sortBy`: `age` or `name` (default is `name`)
     - `order`: `asc` or `desc` (default is `asc`)
     - Searching parameters:
       - `name`: `{value}`
       - `city`: `{value}`
       - `zipCode`: `{value}`
   - **Note:** Non-admin users will receive an "Access denied. Admins only." message.

5. **Get a Particular User**
   - **Method:** GET
   - **URL:** `http://localhost:4000/api/worko/user/:id`
   - **Note:** Replace `:id` with the ID of the user you want to retrieve.

6. **Soft Delete a Particular User**
   - **Method:** DELETE
   - **URL:** `http://localhost:4000/api/worko/user/:id`
   - **Note:** Replace `:id` with the ID of the user you want to delete.


### Testing
There is a folder named "test" which contains the test file : "apis.test.js"
To run the test file : npm test