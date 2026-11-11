"""P21 customer-flow acceptance: real Chromium CSV -> saved owner JSON -> real disk P9/P12/P16 CLI.

Synthetic data only. Browser HTML loaded with set_content (restricted environment blocks file://).
Requires Python playwright + Chromium, Node >=20, and a complete SMAX source checkout.
"""
from pathlib import Path
from playwright.sync_api import sync_playwright, expect
import hashlib
import json
import os
import subprocess
import tempfile
import shutil

ROOT = Path(__file__).resolve().parents[2]
PORTAL = (ROOT / "site" / "owner.html").read_text("utf8")
BUNDLE_CLI = ROOT / "preprocessing" / "self-owner-delivery-cli.mjs"
PRIVATE = "PRIVATE_CUSTOMER_75"
SOURCE = ("일자,판매처,금액,메모\n"
          f"2026-11-01,온라인,100,{PRIVATE}\n"
          "2026-11-02,매장,-10,SECRET_RECORD_76\n").encode("utf8")
HOLD = ("일자,판매처,금액,메모\n"
        "2026-02-30,온라인,100,HOLD_SOURCE_ROW\n").encode("utf8")
CHECKS = []

def check(condition, label):
    assert condition, label
    CHECKS.append(label)

def run(*args):
    p = subprocess.run(["node", str(BUNDLE_CLI), *map(str, args)], cwd=ROOT,
                       text=True, capture_output=True, timeout=25)
    assert p.returncode in (0, 1), (p.returncode, p.stderr)
    return p

def create_browser_draft(page, source, source_name="sample.csv"):
    page.set_content(PORTAL, wait_until="load")
    expect(page.locator("#save")).to_be_disabled()
    page.locator("#csv").set_input_files({"name": source_name, "mimeType": "text/csv", "buffer": source})
    expect(page.locator("#save")).to_be_enabled()
    for key, header in [("date", "일자"), ("channel", "판매처"), ("amount", "금액")]:
        page.select_option("#" + key, header)
    with page.expect_download(timeout=15000) as generated:
        page.locator("#save").click()
    return generated.value


