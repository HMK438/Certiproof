<<<<<<< HEAD
# Certiproof
=======
# CertiProof

**Tamper-evident academic credentials, verified in seconds — not weeks.**

A Web3 academic credential platform: institutions issue certificates as cryptographic hashes
anchored on an Ethereum smart contract, and anyone can verify authenticity instantly — by
certificate ID, QR code, or by uploading the document itself for AI-assisted field extraction
and cross-checking.

**Live app:** https://certiproof-orcin.vercel.app

**Live on Sepolia:** [`0x7125D5A94a7F4e44Fd75A5aD66f94575170eA107`](https://sepolia.etherscan.io/address/0x7125D5A94a7F4e44Fd75A5aD66f94575170eA107)
— a real test certificate has been issued and verified end-to-end:
[example verification](https://sepolia.etherscan.io/tx/0xabb8303ed16c76aff469335b5608b86bd332f5cf82ba0719fe760ae6146f72e7).

## The problem

Academic credential verification today is manual, slow, and easy to forge:

- Fake or altered certificates are hard to catch by eye.
- Centralized verification databases are single points of failure with no public audit trail.
- Students have little control over how their credentials are shared and checked.
- Employers routinely wait days to weeks just to confirm one document with a registrar's office.

## How it works

1. **Institution issues.** An authorized issuer wallet computes a canonical `keccak256` hash of
   the credential's core fields (student name, ID, institution, credential type, issue date) and
   anchors it on-chain via `CertificateRegistry.issueCertificate(bytes32)`.
2. **Student receives.** The certificate is handed to the student with a QR code encoding its
   verification URL (`/verify/<hash>`) — no account or app required to use it.
3. **Verifier checks.** Anyone — an employer, another institution — scans the QR code, pastes the
   certificate ID, or re-enters the printed fields to get an instant on-chain result.
4. **AI cross-checks (optional).** Upload a photo of the physical document instead: Gemini's
   vision model extracts the printed fields, the app recomputes the same hash from what it read,
   and checks that hash against the registry — same result as typing the fields manually, minus
   the typing.

### Why on-chain hashes, not documents

`CertificateRegistry` never stores certificate contents or personal data on-chain — only a
`keccak256` hash of the canonicalized fields. This is a deliberate design decision with two
concrete reasons:

- **Gas cost.** Storing full documents on-chain would be prohibitively expensive at any scale.
- **Privacy.** A public, permanent ledger is the wrong place for student PII. The hash proves
  "this exact set of fields was issued by this address at this time" without ever revealing what
  those fields were to anyone who doesn't already have the document.

Verification works by re-deriving the same hash from a presented document (or from the AI's
extracted fields) and checking it against the registry — the same pattern used by real-world
systems like MIT's Blockcerts.

### Why the AI layer is scoped the way it is

The Gemini-powered upload flow does two specific, honest things — nothing more:

1. Extracts structured fields from an image (OCR-style reading), and
2. Re-derives the certificate hash from those fields and checks it on-chain.

It is **not** a deepfake or pixel-forensics detector — that's a different, much harder problem
requiring specialized image-forensics models. The actual authenticity proof is always the
on-chain hash match. The AI layer's plausibility "assessment" is a soft, secondary signal,
clearly labeled as such in the UI.

## Smart contract

`contracts/CertificateRegistry.sol` — a minimal, single-purpose registry:

- `issueCertificate(bytes32)` — authorized issuers only, reverts on duplicate hashes.
- `revokeCertificate(bytes32)` — callable by the original issuer or the contract owner.
- `verifyCertificate(bytes32)` — free, permissionless `view` call, usable by anyone.
- `addIssuer` / `removeIssuer` / `transferOwnership` — owner-gated admin functions.

Uses custom Solidity errors (not `require(string)`) for cheaper deployment and execution gas.

**19/19 tests passing** — every access-control path, every revert condition, and the full
issue → verify → revoke lifecycle:

```bash
npm run compile   # compile contracts
npm test          # run the Hardhat/Mocha/Chai suite
```

## Tech stack

| Layer | Technology |
|---|---|
| Smart contract | Solidity 0.8.24, Hardhat 3 |
| Chain interaction | ethers.js v6, MetaMask (EIP-1193) |
| Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| AI extraction | Google Gemini API (`@google/genai`), structured JSON output |
| QR codes | `qrcode` |
| Network | Ethereum Sepolia testnet |
| Deployment | Vercel (frontend), Sepolia (contract) |

## Getting started locally

```bash
npm install
cp .env.example .env.local   # fill in what you need — see below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The app runs fully without any keys set —
it just shows clear "not configured yet" states instead of pretending to work.

### FYP demo on Windows

Double-click `demo.bat` in the project folder. It opens a local Hardhat blockchain, deploys the
real `CertificateRegistry`, issues a sample Jane Doe certificate, writes the working contract
configuration to `.env.local`, and starts the app at [http://localhost:3000](http://localhost:3000).
Use the `Certificate ID` saved in `.demo-certificate.txt` on the Verify page to demonstrate a
successful on-chain lookup. The Hardhat window must remain open while the demo is running.

### Environment variables

| Variable | Required for | Notes |
|---|---|---|
| `GEMINI_API_KEY` | AI document upload | Free at [aistudio.google.com](https://aistudio.google.com/apikey) |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Issuing/verifying against real chain data | Set after deployment |
| `NEXT_PUBLIC_SEPOLIA_RPC_URL` | Faster/more reliable reads | Optional, falls back to a public RPC |
| `SEPOLIA_RPC_URL`, `SEPOLIA_PRIVATE_KEY` | Deploying the contract | Hardhat-only, never used by the Next.js app |

### Deploying the contract

```bash
npx hardhat run scripts/deploy.ts --network sepolia
```

Requires a Sepolia RPC URL (e.g. a free Alchemy/Infura endpoint) and a funded testnet wallet
(free from a Sepolia faucet) set as Hardhat configuration variables — see `.env.example`. Use a
dedicated throwaway wallet; never a wallet holding real funds.

## Security notes

- API routes are rate-limited per IP.
- The `/api/extract-certificate` and other routes validate and cap all input sizes.
- The Gemini API key and the Sepolia deployer key live only in server-side/deployment
  environment variables — never committed, never sent to the client.
- Standard security headers are set site-wide (`X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`).
- Read-only chain lookups are proxied through Next.js API routes rather than called directly
  from the browser — several public RPC endpoints (including the default Sepolia one) don't send
  CORS headers, so a direct browser→RPC fetch fails; routing server-to-server avoids depending on
  RPC provider CORS support at all.

## Academic origin

This project was developed as a Final Year Project — *"Certificate Verification System: A Web3 Academic
Credential Platform"* — with a focus on secure academic credential verification using blockchain
technology. It extends the original concept into a working engineering implementation with an AI
assisted document-verification layer for practical real-world use.

### Sustainable Development Goals

| Goal | Relevance |
|---|---|
| SDG 4 — Quality Education | Trusted, instantly verifiable academic records |
| SDG 9 — Industry, Innovation & Infrastructure | On-chain infrastructure for credential issuance |
| SDG 16 — Peace, Justice & Strong Institutions | Reduces certificate fraud, improves auditability |

## License

MIT
>>>>>>> e7dc1ce (Initial commit)
