# Building a User Management Dashboard with Node.js and Stytch for B2B SaaS Applications

This project demos how you can leverage Stytch to create a robust user management dashboard using Node.js and Next.js.

### Technologies Used

1. Node.js
2. Next.js
3. SQLite
4. Prisma
5. Axios

### Implemented Functionality

1. Authentication
2. Email invites for smooth onboarding
3. Organization settings management
4. User profile settings management
    - MFA opt-in
    - Step-up auth
5. RBAC

### Running the Project Locally

To run this project on your local machine, ensure you have the following:

-   A [Stytch B2B](https://stytch.com/pricing?type=B2B) account
-   An email address that doesn't have a [common domain](https://stytch.com/docs/b2b/api/common-email-domains)
-   [Node.js v18.18.2](https://nodejs.org/en) installed on your local machine
-   A code editor and a web browser

Once you have met all the prerequisites, follow these steps:

1. Clone the repo:

    ```bash
    git clone https://github.com/kimanikevin254/stytch-user-management-dashboard.git
    ```

2. Install all the `server` dependencies:

    ```bash
    cd  stytch-user-management-dashboard/server

    npm i
    ```

3. Copy the contents of the `.env.example` file into a new file named `.env` and run the Prisma migrations:

    ```bash
    cp .env.example .env

    npx prisma migrate dev --name init
    ```

    > Make sure you provide the necessary values in the `.env` file.

4. Install all the `client` dependencies:

    ```bash
    cd  stytch-user-management-dashboard/client

    npm i
    ```

5. Run the Node.js and Next.js servers:

    ```bash
    node index.js # in the server folder
    npm run dev # in the client folder
    ```
