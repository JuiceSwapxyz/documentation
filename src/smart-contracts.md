# Smart Contracts

**A technical overview of all smart contracts powering JuiceSwap.**

JuiceSwap is built on a fork of Uniswap V3, with custom contracts for governance, fee collection, and JuiceDollar integration. All contracts are deployed on Citrea Testnet (Chain ID: 5115).

## Contract Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    JuiceSwap Contract Stack                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                 JuiceSwapGateway                         │   │
│   │   • Token conversion (JUSD↔svJUSD, cBTC↔WcBTC)          │   │
│   │   • Simplified swap/liquidity interface                  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│   ┌──────────────────────────┼──────────────────────────────┐   │
│   │                Uniswap V3 Core                           │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│   │  │   Factory   │  │   Pools     │  │ Position    │      │   │
│   │  │             │  │             │  │ Manager     │      │   │
│   │  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                              │                                   │
│   ┌──────────────────────────┼──────────────────────────────┐   │
│   │              JuiceSwap Governance                        │   │
│   │  ┌─────────────────┐  ┌─────────────────┐               │   │
│   │  │  JuiceSwap      │  │  JuiceSwap      │               │   │
│   │  │  Governor       │  │  FeeCollector   │               │   │
│   │  └─────────────────┘  └─────────────────┘               │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## JuiceSwap Custom Contracts

### JuiceSwapGateway

The main entry point for users, handling automatic token conversions.

**Key Features:**
- Converts JUSD to svJUSD (interest-bearing) for pool interactions
- Wraps/unwraps native cBTC to WcBTC
- Simplified interface for swaps and liquidity
- Supports bridged stablecoins

**Key Functions:**

| Function | Description |
|----------|-------------|
| `swapExactTokensForTokens()` | Execute a token swap with automatic conversions |
| `addLiquidity()` | Add liquidity (creates full-range position) |
| `increaseLiquidity()` | Add tokens to existing position |
| `removeLiquidity()` | Withdraw from a position |
| `addBridgedToken()` | Add supported bridged stablecoin |
| `removeBridgedToken()` | Remove bridged stablecoin support |

