This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Prisma

This project uses Prisma ORM 7. The CLI configuration lives in
`prisma.config.ts`; database models live in separate `.prisma` files under
`prisma/`. The shared generator and datasource live in `prisma/schema.prisma`.
Set `DATABASE_URL` in `.env` for the CLI connection.

Run `npx prisma validate` to check the schema and `npx prisma generate` to
generate the client. Keep the Prisma CLI, client, and adapter on compatible
7.x versions when updating dependencies.

Authentication models:

- `User` stores the user's identity and bcrypt password hash.
- `Session` belongs to a user and stores a unique SHA-256 hash of the cookie
  token and its expiration date. Multiple sessions per user are supported;
  deleting a user deletes their sessions.
- Authentication uses custom database sessions with email/password login.
  No Auth.js adapter or JWT signing secret is required. Passwords remain bcrypt
  hashes; `bcrypt`, `zod`, and `server-only` are still required.
- `/signup` creates a user and session; `/login` creates a fresh session after
  password verification. `/profile` requires a valid, unexpired database session.
  It is an account page, not an admin authorization check.
- `app/lib/session.tsx` creates random 32-byte tokens and stores only their
  SHA-256 hashes in `Session`. The raw token lives in a seven-day HttpOnly,
  SameSite=Lax cookie with Secure enabled in production. Authentication never
  trusts the presence of the cookie alone. Old token cookies are not accepted.
- `getSession()` is read-only and may run in Server Components. Use
  `requireSession()` in protected server code. Session mutations must run in
  Server Actions or Route Handlers. `updateSession()` explicitly extends an
  active session by seven days; expired or revoked sessions cannot be renewed.
  Renewal is not automatic. Logout removes both the database row and cookie.
- Expired rows are rejected immediately. They can be periodically removed with
  `db.session.deleteMany({ where: { expiresAt: { lte: new Date() } } })`.

Run `npm run test:session` against local PostgreSQL after applying migrations.
It checks signup, login, renewal, expiration, revocation, logout, and isolation
between browsers. The test deletes its own user and sessions when finished.

Content models:

- `Category` groups articles and courses. Each article or course has an optional
  category; deleting a category leaves its content uncategorized.
- `Course` contains ordered lessons. Deleting a course also deletes its lessons.
  Lesson slugs are unique within a course; article and course slugs are unique
  within their respective models.
- `Article`, `Course`, and `Lesson` start as `DRAFT`. The application must set
  `publishedAt` when publishing and filter public queries by `PUBLISHED` (for
  lessons, check the parent course too). Lower `position` values sort first.
- Article and lesson `content` stores rich text editor JSON.
- `Asset` stores S3 object keys and metadata for images, videos, PDFs, and other
  files. Assets can be shared by articles, courses, and lessons. Deleting content
  does not delete shared asset records or S3 objects. `sizeBytes` is a `BigInt`;
  convert it to a string before JSON serialization.

After changing models, run `npx prisma migrate dev --name add_content_models`
against your development database, then `npx prisma generate`.

## Getting Started

### Local sample content

With `DATABASE_URL` pointing to your local PostgreSQL database:

For a fresh checkout, copy `.env.example` to `.env` first. Set
`POSTGRES_PASSWORD` and use that same password in `DATABASE_URL` (URL-encode
special characters in the URL). Keep existing `.env` values when upgrading an
existing checkout. `.env` is ignored by Git; `.env.example` contains placeholders
and is committed. Compose reads its PostgreSQL settings from `.env`.

Changing these settings does not change credentials in an existing PostgreSQL
volume. Keep them aligned with the initialized database; update the database
password explicitly if you need to rotate it.

```bash
docker compose up -d --wait
npx prisma migrate dev
npx prisma generate
npm run db:seed
npm run dev
```

The seed runs in a transaction and uses upserts to avoid duplicate records.
It preserves existing edits and creates one category, one published course,
two published lessons, one published article, and one draft article. Run it
only against a database where you want sample content.

The home page reads published courses, their published lessons, categories,
and published article summaries from PostgreSQL on each request. Drafts are
excluded. The shared application client lives in `app/lib/db.ts`; the seed uses
its own client so it can run outside Next.js and close its pool afterward.

### UI components

Tailwind CSS 4 uses the existing Turbopack loader. shadcn/ui is configured in
`components.json` with Radix components and a neutral theme. `Button`, `Input`,
`Label`, and `Card` live in `components/ui/` and are used by the login and signup
pages. The theme follows the system light/dark setting and uses the existing
Geist fonts.

Import components from `@/components/ui/button` (or the corresponding filename).
Add more components with `npx shadcn add <component>`.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
