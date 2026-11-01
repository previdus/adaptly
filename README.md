# Adaptly

Adaptly is a child-friendly multiplication learning platform for ages 8–10. It combines an adaptive practice path with two quick-play games and progress views for families.

## Play modes

- **Level Up** follows an ordered path across eight multiplication concepts and 24 levels. Three consecutive correct, unhinted answers advance the learner; mistakes and hints keep practice on the current concept. Progress and evidence are saved to the learner history.
- **Speed Sprint** is a one-minute solo round with score, answer streaks, and a personal best.
- **Last Star Standing** lets 2–8 players race on shared questions. Each starts with three lives; the quickest correct answer stays safe, and eliminated players can keep watching.

## Learning content

- `lib/learning.ts` defines the eight concepts, adaptive sequence, question generation, timing, and progress calculations.
- `lib/multiply-bank.ts` contains the fixed 200-question bank used by Speed Sprint and Last Star Standing.
- The adaptive path generates practice questions and derives parent-facing skill evidence from saved attempts.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm run install:ci
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Current runtime and storage

The current app uses Vinext with a Cloudflare Workers runtime and D1 storage. The live site and its database are managed separately from this source repository. Learner records, family profiles, sign-in sessions, and live arena matches are not included here. Keep database exports and local environment files out of source control.

## AWS proof of concept

`infra/aws/adaptly-poc.yaml` provisions a small EC2 host behind CloudFront. `Dockerfile.aws-poc` runs the existing Worker app with Wrangler's local D1 emulator, storing its SQLite state on an encrypted EBS volume. CloudFront provides HTTPS and sends app traffic to the origin; the origin security group accepts traffic from CloudFront only. This preserves the current app behavior for a pilot without rewriting its APIs.

This is a single-host proof of concept, not a high-availability production setup or a managed AWS database. Learner records are deliberately excluded from GitHub and must be migrated separately into the persistent D1 state on the AWS host.
