# Frequently Asked Questions

## General Questions

### What is JuiceSwap?

JuiceSwap is a decentralized exchange (DEX) built on Citrea, Bitcoin's first ZK rollup. It's a fork of Uniswap V3 optimized for the Citrea network and integrated with the JuiceDollar stablecoin ecosystem.

### How is JuiceSwap different from Uniswap?

While JuiceSwap uses Uniswap V3's proven AMM technology, it adds several unique features:

| Feature | Uniswap V3 | JuiceSwap |
|---------|------------|-----------|
| **svJUSD Integration** | No | Yes - LPs earn savings interest |
| **Fee Distribution** | Protocol treasury | Directly to JUICE equity |
| **Governance** | Timelock + voting | Veto-based (pass by default) |
| **Network** | Ethereum/L2s | Citrea (Bitcoin ZK rollup) |

### What is svJUSD and why does it matter?

svJUSD (Savings Vault JUSD) is an interest-bearing version of JUSD. When you provide JUSD liquidity on JuiceSwap, the Gateway automatically converts it to svJUSD. This means you earn:

1. **Swap fees** from traders (like any DEX)
2. **Savings interest** from the JuiceDollar protocol (bonus yield!)

### Is JuiceSwap audited?

JuiceSwap's custom contracts (Gateway, Governor, FeeCollector) are covered by the [JuiceSwap Audit Scope](https://github.com/JuiceSwapxyz/documentation/blob/main/AUDIT_SCOPE.md). The core AMM contracts are based on Uniswap V3, which has been extensively audited.

## Trading

### What tokens can I trade?

Any ERC-20 token that has a liquidity pool can be traded. Common pairs include:

- JUSD/WcBTC
- JUSD/Other stablecoins
- WcBTC/Other tokens

### What are the fee tiers?

| Fee | Best For |
|-----|----------|
| 0.05% | Stable pairs (JUSD/USDT) |
| 0.30% | Standard pairs (default) |
| 1.00% | Exotic/volatile pairs |

### How do I swap native cBTC?

The JuiceSwapGateway automatically wraps your native cBTC to WcBTC when swapping. Simply use `address(0)` as the input token and send cBTC with your transaction.

### What is slippage and how do I set it?

Slippage is the difference between expected and actual trade prices. Set `minAmountOut` to protect yourself:

```javascript
// 1% slippage tolerance
const minAmountOut = expectedOutput * 99n / 100n;
```

## Liquidity Provision

### How do LP positions work?

Unlike traditional LP tokens, JuiceSwap positions are **NFTs (ERC-721)**. Each position:

- Has a unique token ID
- Can be transferred or sold
- Contains specific price range information
- Earns fees only when price is within range

### What is concentrated liquidity?

Traditional AMMs spread your liquidity across all prices. Concentrated liquidity lets you focus your capital within a specific price range, earning more fees when the price stays in that range.

### Can I provide single-sided liquidity?

Yes, but only if the current price is outside your chosen range. If you set a range entirely above the current price, you'll provide only the lower-priced token.

### How do I earn savings interest as an LP?

It's automatic! When you provide JUSD through the JuiceSwapGateway, it converts your JUSD to svJUSD. When you withdraw, you get back more JUSD than you deposited (assuming positive interest rates).

### What is impermanent loss?

Impermanent loss (IL) occurs when the price ratio of your deposited tokens changes. With concentrated liquidity:

- **Narrower ranges** = Higher fees but more IL risk
- **Wider ranges** = Lower fees but less IL risk
- **Full range** = Similar to Uniswap V2

## Governance

### How does governance work?

JuiceSwap uses a **veto-based** system:

1. Anyone can propose (costs 1,000 JUSD)
2. Proposal waits 14+ days
3. JUICE holders can veto (need 2% voting power)
4. If no veto, anyone can execute

### How do I get voting power?

Voting power = JUICE balance × holding duration

The longer you hold JUICE, the more voting power you accumulate. You can also receive delegated votes from other holders.

### Can I veto a proposal?

Yes, if you have at least 2% of total voting power. This can include votes delegated to you by others.

### Where does the proposal fee go?

The 1,000 JUSD fee goes directly to the JUICE Equity contract, increasing the value of JUICE for all holders.

## Fees and Economics

### Where do protocol fees go?

Protocol fees are collected by the JuiceSwapFeeCollector, which:

1. Collects fees from pools
2. Swaps all tokens to JUSD
3. Sends JUSD to JUICE Equity

This increases the value of JUICE tokens.

### What protects against fee manipulation?

The FeeCollector uses **TWAP (Time-Weighted Average Price)** oracles to validate swap prices. This prevents attackers from manipulating prices during fee collection.

### How much are LP fees?

LPs earn the full swap fee for their tier (0.05%, 0.30%, or 1.00%). There's no protocol cut from LP fees - protocol fees are collected separately from pools.

## Technical

### What network is JuiceSwap on?

JuiceSwap is deployed on **Citrea Testnet** (Chain ID: 5115), Bitcoin's first ZK rollup.

### What wallet do I need?

Any EVM-compatible wallet works (MetaMask, Rainbow, etc.). Make sure to add Citrea Testnet to your wallet.

### Are the contracts upgradeable?

No. JuiceSwap contracts are **immutable** - no admin keys, no proxy upgrades. Changes can only be made through governance proposals.

### How fast are transactions?

Citrea has ~2 second block times, so transactions confirm quickly. Finality inherits from Bitcoin's security through ZK proofs.

## Cypherpunk Philosophy

### Is JuiceSwap truly decentralized?

Yes. JuiceSwap embodies cypherpunk principles:

- **No admin keys** - Nobody can unilaterally change the protocol
- **Veto-based governance** - Proposals pass unless blocked
- **Immutable contracts** - Code cannot be changed
- **Permissionless** - Anyone can trade, provide liquidity, or propose

### What's the connection to Bitcoin?

JuiceSwap runs on Citrea, a ZK rollup that settles on Bitcoin. This means:

- Security backed by Bitcoin
- Bitcoin-native assets (cBTC)
- Part of the broader Bitcoin DeFi ecosystem

### Why veto-based governance?

Traditional governance (majority voting) can lead to:

- Plutocracy (rich control everything)
- Low participation (voter apathy)
- Slow response (need quorum)

Veto-based governance:

- Proposals pass by default (faster)
- Minority protection (2% can block)
- Encourages consensus-building

## Troubleshooting

### My transaction failed. Why?

Common reasons:

| Error | Solution |
|-------|----------|
| `InsufficientOutput` | Increase slippage tolerance |
| `DeadlineExpired` | Transaction was pending too long |
| `InvalidAmount` | Check input amount (can't be 0) |
| `NotNFTOwner` | You don't own that LP position |

### Why did I receive less than expected?

Possible reasons:

1. **Slippage** - Price moved during transaction
2. **Price impact** - Large trade relative to liquidity
3. **Multi-hop routing** - Each hop has some slippage

### My LP position shows 0 liquidity. What happened?

If price moved outside your position's range:

- Your position still exists
- It's not earning fees (out of range)
- You can withdraw or wait for price to return

## Resources

- **App**: [app.juiceswap.xyz](https://app.juiceswap.xyz)
- **GitHub**: [github.com/JuiceSwapxyz](https://github.com/JuiceSwapxyz)
- **JuiceDollar Docs**: [docs.juicedollar.com](https://docs.juicedollar.com)
- **Citrea**: [citrea.xyz](https://citrea.xyz)
