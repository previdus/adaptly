# Working on Adaptly

## Access and prerequisites

Install Git and Node.js 22.13 or newer (the deployment workflow uses 22.13.1), with npm. Obtain GitHub collaborator access from the repository owner to push branches. Authenticate Git with your own GitHub account using your credential manager or SSH; never commit tokens or AWS credentials. Read access alone allows checkout but does not grant push access.

## Clone and run

```bash
git clone https://github.com/previdus/adaptly.git
cd adaptly
npm run install:ci
npm run dev
```

Open the local URL printed by the server, normally http://127.0.0.1:5173/. Keep the terminal running. Use a test learner identity; local learner records are separate from AWS. The repository includes the runtime configuration and question banks. Local development uses a Cloudflare Workers emulator with D1 storage; an AWS login is not needed to develop the UI. Use HTTPS or localhost for browser camera and microphone permissions.

## Where to work

- `app/page.tsx`: main navigation and learning experience.
- `app/GameChooser.tsx`: game and subject selection.
- `app/ArenaHub.tsx`, `app/ArenaCall.tsx`: multiplayer rooms, standings, and video call.
- `app/api/arena/route.ts`: room lifecycle, answers, room discovery, and video signaling.
- `app/api/family/route.ts`: learner identity and saved history.
- `lib/learning.ts`: subjects, concepts, adaptive progression, question generation, and timing.
- `lib/topic-bank.ts`, `lib/multiply-bank.ts`, `lib/grammar-bank.ts`: game question banks.
- `drizzle/`: versioned database scripts and schema snapshots.
- `.github/workflows/deploy-aws.yml`: automatic deployment.
- `infra/aws/`, `Dockerfile.aws-poc`, `scripts/deploy-aws-poc.sh`, `scripts/start-aws-poc.sh`: AWS infrastructure, build, migrations, and restart.

## Check a change

```bash
npx tsc --noEmit
npm run build
```

Run focused lint for files you changed, for example `npx eslint app/ArenaCall.tsx`. Verify the affected flow in the browser at phone and desktop widths. For arena changes, use two separate browser sessions to create and join a room, start a match, answer questions, and check spectator behavior. Check camera, microphone, and fullscreen using real devices when changing calls. A successful build does not establish that video works across networks: the current peer connection uses public STUN and has no TURN relay.

## Database and content changes

Keep existing learner history compatible. Add new, ordered SQL migrations under `drizzle/` rather than modifying a migration already applied to AWS. Review generated migrations (`npm run db:generate`) before committing. The AWS startup script applies numbered SQL files once and records them in a migration ledger. Arena tables also initialize in the arena API. Test database changes on disposable local data before deploying; never delete the AWS state directory to apply a schema update.

Question-bank code ships with the app. Review answers, distractors, concept labels, difficulty, and time allowances. Check video links and their suitability for children. Do not commit learner data, database exports, `.wrangler/` state, or local secrets. The repository is source code and content, not a copy of production records.

## Commit and push

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/describe-your-change
# Make and check your changes.
git add app lib drizzle
# Stage only the relevant files that exist and changed; inspect before committing.
git diff --cached
git commit -m "Describe the change"
git push -u origin feature/describe-your-change
```

Open a pull request into `main`. Repository permissions and branch protection determine who can merge. Avoid committing unrelated files. A direct push or merge into `main` that changes a deployment-watched path triggers AWS deployment; a feature branch push does not deploy.

## Confirm deployment

Open https://github.com/previdus/adaptly/actions and inspect the run for the commit. The workflow installs dependencies, checks types, builds, obtains short-lived AWS credentials through OIDC, and asks Systems Manager to refresh the tagged EC2 host. Inspect failed step logs before retrying. A green run confirms the script reported a healthy app; verify the actual AWS URL and affected flow as well. A documentation-only change generally does not trigger deployment.

AWS access is needed for infrastructure administration and server diagnosis, not ordinary code contributions. Use your own approved AWS access in `us-east-1`. The deployed app stores data in the persistent host volume; the deployment retains it. The deployment script can restore the prior image on failed health checks, but this does not reverse database migrations.
