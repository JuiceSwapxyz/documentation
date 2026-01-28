# Smart Contracts

**A technical overview of all smart contracts powering JuiceSwap.**

JuiceSwap is built on forks of Uniswap V2 and V3, with custom contracts for governance, fee collection, launchpad, and JuiceDollar integration. All contracts are deployed on Citrea Mainnet (Chain ID: 4114) and Testnet (Chain ID: 5115).

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
│   │           Uniswap V2 + V3 Core                           │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│   │  │  V2/V3      │  │   Pools     │  │ Position    │      │   │
│   │  │  Factory    │  │             │  │ Manager     │      │   │
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
│                              │                                   │
│   ┌──────────────────────────┼──────────────────────────────┐   │
│   │              Launchpad & Bridging                        │   │
│   │  ┌─────────────────┐  ┌─────────────────┐               │   │
│   │  │  TokenFactory   │  │  LayerZero      │               │   │
│   │  │  (Bonding Curve)│  │  Bridge (L0)    │               │   │
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
| **Mainnet** | [`0xAFcfD58Fe17BEb0c9D15C51D19519682dFcdaab9`](https://citreascan.com/address/0xAFcfD58Fe17BEb0c9D15C51D19519682dFcdaab9) |
| **Testnet** | [`0x8eE3Dd585752805A258ad3a963949a7c3fec44eB`](https://testnet.citreascan.com/address/0x8eE3Dd585752805A258ad3a963949a7c3fec44eB) |

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
| **Mainnet** | [`0x51f3D5905C768CCA2D4904Ca7877614CeaD607ae`](https://citreascan.com/address/0x51f3D5905C768CCA2D4904Ca7877614CeaD607ae) |
| **Testnet** | [`0x8AFD7CB73Ce85b44996B86ec604c125af244A2B8`](https://testnet.citreascan.com/address/0x8AFD7CB73Ce85b44996B86ec604c125af244A2B8) |

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
| **Mainnet** | [`0xD2D68A452A6f5d9090153f52E64f23cc7fF8A97b`](https://citreascan.com/address/0xD2D68A452A6f5d9090153f52E64f23cc7fF8A97b) |
| **Testnet** | [`0xfac6303F78A2b316a20eD927Ba0f7a7d07AaC47E`](https://testnet.citreascan.com/address/0xfac6303F78A2b316a20eD927Ba0f7a7d07AaC47E) |

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
| **Mainnet** | [`0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82`](https://citreascan.com/address/0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82) |
| **Testnet** | [`0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238`](https://testnet.citreascan.com/address/0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238) |

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
| **Mainnet** | [`0x565eD3D57fe40f78A46f348C220121AE093c3cF8`](https://citreascan.com/address/0x565eD3D57fe40f78A46f348C220121AE093c3cF8) |
| **Testnet** | [`0x26C106BC45E0dd599cbDD871605497B2Fc87c185`](https://testnet.citreascan.com/address/0x26C106BC45E0dd599cbDD871605497B2Fc87c185) |

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
| **Mainnet** | [`0x3D3821D358f56395d4053954f98aec0E1F0fa568`](https://citreascan.com/address/0x3D3821D358f56395d4053954f98aec0E1F0fa568) |
| **Testnet** | [`0x86e7A161cb9696E6d438c0c77dd18244efa2B8b1`](https://testnet.citreascan.com/address/0x86e7A161cb9696E6d438c0c77dd18244efa2B8b1) |

---

### QuoterV2

Provides price quotes for swaps without executing them.

**Key Functions:**

| Function | Description |
|----------|-------------|
| `quoteExactInputSingle()` | Quote for single-hop swap with exact input |
| `quoteExactInput()` | Quote for multi-hop swap with exact input |
| `quoteExactOutputSingle()` | Quote for single-hop swap with exact output |
| `quoteExactOutput()` | Quote for multi-hop swap with exact output |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x428f20dd8926Eabe19653815Ed0BE7D6c36f8425`](https://citreascan.com/address/0x428f20dd8926Eabe19653815Ed0BE7D6c36f8425) |
| **Testnet** | [`0x719a4C7B49E5361a39Dc83c23b353CA220D9B99d`](https://testnet.citreascan.com/address/0x719a4C7B49E5361a39Dc83c23b353CA220D9B99d) |

---

### TickLens

Batch fetches tick data for pools.

**Key Functions:**

| Function | Description |
|----------|-------------|
| `getPopulatedTicksInWord()` | Get all initialized ticks in a word |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0xD9d430f27F922A3316d22Cd9d58558f45Dad8012`](https://citreascan.com/address/0xD9d430f27F922A3316d22Cd9d58558f45Dad8012) |
| **Testnet** | [`0xa0Fe847227eE5076bC5D1D3c605261837fa047fB`](https://testnet.citreascan.com/address/0xa0Fe847227eE5076bC5D1D3c605261837fa047fB) |

---

### V3Migrator

Migrates liquidity from Uniswap V2 to V3.

**Key Functions:**

| Function | Description |
|----------|-------------|
| `migrate()` | Migrate V2 LP tokens to V3 position |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0xB9e69B428a5BfF4aCA9bfE66E80BAfD0477165E6`](https://citreascan.com/address/0xB9e69B428a5BfF4aCA9bfE66E80BAfD0477165E6) |
| **Testnet** | [`0xfa83918a27F9cC32619ae1A85f7e1Ae3e3F6Ceb8`](https://testnet.citreascan.com/address/0xfa83918a27F9cC32619ae1A85f7e1Ae3e3F6Ceb8) |

---

### V3Staker

Liquidity mining rewards for V3 positions.

**Key Functions:**

| Function | Description |
|----------|-------------|
| `createIncentive()` | Create a new staking incentive |
| `stakeToken()` | Stake an LP NFT |
| `unstakeToken()` | Unstake an LP NFT |
| `claimReward()` | Claim earned rewards |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0xB511028582FDEe8AC66b524630Cc85e457f66Aa1`](https://citreascan.com/address/0xB511028582FDEe8AC66b524630Cc85e457f66Aa1) |
| **Testnet** | [`0xeeb6c9514f1E11E48f18DD8822eF3Db1B179DcCE`](https://testnet.citreascan.com/address/0xeeb6c9514f1E11E48f18DD8822eF3Db1B179DcCE) |

---

### Multicall2

Batch multiple contract calls in a single transaction.

**Key Functions:**

| Function | Description |
|----------|-------------|
| `aggregate()` | Execute multiple calls, revert on failure |
| `tryAggregate()` | Execute multiple calls, return success status |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0xd277541Ab4f406Ac9530C41aB3d1818C276e1A1c`](https://citreascan.com/address/0xd277541Ab4f406Ac9530C41aB3d1818C276e1A1c) |
| **Testnet** | [`0xC1bD4864F267f8B032224817d33A7b53eD866F5e`](https://testnet.citreascan.com/address/0xC1bD4864F267f8B032224817d33A7b53eD866F5e) |

---

### ProxyAdmin

Admin contract for upgradeable proxies (e.g., NFT position descriptor).

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x7864b1f116F939eeCFDCf76B532d5BBDa5F80031`](https://citreascan.com/address/0x7864b1f116F939eeCFDCf76B532d5BBDa5F80031) |
| **Testnet** | [`0xCdc7C81784F9D3b4061e754477BEA077B7B4cCa4`](https://testnet.citreascan.com/address/0xCdc7C81784F9D3b4061e754477BEA077B7B4cCa4) |

---

## Uniswap V2 Contracts

JuiceSwap includes Uniswap V2 contracts for simpler AMM pools with constant product formula.

### UniswapV2Factory

Creates and manages V2 liquidity pools.

**Key Functions:**

| Function | Description |
|----------|-------------|
| `createPair()` | Deploy a new V2 pair |
| `getPair()` | Get pair address for token pair |
| `allPairs()` | Get pair by index |
| `allPairsLength()` | Total number of pairs |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x400B27260bc8BbBF740e25B29a24EDf175d9fE56`](https://citreascan.com/address/0x400B27260bc8BbBF740e25B29a24EDf175d9fE56) |
| **Testnet** | [`0xfc271758732F5eD3ddF19727B7E29BFC3325370d`](https://testnet.citreascan.com/address/0xfc271758732F5eD3ddF19727B7E29BFC3325370d) |

---

### UniswapV2Router02

Routes swaps and liquidity operations for V2 pools.

**Key Functions:**

| Function | Description |
|----------|-------------|
| `swapExactTokensForTokens()` | Swap exact input for minimum output |
| `swapTokensForExactTokens()` | Swap maximum input for exact output |
| `addLiquidity()` | Add liquidity to a pair |
| `removeLiquidity()` | Remove liquidity from a pair |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x6BDea31C89E0A202cE84b5752BB2e827B39984ae`](https://citreascan.com/address/0x6BDea31C89E0A202cE84b5752BB2e827B39984ae) |
| **Testnet** | [`0x37164703eF51EcB49C9a565C233a277003aE483f`](https://testnet.citreascan.com/address/0x37164703eF51EcB49C9a565C233a277003aE483f) |

---

## NFT Position Descriptor Contracts

These contracts generate on-chain SVG artwork and metadata for LP position NFTs.

### NFTDescriptorLibrary

Library for generating SVG artwork.

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x106ff466B27D10e9Ab932c443Cd790BbA0027ec6`](https://citreascan.com/address/0x106ff466B27D10e9Ab932c443Cd790BbA0027ec6) |
| **Testnet** | [`0x73e3bDE5af755C34fC4487cA083cb8035a43d1Ef`](https://testnet.citreascan.com/address/0x73e3bDE5af755C34fC4487cA083cb8035a43d1Ef) |

### NonfungibleTokenPositionDescriptor

Generates token URI metadata for position NFTs.

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x321c3C687D65C22A25f1e461e2568156adfD5D9C`](https://citreascan.com/address/0x321c3C687D65C22A25f1e461e2568156adfD5D9C) |
| **Testnet** | [`0x17a12a5461Bf35d4383B3f039d7e5Cd7d92aAACD`](https://testnet.citreascan.com/address/0x17a12a5461Bf35d4383B3f039d7e5Cd7d92aAACD) |

### DescriptorProxy

Upgradeable proxy for the position descriptor.

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x2e6D1f833a7951d02A47f244bA5F429699B87E4f`](https://citreascan.com/address/0x2e6D1f833a7951d02A47f244bA5F429699B87E4f) |
| **Testnet** | [`0x6b8e06186725e41EC05045A957bA78A336b3dd70`](https://testnet.citreascan.com/address/0x6b8e06186725e41EC05045A957bA78A336b3dd70) |

---

## Launchpad Contracts

The JuiceSwap Launchpad enables fair token launches with bonding curve mechanics.

### TokenFactory

Creates new tokens with bonding curve pricing that graduate to V2 pools.

**Key Features:**
- Bonding curve token creation
- Automatic graduation to Uniswap V2 when market cap threshold reached
- Built-in fee mechanism

**Key Functions:**

| Function | Description |
|----------|-------------|
| `createToken()` | Deploy a new bonding curve token |
| `buy()` | Buy tokens on the bonding curve |
| `sell()` | Sell tokens on the bonding curve |
| `graduate()` | Graduate token to V2 pool |

| Property | Value |
|----------|-------|
| **Graduation Threshold** | ~12,750 JUSD collected |
| **Reserved for DEX** | 20.69% of supply |
| **Fee** | 1% (100 bps) |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0xF5E06d37091a252A3Ae6BFd575D97635625028b9`](https://citreascan.com/address/0xF5E06d37091a252A3Ae6BFd575D97635625028b9) |
| **Testnet** | [`0xCf5b581064F27a0cFABbbD3E538aFf3b358665c4`](https://testnet.citreascan.com/address/0xCf5b581064F27a0cFABbbD3E538aFf3b358665c4) |

---

### BondingCurveToken (Implementation)

Template contract for bonding curve tokens.

| Network | Address |
|---------|---------|
| **Mainnet** | [`0xB8418EDc48c0a63a0Ab29F50BdE09552A8aECa0c`](https://citreascan.com/address/0xB8418EDc48c0a63a0Ab29F50BdE09552A8aECa0c) |
| **Testnet** | [`0xC46706007351AD7853159170fCC0489CCD04643D`](https://testnet.citreascan.com/address/0xC46706007351AD7853159170fCC0489CCD04643D) |

---

## LayerZero Bridge Contracts (Mainnet Only)

JuiceSwap integrates with LayerZero for cross-chain token bridging from Ethereum.

### Bridged Tokens

| Token | Address | Description |
|-------|---------|-------------|
| **USDC (L0)** | [`0xE045e6c36cF77FAA2CfB54466D71A3aEF7bbE839`](https://citreascan.com/address/0xE045e6c36cF77FAA2CfB54466D71A3aEF7bbE839) | LayerZero bridged USDC |
| **USDT (L0)** | [`0x9f3096Bac87e7F03DC09b0B416eB0DF837304dc4`](https://citreascan.com/address/0x9f3096Bac87e7F03DC09b0B416eB0DF837304dc4) | LayerZero bridged USDT |
| **WBTC.e** | [`0xDF240DC08B0FdaD1d93b74d5048871232f6BEA3d`](https://citreascan.com/address/0xDF240DC08B0FdaD1d93b74d5048871232f6BEA3d) | LayerZero bridged WBTC (OFT) |

### OFT Adapters

| Contract | Address | Description |
|----------|---------|-------------|
| **USDC OFT Adapter** | [`0x41710804caB0974638E1504DB723D7bddec22e30`](https://citreascan.com/address/0x41710804caB0974638E1504DB723D7bddec22e30) | Bridge adapter for USDC |
| **USDT OFT Adapter** | [`0xF8b5983BFa11dc763184c96065D508AE1502C030`](https://citreascan.com/address/0xF8b5983BFa11dc763184c96065D508AE1502C030) | Bridge adapter for USDT |

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
| **Mainnet** | [`0x0987D3720D38847ac6dBB9D025B9dE892a3CA35C`](https://citreascan.com/address/0x0987D3720D38847ac6dBB9D025B9dE892a3CA35C) |
| **Testnet** | [`0x6a850a548fdd050e8961223ec8FfCDfacEa57E39`](https://testnet.citreascan.com/address/0x6a850a548fdd050e8961223ec8FfCDfacEa57E39) |

### svJUSD (SavingsVaultJUSD)

Interest-bearing JUSD vault (ERC-4626). Used in pools instead of plain JUSD.

| Property | Value |
|----------|-------|
| **Symbol** | svJUSD |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x1b70ae756b1089cc5948e4f8a2AD498DF30E897d`](https://citreascan.com/address/0x1b70ae756b1089cc5948e4f8a2AD498DF30E897d) |
| **Testnet** | [`0x802a29bD29f02c8C477Af5362f9ba88FAe39Cc7B`](https://testnet.citreascan.com/address/0x802a29bD29f02c8C477Af5362f9ba88FAe39Cc7B) |

### JUICE (Equity)

Governance token for voting and fee distribution.

| Property | Value |
|----------|-------|
| **Decimals** | 18 |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x2A36f2b204B46Fd82653cd06d00c7fF757C99ae4`](https://citreascan.com/address/0x2A36f2b204B46Fd82653cd06d00c7fF757C99ae4) |
| **Testnet** | [`0x7fa131991c8A7d8C21b11391C977Fc7c4c8e0D5E`](https://testnet.citreascan.com/address/0x7fa131991c8A7d8C21b11391C977Fc7c4c8e0D5E) |

### WcBTC (Wrapped cBTC)

Wrapped version of native cBTC for ERC-20 compatibility.

| Property | Value |
|----------|-------|
| **Decimals** | 18 |

| Network | Address |
|---------|---------|
| **Mainnet** | [`0x3100000000000000000000000000000000000006`](https://citreascan.com/address/0x3100000000000000000000000000000000000006) |
| **Testnet** | [`0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93`](https://testnet.citreascan.com/address/0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93) |

---

## Contract Summary

### Mainnet (Chain ID: 4114)

#### JuiceSwap Core

| Contract | Address | Purpose |
|----------|---------|---------|
| JuiceSwapGateway | [`0xAFcfD58Fe17BEb0c9D15C51D19519682dFcdaab9`](https://citreascan.com/address/0xAFcfD58Fe17BEb0c9D15C51D19519682dFcdaab9) | User-facing swap/LP interface |
| JuiceSwapGovernor | [`0x51f3D5905C768CCA2D4904Ca7877614CeaD607ae`](https://citreascan.com/address/0x51f3D5905C768CCA2D4904Ca7877614CeaD607ae) | Governance proposals |
| JuiceSwapFeeCollector | [`0xD2D68A452A6f5d9090153f52E64f23cc7fF8A97b`](https://citreascan.com/address/0xD2D68A452A6f5d9090153f52E64f23cc7fF8A97b) | Fee collection & distribution |

#### Uniswap V3

| Contract | Address | Purpose |
|----------|---------|---------|
| UniswapV3Factory | [`0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82`](https://citreascan.com/address/0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82) | V3 pool creation |
| SwapRouter | [`0x565eD3D57fe40f78A46f348C220121AE093c3cF8`](https://citreascan.com/address/0x565eD3D57fe40f78A46f348C220121AE093c3cF8) | V3 swap routing |
| NonfungiblePositionManager | [`0x3D3821D358f56395d4053954f98aec0E1F0fa568`](https://citreascan.com/address/0x3D3821D358f56395d4053954f98aec0E1F0fa568) | LP NFT management |
| QuoterV2 | [`0x428f20dd8926Eabe19653815Ed0BE7D6c36f8425`](https://citreascan.com/address/0x428f20dd8926Eabe19653815Ed0BE7D6c36f8425) | Price quotes |
| TickLens | [`0xD9d430f27F922A3316d22Cd9d58558f45Dad8012`](https://citreascan.com/address/0xD9d430f27F922A3316d22Cd9d58558f45Dad8012) | Tick data fetching |
| V3Migrator | [`0xB9e69B428a5BfF4aCA9bfE66E80BAfD0477165E6`](https://citreascan.com/address/0xB9e69B428a5BfF4aCA9bfE66E80BAfD0477165E6) | V2→V3 migration |
| V3Staker | [`0xB511028582FDEe8AC66b524630Cc85e457f66Aa1`](https://citreascan.com/address/0xB511028582FDEe8AC66b524630Cc85e457f66Aa1) | Liquidity mining |

#### Uniswap V2

| Contract | Address | Purpose |
|----------|---------|---------|
| UniswapV2Factory | [`0x400B27260bc8BbBF740e25B29a24EDf175d9fE56`](https://citreascan.com/address/0x400B27260bc8BbBF740e25B29a24EDf175d9fE56) | V2 pair creation |
| UniswapV2Router02 | [`0x6BDea31C89E0A202cE84b5752BB2e827B39984ae`](https://citreascan.com/address/0x6BDea31C89E0A202cE84b5752BB2e827B39984ae) | V2 swap routing |

#### Infrastructure

| Contract | Address | Purpose |
|----------|---------|---------|
| Multicall2 | [`0xd277541Ab4f406Ac9530C41aB3d1818C276e1A1c`](https://citreascan.com/address/0xd277541Ab4f406Ac9530C41aB3d1818C276e1A1c) | Batch calls |
| ProxyAdmin | [`0x7864b1f116F939eeCFDCf76B532d5BBDa5F80031`](https://citreascan.com/address/0x7864b1f116F939eeCFDCf76B532d5BBDa5F80031) | Proxy administration |
| NFTDescriptorLibrary | [`0x106ff466B27D10e9Ab932c443Cd790BbA0027ec6`](https://citreascan.com/address/0x106ff466B27D10e9Ab932c443Cd790BbA0027ec6) | NFT SVG generation |
| PositionDescriptor | [`0x321c3C687D65C22A25f1e461e2568156adfD5D9C`](https://citreascan.com/address/0x321c3C687D65C22A25f1e461e2568156adfD5D9C) | NFT metadata |
| DescriptorProxy | [`0x2e6D1f833a7951d02A47f244bA5F429699B87E4f`](https://citreascan.com/address/0x2e6D1f833a7951d02A47f244bA5F429699B87E4f) | Upgradeable descriptor |

#### Launchpad

| Contract | Address | Purpose |
|----------|---------|---------|
| TokenFactory | [`0xF5E06d37091a252A3Ae6BFd575D97635625028b9`](https://citreascan.com/address/0xF5E06d37091a252A3Ae6BFd575D97635625028b9) | Bonding curve tokens |
| BondingCurveToken | [`0xB8418EDc48c0a63a0Ab29F50BdE09552A8aECa0c`](https://citreascan.com/address/0xB8418EDc48c0a63a0Ab29F50BdE09552A8aECa0c) | Token implementation |

#### Tokens

| Contract | Address | Purpose |
|----------|---------|---------|
| JUSD | [`0x0987D3720D38847ac6dBB9D025B9dE892a3CA35C`](https://citreascan.com/address/0x0987D3720D38847ac6dBB9D025B9dE892a3CA35C) | Stablecoin |
| svJUSD | [`0x1b70ae756b1089cc5948e4f8a2AD498DF30E897d`](https://citreascan.com/address/0x1b70ae756b1089cc5948e4f8a2AD498DF30E897d) | Savings vault |
| JUICE | [`0x2A36f2b204B46Fd82653cd06d00c7fF757C99ae4`](https://citreascan.com/address/0x2A36f2b204B46Fd82653cd06d00c7fF757C99ae4) | Governance token |
| WcBTC | [`0x3100000000000000000000000000000000000006`](https://citreascan.com/address/0x3100000000000000000000000000000000000006) | Wrapped cBTC |

#### LayerZero Bridge

| Contract | Address | Purpose |
|----------|---------|---------|
| USDC (L0) | [`0xE045e6c36cF77FAA2CfB54466D71A3aEF7bbE839`](https://citreascan.com/address/0xE045e6c36cF77FAA2CfB54466D71A3aEF7bbE839) | Bridged USDC |
| USDC OFT Adapter | [`0x41710804caB0974638E1504DB723D7bddec22e30`](https://citreascan.com/address/0x41710804caB0974638E1504DB723D7bddec22e30) | USDC bridge adapter |
| USDT (L0) | [`0x9f3096Bac87e7F03DC09b0B416eB0DF837304dc4`](https://citreascan.com/address/0x9f3096Bac87e7F03DC09b0B416eB0DF837304dc4) | Bridged USDT |
| USDT OFT Adapter | [`0xF8b5983BFa11dc763184c96065D508AE1502C030`](https://citreascan.com/address/0xF8b5983BFa11dc763184c96065D508AE1502C030) | USDT bridge adapter |
| WBTC.e | [`0xDF240DC08B0FdaD1d93b74d5048871232f6BEA3d`](https://citreascan.com/address/0xDF240DC08B0FdaD1d93b74d5048871232f6BEA3d) | Bridged WBTC |

### Testnet (Chain ID: 5115)

#### JuiceSwap Core

| Contract | Address | Purpose |
|----------|---------|---------|
| JuiceSwapGateway | [`0x8eE3Dd585752805A258ad3a963949a7c3fec44eB`](https://testnet.citreascan.com/address/0x8eE3Dd585752805A258ad3a963949a7c3fec44eB) | User-facing swap/LP interface |
| JuiceSwapGovernor | [`0x8AFD7CB73Ce85b44996B86ec604c125af244A2B8`](https://testnet.citreascan.com/address/0x8AFD7CB73Ce85b44996B86ec604c125af244A2B8) | Governance proposals |
| JuiceSwapFeeCollector | [`0xfac6303F78A2b316a20eD927Ba0f7a7d07AaC47E`](https://testnet.citreascan.com/address/0xfac6303F78A2b316a20eD927Ba0f7a7d07AaC47E) | Fee collection & distribution |

#### Uniswap V3

| Contract | Address | Purpose |
|----------|---------|---------|
| UniswapV3Factory | [`0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238`](https://testnet.citreascan.com/address/0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238) | V3 pool creation |
| SwapRouter | [`0x26C106BC45E0dd599cbDD871605497B2Fc87c185`](https://testnet.citreascan.com/address/0x26C106BC45E0dd599cbDD871605497B2Fc87c185) | V3 swap routing |
| NonfungiblePositionManager | [`0x86e7A161cb9696E6d438c0c77dd18244efa2B8b1`](https://testnet.citreascan.com/address/0x86e7A161cb9696E6d438c0c77dd18244efa2B8b1) | LP NFT management |
| QuoterV2 | [`0x719a4C7B49E5361a39Dc83c23b353CA220D9B99d`](https://testnet.citreascan.com/address/0x719a4C7B49E5361a39Dc83c23b353CA220D9B99d) | Price quotes |
| TickLens | [`0xa0Fe847227eE5076bC5D1D3c605261837fa047fB`](https://testnet.citreascan.com/address/0xa0Fe847227eE5076bC5D1D3c605261837fa047fB) | Tick data fetching |
| V3Migrator | [`0xfa83918a27F9cC32619ae1A85f7e1Ae3e3F6Ceb8`](https://testnet.citreascan.com/address/0xfa83918a27F9cC32619ae1A85f7e1Ae3e3F6Ceb8) | V2→V3 migration |
| V3Staker | [`0xeeb6c9514f1E11E48f18DD8822eF3Db1B179DcCE`](https://testnet.citreascan.com/address/0xeeb6c9514f1E11E48f18DD8822eF3Db1B179DcCE) | Liquidity mining |

#### Uniswap V2

| Contract | Address | Purpose |
|----------|---------|---------|
| UniswapV2Factory | [`0xfc271758732F5eD3ddF19727B7E29BFC3325370d`](https://testnet.citreascan.com/address/0xfc271758732F5eD3ddF19727B7E29BFC3325370d) | V2 pair creation |
| UniswapV2Router02 | [`0x37164703eF51EcB49C9a565C233a277003aE483f`](https://testnet.citreascan.com/address/0x37164703eF51EcB49C9a565C233a277003aE483f) | V2 swap routing |

#### Infrastructure

| Contract | Address | Purpose |
|----------|---------|---------|
| Multicall2 | [`0xC1bD4864F267f8B032224817d33A7b53eD866F5e`](https://testnet.citreascan.com/address/0xC1bD4864F267f8B032224817d33A7b53eD866F5e) | Batch calls |
| ProxyAdmin | [`0xCdc7C81784F9D3b4061e754477BEA077B7B4cCa4`](https://testnet.citreascan.com/address/0xCdc7C81784F9D3b4061e754477BEA077B7B4cCa4) | Proxy administration |
| NFTDescriptorLibrary | [`0x73e3bDE5af755C34fC4487cA083cb8035a43d1Ef`](https://testnet.citreascan.com/address/0x73e3bDE5af755C34fC4487cA083cb8035a43d1Ef) | NFT SVG generation |
| PositionDescriptor | [`0x17a12a5461Bf35d4383B3f039d7e5Cd7d92aAACD`](https://testnet.citreascan.com/address/0x17a12a5461Bf35d4383B3f039d7e5Cd7d92aAACD) | NFT metadata |
| DescriptorProxy | [`0x6b8e06186725e41EC05045A957bA78A336b3dd70`](https://testnet.citreascan.com/address/0x6b8e06186725e41EC05045A957bA78A336b3dd70) | Upgradeable descriptor |

#### Launchpad

| Contract | Address | Purpose |
|----------|---------|---------|
| TokenFactory | [`0xCf5b581064F27a0cFABbbD3E538aFf3b358665c4`](https://testnet.citreascan.com/address/0xCf5b581064F27a0cFABbbD3E538aFf3b358665c4) | Bonding curve tokens |
| BondingCurveToken | [`0xC46706007351AD7853159170fCC0489CCD04643D`](https://testnet.citreascan.com/address/0xC46706007351AD7853159170fCC0489CCD04643D) | Token implementation |

#### Tokens

| Contract | Address | Purpose |
|----------|---------|---------|
| JUSD | [`0x6a850a548fdd050e8961223ec8FfCDfacEa57E39`](https://testnet.citreascan.com/address/0x6a850a548fdd050e8961223ec8FfCDfacEa57E39) | Stablecoin |
| svJUSD | [`0x802a29bD29f02c8C477Af5362f9ba88FAe39Cc7B`](https://testnet.citreascan.com/address/0x802a29bD29f02c8C477Af5362f9ba88FAe39Cc7B) | Savings vault |
| JUICE | [`0x7fa131991c8A7d8C21b11391C977Fc7c4c8e0D5E`](https://testnet.citreascan.com/address/0x7fa131991c8A7d8C21b11391C977Fc7c4c8e0D5E) | Governance token |
| WcBTC | [`0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93`](https://testnet.citreascan.com/address/0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93) | Wrapped cBTC |

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
| [JuiceSwapxyz/v3-core](https://github.com/JuiceSwapxyz/v3-core) | V3 Factory, Pools (Uniswap V3 fork) |
| [JuiceSwapxyz/v3-periphery](https://github.com/JuiceSwapxyz/v3-periphery) | V3 Router, Position Manager, Quoter |
| [JuiceSwapxyz/v2-core](https://github.com/JuiceSwapxyz/v2-core) | V2 Factory, Pairs (Uniswap V2 fork) |
| [JuiceSwapxyz/v2-periphery](https://github.com/JuiceSwapxyz/v2-periphery) | V2 Router |
| [JuiceSwapxyz/deploy-v3](https://github.com/JuiceSwapxyz/deploy-v3) | Deployment scripts |
| [JuiceSwapxyz/launchpad](https://github.com/JuiceSwapxyz/launchpad) | TokenFactory, BondingCurveToken |

| Network | Chain ID | Explorer |
|---------|----------|----------|
| **Mainnet** | 4114 | [explorer.mainnet.citrea.xyz](https://citreascan.com) |
| **Testnet** | 5115 | [explorer.testnet.citrea.xyz](https://testnet.citreascan.com) |
