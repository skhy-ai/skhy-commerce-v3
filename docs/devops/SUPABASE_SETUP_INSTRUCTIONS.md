# Supabase Database Setup Instructions

We attempted to automatically deploy the database schema, but encountered a network compatibility issue (the database host resolves to IPv6, which is not reachable from this environment).

## Option 1: Run SQL in Supabase Dashboard (Recommended)

1.  Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2.  Select your project (`<PROJECT_ID>`).
3.  Go to the **SQL Editor** (icon on the left sidebar).
4.  Click **New Query**.
5.  Copy and paste the content of the `supabase_schema.sql` file (found in the root of your project) into the editor.
6.  Click **Run**.

## Option 2: Use an IPv4 Connection String

If you want to run the deployment script locally or from an environment that supports IPv4 (or obtain the IPv4 connection string from Supabase settings -> Database -> Connection Pooler):

1.  Update your `DATABASE_URL` in `.env` to use the Connection Pooler URL (Mode: Session, Port: 5432). It usually looks like:
    `postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`
2.  Run `node scripts/deploy-db.js`.

## Schema Details

The `supabase_schema.sql` file includes:
*   `users`: For user management.
*   `products`: Stores product details and pricing.
*   `blog_posts`: Manages blog content.
*   Row Level Security (RLS) policies for secure access.
