"""Attach the CloudFront Function that keeps other websites from using the imagery tiles.

models-resources.concord.org (distribution E1QHTGVGYD1DWZ) serves the whole models-resources bucket,
so the function runs only on a `geocode-imagery/*` cache behavior, which this script adds as a copy of
the distribution's default behavior. A separate staging distribution, a copy of production on its own
*.cloudfront.net domain, gets the same behavior so rule changes can be tried there first.

Staging and production each run their own function (geocode-imagery-protect-staging and
geocode-imagery-protect): a distribution always runs a function's LIVE stage, so with one shared
function, publishing a change to try it on staging would also publish it to production.

Every command checks what exists and only creates or changes what differs, so all are safe to re-run.
Before publishing, a function's code is run in CloudFront against every case in
cloudfront/protect-tiles-cases.json, and after deploying, the same cases are sent to the distribution.

usage:
  /opt/homebrew/bin/python3 protect_tiles.py staging [--dry-run] [--no-wait]
  /opt/homebrew/bin/python3 protect_tiles.py production [--dry-run] [--no-wait] [--yes] [--remove]
  /opt/homebrew/bin/python3 protect_tiles.py verify {staging,production}

`production` requires the code to already be live on staging, shows its plan, and asks before
changing anything. `production --remove` detaches the function from production again.
"""
import argparse
import copy
import json
import os
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

PRODUCTION_ID = "E1QHTGVGYD1DWZ"
PRODUCTION_DOMAIN = "models-resources.concord.org"
STAGING_COMMENT = "geocode-imagery staging, managed by geocode scripts/imagery/protect_tiles.py"
STAGING_CACHE_POLICY = "geocode-imagery-staging"
FUNCTION_NAMES = {"staging": "geocode-imagery-protect-staging", "production": "geocode-imagery-protect"}
FUNCTION_COMMENT = "Keeps other websites from using geocode-imagery tiles (geocode scripts/imagery)"
PATH_PATTERN = "geocode-imagery/*"
SAMPLE_TILE = "geocode-imagery/vivid-2020/10/56/447.webp"

HERE = os.path.dirname(os.path.abspath(__file__))
FUNCTION_PATH = os.path.join(HERE, "cloudfront", "protect-tiles.js")
CASES_PATH = os.path.join(HERE, "cloudfront", "protect-tiles-cases.json")


def aws(*args, missing=None):
    """Run an AWS CLI command and return its parsed JSON output.

    Returns None instead of exiting when the command fails with the error code `missing`."""
    result = subprocess.run(["aws", *args, "--output", "json"], capture_output=True, text=True)
    if result.returncode != 0:
        if missing and missing in result.stderr:
            return None
        sys.exit(f"aws {' '.join(args[:2])} failed:\n{result.stderr.strip()}")
    return json.loads(result.stdout) if result.stdout.strip() else {}


def write_temp_json(data):
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False) as f:
        json.dump(data, f)
    return f.name


def load_cases():
    with open(CASES_PATH) as f:
        return json.load(f)


def viewer_request_event(headers):
    """A CloudFront Functions viewer-request event for the sample tile with these headers."""
    return {
        "version": "1.0",
        "context": {"eventType": "viewer-request"},
        "viewer": {"ip": "192.0.2.1"},
        "request": {
            "method": "GET",
            "uri": "/" + SAMPLE_TILE,
            "querystring": {},
            "headers": {name: {"value": value} for name, value in headers.items()},
            "cookies": {},
        },
    }


def read_function_code():
    with open(FUNCTION_PATH, "rb") as f:
        return f.read()


# --- Functions ---

def function_arn(name):
    account = aws("sts", "get-caller-identity")["Account"]
    return f"arn:aws:cloudfront::{account}:function/{name}"


def deployed_code(name, stage):
    """The function's code at `stage`, or None if the function does not exist."""
    with tempfile.TemporaryDirectory() as tmp:
        out = os.path.join(tmp, "code.js")
        if aws("cloudfront", "get-function", "--name", name, "--stage", stage, out,
               missing="NoSuchFunctionExists") is None:
            return None
        with open(out, "rb") as f:
            return f.read()


