# Smart Contracts

**A technical overview of all smart contracts powering JuiceSwap.**

JuiceSwap is built on a fork of Uniswap V3, with custom contracts for governance, fee collection, and JuiceDollar integration. All contracts are deployed on Citrea Mainnet (Chain ID: 4114) and Testnet (Chain ID: 5115).

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
| **Default Fee** | 3000 (0.30%) |
| **Max Bridged Tokens** | 10 |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0xAFcfD58Fe17BEb0c9D15C51D19519682dFcdaab9`](https://explorer.mainnet.citrea.xyz/address/0xAFcfD58Fe17BEb0c9D15C51D19519682dFcdaab9) |
| **Testnet** | [`0x8eE3Dd585752805A258ad3a963949a7c3fec44eB`](https://explorer.testnet.citrea.xyz/address/0x8eE3Dd585752805A258ad3a963949a7c3fec44eB) |

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
| **Proposal Fee** | 1,000 JUSD |
| **Min Application Period** | 14 days |
| **Veto Quorum** | 2% |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x51f3D5905C768CCA2D4904Ca7877614CeaD607ae`](https://explorer.mainnet.citrea.xyz/address/0x51f3D5905C768CCA2D4904Ca7877614CeaD607ae) |
| **Testnet** | [`0x8AFD7CB73Ce85b44996B86ec604c125af244A2B8`](https://explorer.testnet.citrea.xyz/address/0x8AFD7CB73Ce85b44996B86ec604c125af244A2B8) |

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
| **TWAP Period** | 30 minutes (1800 seconds) |
| **Max Slippage** | 2% (200 bps) |
| **Block Time** | 2 seconds (Citrea) |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0xD2D68A452A6f5d9090153f52E64f23cc7fF8A97b`](https://explorer.mainnet.citrea.xyz/address/0xD2D68A452A6f5d9090153f52E64f23cc7fF8A97b) |
| **Testnet** | [`0xfac6303F78A2b316a20eD927Ba0f7a7d07AaC47E`](https://explorer.testnet.citrea.xyz/address/0xfac6303F78A2b316a20eD927Ba0f7a7d07AaC47E) |

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
| **Owner** | JuiceSwapFeeCollector |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82`](https://explorer.mainnet.citrea.xyz/address/0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82) |
| **Testnet** | [`0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238`](https://explorer.testnet.citrea.xyz/address/0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238) |

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

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x565eD3D57fe40f78A46f348C220121AE093c3cF8`](https://explorer.mainnet.citrea.xyz/address/0x565eD3D57fe40f78A46f348C220121AE093c3cF8) |
| **Testnet** | [`0x26C106BC45E0dd599cbDD871605497B2Fc87c185`](https://explorer.testnet.citrea.xyz/address/0x26C106BC45E0dd599cbDD871605497B2Fc87c185) |

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

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x3D3821D358f56395d4053954f98aec0E1F0fa568`](https://explorer.mainnet.citrea.xyz/address/0x3D3821D358f56395d4053954f98aec0E1F0fa568) |
| **Testnet** | [`0x86e7A161cb9696E6d438c0c77dd18244efa2B8b1`](https://explorer.testnet.citrea.xyz/address/0x86e7A161cb9696E6d438c0c77dd18244efa2B8b1) |

---

## JuiceDollar Integration

JuiceSwap integrates with JuiceDollar contracts:

### JUSD (JuiceDollar)

The stablecoin used for trading pairs.

| Property | Value |
|----------|-------|
| **Decimals** | 18 |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x0987D3720D38847ac6dBB9D025B9dE892a3CA35C`](https://explorer.mainnet.citrea.xyz/address/0x0987D3720D38847ac6dBB9D025B9dE892a3CA35C) |
| **Testnet** | [`0x6a850a548fdd050e8961223ec8FfCDfacEa57E39`](https://explorer.testnet.citrea.xyz/address/0x6a850a548fdd050e8961223ec8FfCDfacEa57E39) |

### svJUSD (SavingsVaultJUSD)

Interest-bearing JUSD vault (ERC-4626). Used in pools instead of plain JUSD.

| Property | Value |
|----------|-------|
| **Symbol** | svJUSD |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x1b70ae756b1089cc5948e4f8a2AD498DF30E897d`](https://explorer.mainnet.citrea.xyz/address/0x1b70ae756b1089cc5948e4f8a2AD498DF30E897d) |
| **Testnet** | [`0x802a29bD29f02c8C477Af5362f9ba88FAe39Cc7B`](https://explorer.testnet.citrea.xyz/address/0x802a29bD29f02c8C477Af5362f9ba88FAe39Cc7B) |

### JUICE (Equity)

Governance token for voting and fee distribution.

| Property | Value |
|----------|-------|
| **Decimals** | 18 |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x2A36f2b204B46Fd82653cd06d00c7fF757C99ae4`](https://explorer.mainnet.citrea.xyz/address/0x2A36f2b204B46Fd82653cd06d00c7fF757C99ae4) |
| **Testnet** | [`0x7fa131991c8A7d8C21b11391C977Fc7c4c8e0D5E`](https://explorer.testnet.citrea.xyz/address/0x7fa131991c8A7d8C21b11391C977Fc7c4c8e0D5E) |

### WcBTC (Wrapped cBTC)

Wrapped version of native cBTC for ERC-20 compatibility.

| Property | Value |
|----------|-------|
| **Decimals** | 18 |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x3100000000000000000000000000000000000006`](https://explorer.mainnet.citrea.xyz/address/0x3100000000000000000000000000000000000006) |
| **Testnet** | [`0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93`](https://explorer.testnet.citrea.xyz/address/0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93) |

---

## Contract Summary

### Mainnet (Chain ID: 4114)

| Contract | Address | Purpose |
|----------|---------|---------|
| JuiceSwapGateway | [`0xAFcf...ab9`](https://explorer.mainnet.citrea.xyz/address/0xAFcfD58Fe17BEb0c9D15C51D19519682dFcdaab9) | User-facing swap/LP interface |
| JuiceSwapGovernor | [`0x51f3...7ae`](https://explorer.mainnet.citrea.xyz/address/0x51f3D5905C768CCA2D4904Ca7877614CeaD607ae) | Governance proposals |
| JuiceSwapFeeCollector | [`0xD2D6...97b`](https://explorer.mainnet.citrea.xyz/address/0xD2D68A452A6f5d9090153f52E64f23cc7fF8A97b) | Fee collection & distribution |
| UniswapV3Factory | [`0xd809...e82`](https://explorer.mainnet.citrea.xyz/address/0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82) | Pool creation |
| SwapRouter | [`0x565e...cF8`](https://explorer.mainnet.citrea.xyz/address/0x565eD3D57fe40f78A46f348C220121AE093c3cF8) | Swap routing |
| NonfungiblePositionManager | [`0x3D38...568`](https://explorer.mainnet.citrea.xyz/address/0x3D3821D358f56395d4053954f98aec0E1F0fa568) | LP NFT management |

### Testnet (Chain ID: 5115)

| Contract | Address | Purpose |
|----------|---------|---------|
| JuiceSwapGateway | [`0x8eE3...44eB`](https://explorer.testnet.citrea.xyz/address/0x8eE3Dd585752805A258ad3a963949a7c3fec44eB) | User-facing swap/LP interface |
| JuiceSwapGovernor | [`0x8AFD...A2B8`](https://explorer.testnet.citrea.xyz/address/0x8AFD7CB73Ce85b44996B86ec604c125af244A2B8) | Governance proposals |
| JuiceSwapFeeCollector | [`0xfac6...47E`](https://explorer.testnet.citrea.xyz/address/0xfac6303F78A2b316a20eD927Ba0f7a7d07AaC47E) | Fee collection & distribution |
| UniswapV3Factory | [`0xdd6D...4238`](https://explorer.testnet.citrea.xyz/address/0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238) | Pool creation |
| SwapRouter | [`0x26C1...c185`](https://explorer.testnet.citrea.xyz/address/0x26C106BC45E0dd599cbDD871605497B2Fc87c185) | Swap routing |
| NonfungiblePositionManager | [`0x86e7...B8b1`](https://explorer.testnet.citrea.xyz/address/0x86e7A161cb9696E6d438c0c77dd18244efa2B8b1) | LP NFT management |

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

| Network | Chain ID | Explorer |
|---------|----------|----------|
| **Mainnet** | 4114 | [explorer.mainnet.citrea.xyz](https://explorer.mainnet.citrea.xyz) |
| **Testnet** | 5115 | [explorer.testnet.citrea.xyz](https://explorer.testnet.citrea.xyz) |
