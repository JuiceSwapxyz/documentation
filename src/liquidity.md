# Providing Liquidity

**Earn swap fees and savings interest by providing liquidity to JuiceSwap pools.**

## Understanding Liquidity Provision

JuiceSwap uses Uniswap V3's concentrated liquidity model, where liquidity providers (LPs) can concentrate their capital within specific price ranges for greater capital efficiency.

### Double Yield Advantage

JuiceSwap offers a unique benefit: **LPs earn both swap fees AND savings interest**:

| Yield Source | Description |
|--------------|-------------|
| **Swap Fees** | 0.05% - 1% per trade (based on fee tier) |
| **Savings Interest** | Automatic via svJUSD (when JUSD is in the pool) |

This is possible because the Gateway automatically converts JUSD to svJUSD (the interest-bearing savings vault token) when you provide liquidity.

## Concentrated Liquidity Basics

Unlike traditional AMMs with infinite price ranges, Uniswap V3 lets you choose where to concentrate your liquidity:

```
Price
  │
  │     ┌─────────────────┐
  │     │  Your Liquidity │
  │     │   (Concentrated)│
  │     └─────────────────┘
  │ ────────────────────────── Traditional AMM (Spread Thin)
  │
  └────────────────────────────► Range
       Lower         Upper
```

### Benefits of Concentration

| Concentration | Capital Efficiency | Risk |
|---------------|-------------------|------|
| Narrow range | Very high (up to 4000x) | Higher (out-of-range risk) |
| Medium range | Moderate (10-100x) | Balanced |
| Full range | Same as V2 (1x) | Lowest |

## Adding Liquidity

### Via JuiceSwapGateway

The Gateway simplifies liquidity provision with automatic token conversions:

```solidity
function addLiquidity(
    address tokenA,       // First token (e.g., JUSD)
    address tokenB,       // Second token (e.g., WcBTC)
    uint24 fee,           // Fee tier (500, 3000, 10000)
    uint256 amountADesired,
    uint256 amountBDesired,
    uint256 amountAMin,   // Slippage protection
    uint256 amountBMin,
    address to,           // NFT recipient
    uint256 deadline
) external payable returns (uint256 amountA, uint256 amountB, uint256 liquidity)
```

**Note:** This creates a full-range position. For custom price ranges, use the NonfungiblePositionManager directly.

### Example: Adding JUSD/WcBTC Liquidity

```javascript
const gateway = new ethers.Contract(GATEWAY_ADDRESS, gatewayAbi, signer);

// Approve tokens
await jusd.approve(GATEWAY_ADDRESS, amountJusd);
await wcbtc.approve(GATEWAY_ADDRESS, amountWcbtc);

// Add liquidity (creates full-range position)
const [amountA, amountB, tokenId] = await gateway.addLiquidity(
    JUSD_ADDRESS,
    WCBTC_ADDRESS,
    3000,                   // 0.3% fee tier
    ethers.parseEther("1000"),  // 1000 JUSD
    ethers.parseEther("0.01"),  // 0.01 WcBTC
    ethers.parseEther("990"),   // min 990 JUSD (1% slippage)
    ethers.parseEther("0.0099"), // min 0.0099 WcBTC
    userAddress,
    deadline
);

console.log(`Position NFT ID: ${tokenId}`);
```

### Adding Liquidity with Native cBTC

```javascript
const [amountA, amountB, tokenId] = await gateway.addLiquidity(
    JUSD_ADDRESS,
    ethers.ZeroAddress,     // Native cBTC
    3000,
    ethers.parseEther("1000"),
    0,                      // Ignored, uses msg.value
    ethers.parseEther("990"),
    ethers.parseEther("0.0099"),
    userAddress,
    deadline,
    { value: ethers.parseEther("0.01") } // Send cBTC
);
```

## LP Position NFTs

Unlike traditional LP tokens, Uniswap V3 positions are represented as **NFTs (ERC-721)**:

