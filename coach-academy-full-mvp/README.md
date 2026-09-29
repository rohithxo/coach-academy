# Coach Academy — Full MVP

A free-tier-friendly online coaching platform starter.

## Student flow

Welcome → Course → Phone OTP → Razorpay payment → Paid course → Private lesson videos → Module progress → Course quiz → 60% pass → Certificate PDF.

## Coach flow

Coach login → Admin dashboard → Create course → Add modules → Upload videos.

## Stack

- Next.js
- Supabase Auth + Postgres + Storage
- Razorpay
- jsPDF

## Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql`.
3. Optionally run `supabase/seed.sql`.
4. Enable Phone Auth and configure an SMS provider in Supabase.
5. Create a coach user in Supabase Auth.
6. Insert that user's UUID into `profiles` and set `role='coach'`. You can then sign into `/admin` with that phone number.
7. Create Razorpay API keys.
8. Copy `.env.example` to `.env.local` and fill:
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   RAZORPAY_KEY_ID
   RAZORPAY_KEY_SECRET
   NEXT_PUBLIC_RAZORPAY_KEY_ID
9. `npm install`
10. `npm run dev`

## Deploy

Deploy the Next.js project to a compatible hosting provider and add the same environment variables there.

## Important

This is an MVP foundation, not a completed audited payment platform. Before charging real customers:

- Configure Razorpay webhooks and verify payment status server-side.
- Add rate limiting and abuse protection.
- Add stronger coach authorization and audit logs.
- Add file-size/type limits and virus/content controls for uploads.
- Configure storage policies for production.
- Use a dedicated video delivery service if you have many/large videos.
- Add privacy policy, terms, refund policy and certificate verification.
- Test OTP, payment, webhook, failed payment, refund, quiz and certificate flows end-to-end.

## Quiz builder

The coach dashboard includes a JSON quiz editor. Each question should contain `question`, `options` (array), and `correct_option`.