def development_etag(name):
    return aws("cloudfront", "describe-function", "--name", name, "--stage", "DEVELOPMENT")["ETag"]


def function_changes(name):
    """What deploy_function would do, as a list of descriptions."""
    code = read_function_code()
    development = deployed_code(name, "DEVELOPMENT")
    changes = []
    if development is None:
        changes.append(f"create function {name}")
    elif development != code:
        changes.append(f"update function {name} with {os.path.relpath(FUNCTION_PATH)}")
    if deployed_code(name, "LIVE") != code:
        changes.append(f"test and publish function {name}")
    return changes


def deploy_function(name):
    """Create or update the function, test it in CloudFront, and publish it if it changed."""
    code = read_function_code()
    config = f"Comment={FUNCTION_COMMENT},Runtime=cloudfront-js-2.0"
    development = deployed_code(name, "DEVELOPMENT")
    if development is None:
        print(f"Creating function {name}")
        aws("cloudfront", "create-function", "--name", name, "--function-config", config,
            "--function-code", f"fileb://{FUNCTION_PATH}")
    elif development != code:
        print(f"Updating function {name}")
        aws("cloudfront", "update-function", "--name", name, "--if-match", development_etag(name),
            "--function-config", config, "--function-code", f"fileb://{FUNCTION_PATH}")
    else:
        print(f"Function {name} is up to date")

    if deployed_code(name, "LIVE") == code:
        print(f"Function {name} is already live")
        return
    test_function(name)
    print(f"Publishing function {name}")
    aws("cloudfront", "publish-function", "--name", name, "--if-match", development_etag(name))


def test_function(name):
    """Run the function's DEVELOPMENT code in CloudFront against every case; exit if any fails."""
    print(f"Testing function {name} in CloudFront")
    etag = development_etag(name)
    failures = []
    for case in load_cases():
        event_path = write_temp_json(viewer_request_event(case["headers"]))
        try:
            result = aws("cloudfront", "test-function", "--name", name, "--if-match", etag,
                         "--stage", "DEVELOPMENT", "--event-object", f"fileb://{event_path}")["TestResult"]
        finally:
            os.remove(event_path)
        if result.get("FunctionErrorMessage"):
            failures.append(f"{case['name']}: {result['FunctionErrorMessage']}")
            continue
        allowed = "request" in json.loads(result["FunctionOutput"])
        if allowed != case["allowed"]:
            failures.append(f"{case['name']}: {'allowed' if allowed else 'blocked'}")
    if failures:
        sys.exit("Function test failed, not publishing:\n  " + "\n  ".join(failures))
    print(f"  all {len(load_cases())} cases pass")


# --- Distributions ---

def find_staging_distribution():
    """The staging distribution's id, or None if it does not exist yet."""
    items = aws("cloudfront", "list-distributions")["DistributionList"].get("Items", [])
    ids = [d["Id"] for d in items if d["Comment"] == STAGING_COMMENT]
    if len(ids) > 1:
        sys.exit(f"More than one staging distribution: {', '.join(ids)}. Delete the extras.")
    return ids[0] if ids else None


def staging_cache_policy_id(production_policy_id):
    """A copy of production's cache policy for staging, created if it does not exist yet.

    A cache policy can be used by at most 100 distributions, and the shared S3-CORS-1 policy
    production uses is at that limit."""
    policies = aws("cloudfront", "list-cache-policies", "--type", "custom")["CachePolicyList"]
    for item in policies.get("Items", []):
        if item["CachePolicy"]["CachePolicyConfig"]["Name"] == STAGING_CACHE_POLICY:
            return item["CachePolicy"]["Id"]

    response = aws("cloudfront", "get-cache-policy", "--id", production_policy_id)
    config = response["CachePolicy"]["CachePolicyConfig"]
    config.update({"Name": STAGING_CACHE_POLICY,
                   "Comment": f"Copy of {config['Name']} for the geocode-imagery staging distribution"})
    config_path = write_temp_json(config)
    try:
        policy = aws("cloudfront", "create-cache-policy",
                     "--cache-policy-config", f"file://{config_path}")["CachePolicy"]
    finally:
        os.remove(config_path)
    print(f"Created cache policy {STAGING_CACHE_POLICY} ({policy['Id']})")
    return policy["Id"]


