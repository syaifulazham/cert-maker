# MySQL Setup for Cert-Maker

This guide explains how to set up MySQL for the Cert-Maker application.

## Prerequisites

- MySQL Server installed and running
- MySQL client (mysql command line client or MySQL Workbench)

## Database Setup

1. Log in to MySQL as a user with privileges to create databases and users:

   ```bash
   mysql -u root -p
   ```

2. Create a database for the application:

   ```sql
   CREATE DATABASE certmaker;
   ```

3. Create a user for the application:

   ```sql
   CREATE USER 'certmaker_user'@'%' IDENTIFIED BY 'your_strong_password';
   ```

4. Grant privileges to the user:

   ```sql
   GRANT ALL PRIVILEGES ON certmaker.* TO 'certmaker_user'@'%';
   FLUSH PRIVILEGES;
   ```

5. Update the `.env` file in the root of the project with the MySQL connection string:

   ```
   DATABASE_URL="mysql://certmaker_user:your_strong_password@localhost:3306/certmaker"
   ```

   If you're using a remote MySQL server, replace `localhost` with the server address.

## Applying the Database Schema

After setting up the database, you need to push the Prisma schema to it:

```bash
npm run prisma:push
```

This will create all the necessary tables according to the Prisma schema.

## Viewing the Database

You can use Prisma Studio to view and edit the database:

```bash
npm run prisma:studio
```

This will start a web interface at http://localhost:5555 where you can view and edit your database tables.

## Troubleshooting

- If you encounter connection issues, ensure that the MySQL server is running and that your connection string in the `.env` file is correct.
- Make sure your MySQL user has the correct permissions for the database.
- If you're using a remote MySQL server, ensure that the firewall allows connections on port 3306.