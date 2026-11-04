# Adaptly

Adaptly is a child-friendly adaptive learning platform for ages 8–10. It combines a personal practice path across Maths and English Grammar topics with quick-play games and progress views for families.

## Play modes

- **Level Up** follows an ordered, topic-specific path across multiplication, addition, subtraction, division, HCF and LCM. Three consecutive correct, unhinted answers advance the learner; mistakes and hints keep practice on the current concept. Progress and evidence are saved to the learner history.
- **Speed Sprint** is a one-minute solo round with score, answer streaks, and a personal best.
- **Last Star Standing** lets 2–8 players race on shared questions for their chosen topic. Each starts with three lives; the quickest correct answer stays safe, and eliminated players can keep watching.

## Learning content

- `lib/learning.ts` defines topic concepts, adaptive sequences, question generation, timing, and progress calculations.
- `lib/multiply-bank.ts` contains the 200-question multiplication bank.
- `lib/topic-bank.ts` exposes a validated 200-question bank for each topic to Speed Sprint and Last Star Standing. Fresh adaptive-practice questions are generated when needed.
- The adaptive path generates practice questions and derives parent-facing skill evidence from saved attempts.

For checkout, development, database changes, and contribution instructions, see [CONTRIBUTING.md](CONTRIBUTING.md).

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

### Automatic AWS deployment

`.github/workflows/deploy-aws.yml` builds and type-checks every relevant `main` push, then refreshes the `adaptly-poc` EC2 instance over AWS Systems Manager. App code, question banks, and files under `drizzle/` trigger deployment. Database migrations are recorded in the persistent local D1 migration ledger and applied once when the container starts. The previous container image is restored if the new app does not become healthy.

The workflow uses GitHub OIDC and short-lived AWS credentials; it does not store AWS access keys in GitHub. The `adaptly-github-actions-deploy-role` CloudFormation stack is created in the configured AWS account. Its `RoleArn` is set in the workflow; if recreating this setup in another AWS account, update that value to the new stack output.

To recreate the role in another account, create a CloudFormation stack in `us-east-1` from `infra/aws/github-actions-deploy-role.yaml`. If that account already has GitHub's OIDC provider, pass its ARN as `ExistingGitHubOidcProviderArn`; otherwise leave the parameter blank and the stack creates it. Set the new stack's `RoleArn` output as `role-to-assume` in the workflow. The AWS host must be managed by Systems Manager and have the `app=Adaptly` and `Name=adaptly-poc` tags, set by `infra/aws/adaptly-poc.yaml`.

The role trusts only `previdus/adaptly`'s `main` branch and can run the deployment script only on the tagged Adaptly host. Since Systems Manager runs commands with host-level privileges, protect `main` and limit who can push to it. Deployment requires that role to exist and be accessible; failures appear in GitHub Actions.