def create_staging_distribution():
    """Copy production's configuration, minus its domains, certificate, logging, and behaviors."""
    config = aws("cloudfront", "get-distribution-config", "--id", PRODUCTION_ID)["DistributionConfig"]
    config = copy.deepcopy(config)
    default_behavior = config["DefaultCacheBehavior"]
    default_behavior["CachePolicyId"] = staging_cache_policy_id(default_behavior["CachePolicyId"])
    config.update({
        "CallerReference": f"geocode-imagery-staging-{int(time.time())}",
        "Comment": STAGING_COMMENT,
        "Aliases": {"Quantity": 0},
        "ViewerCertificate": {"CloudFrontDefaultCertificate": True},
        "Logging": {"Enabled": False, "IncludeCookies": False, "Bucket": "", "Prefix": ""},
        "PriceClass": "PriceClass_100",
        "CacheBehaviors": {"Quantity": 0},
    })
    default_behavior["FunctionAssociations"] = {"Quantity": 0}
    config_path = write_temp_json(config)
    try:
        distribution = aws("cloudfront", "create-distribution",
                           "--distribution-config", f"file://{config_path}")["Distribution"]
    finally:
        os.remove(config_path)
    print(f"Created staging distribution {distribution['Id']} ({distribution['DomainName']})")
    return distribution["Id"]


def distribution_domain(distribution_id):
    return aws("cloudfront", "get-distribution", "--id", distribution_id)["Distribution"]["DomainName"]


def planned_behavior(distribution_id, arn):
    """The distribution's config with the geocode-imagery behavior running `arn` (or no function
    when `arn` is None), its ETag, and a description of the change, which is None if there is none."""
    response = aws("cloudfront", "get-distribution-config", "--id", distribution_id)
    config = response["DistributionConfig"]
    behaviors = config["CacheBehaviors"].setdefault("Items", [])
    behavior = next((b for b in behaviors if b["PathPattern"] == PATH_PATTERN), None)
    association = [{"FunctionARN": arn, "EventType": "viewer-request"}] if arn else []

    if behavior is None:
        if not arn:
            return config, response["ETag"], None
        # Copy the default behavior so the tiles keep the origin and caching they have now. First,
        # so no other behavior's pattern can match the tiles before it.
        behavior = copy.deepcopy(config["DefaultCacheBehavior"])
        behavior["PathPattern"] = PATH_PATTERN
        behavior["FunctionAssociations"] = {"Quantity": 1, "Items": association}
        behaviors.insert(0, behavior)
        config["CacheBehaviors"]["Quantity"] = len(behaviors)
        return config, response["ETag"], f"add a {PATH_PATTERN} behavior running {arn}"

    current = behavior["FunctionAssociations"].get("Items", [])
    others = [a for a in current if a["EventType"] != "viewer-request"]
    if [a for a in current if a["EventType"] == "viewer-request"] == association:
        return config, response["ETag"], None
    items = others + association
    behavior["FunctionAssociations"] = {"Quantity": len(items), "Items": items}
    change = f"run {arn} on {PATH_PATTERN}" if arn else f"stop running a function on {PATH_PATTERN}"
    return config, response["ETag"], change


def update_distribution(distribution_id, config, etag):
    config_path = write_temp_json(config)
    try:
        aws("cloudfront", "update-distribution", "--id", distribution_id, "--if-match", etag,
            "--distribution-config", f"file://{config_path}")
    finally:
        os.remove(config_path)


def wait_until_deployed(distribution_id):
    print(f"Waiting for {distribution_id} to deploy (usually 2-10 minutes)...")
    subprocess.run(["aws", "cloudfront", "wait", "distribution-deployed", "--id", distribution_id],
                   check=True)


# --- Verification ---

