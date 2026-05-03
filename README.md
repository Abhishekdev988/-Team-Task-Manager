# Team Task Manager

A full-stack project management and task tracking application built with **Next.js**, **Prisma**, and **PostgreSQL**.

## Features
- **Authentication**: Secure Login & Registration using NextAuth.js and bcrypt.
- **Role-Based Access Control**: Admins can create projects and assign tasks; Members can view their tasks and update status.
- **Projects & Tasks**: Manage your team's projects, members, and task deadlines.
- **Dashboard**: Track Pending, Completed, and Overdue tasks at a glance.

## Local Development (Optional)
This repository is configured to use PostgreSQL. To run locally, you will need a PostgreSQL database.
1. Add your database URL to `.env`: `DATABASE_URL="postgresql://user:password@localhost:5432/mydb"`
2. Add a strong random string for `NEXTAUTH_SECRET` in `.env`.
3. Run `npm install`
4. Run `npx prisma db push` to generate the schema.
5. Run `npm run dev`

## Deployment to Railway (Mandatory)

1. **Push to GitHub**:
   - Create a new blank repository on GitHub.
   - Run the following commands in your terminal to push this code:
     ```bash
     git branch -M main
     git remote add origin https://github.com/your-username/your-repo-name.git
     git push -u origin main
     ```

2. **Deploy on Railway**:
   - Go to [Railway.app](https://railway.app/) and log in.
   - Click **New Project** -> **Deploy from GitHub repo**.
   - Select the repository you just pushed.
   - Click **Add a Service** -> **Database** -> **Add PostgreSQL**.
   - Go to your Web App service settings -> **Variables**.
   - Railway will automatically detect the database and you can click **Add Reference** to add `DATABASE_URL` linking to the Postgres database.
   - Add another variable: `NEXTAUTH_SECRET` with a long random string.
   - Add `NEXTAUTH_URL` and set it to your deployed Railway domain (e.g. `https://your-app.up.railway.app`).
   - The app will build automatically. The build command `prisma generate && prisma db push && next build` is already configured in `package.json` to ensure the database schema is created on deploy.

3. **Enjoy!**
   - The first user who registers will automatically be granted the `ADMIN` role to manage projects. Subsequent users will be `MEMBER`s.