def main():
    with tempfile.TemporaryDirectory(prefix="smax-p21-native-") as work:
        root = Path(work)
        executable = os.getenv("SMAX_CHROMIUM_PATH")
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True, executable_path=executable or None,
                                                 args=["--no-sandbox"] if executable else [])
            context = browser.new_context(accept_downloads=True)
            page = context.new_page()
            network, exceptions = [], []
            page.on("request", lambda request: network.append(request.url))
            page.on("pageerror", lambda error: exceptions.append(str(error)))
            try:
                original = root / "source.csv"
                original.write_bytes(SOURCE)
                original_sha = hashlib.sha256(SOURCE).hexdigest()
                down = create_browser_draft(page, SOURCE)
                check(down.suggested_filename == "smax-owner-mapping.json", "correct customer download filename")
                draft_file = root / "owner.json"
                down.save_as(draft_file)
                draft = json.loads(draft_file.read_text("utf8"))
                check(draft["source_sha256"] == original_sha, "browser draft bound to physical CSV SHA")
                check(draft["mapping"] == {"date": "일자", "channel": "판매처", "amount": "금액"},
                      "browser explicitly selected 3 customer roles")
                check(PRIVATE not in page.content(), "source private rows absent from UI")
                output = root / "bundle"
                packaged = run("--package", original, draft_file, output)
                check(packaged.returncode == 0, f"real native P9/P12 disk package: {packaged.stderr}")
                pack = json.loads(packaged.stdout)
                check(pack["preview_status"] == "READY_FOR_OWNER_REVIEW" and
                      not pack["customer_package_approved"] and pack["owner_approval"] == "NOT_GRANTED",
                      "native review package cannot approve/execute")
                check(sorted(p.name for p in output.iterdir()) ==
                      ["manifest.json", "receipt.json", "report.html"],
                      "real package creates exactly 3 files")
                receipt = json.loads((output / "receipt.json").read_text("utf8"))
                report = (output / "report.html").read_text("utf8")
                check(receipt["summary"]["net_amount"] == "90.00" and "90.00" in report,
                      "native financial net 90.00 equals safe owner report")
                check(not any(s in report or s in packaged.stdout for s in
                          [PRIVATE, "SECRET_RECORD_76", "온라인", "매장"]),
                      "no original private rows/channels in customer report/stdout")
                check(original.read_bytes() == SOURCE, "original CSV bytes untouched after package")
                verified = run("--verify", output)
                check(verified.returncode == 0 and
                      json.loads(verified.stdout)["status"] == "OFFLINE_OWNER_REVIEW_BUNDLE_REVERIFIED",
                      "native on-disk re-verification succeeds")
                check(run("--package", original, draft_file, output).returncode == 1,
                      "duplicate target cannot overwrite a customer package")
                (output / "report.html").write_text(report + "TAMPERED", encoding="utf8")
                changed = run("--verify", output)
                check(changed.returncode == 1 and not changed.stdout and
                      "OWNER_BUNDLE_BLOCKED" in changed.stderr,
                      "tampered HTML is refused by native verifier")

                # Hold path: browser owner draft is real, receipt/report must not expose money.
                hold_original = root / "hold.csv"
                hold_original.write_bytes(HOLD)
                hold_down = create_browser_draft(page, HOLD, "hold.csv")
                hold_draft = root / "hold.json"
                hold_down.save_as(hold_draft)
                hold_out = root / "hold_bundle"
                held = run("--package", hold_original, hold_draft, hold_out)
                check(held.returncode == 0 and json.loads(held.stdout)["preview_status"] == "REVIEW_HOLD",
                      "invalid calendar date leads to native HOLD")
                hold_receipt = json.loads((hold_out / "receipt.json").read_text("utf8"))
                hold_html = (hold_out / "report.html").read_text("utf8")
                check(hold_receipt["summary"] is None and "100.00" not in hold_html and
                      "HOLD_SOURCE_ROW" not in hold_html,
                      "HOLD suppresses monetary totals and private rows")
                check(run("--verify", hold_out).returncode == 0,
                      "HOLD review package also re-verifies without approval")

                # SHA mismatch must be blocked before folder creation.
                stale_csv = root / "stale.csv"
                stale_csv.write_bytes(SOURCE + b"2026-11-03,Shop,1,NEW\n")
                stale_out = root / "stale_bundle"
                mismatch = run("--package", stale_csv, draft_file, stale_out)
                check(mismatch.returncode == 1 and not stale_out.exists() and not mismatch.stdout,
                      "original CSV modified: native blocks before creating destination")

                # Raw-byte UTF8 BOM must produce a different valid digest and bundle.
                bom_bytes = b"\xef\xbb\xbf" + SOURCE
                bom_original = root / "bom.csv"
                bom_original.write_bytes(bom_bytes)
                bom_down = create_browser_draft(page, bom_bytes, "bom.csv")
                bom_draft = root / "bom.json"
                bom_down.save_as(bom_draft)
                bom_data = json.loads(bom_draft.read_text("utf8"))
                check(bom_data["source_sha256"] == hashlib.sha256(bom_bytes).hexdigest() != original_sha,
                      "browser maps BOM-inclusive physical source SHA")
                bom_out = root / "bom_bundle"
                bom_pack = run("--package", bom_original, bom_draft, bom_out)
                check(bom_pack.returncode == 0 and
                      json.loads(bom_pack.stdout)["source_sha256"] == bom_data["source_sha256"],
                      "BOM browser draft accepted through full native package")
                check(run("--verify", bom_out).returncode == 0,
                      "BOM-inclusive bundle independently re-verified")
                # Real P16 security preflight: complete package is immutable, tampering fails.
                unchanged = {n: (bom_out / n).read_bytes() for n in ["manifest.json", "receipt.json", "report.html"]}
                check(run("--verify", bom_out).returncode == 0 and all(
                      (bom_out / n).read_bytes() == payload for n, payload in unchanged.items()),
                      "verified package files remain byte-for-byte unchanged")
                for item, marker in [("receipt.json", b'BROKEN_RECEIPT'),
                                     ("manifest.json", b'BROKEN_MANIFEST')]:
                    corrupt = root / ("corrupt_" + item)
                    shutil.copytree(bom_out, corrupt)
                    with (corrupt / item).open("ab") as target:
                        target.write(marker)
                    check(run("--verify", corrupt).returncode == 1,
                          "native verifier rejects altered " + item)
                extra = root / "unexpected_file_bundle"
                shutil.copytree(bom_out, extra)
                (extra / "extra.txt").write_text("untrusted", encoding="utf8")
                check(run("--verify", extra).returncode == 1,
                      "native verifier rejects unexpected extra file")
                linked = root / "symlink_report_bundle"
                shutil.copytree(bom_out, linked)
                (linked / "report.html").unlink()
                (linked / "report.html").symlink_to(bom_out / "report.html")
                check(run("--verify", linked).returncode == 1,
                      "native verifier refuses symlinked report")
                forged_out = root / "forged_bom_bundle"
                check(run("--package", bom_original, draft_file, forged_out).returncode == 1 and
                      not forged_out.exists(),
                      "non-BOM draft cannot authorize BOM source")
                check(not network and not exceptions, "zero browser requests or JS exceptions")
                print(json.dumps({"result": "PASS", "checks": len(CHECKS), "failed": 0,
                                  "chromium": browser.version, "node": subprocess.check_output(["node", "--version"], text=True).strip(),
                                  "source": "exact checked-in modules, synthetic physical disk files",
                                  "file_navigation": "NOT_TESTED: browser policy blocks file://",
                                  "full_repo_npm": "NOT_RUN",
                                  "details": CHECKS}, ensure_ascii=False, indent=2))
            finally:
                browser.close()

if __name__ == "__main__":
    main()
