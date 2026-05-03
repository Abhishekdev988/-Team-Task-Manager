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

## Deployment

### Option A: Deployment to Vercel (Recommended for Next.js)
1. **Push to GitHub**: Push this repository to your GitHub account.
2. **Deploy on Vercel**: 
   - Go to [Vercel](https://vercel.com/) and import your GitHub repository.
3. **Database Setup**:
   - In Vercel, go to the **Storage** tab and create a **Prisma Postgres** database.
   - Vercel will automatically inject the `DATABASE_URL` into your environment variables.
4. **Environment Variables**:
   - Go to **Settings > Environment Variables** and add:
     - `NEXTAUTH_SECRET`: Add a long random string (e.g., `my_super_secret_key_12345!`).
     - `NEXTAUTH_URL`: Enter your Vercel public domain (e.g., `https://your-app.vercel.app`).
5. **Redeploy**: Go to the **Deployments** tab and click **Redeploy** to ensure the database and variables are loaded correctly.

### Option B: Deployment to Railway
1. **Push to GitHub**: Push this repository to your GitHub account.
2. **Deploy on Railway**: 
   - Go to [Railway](https://railway.app/) and choose **Deploy from GitHub repo**.
3. **Add Database**:
   - Add a new **PostgreSQL** service to your Railway project.
4. **Environment Variables**:
   - In your Web App service variables, add `DATABASE_URL` (Reference the Postgres service).
   - Add `NEXTAUTH_SECRET` with a long random string.
   - Add `NEXTAUTH_URL` with your Railway public domain.
5. Railway will automatically build the app and push the database schema using the `build` script.

## Notes
- The first user who registers will automatically be granted the `ADMIN` role to manage projects. Subsequent users will be `MEMBER`s.
