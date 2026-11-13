"""
GitHub App helpers for Phase 5 CI integration.
  - Webhook signature verification (HMAC-SHA256)
  - App JWT generation (RS256)
  - Installation access token exchange
  - GitHub API calls: PR files, file content, PR comment
"""
import hashlib
import hmac
import logging
import time
from typing import Optional

import httpx
import jwt

from config import GITHUB_APP_ID, GITHUB_PRIVATE_KEY, GITHUB_WEBHOOK_SECRET

log = logging.getLogger(__name__)
_GITHUB_API = "https://api.github.com"
_GH_HEADERS = {
    "Accept": "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
}


def verify_webhook_signature(payload: bytes, header: str) -> bool:
    if not GITHUB_WEBHOOK_SECRET or not header.startswith("sha256="):
        return False
    expected = "sha256=" + hmac.new(
        GITHUB_WEBHOOK_SECRET.encode(), payload, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, header)


def _app_jwt() -> str:
    if not GITHUB_APP_ID or not GITHUB_PRIVATE_KEY:
        raise RuntimeError("GITHUB_APP_ID and GITHUB_PRIVATE_KEY must be set.")
    now = int(time.time())
    return jwt.encode(
        {"iat": now - 60, "exp": now + 600, "iss": str(GITHUB_APP_ID)},
        GITHUB_PRIVATE_KEY,
        algorithm="RS256",
    )


async def get_installation_token(installation_id: int) -> str:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{_GITHUB_API}/app/installations/{installation_id}/access_tokens",
            headers={**_GH_HEADERS, "Authorization": f"Bearer {_app_jwt()}"},
        )
        resp.raise_for_status()
        return resp.json()["token"]


async def get_pr_sol_files(token: str, owner: str, repo: str, pr_number: int) -> list[dict]:
    """Return list of {filename, raw_url} for changed .sol files in a PR."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"{_GITHUB_API}/repos/{owner}/{repo}/pulls/{pr_number}/files",
            headers={**_GH_HEADERS, "Authorization": f"Bearer {token}"},
        )
        resp.raise_for_status()
    return [
        {"filename": f["filename"], "raw_url": f["raw_url"]}
        for f in resp.json()
        if f["filename"].endswith(".sol") and f.get("status") != "removed"
    ]


async def fetch_raw_file(token: str, raw_url: str) -> str:
    async with httpx.AsyncClient(follow_redirects=True) as client:
        resp = await client.get(
            raw_url, headers={"Authorization": f"Bearer {token}"}
        )
        resp.raise_for_status()
        return resp.text


async def post_pr_comment(token: str, owner: str, repo: str, pr_number: int, body: str) -> None:
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"{_GITHUB_API}/repos/{owner}/{repo}/issues/{pr_number}/comments",
            headers={**_GH_HEADERS, "Authorization": f"Bearer {token}"},
            json={"body": body},
        )
        resp.raise_for_status()
