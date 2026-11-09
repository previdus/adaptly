#!/bin/bash

# Only disposable build cache and untagged images may be reclaimed here.
# The running app, tagged rollback image and persistent volumes are never removed.
prepare_docker_build() {
  local docker_root free_kb free_inodes
  docker_root=$(docker info --format '{{.DockerRootDir}}')
  free_kb=$(df -Pk "$docker_root" | awk 'NR == 2 {print $4}')
  free_inodes=$(df -Pi "$docker_root" | awk 'NR == 2 {print $4}')
  echo "Docker storage before build: ${free_kb} KiB and ${free_inodes} inodes free."

  if (( free_kb < 8388608 || free_inodes < 150000 )); then
    echo "Reclaiming unused Docker build cache and dangling images."
    docker builder prune --all --force
    docker image prune --force
    free_kb=$(df -Pk "$docker_root" | awk 'NR == 2 {print $4}')
    free_inodes=$(df -Pi "$docker_root" | awk 'NR == 2 {print $4}')
    echo "Docker storage after cleanup: ${free_kb} KiB and ${free_inodes} inodes free."
  fi

  if (( free_kb < 8388608 || free_inodes < 150000 )); then
    echo "Insufficient Docker build space after safe cache cleanup. The running app and learner data were not changed." >&2
    return 1
  fi
}
