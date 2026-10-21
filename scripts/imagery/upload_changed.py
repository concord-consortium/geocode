"""Upload only the tiles whose content differs from what is already in S3.

For refreshing a prefix in place. `upload.sh` syncs with --size-only, which skips a rebuilt tile that
happens to keep its byte size; this compares MD5s against the objects' ETags instead (equal for
these small, single-part uploads). Changed and new tiles are hard-linked into a staging directory
and copied up with the same headers as upload.sh. Tiles in S3 but not on disk are reported, not
deleted.

Because tiles are cached for a year, follow an in-place refresh with a CloudFront invalidation of
the prefix.

usage: /opt/homebrew/bin/python3 upload_changed.py [PREFIX] [--dry-run]
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys

BUCKET = "models-resources"


def remote_etags(prefix):
    out = subprocess.run(["aws", "s3api", "list-objects-v2", "--bucket", BUCKET, "--prefix", prefix + "/",
                          "--query", "Contents[].[Key,ETag]", "--output", "json"],
                         check=True, capture_output=True, text=True).stdout
    return {key[len(prefix) + 1:]: etag.strip('"') for key, etag in (json.loads(out) or [])}


def local_md5s(root):
    result = {}
    for dirpath, _, files in os.walk(root):
        for name in files:
            if name.endswith(".webp"):
                path = os.path.join(dirpath, name)
                with open(path, "rb") as f:
                    result[os.path.relpath(path, root)] = hashlib.md5(f.read()).hexdigest()
    return result


def main():
    args = [a for a in sys.argv[1:] if a != "--dry-run"]
    dry_run = "--dry-run" in sys.argv
    prefix = args[0] if args else "geocode-imagery/vivid-2020"
    os.chdir(os.path.dirname(os.path.abspath(__file__)))

    remote = remote_etags(prefix)
    local = local_md5s("tiles")
    changed = sorted(k for k, md5 in local.items() if k in remote and remote[k] != md5)
    new = sorted(k for k in local if k not in remote)
    orphaned = sorted(k for k in remote if k not in local)
    print(f"{len(local)} local tiles, {len(remote)} in s3://{BUCKET}/{prefix}/: "
          f"{len(changed)} changed, {len(new)} new, {len(orphaned)} only in S3")
    if dry_run or not (changed or new):
        return

    staging = os.path.join("build", "upload-staging")
    shutil.rmtree(staging, ignore_errors=True)
    for key in changed + new:
        os.makedirs(os.path.join(staging, os.path.dirname(key)), exist_ok=True)
        os.link(os.path.join("tiles", key), os.path.join(staging, key))
    subprocess.run(["aws", "s3", "cp", staging + "/", f"s3://{BUCKET}/{prefix}/", "--recursive",
                    "--only-show-errors", "--content-type", "image/webp",
                    "--cache-control", "public, max-age=31536000, immutable"], check=True)
    shutil.rmtree(staging)
    print(f"Uploaded {len(changed) + len(new)} tiles")


if __name__ == "__main__":
    main()
