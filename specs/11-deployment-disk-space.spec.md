# Safe deployment disk recovery

Before building on the existing EC2 host, inspect Docker filesystem free bytes and inodes. If fewer than 8 GiB or 150,000 inodes remain, prune unused Docker builder cache and dangling images only, then inspect again. Never prune volumes, remove learner state, remove running containers, or delete tagged rollback images to recover space. If space remains insufficient, fail before stopping the current app.

Separate dependency installation from source copying in the Dockerfile, so app-only updates can reuse dependencies. Remove npm download cache within the dependency layer. Preserve current health checking, persistent database mount and rollback behavior. Print preflight diagnostics in the deployment run for both success and failure.

Verify with mocked shell commands: healthy disk does not prune; exhausted disk or inodes trigger bounded cache cleanup; insufficient space after cleanup fails safely. Verify real deployment succeeds and the public app serves the updated lesson bundle.