def verify(domain):
    """Request the sample tile with each case's headers and check what comes back."""
    url = f"https://{domain}/{SAMPLE_TILE}"
    print(f"Verifying {url}")
    failures = []
    for case in load_cases():
        request = urllib.request.Request(url, headers=case["headers"])
        try:
            with urllib.request.urlopen(request) as response:
                status = response.status
        except urllib.error.HTTPError as e:
            status = e.code
        if status != (200 if case["allowed"] else 403):
            failures.append(f"{case['name']}: HTTP {status}")
    if failures:
        sys.exit("Verification failed:\n  " + "\n  ".join(failures))
    print(f"  all {len(load_cases())} cases pass")


# --- Commands ---

def staging(args):
    name = FUNCTION_NAMES["staging"]
    distribution_id = find_staging_distribution()
    if args.dry_run:
        changes = function_changes(name)
        if distribution_id is None:
            changes.append("create the staging distribution and add the behavior")
        else:
            change = planned_behavior(distribution_id, function_arn(name))[2]
            changes += [change] if change else []
        print_plan(changes)
        return

    deploy_function(name)
    if distribution_id is None:
        distribution_id = create_staging_distribution()
    config, etag, change = planned_behavior(distribution_id, function_arn(name))
    if change:
        print(f"Staging distribution {distribution_id}: {change}")
        update_distribution(distribution_id, config, etag)
    else:
        print(f"Staging distribution {distribution_id} is up to date")
    if not args.no_wait:
        wait_until_deployed(distribution_id)
        verify(distribution_domain(distribution_id))


def production(args):
    name = FUNCTION_NAMES["production"]
    if args.remove:
        changes = []
        config, etag, change = planned_behavior(PRODUCTION_ID, None)
    else:
        if deployed_code(FUNCTION_NAMES["staging"], "LIVE") != read_function_code():
            sys.exit(f"{os.path.relpath(FUNCTION_PATH)} is not live on staging yet. "
                     "Run `protect_tiles.py staging` and test it there first.")
        changes = function_changes(name)
        config, etag, change = planned_behavior(PRODUCTION_ID, function_arn(name))
    changes += [f"production distribution {PRODUCTION_ID}: {change}"] if change else []
    print_plan(changes)
    if not changes or args.dry_run:
        return
    if not args.yes and input("This changes production. Type 'yes' to continue: ") != "yes":
        sys.exit("Cancelled")

    if not args.remove:
        deploy_function(name)
    if change:
        update_distribution(PRODUCTION_ID, config, etag)
    if not args.no_wait:
        wait_until_deployed(PRODUCTION_ID)
        if not args.remove:
            verify(PRODUCTION_DOMAIN)


def verify_command(args):
    if args.target == "production":
        verify(PRODUCTION_DOMAIN)
        return
    distribution_id = find_staging_distribution()
    if distribution_id is None:
        sys.exit("There is no staging distribution yet. Run `protect_tiles.py staging`.")
    verify(distribution_domain(distribution_id))


def print_plan(changes):
    if not changes:
        print("Everything is up to date")
    for change in changes:
        print(f"Will {change}")


def main():
    parser = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    commands = parser.add_subparsers(dest="command", required=True)

    staging_parser = commands.add_parser("staging", help="deploy to the staging distribution")
    production_parser = commands.add_parser("production", help="deploy to models-resources.concord.org")
    for p in (staging_parser, production_parser):
        p.add_argument("--dry-run", action="store_true", help="show what would change and stop")
        p.add_argument("--no-wait", action="store_true",
                       help="do not wait for the distribution to deploy or verify it")
    production_parser.add_argument("--yes", action="store_true", help="do not ask for confirmation")
    production_parser.add_argument("--remove", action="store_true",
                                   help="stop running the function on production")
    staging_parser.set_defaults(run=staging)
    production_parser.set_defaults(run=production)

    verify_parser = commands.add_parser("verify", help="send every test case to a distribution")
    verify_parser.add_argument("target", choices=["staging", "production"])
    verify_parser.set_defaults(run=verify_command)

    args = parser.parse_args()
    args.run(args)


if __name__ == "__main__":
    main()
