#!/usr/bin/env python3
"""SMAX private SELF offline end-to-end QA (developer only, never customer data).

Requires developer-installed Playwright and Chromium:
  python -m pip install playwright
  python -m playwright install chromium
  npm test && npm run build:self
  python scripts/qa_browser.py
To test Windows Edge if available:
  python scripts/qa_browser.py --channel msedge
This script never uploads customer data. It tests the local build with synthetic CSV.
"""
from __future__ import annotations

import argparse
import csv
import io
import json
import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

REPO = Path(__file__).resolve().parents[1]
DEFAULT_HTML = REPO / "dist" / "SMAX_SELF_OFFLINE.html"
DEFAULT_CSV = REPO / "examples" / "SMAX_SELF_SAMPLE.csv"


def main() -> int:
    parser = argparse.ArgumentParser(description="SMAX SELF local file Chromium/Edge QA")
    parser.add_argument("--html", type=Path, default=DEFAULT_HTML)
    parser.add_argument("--csv", dest="sample", type=Path, default=DEFAULT_CSV)
    parser.add_argument("--channel", choices=["chromium", "msedge"], default="chromium")
    parser.add_argument("--headed", action="store_true")
    args = parser.parse_args()
    target = args.html.expanduser().resolve()
    sample = args.sample.expanduser().resolve()
    if not target.is_file() or not sample.is_file():
        print("FAIL: build HTML or synthetic CSV sample missing. Run npm test && npm run build:self first.",
              file=sys.stderr)
        return 2
    if target.suffix.lower() != ".html" or sample.suffix.lower() != ".csv":
        print("FAIL: expected HTML build and CSV fixture only", file=sys.stderr)
        return 2
    errors: list[str] = []
    requests: list[str] = []
    checks: list[str] = []
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(
                channel=None if args.channel == "chromium" else "msedge",
                headless=not args.headed,
            )
        except Exception as exc:
            print(json.dumps({"status": "BLOCKED", "stage": "browser_launch",
                              "error": str(exc), "reason": "browser executable or policy"},
                             ensure_ascii=False), file=sys.stderr)
            return 3
        try:
            context = browser.new_context(accept_downloads=True, viewport={"width": 1280, "height": 900})
            context.set_offline(True)
            page = context.new_page()
            page.on("pageerror", lambda exc: errors.append(str(exc)))
            page.on("console", lambda msg: errors.append(msg.text) if msg.type == "error" else None)
            page.on("request", lambda req: requests.append(req.url)
                    if req.url.startswith(("http://", "https://")) else None)

            page.goto(target.as_uri(), wait_until="load")
            assert page.title().startswith("SMAX"), "local page title missing"
            page.locator('[data-action="select"][data-id="spreadsheet"]').first.click()
            page.locator("#tab-chat").click()
            page.locator("#csv-upload").set_input_files(str(sample))
            checks.append("offline file:// page opens with local CSV chooser")

            for field, label in {
                "date": "거래날짜",
                "item": "품목",
                "amount": "결제금액",
            }.items():
                page.locator("#map-" + field).select_option(label)
            page.locator('[data-action="run-csv"]').click()
            result = page.locator(".csv-result")
            assert "검토 필요 2행" in result.inner_text(), "expected duplicate and invalid sample rows"
            assert "DUPLICATE" in result.inner_text(), "duplicate must remain flagged"
            assert "INVALID_DATE" in result.inner_text(), "invalid date must remain flagged"
            checks.append("confirmed mapping produces flagged review preview")

            with page.expect_download(timeout=10000) as download_info:
                page.locator('[data-action="download-csv"]').click()
            download = download_info.value
            assert download.suggested_filename == "SMAX_STANDARDIZED.csv"
            bytes_out = Path(download.path()).read_bytes()
            assert bytes_out.startswith(b"\xef\xbb\xbf"), "UTF-8 BOM missing"
            rows = list(csv.DictReader(io.StringIO(bytes_out.decode("utf-8-sig"))))
            assert len(rows) == 4, f"row loss: {len(rows)} (expected 4)"
            assert sum(r["검토상태"] == "NEEDS_REVIEW" for r in rows) == 2
            checks.append("downloaded UTF-8 CSV retains all 4 synthetic rows")

            page.locator("#map-amount").select_option("품목")
            assert page.locator('[data-action="download-csv"]').count() == 0, (
                "stale CSV download remained after mapping change"
            )
            assert page.locator('[data-action="run-csv"]').is_disabled(), (
                "duplicate mapping should disable transformation"
            )
            checks.append("invalid remap invalidates download and prevents execution")

            page.set_viewport_size({"width": 375, "height": 812})
            assert page.locator("#csv-upload").count() == 1
            checks.append("narrow mobile-width layout retains file input")

            assert not errors, f"browser errors: {errors}"
            assert not requests, f"network requests detected: {requests}"
            checks.append("offline mode with no console errors or outbound HTTP(S) requests")
            print(json.dumps({
                "status": "PASS",
                "checks": checks,
                "browser": args.channel,
                "source": str(target),
                "synthetic_csv": str(sample),
                "outbound_http_requests": 0,
            }, ensure_ascii=False))
            return 0
        except Exception as exc:
            environment_blocked = "ERR_BLOCKED_BY_ADMINISTRATOR" in str(exc)
            print(json.dumps({
                "status": "BLOCKED" if environment_blocked else "FAIL",
                "checks_completed": checks,
                "error": str(exc),
                "browser_errors": errors,
                "outbound_http_requests": requests,
            }, ensure_ascii=False), file=sys.stderr)
            return 3 if environment_blocked else 1
        finally:
            browser.close()


if __name__ == "__main__":
    raise SystemExit(main())
