# Bridge

**Bridge assets between Bitcoin, Citrea, Ethereum, and Polygon via Lightning.Space (LDS).**

## Overview

The Bridge enables trustless cross-chain swaps powered by [Lightning.Space](https://lightning.space) (LDS). It uses atomic swaps with HTLCs (Hash Time-Locked Contracts) and MuSig2 cooperative signing to bridge assets between:

- **Bitcoin** ↔ Citrea (cBTC)
- **Citrea** (cBTC) ↔ Ethereum (WBTC)
- **Ethereum** (WBTC) ↔ Citrea (WBTCe)
- **Citrea** (JUSD) ↔ Ethereum (USDT, USDC)
- **Citrea** (JUSD) ↔ Polygon (USDT)

All swaps are non-custodial. Funds are locked in smart contracts and can only be claimed with a valid preimage or refunded after a timeout.

## Swap Types

### Submarine Swap (cBTC/BTC → BTC Lightning)

Sends cBTC on Citrea (or BTC on-chain) and receives BTC via a Lightning invoice.

**Flow:**

1. User provides a Lightning invoice
2. LDS returns a lockup address and expected amount
3. User locks cBTC in the on-chain contract
4. LDS pays the Lightning invoice
5. LDS claims the locked cBTC using the payment preimage

**Status progression:** `invoice.set` → `transaction.mempool` → `transaction.confirmed` → `invoice.settled`

### Reverse Swap (BTC Lightning → cBTC/BTC)

Sends BTC via Lightning and receives cBTC on Citrea (or BTC on-chain).

**Flow:**

1. User specifies the amount and claim address
2. LDS returns a Lightning invoice
3. User pays the Lightning invoice
4. LDS locks cBTC on Citrea
5. User (or LDS via `help-me-claim`) claims the cBTC using the preimage

**Status progression:** `swap.created` → `transaction.server.mempool` → `transaction.server.confirmed` → `transaction.claimed`

### Chain Swap (Cross-Chain)

Bridges assets between chains. Supported pairs (from the live API):

| From | To |
|------|-----|
| cBTC (Citrea) | BTC (on-chain) |
| cBTC (Citrea) | WBTC (Ethereum) |
| BTC (on-chain) | cBTC (Citrea) |
| WBTC (Ethereum) | cBTC (Citrea) |
| WBTC (Ethereum) | WBTCe (Citrea) |
| WBTCe (Citrea) | WBTC (Ethereum) |
| JUSD (Citrea) | USDT (Ethereum) |
| JUSD (Citrea) | USDC (Ethereum) |
| JUSD (Citrea) | USDT (Polygon) |
| USDT (Ethereum) | JUSD (Citrea) |
| USDC (Ethereum) | JUSD (Citrea) |
| USDT (Polygon) | JUSD (Citrea) |

> **Note:** Stablecoin bridges always route through JUSD on Citrea, not cBTC.

**Flow:**

1. User specifies source asset, destination asset, amount, and claim address
2. LDS returns lockup details for both chains
3. User locks funds on the source chain (ERC20 approval + lock, or native cBTC lock)
4. LDS detects the lockup and locks funds on the destination chain
5. User claims funds on the destination chain using cooperative MuSig2 signing
6. LDS claims funds on the source chain

**Status progression:** `swap.created` → `transaction.mempool` → `transaction.confirmed` → `transaction.server.mempool` → `transaction.server.confirmed` → `transaction.claimed`

## Smart Contracts

### CoinSwap (Native cBTC)

Used for locking and claiming native cBTC on Citrea.

```solidity
// Lock native cBTC with HTLC
function lock(
    bytes32 preimageHash,
    address claimAddress,
    uint256 timelock
) external payable

// Claim locked cBTC with valid preimage
function claim(
    bytes32 preimage,
    uint256 amount,
    address refundAddress,
    uint256 timelock
) external

// Refund after timeout
function refund(
    bytes32 preimageHash,
    uint256 amount,
    address claimAddress,
    uint256 timelock
) external
```

### ERC20Swap (Token Swaps)

Used for locking and claiming ERC20 tokens (WBTC, WBTCe, JUSD, USDT, USDC).

```solidity
// Lock ERC20 tokens (requires prior approval)
function lock(
    bytes32 preimageHash,
    uint256 amount,
    address tokenAddress,
    address claimAddress,
    uint256 timelock
) external

// Claim locked tokens with valid preimage
function claim(
    bytes32 preimage,
    uint256 amount,
    address tokenAddress,
    address refundAddress,
    uint256 timelock
) external

// Refund after timeout
function refund(
    bytes32 preimageHash,
    uint256 amount,
    address tokenAddress,
    address claimAddress,
    address refundAddress,
    uint256 timelock
) external
```

### Contract Addresses

| Contract | Chain | Address |
|----------|-------|---------|
| CoinSwap | Citrea | [`0x7397f25f230f7d5a83c18e1b68b32511bf35f860`](https://citreascan.com/address/0x7397f25f230f7d5a83c18e1b68b32511bf35f860) |
| ERC20Swap | Ethereum | [`0x2E21F58Da58c391F110467c7484EdfA849C1CB9B`](https://etherscan.io/address/0x2E21F58Da58c391F110467c7484EdfA849C1CB9B) |
| LDS Liquidity | Citrea | [`0xDDA7efc856833960694cb26cb583e0CCCA497b87`](https://citreascan.com/address/0xDDA7efc856833960694cb26cb583e0CCCA497b87) |

## API Reference

The Bridge communicates with the LDS API (`REACT_APP_LDS_API_URL`).

### Submarine Swaps

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/swap/v2/swap/submarine` | Get available submarine pairs, rates, limits, and fees |
| POST | `/swap/v2/swap/submarine` | Create a submarine swap |
| GET | `/swap/v2/swap/submarine/{id}/transactions` | Get lockup transaction details |

**Create Submarine Swap Request:**

```json
{
  "from": "cBTC",
  "to": "BTC",
  "invoice": "<lightning_invoice>",
  "pairHash": "<pair_hash>",
  "referralId": "boltz_webapp_desktop",
  "refundPublicKey": "<public_key_hex>"
}
```

**Response:**

```json
{
  "id": "<swap_id>",
  "address": "<lockup_address>",
  "expectedAmount": 100000,
  "acceptZeroConf": true,
  "timeoutBlockHeight": 123456
}
```

### Reverse Swaps

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/swap/v2/swap/reverse` | Get available reverse pairs, rates, limits, and fees |
| POST | `/swap/v2/swap/reverse` | Create a reverse swap |

**Create Reverse Swap Request:**

```json
{
  "from": "BTC",
  "to": "cBTC",
  "pairHash": "<pair_hash>",
  "preimageHash": "<sha256_hash_hex>",
  "claimAddress": "0x...",
  "invoiceAmount": 100000
}
```

**Response:**

```json
{
  "id": "<swap_id>",
  "invoice": "<lightning_invoice>",
  "lockupAddress": "<address>",
  "onchainAmount": 99500,
  "timeoutBlockHeight": 123456
}
```

### Chain Swaps

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/swap/v2/swap/chain/` | Get available chain pairs, rates, limits, and fees |
| POST | `/swap/v2/swap/chain/` | Create a chain swap |
| GET | `/swap/v2/swap/chain/{id}/transactions` | Get user and server lockup transactions |
| POST | `/swap/v2/swap/chain/{id}/claim` | Submit cooperative claim signature |

**Create Chain Swap Request:**

```json
{
  "from": "cBTC",
  "to": "WBTC_ETH",
  "preimageHash": "<sha256_hash_hex>",
  "claimPublicKey": "<public_key_hex>",
  "claimAddress": "0x...",
  "refundPublicKey": "<public_key_hex>",
  "pairHash": "<pair_hash>",
  "referralId": "boltz_webapp_desktop",
  "userLockAmount": 100000
}
```

### Auto-Claim

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/claim/help-me-claim` | Request LDS to claim on behalf of the user |

```json
{
  "preimage": "<preimage_hex>",
  "preimageHash": "0x<preimage_hash_hex>",
  "chainId": 4114
}
```

### General

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/swap/v2/swap/{id}` | Get current swap status |
| GET | `/swap/v2/chain/fees` | Get current BTC chain fees |
| GET | `/boltz/balance` | Get LDS liquidity balances |
| POST | `/claim/graphql` | Query lockup state via GraphQL |

## WebSocket Updates

Real-time swap status updates are available via WebSocket at `wss://<LDS_API_HOST>/swap/v2/ws`.

**Subscribe to swap updates:**

```json
{
  "op": "subscribe",
  "channel": "swap.update",
  "args": ["<swap_id>"]
}
```

**Update event:**

```json
{
  "event": "update",
  "channel": "swap.update",
  "args": [{
    "id": "<swap_id>",
    "status": "transaction.claimed",
    "failureReason": null
  }]
}
```

### Swap Statuses

| Status | Category | Description |
|--------|----------|-------------|
| `swap.created` | Pending | Swap created, waiting for action |
| `invoice.set` | Pending | Lightning invoice set (submarine) |
| `invoice.pending` | Pending | Lightning payment in progress |
| `transaction.mempool` | Pending | User lockup detected in mempool |
| `transaction.confirmed` | Pending | User lockup confirmed on-chain |
| `transaction.server.mempool` | Pending | Server lockup detected in mempool |
| `transaction.server.confirmed` | Pending | Server lockup confirmed on-chain |
| `transaction.claim.pending` | Pending | Claim transaction submitted |
| `invoice.settled` | Success | Lightning invoice paid (submarine complete) |
| `transaction.claimed` | Success | Funds claimed on-chain (reverse/chain complete) |
| `swap.expired` | Failed | Swap timed out |
| `swap.refunded` | Failed | Swap refunded by server |
| `invoice.expired` | Failed | Lightning invoice expired |
| `invoice.failedToPay` | Failed | Lightning payment failed |
| `transaction.failed` | Failed | On-chain transaction failed |
| `transaction.lockupFailed` | Failed | Lockup transaction failed |
| `transaction.refunded` | Failed | Funds refunded on-chain |

## Fees

Each swap pair has its own fee structure returned by the pair endpoints:

- **Percentage fee**: Applied to the swap amount (e.g., 0–0.5%)
- **Miner fees**: Fixed fee covering on-chain transaction costs
  - Submarine: single miner fee
  - Reverse: separate lockup and claim miner fees
  - Chain: separate server and user (claim + lockup) miner fees

> Stablecoin pairs (JUSD ↔ USDT/USDC) currently have 0% fees and 0 miner fees.

## Limits

Each pair defines minimum and maximum swap amounts (in the smallest unit of the asset):

- **BTC/cBTC/WBTC pairs**: limits in satoshis (e.g., min 2,500 sats, max 10,000,000 sats)
- **Stablecoin pairs**: limits in token base units (e.g., min 100,000,000, max 1,000,000,000,000)

The effective maximum is further constrained by the available on-chain liquidity of the LDS bridge contract.

## Security

- **Atomic swaps**: Funds can only be claimed with a valid preimage or refunded after timeout — never lost
- **Non-custodial**: LDS never has unilateral control over user funds
- **Timelock protection**: If a swap fails, users can reclaim funds after the timeout block height
- **MuSig2 cooperative signing**: Chain swaps use Schnorr-based MuSig2 for efficient Taproot claims
- **Local key management**: Preimages and key pairs are generated client-side and stored locally
