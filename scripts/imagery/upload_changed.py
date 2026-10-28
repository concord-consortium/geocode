"""Upload only the tiles whose content differs from what is already in S3.

NOTE: Only use this script during development. Once a tile set has been released and
used by non-developers, a new prefix should be used instead.

This script is for refreshing a prefix in place. `upload.sh` syncs with --size-only, which skips
a rebuilt tile that happens to keep its byte size; this compares MD5s against the objects' ETags
instead (equal for these small, single-part uploads). Changed and new tiles are hard-linked into a
staging directory and copied up with the same headers as upload.sh. Tiles in S3 but not on disk are
reported, and deleted with --delete (needed when a rebuild stops writing some tiles, as masking the
water does: otherwise the old water tiles keep being served). Run with --dry-run first to see the counts.

Because tiles are cached for a year, follow an in-place refresh with a CloudFront invalidation of
the prefix.

usage: /opt/homebrew/bin/python3 upload_changed.py [PREFIX] [--dry-run] [--delete [--max-delete N]]
"""
import hashlib
import json
import os
import shutil
import subprocess
import sys

BUCKET = "models-resources"


def data_dir():
    """All inputs and outputs live in data/ next to this script (gitignored)."""
    path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
    os.makedirs(path, exist_ok=True)
    return path


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


def delete(prefix, keys):
    """Delete tiles from the prefix, 1,000 per request (the S3 limit)."""
    batch_file = os.path.join("build", "delete-batch.json")
    for i in range(0, len(keys), 1000):
        with open(batch_file, "w") as f:
            json.dump({"Objects": [{"Key": f"{prefix}/{k}"} for k in keys[i:i + 1000]], "Quiet": True}, f)
        result = subprocess.run(["aws", "s3api", "delete-objects", "--bucket", BUCKET, "--delete",
                                 f"file://{batch_file}", "--output", "json"], check=True, capture_output=True, text=True)
        errors = json.loads(result.stdout or "{}").get("Errors", [])   # per-key failures still exit 0
        if errors:
            sys.exit(f"{len(errors)} deletes failed, e.g. {errors[0]}")
    os.remove(batch_file)
    print(f"Deleted {len(keys)} tiles that are no longer built")


def main():
    argv = sys.argv[1:]
    max_delete = None
    if "--max-delete" in argv:   # safety cap: refuse to delete more tiles than this
        i = argv.index("--max-delete")
        max_delete = int(argv[i + 1])
        del argv[i:i + 2]
    flags = {"--dry-run", "--delete"}
    args = [a for a in argv if a not in flags]
    dry_run, delete_orphans = "--dry-run" in argv, "--delete" in argv
    prefix = args[0] if args else "geocode-imagery/vivid-2020"
    os.chdir(data_dir())

    remote = remote_etags(prefix)
    local = local_md5s("tiles")
    if not local:
        sys.exit("No local tiles: refusing to compare (and, with --delete, to empty the prefix)")
    changed = sorted(k for k, md5 in local.items() if k in remote and remote[k] != md5)
    new = sorted(k for k in local if k not in remote)
    orphaned = sorted(k for k in remote if k not in local and k.endswith(".webp"))
    print(f"{len(local)} local tiles, {len(remote)} in s3://{BUCKET}/{prefix}/: "
          f"{len(changed)} changed, {len(new)} new, {len(orphaned)} only in S3")
    if dry_run:
        return
    if delete_orphans and max_delete is not None and len(orphaned) > max_delete:
        sys.exit(f"{len(orphaned)} tiles would be deleted, more than --max-delete {max_delete}; nothing changed")
    if changed or new:
        upload(prefix, changed + new)
    if delete_orphans and orphaned:
        delete(prefix, orphaned)


def upload(prefix, keys):
    staging = os.path.join("build", "upload-staging")
    shutil.rmtree(staging, ignore_errors=True)
    for key in keys:
        os.makedirs(os.path.join(staging, os.path.dirname(key)), exist_ok=True)
        os.link(os.path.join("tiles", key), os.path.join(staging, key))
    subprocess.run(["aws", "s3", "cp", staging + "/", f"s3://{BUCKET}/{prefix}/", "--recursive",
                    "--only-show-errors", "--content-type", "image/webp",
                    "--cache-control", "public, max-age=31536000, immutable"], check=True)
    shutil.rmtree(staging)
    print(f"Uploaded {len(keys)} tiles")


if __name__ == "__main__":
    main()
