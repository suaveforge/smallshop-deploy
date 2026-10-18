# smallshop-deploy
This is the **deployment-only** repository for SuaveForge / 작은가게.

- Source repository: https://github.com/suaveforge/smallshop (private)
- Deployment repo: https://github.com/suaveforge/smallshop-deploy (private)
- Application: Next.js Node 22 standalone, no live customer data and no real payment processing in the initial demo
- Deploy target: existing **server123 self-hosted Linux runner** only after confirming its exact GitHub runner labels and Docker availability.
- Docker Compose service: `smallshop-web`
- Host binding: `127.0.0.1:18195` by default (internal only, overridable via SMALLSHOP_PORT)

## Safeguards
This repository has **no automatic production deployment**. The deployment workflow is manual and must be enabled only after validating the runner labels, secrets, port, and reverse-proxy ownership. It must never stop existing SuaveForge containers.

## Required secret
`SMALLSHOP_SOURCE_READ_TOKEN` – fine-grained token with read-only Contents access to `suaveforge/smallshop`, configured as a GitHub Actions secret in this deployment repository.

## Commands (on the designated host, after building `smallshop:web`)
```sh
docker compose -p smallshop -f compose.yaml config
docker compose -p smallshop -f compose.yaml up -d --no-deps web
curl -fsS http://127.0.0.1:18195/api/health
```

No real business data, payment keys, or customer details are configured here.
