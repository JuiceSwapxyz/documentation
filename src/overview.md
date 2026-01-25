# Overview

**JuiceSwap is a decentralized exchange (DEX) built on Citrea, Bitcoin's first ZK rollup, deeply integrated with the JuiceDollar stablecoin ecosystem.**

## What is JuiceSwap?

JuiceSwap is a Uniswap V3 fork optimized for the Citrea network. It enables trustless token swaps and liquidity provision with a unique twist: **liquidity providers earn both swap fees AND savings interest** through automatic svJUSD integration.

### Key Features

| Feature | Description |
|---------|-------------|
| **Concentrated Liquidity** | Uniswap V3's capital-efficient AMM model |
| **svJUSD Integration** | LPs automatically earn savings interest on JUSD |
| **JUICE Governance** | Same veto-based governance as JuiceDollar |
| **Fee Buyback** | Protocol fees are converted to JUSD and added to JUICE equity |
| **Bitcoin-Native** | Built on Citrea, Bitcoin's ZK rollup |

## The Cypherpunk Heritage

JuiceSwap, like JuiceDollar, embodies the core principles of the cypherpunk movement:

> "We the Cypherpunks are dedicated to building anonymous systems... Privacy is necessary for an open society in the electronic age."
> — Eric Hughes, A Cypherpunk's Manifesto (1993)

### Principles Realized in JuiceSwap

| Cypherpunk Ideal | JuiceSwap Implementation |
|------------------|--------------------------|
| **Decentralization** | No admin keys, veto-based governance only |
| **Trustlessness** | Immutable contracts, no upgrades |
| **Permissionlessness** | Anyone can create pools, provide liquidity, or swap |
| **Self-Custody** | Users hold their own LP NFTs |
| **Censorship Resistance** | No entity can block trades or freeze liquidity |

JuiceSwap brings decentralized trading to Bitcoin through Citrea's ZK rollup technology, continuing the cypherpunk vision of permissionless financial infrastructure.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      JuiceSwap Ecosystem                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌───────────────┐     ┌───────────────┐                   │
│   │ JuiceSwap     │     │ Uniswap V3    │                   │
│   │ Gateway       │────▶│ Core Contracts│                   │
│   │               │     │ (Pools, NFTs) │                   │
│   └───────┬───────┘     └───────────────┘                   │
│           │                                                  │
│           ▼                                                  │
│   ┌───────────────┐     ┌───────────────┐                   │
│   │ JUSD ←→ svJUSD│     │ Fee Collector │                   │
│   │ Conversion    │     │ → JUICE Equity│                   │
│   └───────────────┘     └───────────────┘                   │
│                                                              │
│   ┌─────────────────────────────────────────────────────┐   │
│   │              JuiceDollar Protocol                    │   │
│   │   JUSD (Stablecoin) │ JUICE (Equity) │ svJUSD (Vault)│  │
│   └─────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## How JuiceSwap Works

### 1. Token Swapping

Users swap tokens through the JuiceSwapGateway, which handles automatic conversions:

- **JUSD** is converted to **svJUSD** (interest-bearing) for pool interactions
- **cBTC** (native Bitcoin) is wrapped to **WcBTC** automatically
- **JUICE** trades route through the Equity contract

### 2. Liquidity Provision

Liquidity providers deposit tokens into Uniswap V3-style concentrated liquidity pools:

- Receive an **NFT** representing their position
- Earn **swap fees** from traders
- **Bonus**: JUSD liquidity automatically earns savings interest via svJUSD

### 3. Fee Distribution

Protocol fees flow back to JUICE holders:

1. Fees collected from pools in various tokens
2. **JuiceSwapFeeCollector** swaps all fees to JUSD
3. JUSD sent to **JUICE Equity** contract
4. JUICE token price increases

### 4. Governance

JuiceSwap uses the same governance model as JuiceDollar:

- **Propose**: Pay 1,000 JUSD, wait 14 days minimum
- **Veto**: Anyone with 2% voting power can block proposals
- **Execute**: After veto period, anyone can execute

## Integration with JuiceDollar

JuiceSwap is tightly integrated with the JuiceDollar protocol:

| Component | JuiceDollar | JuiceSwap Usage |
|-----------|-------------|-----------------|
| **JUSD** | Stablecoin | Trading pair, converted to svJUSD in pools |
| **JUICE** | Equity token | Governance voting, fee recipient |
| **svJUSD** | Savings vault | Used in pools for auto-interest |
| **Governance** | Veto system | Same mechanism for JuiceSwap proposals |

## Contract Addresses

All contracts are deployed on **Citrea Testnet** (Chain ID: 5115):

| Contract | Address |
|----------|---------|
| JuiceSwapGateway | [`0x8eE3Dd585752805A258ad3a963949a7c3fec44eB`](https://explorer.testnet.citrea.xyz/address/0x8eE3Dd585752805A258ad3a963949a7c3fec44eB) |
| JuiceSwapGovernor | [`0x8AFD7CB73Ce85b44996B86ec604c125af244A2B8`](https://explorer.testnet.citrea.xyz/address/0x8AFD7CB73Ce85b44996B86ec604c125af244A2B8) |
| JuiceSwapFeeCollector | [`0xfac6303F78A2b316a20eD927Ba0f7a7d07AaC47E`](https://explorer.testnet.citrea.xyz/address/0xfac6303F78A2b316a20eD927Ba0f7a7d07AaC47E) |
| UniswapV3Factory | [`0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238`](https://explorer.testnet.citrea.xyz/address/0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238) |
| SwapRouter | [`0x26C106BC45E0dd599cbDD871605497B2Fc87c185`](https://explorer.testnet.citrea.xyz/address/0x26C106BC45E0dd599cbDD871605497B2Fc87c185) |
| NonfungiblePositionManager | [`0x86e7A161cb9696E6d438c0c77dd18244efa2B8b1`](https://explorer.testnet.citrea.xyz/address/0x86e7A161cb9696E6d438c0c77dd18244efa2B8b1) |

### JuiceDollar Protocol (Referenced)

| Contract | Address |
|----------|---------|
| JUSD | [`0x6a850a548fdd050e8961223ec8FfCDfacEa57E39`](https://explorer.testnet.citrea.xyz/address/0x6a850a548fdd050e8961223ec8FfCDfacEa57E39) |
| JUICE (Equity) | [`0x7fa131991c8A7d8C21b11391C977Fc7c4c8e0D5E`](https://explorer.testnet.citrea.xyz/address/0x7fa131991c8A7d8C21b11391C977Fc7c4c8e0D5E) |
| svJUSD (SavingsVault) | [`0x802a29bD29f02c8C477Af5362f9ba88FAe39Cc7B`](https://explorer.testnet.citrea.xyz/address/0x802a29bD29f02c8C477Af5362f9ba88FAe39Cc7B) |
| WcBTC | [`0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93`](https://explorer.testnet.citrea.xyz/address/0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93) |

## Why JuiceSwap?

### For Traders

- **Low slippage** through concentrated liquidity
- **Seamless UX** - JUSD/svJUSD conversion is automatic
- **Bitcoin-native** - trade on Citrea's ZK rollup

### For Liquidity Providers

- **Double yield** - swap fees PLUS savings interest
- **Capital efficiency** - concentrated liquidity positions
- **NFT positions** - transferable, composable LP tokens

### For JUICE Holders

- **Fee revenue** - all protocol fees increase JUICE value
- **Governance power** - same voting rights as JuiceDollar
- **Ecosystem growth** - more trading volume = more fees

## Getting Started

1. **[Swapping Tokens](/swap)** - Learn how to trade on JuiceSwap
2. **[Providing Liquidity](/liquidity)** - Earn fees as a liquidity provider
3. **[Governance](/governance)** - Participate in protocol governance
4. **[Smart Contracts](/smart-contracts)** - Technical contract reference

## Resources

- **App**: [bapp.juiceswap.com](https://bapp.juiceswap.com)
- **GitHub**: [github.com/JuiceSwapxyz](https://github.com/JuiceSwapxyz)
- **JuiceDollar Docs**: [docs.juicedollar.com](https://docs.juicedollar.com)
- **Explorer**: [explorer.testnet.citrea.xyz](https://explorer.testnet.citrea.xyz)
