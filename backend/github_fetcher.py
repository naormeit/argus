"""
Fetch Solidity source from GitHub URLs.

Supported formats:
  - Single file:  github.com/owner/repo/blob/branch/path/to/File.sol
  - Directory:    github.com/owner/repo/tree/branch/contracts/
  - Repo root:    github.com/owner/repo
  - Raw URL:      raw.githubusercontent.com/owner/repo/branch/path/File.sol
"""
import re
import logging
import httpx

log = logging.getLogger(__name__)

_HEADERS = {
    "Accept":     "application/vnd.github.v3+json",
    "User-Agent": "Argus-Security-Auditor/2.0",
}

MAX_SOL_FILES = 20


class GitHubFetchError(Exception):
    pass


def _parse_url(url: str) -> dict:
    url = url.strip().rstrip("/")

    # raw.githubusercontent.com
    m = re.match(
        r"https?://raw\.githubusercontent\.com/([^/]+)/([^/]+)/([^/]+)/(.+)", url
    )
    if m:
        return dict(type="raw", owner=m[1], repo=m[2], ref=m[3], path=m[4])

    # github.com/.../blob/...
    m = re.match(
        r"https?://github\.com/([^/]+)/([^/]+)/blob/([^/]+)/(.+)", url
    )
    if m:
        return dict(type="blob", owner=m[1], repo=m[2], ref=m[3], path=m[4])

    # github.com/.../tree/...
    m = re.match(
        r"https?://github\.com/([^/]+)/([^/]+)/tree/([^/]+)(/.+)?", url
    )
    if m:
        return dict(type="tree", owner=m[1], repo=m[2], ref=m[3],
                    path=(m[4] or "").lstrip("/"))

    # github.com/owner/repo (root)
    m = re.match(r"https?://github\.com/([^/]+)/([^/]+)/?$", url)
    if m:
        return dict(type="tree", owner=m[1], repo=m[2], ref="HEAD", path="")

    raise GitHubFetchError(
        f"Unrecognised GitHub URL format. Paste a file (.sol), directory, or repo link."
    )


async def fetch_github_source(url: str) -> tuple[str, str]:
    """
    Returns (combined_source_code, human_label).
    Raises GitHubFetchError on any failure.
    """
    parsed = _parse_url(url)
    owner, repo, ref, path = (
        parsed["owner"], parsed["repo"], parsed["ref"], parsed["path"]
    )

    async with httpx.AsyncClient(timeout=20.0, headers=_HEADERS) as client:

        # ── Single file ──────────────────────────────────────────────────────
        if parsed["type"] in ("raw", "blob"):
            if parsed["type"] == "blob":
                raw_url = (
                    f"https://raw.githubusercontent.com/{owner}/{repo}/{ref}/{path}"
                )
            else:
                raw_url = url

            resp = await client.get(raw_url)
            if resp.status_code == 404:
                raise GitHubFetchError(f"File not found: {path}")
            resp.raise_for_status()

            source = resp.text
            if not source.strip():
                raise GitHubFetchError("File is empty.")

            label = path.split("/")[-1]
            log.info(f"GitHub single file: {label} ({len(source):,} chars)")
            return source, label

        # ── Directory / repo root ────────────────────────────────────────────
        api_url = (
            f"https://api.github.com/repos/{owner}/{repo}/git/trees/{ref}?recursive=1"
        )
        resp = await client.get(api_url)
        if resp.status_code == 404:
            raise GitHubFetchError(
                f"Repository not found or branch '{ref}' doesn't exist: {owner}/{repo}"
            )
        if resp.status_code == 403:
            raise GitHubFetchError(
                "GitHub rate limit hit (60 req/hr unauthenticated). Try again in a minute."
            )
        resp.raise_for_status()

        tree = resp.json().get("tree", [])
        sol_files = [
            item for item in tree
            if item["type"] == "blob"
            and item["path"].endswith(".sol")
            and (not path or item["path"].startswith(path))
        ]

        if not sol_files:
            raise GitHubFetchError(
                f"No .sol files found in {owner}/{repo}" + (f"/{path}" if path else "")
            )

        sol_files = sol_files[:MAX_SOL_FILES]
        log.info(f"GitHub tree: fetching {len(sol_files)} .sol file(s) from {owner}/{repo}")

        parts = []
        for item in sol_files:
            raw_url = (
                f"https://raw.githubusercontent.com/{owner}/{repo}/{ref}/{item['path']}"
            )
            r = await client.get(raw_url)
            if r.status_code == 200 and r.text.strip():
                parts.append(f"// File: {item['path']}\n{r.text}")

        if not parts:
            raise GitHubFetchError("Failed to fetch any .sol files from the repository.")

        source = "\n\n".join(parts)
        label  = f"{owner}/{repo}"
        log.info(f"GitHub repo: assembled {len(parts)} file(s) for {label} ({len(source):,} chars)")
        return source, label
