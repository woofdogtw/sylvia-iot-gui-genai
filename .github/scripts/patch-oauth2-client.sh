#!/usr/bin/env bash
# Add http://localhost:9000/#/auth/callback to the OAuth2 public client's redirect URIs.
# The deployment start.sh only configures redirect URIs for port 1080 (production),
# but E2E tests serve the SPA at port 9000.

set -e

BASE_URL="http://localhost:1080"
REDIRECT_URI_ENC="http%3A%2F%2Flocalhost%3A1080%2Fauth%2Foauth2%2Fredirect"
LOGIN_STATE="response_type%3Dcode%26client_id%3Dpublic%26redirect_uri%3D${REDIRECT_URI_ENC}"

SESSION_ID=$(curl -sf -D - -o /dev/null -X POST "${BASE_URL}/auth/oauth2/login" \
    -d "state=${LOGIN_STATE}&account=admin&password=admin" \
    | grep -oP 'session_id=\K[^&;]+' | tr -d '\r')

AUTH_CODE=$(curl -sf -D - -o /dev/null -X POST "${BASE_URL}/auth/oauth2/authorize" \
    -d "allow=yes&session_id=${SESSION_ID}&client_id=public&response_type=code&redirect_uri=${REDIRECT_URI_ENC}" \
    | grep -oP 'code=\K[^&\s]+' | tr -d '\r')

TOKEN=$(curl -sf -X POST "${BASE_URL}/auth/oauth2/token" \
    -d "grant_type=authorization_code&code=${AUTH_CODE}&redirect_uri=http://localhost:1080/auth/oauth2/redirect&client_id=public" \
    | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

curl -sf -X PATCH "${BASE_URL}/coremgr/api/v1/client/public" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d '{"data":{"redirectUris":["http://localhost:1080/auth/oauth2/redirect","http://localhost:1080/#/auth/callback","http://localhost:9000/#/auth/callback"]}}'

echo "OAuth2 public client patched: added http://localhost:9000/#/auth/callback"
