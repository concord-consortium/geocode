import json
import subprocess
import unittest

from protect_tiles import FUNCTION_PATH, load_cases, viewer_request_event

# Runs the CloudFront Function in Node, which accepts the same ES5 as cloudfront-js-2.0.
RUNNER = """
const fs = require("fs");
const handler = new Function(fs.readFileSync(process.argv[1], "utf8") + "\\nreturn handler;")();
const events = JSON.parse(fs.readFileSync(0, "utf8"));
console.log(JSON.stringify(events.map(e => !("statusCode" in handler(e)))));
"""


class ProtectTilesTest(unittest.TestCase):
    def test_cases(self):
        cases = load_cases()
        events = [viewer_request_event(case["headers"]) for case in cases]
        result = subprocess.run(["node", "-e", RUNNER, FUNCTION_PATH], input=json.dumps(events),
                                capture_output=True, text=True, check=True)
        for case, allowed in zip(cases, json.loads(result.stdout)):
            with self.subTest(case["name"]):
                self.assertEqual(allowed, case["allowed"])

    def test_cases_cover_both_outcomes(self):
        outcomes = {case["allowed"] for case in load_cases()}
        self.assertEqual(outcomes, {True, False})


if __name__ == "__main__":
    unittest.main()
