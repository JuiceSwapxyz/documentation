# Swapping Tokens

**Trade tokens on JuiceSwap with automatic JUSD/svJUSD conversion and concentrated liquidity.**

## How Swapping Works

JuiceSwap uses Uniswap V3's concentrated liquidity AMM (Automated Market Maker) to enable trustless token swaps. The JuiceSwapGateway adds a layer of convenience by automatically handling token conversions.

### Automatic Conversions

When you swap through JuiceSwap, the Gateway handles these conversions automatically:

| You Provide | Gateway Uses | You Receive |
|-------------|--------------|-------------|
| JUSD | svJUSD (in pool) | Your desired token |
| cBTC (native) | WcBTC | Your desired token |
| Any token | As-is | JUSD (converted from svJUSD) |

**Why svJUSD?** All pools use svJUSD (the interest-bearing savings vault token) instead of plain JUSD. This means liquidity providers earn savings interest in addition to swap fees. The conversion is invisible to users.

## Executing a Swap

### Via JuiceSwapGateway

```solidity
function swapExactTokensForTokens(
    address tokenIn,      // Token you're selling
    address tokenOut,     // Token you're buying
    uint24 fee,           // Fee tier (500, 3000, or 10000)
    uint256 amountIn,     // Amount to swap
    uint256 minAmountOut, // Minimum output (slippage protection)
    address to,           // Recipient address
    uint256 deadline      // Transaction deadline
) external payable returns (uint256 amountOut)
```

### Fee Tiers

JuiceSwap supports multiple fee tiers for different pair volatilities:

| Fee Tier | Fee | Best For |
|----------|-----|----------|
| 500 | 0.05% | Stable pairs (JUSD/USDT) |
| 3000 | 0.30% | Standard pairs (default) |
| 10000 | 1.00% | Exotic/volatile pairs |

**Note:** If you pass `fee = 0`, the Gateway uses the default fee tier (0.30%).

### Example: Swapping JUSD for WcBTC

```javascript
const gateway = new ethers.Contract(GATEWAY_ADDRESS, gatewayAbi, signer);

// Approve Gateway to spend JUSD
await jusd.approve(GATEWAY_ADDRESS, amountIn);

// Execute swap
const amountOut = await gateway.swapExactTokensForTokens(
    JUSD_ADDRESS,           // tokenIn
    WCBTC_ADDRESS,          // tokenOut
    3000,                   // 0.3% fee tier
    ethers.parseEther("100"), // 100 JUSD
    ethers.parseEther("0.001"), // min 0.001 WcBTC
    userAddress,            // recipient
    Math.floor(Date.now() / 1000) + 600 // 10 min deadline
);
```

### Swapping Native cBTC

For native Bitcoin (cBTC) swaps, send the amount as `msg.value`:

```javascript
// Swap native cBTC for JUSD
const amountOut = await gateway.swapExactTokensForTokens(
    ethers.ZeroAddress,     // tokenIn = native cBTC
    JUSD_ADDRESS,           // tokenOut
    3000,                   // fee tier
    0,                      // amountIn (ignored, uses msg.value)
    minJusdOut,             // slippage protection
    userAddress,            // recipient
    deadline,
    { value: ethers.parseEther("0.01") } // 0.01 cBTC
);
```

## Slippage Protection

Always set `minAmountOut` to protect against price movements:

```javascript
// Calculate minimum output with 1% slippage tolerance
const expectedOutput = await getQuote(tokenIn, tokenOut, amountIn);
const minAmountOut = expectedOutput * 99n / 100n; // 1% slippage
```

If the actual output is less than `minAmountOut`, the transaction reverts with `InsufficientOutput()`.

## Price Impact

Large trades relative to pool liquidity will experience price impact. The concentrated liquidity model means:

- **Within range**: Excellent pricing from concentrated liquidity
- **Outside range**: May need to use multiple pools or experience higher slippage

### Checking Liquidity

Before large trades, check pool liquidity:

```javascript
// Get pool address
const poolAddress = await factory.getPool(tokenA, tokenB, fee);

// Check pool liquidity
const pool = new ethers.Contract(poolAddress, poolAbi, provider);
const liquidity = await pool.liquidity();
```

## Multi-Hop Swaps

For tokens without a direct pool, use multi-hop routing through the SwapRouter:

```javascript
// Path encoding: token0 + fee + token1 + fee + token2
const path = ethers.solidityPacked(
    ['address', 'uint24', 'address', 'uint24', 'address'],
    [TOKEN_A, 3000, JUSD_ADDRESS, 3000, TOKEN_B]
);

// Execute multi-hop swap via SwapRouter
const router = new ethers.Contract(SWAP_ROUTER_ADDRESS, routerAbi, signer);
await router.exactInput({
    path: path,
    recipient: userAddress,
    amountIn: amountIn,
    amountOutMinimum: minAmountOut
});
```

## Transaction Deadlines

Always include a deadline to prevent stale transactions:

```javascript
// 10 minute deadline
const deadline = Math.floor(Date.now() / 1000) + 600;
```

If `block.timestamp > deadline`, the transaction reverts with `DeadlineExpired()`.

## Error Handling

| Error | Cause | Solution |
|-------|-------|----------|
| `InsufficientOutput` | Slippage exceeded | Increase `minAmountOut` tolerance |
| `DeadlineExpired` | Transaction too old | Use fresh deadline |
| `InvalidAmount` | Zero input amount | Provide non-zero amount |
| `InvalidFee` | Fee tier doesn't exist | Use 500, 3000, or 10000 |
| `InvalidToken` | Unsupported token | Check token addresses |

## Events

Monitor swaps through the `SwapExecuted` event:

```solidity
event SwapExecuted(
    address indexed sender,
    address indexed tokenIn,
    address indexed tokenOut,
    uint256 amountIn,
    uint256 amountOut
);
```

## Gas Optimization

- **Approve once**: Use `approve(MAX_UINT256)` to avoid repeated approvals
- **Native cBTC**: Swapping native cBTC saves the wrap/unwrap gas cost
- **Direct pools**: Single-hop swaps are cheaper than multi-hop

## Security Considerations

1. **Always use slippage protection** - Set realistic `minAmountOut`
2. **Check pool liquidity** - Large trades in small pools have high impact
3. **Verify addresses** - Double-check token and recipient addresses
4. **Use deadlines** - Prevent transaction front-running

## Contract Addresses

### Mainnet (Chain ID: 4114)

| Contract | Address |
|----------|---------|
| JuiceSwapGateway | [`0xAFcfD58Fe17BEb0c9D15C51D19519682dFcdaab9`](https://citreascan.com/address/0xAFcfD58Fe17BEb0c9D15C51D19519682dFcdaab9) |
| SwapRouter | [`0x565eD3D57fe40f78A46f348C220121AE093c3cF8`](https://citreascan.com/address/0x565eD3D57fe40f78A46f348C220121AE093c3cF8) |
| UniswapV3Factory | [`0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82`](https://citreascan.com/address/0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82) |

### Testnet (Chain ID: 5115)

| Contract | Address |
|----------|---------|
| JuiceSwapGateway | [`0x8eE3Dd585752805A258ad3a963949a7c3fec44eB`](https://testnet.citreascan.com/address/0x8eE3Dd585752805A258ad3a963949a7c3fec44eB) |
| SwapRouter | [`0x26C106BC45E0dd599cbDD871605497B2Fc87c185`](https://testnet.citreascan.com/address/0x26C106BC45E0dd599cbDD871605497B2Fc87c185) |
| UniswapV3Factory | [`0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238`](https://testnet.citreascan.com/address/0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238) |