| Property | Value |
|----------|-------|
| **Address** | [`0x3b59BCd4eFe392d715f4c57fA4218BFCAD5FB153`](https://explorer.testnet.citrea.xyz/address/0x3b59BCd4eFe392d715f4c57fA4218BFCAD5FB153) |
| **Default Fee** | 3000 (0.30%) |
| **Max Bridged Tokens** | 10 |

---

### JuiceSwapGovernor

Governance contract using JUICE token voting with veto mechanism.

**Key Features:**
- Veto-based governance (proposals pass unless blocked)
- 14-day minimum application period
- 2% voting power required for veto
- Integrates with JuiceDollar's JUICE voting system

**Key Functions:**

| Function | Description |
|----------|-------------|
| `propose()` | Create a new governance proposal (1000 JUSD fee) |
| `execute()` | Execute a passed proposal |
| `veto()` | Block a proposal (requires 2% voting power) |
| `state()` | Get proposal state |
| `getVotingPower()` | Check voting power including delegates |

| Property | Value |
|----------|-------|
| **Address** | [`0x205903c54C56bCED8C97f2DC250BA53d715174e9`](https://explorer.testnet.citrea.xyz/address/0x205903c54C56bCED8C97f2DC250BA53d715174e9) |
| **Proposal Fee** | 1,000 JUSD |
| **Min Application Period** | 14 days |
| **Veto Quorum** | 2% |

---

### JuiceSwapFeeCollector

Automated protocol fee collection with TWAP-based frontrunning protection.

**Key Features:**
- Collects protocol fees from Uniswap V3 pools
- Swaps fees to JUSD using TWAP oracle validation
- Sends JUSD to JUICE Equity (increases JUICE price)
- Multi-hop swap support with manipulation protection

**Key Functions:**

| Function | Description |
|----------|-------------|
| `collectAndReinvestFees()` | Collect fees and send to JUICE equity |
| `calculateExpectedOutputMultiHop()` | Calculate expected swap output using TWAP |
| `setProtectionParams()` | Update TWAP/slippage parameters |
| `setCollector()` | Set authorized collector address |
| `enableFeeAmount()` | Enable new fee tier on factory |
| `setFactoryOwner()` | Transfer factory ownership |

| Property | Value |
|----------|-------|
| **Address** | [`0xc3d817C394d55aB57f5bF0Fc5C6878ccE033E32a`](https://explorer.testnet.citrea.xyz/address/0xc3d817C394d55aB57f5bF0Fc5C6878ccE033E32a) |
| **TWAP Period** | 30 minutes (1800 seconds) |
| **Max Slippage** | 2% (200 bps) |
| **Block Time** | 2 seconds (Citrea) |

---

## Uniswap V3 Core Contracts

### UniswapV3Factory

Creates and manages liquidity pools.

**Key Functions:**

| Function | Description |
|----------|-------------|
| `createPool()` | Deploy a new pool for a token pair |
| `getPool()` | Get pool address for token pair and fee |
| `setOwner()` | Transfer factory ownership |
| `enableFeeAmount()` | Enable new fee tier |

| Property | Value |
|----------|-------|
| **Address** | [`0x9136D17Ec096AAd031D442a796cd5984128cF0b2`](https://explorer.testnet.citrea.xyz/address/0x9136D17Ec096AAd031D442a796cd5984128cF0b2) |
| **Owner** | JuiceSwapFeeCollector |

### Fee Tiers

| Fee | Tick Spacing | Use Case |
|-----|--------------|----------|
| 500 (0.05%) | 10 | Stable pairs |
| 3000 (0.30%) | 60 | Standard pairs |
| 10000 (1.00%) | 200 | Exotic pairs |

---

### SwapRouter

Routes swaps through the most efficient path.

**Key Functions:**

| Function | Description |
|----------|-------------|
| `exactInputSingle()` | Single-hop swap |
| `exactInput()` | Multi-hop swap via encoded path |
| `exactOutputSingle()` | Single-hop swap with exact output |
| `exactOutput()` | Multi-hop swap with exact output |

| Property | Value |
|----------|-------|
| **Address** | [`0x2d11a82633adD5b8742311fDa0E751264d093E7f`](https://explorer.testnet.citrea.xyz/address/0x2d11a82633adD5b8742311fDa0E751264d093E7f) |

---

### NonfungiblePositionManager

Manages LP positions as NFTs (ERC-721).

**Key Functions:**

| Function | Description |
|----------|-------------|
| `mint()` | Create new liquidity position |
| `increaseLiquidity()` | Add liquidity to existing position |
| `decreaseLiquidity()` | Remove liquidity from position |
| `collect()` | Collect earned fees |
| `positions()` | Get position details |

| Property | Value |
|----------|-------|
| **Address** | [`0x56D63E0F763b29F62bb7242420d028F86e9402E1`](https://explorer.testnet.citrea.xyz/address/0x56D63E0F763b29F62bb7242420d028F86e9402E1) |

---

## JuiceDollar Integration

JuiceSwap integrates with JuiceDollar contracts:

### JUSD (JuiceDollar)

The stablecoin used for trading pairs.

| Property | Value |
|----------|-------|
| **Address** | [`0xFdB0a83d94CD65151148a131167Eb499Cb85d015`](https://explorer.testnet.citrea.xyz/address/0xFdB0a83d94CD65151148a131167Eb499Cb85d015) |
| **Decimals** | 18 |

### svJUSD (SavingsVaultJUSD)

Interest-bearing JUSD vault (ERC-4626). Used in pools instead of plain JUSD.

| Property | Value |
|----------|-------|
| **Address** | [`0x9580498224551E3f2e3A04330a684BF025111C53`](https://explorer.testnet.citrea.xyz/address/0x9580498224551E3f2e3A04330a684BF025111C53) |
| **Symbol** | svJUSD |

### JUICE (Equity)

Governance token for voting and fee distribution.

| Property | Value |
|----------|-------|
| **Address** | [`0x7b2A560bf72B0Dd2EAbE3271F829C2597c8420d5`](https://explorer.testnet.citrea.xyz/address/0x7b2A560bf72B0Dd2EAbE3271F829C2597c8420d5) |
| **Decimals** | 18 |

### WcBTC (Wrapped cBTC)

Wrapped version of native cBTC for ERC-20 compatibility.

| Property | Value |
|----------|-------|
| **Address** | [`0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93`](https://explorer.testnet.citrea.xyz/address/0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93) |
| **Decimals** | 18 |

---

## Contract Summary

| Contract | Address | Purpose |
|----------|---------|---------|
| JuiceSwapGateway | [`0x3b59...5153`](https://explorer.testnet.citrea.xyz/address/0x3b59BCd4eFe392d715f4c57fA4218BFCAD5FB153) | User-facing swap/LP interface |
| JuiceSwapGovernor | [`0x2059...74e9`](https://explorer.testnet.citrea.xyz/address/0x205903c54C56bCED8C97f2DC250BA53d715174e9) | Governance proposals |
| JuiceSwapFeeCollector | [`0xc3d8...E32a`](https://explorer.testnet.citrea.xyz/address/0xc3d817C394d55aB57f5bF0Fc5C6878ccE033E32a) | Fee collection & distribution |
| UniswapV3Factory | [`0x9136...F0b2`](https://explorer.testnet.citrea.xyz/address/0x9136D17Ec096AAd031D442a796cd5984128cF0b2) | Pool creation |
| SwapRouter | [`0x2d11...3E7f`](https://explorer.testnet.citrea.xyz/address/0x2d11a82633adD5b8742311fDa0E751264d093E7f) | Swap routing |
| NonfungiblePositionManager | [`0x56D6...02E1`](https://explorer.testnet.citrea.xyz/address/0x56D63E0F763b29F62bb7242420d028F86e9402E1) | LP NFT management |

---

## Security Properties

| Property | Implementation |
|----------|---------------|
| **Immutability** | No upgradeable proxies, no admin keys |
| **Governance** | Veto-based with 14-day timelock |
| **Oracle Protection** | TWAP-based price validation |
| **Flash Loan Protection** | Time-weighted voting |
| **Reentrancy Protection** | ReentrancyGuard on all entry points |

---

## Source Code

All source code is available on GitHub:

| Repository | Description |
|------------|-------------|
| [JuiceSwapxyz/smart-contracts](https://github.com/JuiceSwapxyz/smart-contracts) | Gateway, Governor, FeeCollector |
| [JuiceSwapxyz/v3-core](https://github.com/JuiceSwapxyz/v3-core) | Factory, Pools (Uniswap V3 fork) |
| [JuiceSwapxyz/v3-periphery](https://github.com/JuiceSwapxyz/v3-periphery) | Router, Position Manager |

**Network:** Citrea Testnet (Chain ID: 5115)

**Explorer:** [explorer.testnet.citrea.xyz](https://explorer.testnet.citrea.xyz)
