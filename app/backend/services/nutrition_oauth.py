"""OAuth helpers for the FatSecret API.

Two auth strategies are supported:

  OAuth 2.0 (primary) — direct to platform.fatsecret.com
    Requires FATSECRET_CLIENT_ID / FATSECRET_CLIENT_SECRET and your
    server's IP to be whitelisted on the FatSecret platform.

  OAuth 1.0a (fallback) — via fatsecret4.p.rapidapi.com
    Uses the RapidAPI key + HMAC-SHA1 signed params.  No IP whitelist
    needed.  The signature base URL must be platform.fatsecret.com even
    though the request is sent to the RapidAPI host.

Tokens are cached in memory and refreshed automatically when they expire.
"""

import base64
import hashlib
import hmac
import time
import urllib.parse
import uuid

import httpx
from core.config import settings

# ── OAuth 2.0 ─────────────────────────────────────────────────────────────────

_cached_token: str = ""
_token_expires_at: float = 0.0

TOKEN_URL = "https://oauth.fatsecret.com/connect/token"


def get_bearer_token() -> str:
    """
    Return a valid OAuth 2.0 bearer token, fetching a fresh one if the
    cached token is missing or within 30 seconds of expiry.
    """
    global _cached_token, _token_expires_at

    if _cached_token and time.time() < _token_expires_at - 30:
        return _cached_token

    response = httpx.post(
        TOKEN_URL,
        data={"grant_type": "client_credentials", "scope": "basic"},
        auth=(settings.FATSECRET_CLIENT_ID, settings.FATSECRET_CLIENT_SECRET),
    )
    response.raise_for_status()
    data = response.json()

    _cached_token = data["access_token"]
    _token_expires_at = time.time() + int(data.get("expires_in", 86400))
    return _cached_token


# ── OAuth 1.0a ────────────────────────────────────────────────────────────────


def build_oauth1_url(request_params: dict, send_url: str) -> str:
    """
    Return a fully-signed URL for an OAuth 1.0a GET request.

    Combines request_params with OAuth metadata, signs everything with
    HMAC-SHA1 using the FatSecret consumer secret, and returns the
    complete URL with all params (including the signature) in the query
    string.  The caller should pass this URL directly to httpx without
    any additional params to avoid double-encoding.
    """
    oauth_params = {
        "oauth_consumer_key": settings.FATSECRET_CLIENT_ID,
        "oauth_signature_method": "HMAC-SHA1",
        "oauth_timestamp": str(int(time.time())),
        "oauth_nonce": uuid.uuid4().hex,
        "oauth_version": "1.0",
    }

    all_params = {**request_params, **oauth_params}

    # Percent-encode every key and value for the normalised parameter string
    encoded_pairs = sorted(
        (urllib.parse.quote(str(k), safe=""), urllib.parse.quote(str(v), safe=""))
        for k, v in all_params.items()
    )
    norm_params = "&".join(k + "=" + v for k, v in encoded_pairs)

    # Signature base string: METHOD & encoded_url & encoded_params
    # Sign against the URL the request is actually sent to
    base_string = "&".join([
        "GET",
        urllib.parse.quote(send_url, safe=""),
        urllib.parse.quote(norm_params, safe=""),
    ])

    signing_key = urllib.parse.quote(settings.FATSECRET_CONSUMER_SECRET, safe="") + "&"
    raw_sig = hmac.new(
        signing_key.encode(), base_string.encode(), hashlib.sha1
    ).digest()
    all_params["oauth_signature"] = base64.b64encode(raw_sig).decode()

    # Build the query string manually — do NOT hand params to httpx so it
    # cannot re-encode them and invalidate the signature
    qs = "&".join(
        urllib.parse.quote(str(k), safe="") + "=" + urllib.parse.quote(str(v), safe="")
        for k, v in all_params.items()
    )
    return send_url + "?" + qs
