import assert from 'node:assert/strict';
import { it } from 'node:test';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

function preflight(beforeKB: number, afterKB: number, beforeInodes=500000, afterInodes=500000) {
  const temp=mkdtempSync(path.join(os.tmpdir(),'adaptly-space-test-'));
  const log=path.join(temp,'docker.log').replaceAll('\\','/');
  const cleaned=path.join(temp,'cleaned').replaceAll('\\','/');
  const helper=path.resolve('scripts/prepare-docker-build.sh').replaceAll('\\','/');
  const bash=process.platform==='win32' ? path.join(process.env.ProgramFiles || 'C:/Program Files','Git/usr/bin/bash.exe') : 'bash';
  const harness=`
    set -euo pipefail
    export PATH="/usr/bin:/bin:$PATH"
    docker() {
      printf '%s\n' "$*" >> "$TEST_LOG"
      if [[ "$1" == info ]]; then printf '/mock/docker\n'; fi
      if [[ "$1 $2" == 'builder prune' ]]; then touch "$TEST_CLEANED"; fi
    }
    df() {
      local free="$TEST_BEFORE_KB" inodes="$TEST_BEFORE_INODES"
      if [[ -f "$TEST_CLEANED" ]]; then free="$TEST_AFTER_KB"; inodes="$TEST_AFTER_INODES"; fi
      if [[ "$1" == '-Pk' ]]; then
        printf 'Filesystem 1024-blocks Used Available Capacity Mounted\nmock 30000000 1000 %s 50%% /mock/docker\n' "$free"
      else
        printf 'Filesystem Inodes IUsed IFree IUse%% Mounted\nmock 2000000 1000 %s 50%% /mock/docker\n' "$inodes"
      fi
    }
    source "$1"
    prepare_docker_build
  `;
  try {
    const result=spawnSync(bash,['--noprofile','--norc','-c',harness,'--',helper],{
      encoding:'utf8',env:{...process.env,TEST_LOG:log,TEST_CLEANED:cleaned,
        TEST_BEFORE_KB:String(beforeKB),TEST_AFTER_KB:String(afterKB),
        TEST_BEFORE_INODES:String(beforeInodes),TEST_AFTER_INODES:String(afterInodes)},
    });
    if(result.error) throw result.error;
    const commands=readFileSync(log,'utf8');
    assert.doesNotMatch(commands,/volume|system prune|container|image prune.*--all/);
    return {...result,commands};
  } finally { rmSync(temp,{recursive:true,force:true}); }
}
it('leaves healthy deployment caches alone',()=>{
  const result=preflight(20000000,20000000);
  assert.equal(result.status,0,result.stderr);
  assert.doesNotMatch(result.commands,/prune/);
});
it('recovers unused build cache before deploying when storage is exhausted',()=>{
  const result=preflight(1000,20000000);
  assert.equal(result.status,0,result.stderr);
  assert.match(result.commands,/builder prune --all --force/);
  assert.match(result.commands,/image prune --force/);
});
it('also recovers when inode capacity rather than byte capacity is exhausted',()=>{
  const result=preflight(20000000,20000000,10,500000);
  assert.equal(result.status,0,result.stderr);
  assert.match(result.commands,/builder prune/);
});
it('fails before replacing the app if safe cleanup cannot recover enough space',()=>{
  const result=preflight(1000,1000);
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/Insufficient/);
});