| Property | Description |
|----------|-------------|
| **Unique** | Each position has a unique token ID |
| **Transferable** | Can be sold or transferred |
| **Composable** | Can be used in DeFi protocols |
| **Range-specific** | Contains tick range information |

### Viewing Your Position

```javascript
const positionManager = new ethers.Contract(
    POSITION_MANAGER_ADDRESS,
    positionManagerAbi,
    provider
);

const position = await positionManager.positions(tokenId);
// Returns: nonce, operator, token0, token1, fee,
//          tickLower, tickUpper, liquidity,
//          feeGrowthInside0LastX128, feeGrowthInside1LastX128,
//          tokensOwed0, tokensOwed1
```

## Increasing Liquidity

Add more tokens to an existing position:

```solidity
function increaseLiquidity(
    uint256 tokenId,
    address tokenA,
    address tokenB,
    uint256 amountADesired,
    uint256 amountBDesired,
    uint256 amountAMin,
    uint256 amountBMin,
    uint256 deadline
) external payable returns (uint256 amountA, uint256 amountB, uint128 liquidity)
```

**Important:** You must approve the Gateway to transfer your position NFT first.

```javascript
// Approve NFT transfer
await positionManager.approve(GATEWAY_ADDRESS, tokenId);

// Increase liquidity
const [amountA, amountB, addedLiquidity] = await gateway.increaseLiquidity(
    tokenId,
    JUSD_ADDRESS,
    WCBTC_ADDRESS,
    ethers.parseEther("500"),
    ethers.parseEther("0.005"),
    ethers.parseEther("495"),
    ethers.parseEther("0.00495"),
    deadline
);
```

## Removing Liquidity

Withdraw tokens from your position:

```solidity
function removeLiquidity(
    uint256 tokenId,
    uint128 liquidityToRemove, // 0 = remove all
    address tokenA,
    address tokenB,
    uint256 amountAMin,
    uint256 amountBMin,
    address to,
    uint256 deadline
) external returns (uint256 amountA, uint256 amountB)
```

### Example: Full Withdrawal

```javascript
// Approve NFT transfer
await positionManager.approve(GATEWAY_ADDRESS, tokenId);

// Remove all liquidity
const [amountA, amountB] = await gateway.removeLiquidity(
    tokenId,
    0,                      // 0 = remove all liquidity
    JUSD_ADDRESS,
    WCBTC_ADDRESS,
    0,                      // No minimum (be careful in production!)
    0,
    userAddress,
    deadline
);
```

### Partial Withdrawal

```javascript
// Remove 50% of liquidity
const position = await positionManager.positions(tokenId);
const halfLiquidity = position.liquidity / 2n;

const [amountA, amountB] = await gateway.removeLiquidity(
    tokenId,
    halfLiquidity,
    JUSD_ADDRESS,
    WCBTC_ADDRESS,
    amountAMin,
    amountBMin,
    userAddress,
    deadline
);
```

## Collecting Fees

Accumulated swap fees can be collected separately from removing liquidity:

```javascript
// Collect fees via Position Manager
const [amount0, amount1] = await positionManager.collect({
    tokenId: tokenId,
    recipient: userAddress,
    amount0Max: ethers.MaxUint128,
    amount1Max: ethers.MaxUint128
});
```

**Note:** Fees are denominated in the pool's actual tokens (svJUSD, not JUSD).

## svJUSD Interest Mechanism

When you provide JUSD liquidity:

1. Gateway converts your JUSD to svJUSD
2. svJUSD is deposited into the pool
3. svJUSD appreciates in value over time (savings interest)
4. When you withdraw, svJUSD is converted back to more JUSD

```
Deposit: 1000 JUSD → 1000 svJUSD (shares)
         ↓
         Pool earns swap fees
         svJUSD earns savings interest
         ↓
Withdraw: 1000 svJUSD → 1020 JUSD (2% interest earned)
                      + swap fees earned
```

## Price Ranges and Ticks

