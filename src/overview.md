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
| JuiceSwapGateway | [`0x3b59BCd4eFe392d715f4c57fA4218BFCAD5FB153`](https://explorer.testnet.citrea.xyz/address/0x3b59BCd4eFe392d715f4c57fA4218BFCAD5FB153) |
| JuiceSwapGovernor | [`0x205903c54C56bCED8C97f2DC250BA53d715174e9`](https://explorer.testnet.citrea.xyz/address/0x205903c54C56bCED8C97f2DC250BA53d715174e9) |
| JuiceSwapFeeCollector | [`0xc3d817C394d55aB57f5bF0Fc5C6878ccE033E32a`](https://explorer.testnet.citrea.xyz/address/0xc3d817C394d55aB57f5bF0Fc5C6878ccE033E32a) |
| UniswapV3Factory | [`0x9136D17Ec096AAd031D442a796cd5984128cF0b2`](https://explorer.testnet.citrea.xyz/address/0x9136D17Ec096AAd031D442a796cd5984128cF0b2) |
| SwapRouter | [`0x2d11a82633adD5b8742311fDa0E751264d093E7f`](https://explorer.testnet.citrea.xyz/address/0x2d11a82633adD5b8742311fDa0E751264d093E7f) |
| NonfungiblePositionManager | [`0x56D63E0F763b29F62bb7242420d028F86e9402E1`](https://explorer.testnet.citrea.xyz/address/0x56D63E0F763b29F62bb7242420d028F86e9402E1) |

### JuiceDollar Protocol (Referenced)

| Contract | Address |
|----------|---------|
| JUSD | [`0xFdB0a83d94CD65151148a131167Eb499Cb85d015`](https://explorer.testnet.citrea.xyz/address/0xFdB0a83d94CD65151148a131167Eb499Cb85d015) |
| JUICE (Equity) | [`0x7b2A560bf72B0Dd2EAbE3271F829C2597c8420d5`](https://explorer.testnet.citrea.xyz/address/0x7b2A560bf72B0Dd2EAbE3271F829C2597c8420d5) |
| svJUSD (SavingsVault) | [`0x9580498224551E3f2e3A04330a684BF025111C53`](https://explorer.testnet.citrea.xyz/address/0x9580498224551E3f2e3A04330a684BF025111C53) |
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

- **App**: [app.juiceswap.xyz](https://app.juiceswap.xyz)
- **GitHub**: [github.com/JuiceSwapxyz](https://github.com/JuiceSwapxyz)
- **JuiceDollar Docs**: [docs.juicedollar.com](https://docs.juicedollar.com)
- **Explorer**: [explorer.testnet.citrea.xyz](https://explorer.testnet.citrea.xyz)
