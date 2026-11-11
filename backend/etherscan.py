"""
Fetch verified Solidity source from block explorers.
Supports Ethereum, Base, Polygon, Arbitrum, BSC.
"""
import httpx
import logging
from config import ETHERSCAN_API_KEY

log = logging.getLogger(__name__)

EXPLORERS: dict[str, str] = {
    "ethereum": "https://api.etherscan.io/api",
    "base":     "https://api.basescan.org/api",
    "polygon":  "https://api.polygonscan.com/api",
    "arbitrum": "https://api.arbiscan.io/api",
    "bsc":      "https://api.bscscan.com/api",
}


class ContractNotVerified(Exception):
    pass


class ExplorerError(Exception):
    pass


async def fetch_contract_source(address: str, network: str = "ethereum") -> tuple[str, str]:
    """
    Fetch verified source code for a contract address.
    Returns (source_code, contract_name).
    Raises ContractNotVerified or ExplorerError.
    """
    base_url = EXPLORERS.get(network)
    if not base_url:
        raise ValueError(f"Unsupported network: {network}. Use: {list(EXPLORERS)}")

    params = {
        "module":  "contract",
        "action":  "getsourcecode",
        "address": address,
        "apikey":  ETHERSCAN_API_KEY,
    }

    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(base_url, params=params)
        resp.raise_for_status()
        data = resp.json()

    if data.get("status") != "1" or not data.get("result"):
        raise ExplorerError(f"Explorer error: {data.get('message', 'unknown error')}")

    result = data["result"][0]
    source = result.get("SourceCode", "")

    if not source:
        raise ContractNotVerified(
            f"Contract {address} is not verified on {network}. "
            "Only verified contracts can be audited."
        )

    # Handle multi-file JSON format (wrapped in {{ }})
    if source.startswith("{{"):
        import json
        inner = json.loads(source[1:-1])  # strip outer {{ }}
        sources = inner.get("sources", {})
        # Concatenate all Solidity files
        parts = []
        for filename, file_data in sources.items():
            content = file_data.get("content", "")
            parts.append(f"// File: {filename}\n{content}")
        source = "\n\n".join(parts)
    elif source.startswith("{"):
        import json
        inner = json.loads(source)
        sources = inner.get("sources", {})
        parts = []
        for filename, file_data in sources.items():
            content = file_data.get("content", "")
            parts.append(f"// File: {filename}\n{content}")
        if parts:
            source = "\n\n".join(parts)

    contract_name = result.get("ContractName", "Unknown")
    log.info(f"Fetched source for {contract_name} ({address}) on {network}: {len(source)} chars")
    return source, contract_name