Uniswap V3 uses "ticks" to define price ranges:

| Concept | Description |
|---------|-------------|
| **Tick** | Discrete price point (each tick = 0.01% price change) |
| **Tick Spacing** | Minimum tick interval for a fee tier |
| **Full Range** | Ticks from MIN_TICK to MAX_TICK |

### Fee Tier to Tick Spacing

| Fee Tier | Tick Spacing |
|----------|--------------|
| 500 (0.05%) | 10 |
| 3000 (0.30%) | 60 |
| 10000 (1.00%) | 200 |

## Impermanent Loss

Concentrated liquidity amplifies both gains and impermanent loss:

| Price Movement | Concentrated LP | Traditional LP |
|----------------|-----------------|----------------|
| Within range | Higher fees, some IL | Lower fees, less IL |
| Outside range | No fees, max IL for range | Still earning, less IL |

**Mitigation strategies:**
- Wider ranges for volatile pairs
- Active management (rebalancing)
- Focus on stable pairs

## Advanced: Custom Range Positions

For custom price ranges, interact directly with NonfungiblePositionManager:

```javascript
const mintParams = {
    token0: svJUSD_ADDRESS,  // Must use actual pool tokens
    token1: WCBTC_ADDRESS,
    fee: 3000,
    tickLower: -887220,      // Custom lower tick
    tickUpper: 887220,       // Custom upper tick
    amount0Desired: amount0,
    amount1Desired: amount1,
    amount0Min: 0,
    amount1Min: 0,
    recipient: userAddress,
    deadline: deadline
};

const [tokenId, liquidity, amount0, amount1] =
    await positionManager.mint(mintParams);
```

## Events

```solidity
// Liquidity added
event LiquidityAdded(
    address indexed sender,
    address tokenA,
    address tokenB,
    uint256 amountA,
    uint256 amountB,
    uint256 indexed tokenId
);

// Liquidity increased
event LiquidityIncreased(
    address indexed sender,
    uint256 indexed tokenId,
    uint256 amountA,
    uint256 amountB,
    uint128 liquidity
);

// Liquidity removed
event LiquidityRemoved(
    address indexed sender,
    uint256 indexed tokenId,
    uint256 amountA,
    uint256 amountB,
    uint128 liquidity
);
```

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `NotNFTOwner` | You don't own the position NFT | Use your own position |
| `InsufficientLiquidity` | Trying to remove more than available | Check position liquidity |
| `TokenMismatch` | Wrong tokens for position | Verify token addresses |
| `InvalidTokenPair` | Both tokens convert to same actual token | Use different tokens |
| `SlippageExceeded` | Price moved too much | Increase slippage tolerance |

## Contract Addresses

### Mainnet (Chain ID: 4114)

| Contract | Address |
|----------|---------|
| JuiceSwapGateway | [`0xAFcfD58Fe17BEb0c9D15C51D19519682dFcdaab9`](https://citreascan.com/address/0xAFcfD58Fe17BEb0c9D15C51D19519682dFcdaab9) |
| NonfungiblePositionManager | [`0x3D3821D358f56395d4053954f98aec0E1F0fa568`](https://citreascan.com/address/0x3D3821D358f56395d4053954f98aec0E1F0fa568) |
| UniswapV3Factory | [`0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82`](https://citreascan.com/address/0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82) |

### Testnet (Chain ID: 5115)

| Contract | Address |
|----------|---------|
| JuiceSwapGateway | [`0x8eE3Dd585752805A258ad3a963949a7c3fec44eB`](https://testnet.citreascan.com/address/0x8eE3Dd585752805A258ad3a963949a7c3fec44eB) |
| NonfungiblePositionManager | [`0x86e7A161cb9696E6d438c0c77dd18244efa2B8b1`](https://testnet.citreascan.com/address/0x86e7A161cb9696E6d438c0c77dd18244efa2B8b1) |
| UniswapV3Factory | [`0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238`](https://testnet.citreascan.com/address/0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238) |
