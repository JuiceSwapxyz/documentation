# Governance

**JuiceSwap uses the same veto-based governance system as JuiceDollar, powered by JUICE token voting.**

## Governance Philosophy

JuiceSwap's governance embodies the cypherpunk principle of **"code as law"**:

- **No admin keys** - No privileged accounts can change protocol parameters
- **Veto-based** - Proposals pass by default unless actively blocked
- **Minority protection** - Only 2% voting power needed to veto
- **Time-weighted voting** - Long-term holders have more influence

This design maximizes permissionlessness while still allowing the community to protect against malicious proposals.

## How Governance Works

### The JuiceSwapGovernor

The `JuiceSwapGovernor` contract manages all governance actions for JuiceSwap:

1. **Anyone can propose** by paying 1,000 JUSD
2. **14-day minimum waiting period** for community review
3. **JUICE holders can veto** with 2% voting power
4. **If no veto**, anyone can execute the proposal

```
Propose → Wait 14 days → Execute (if no veto)
    ↑                         ↓
    └─── Veto (2% votes) ─────┘
```

## Creating Proposals

### Proposal Types

JuiceSwapGovernor can execute calls on any contract, enabling:

| Target | Example Actions |
|--------|-----------------|
| **Factory** | Enable new fee tiers |
| **FeeCollector** | Update TWAP parameters, change collector |
| **Pools** | Set protocol fee |
| **Any contract** | Custom governance actions |

### Making a Proposal

```solidity
function propose(
    address target,           // Contract to call
    bytes calldata data,      // Encoded function call
    uint256 applicationPeriod, // Veto period (≥14 days)
    string calldata description // Human-readable description
) external returns (uint256 proposalId)
```

### Example: Enable New Fee Tier

```javascript
const governor = new ethers.Contract(GOVERNOR_ADDRESS, governorAbi, signer);

// Approve 1000 JUSD fee
await jusd.approve(GOVERNOR_ADDRESS, ethers.parseEther("1000"));

// Encode the function call
const feeCollector = new ethers.Interface(feeCollectorAbi);
const callData = feeCollector.encodeFunctionData("enableFeeAmount", [
    100,    // 0.01% fee
    1       // tick spacing
]);

// Create proposal
const proposalId = await governor.propose(
    FEE_COLLECTOR_ADDRESS,
    callData,
    14 * 24 * 60 * 60,  // 14 days
    "Enable 0.01% fee tier for stable pairs"
);
```

### Proposal Fee

The **1,000 JUSD fee** is transferred directly to the JUICE Equity contract, increasing JUICE token value. This:

- Prevents spam proposals
- Ensures proposers have skin in the game
- Benefits all JUICE holders

## Voting Power

### How Votes Are Calculated

JuiceSwap uses the same voting mechanism as JuiceDollar:

```
votes = JUICE balance × holding duration
```

| Factor | Effect |
|--------|--------|
| **More JUICE** | More votes |
| **Longer holding** | More votes |
| **Recently received** | Zero votes initially |

### Checking Voting Power

```javascript
const governor = new ethers.Contract(GOVERNOR_ADDRESS, governorAbi, provider);

// Get your voting power (with delegates)
const votingPower = await governor.getVotingPower(myAddress, helpers);

// Get as percentage (basis points)
const percentage = await governor.getVotingPowerPercentage(myAddress, helpers);
// 200 = 2%, 1000 = 10%
```

### Vote Delegation

Small holders can combine voting power through delegation:

```javascript
// On the JUICE (Equity) contract
await juice.delegateVoteTo(delegateAddress);
```

When vetoing, include all addresses that delegated to you in the `helpers` array.

## Vetoing Proposals

### Requirements

To veto a proposal, you need:
- **2% of total voting power** (your votes + delegated votes)
- Veto before the application period ends

### Executing a Veto

```solidity
function veto(
    uint256 proposalId,
    address[] calldata helpers  // Addresses that delegated to you
) external
```

```javascript
// Helpers must be sorted ascending, no duplicates
const helpers = [
    "0x1111...",  // Alice delegated to me
    "0x2222...",  // Bob delegated to me
].sort();

await governor.veto(proposalId, helpers);
```

### Flash Loan Protection

The voting system is **immune to flash loan attacks**:

- Votes = balance × **holding duration**
- Flash-loaned tokens have **0 seconds** holding duration
- Therefore flash loans provide **0 votes**

## Executing Proposals

After the application period ends without a veto:

```javascript
// Anyone can execute
await governor.execute(proposalId);
```

The encoded function call is executed on the target contract.

## Proposal States

```solidity
enum ProposalState {
    NotFound,   // Proposal doesn't exist
    Pending,    // Still in application period
    Ready,      // Can be executed
    Vetoed,     // Was vetoed
    Executed    // Already executed
}
```

```javascript
const state = await governor.state(proposalId);
```

## Fee Collector Governance

The `JuiceSwapFeeCollector` has several governable parameters:

### Protection Parameters

```solidity
function setProtectionParams(
    uint32 _twapPeriod,      // TWAP period (min 5 minutes)
    uint256 _maxSlippageBps  // Max slippage (max 10%)
) external onlyOwner
```

| Parameter | Default | Range |
|-----------|---------|-------|
| TWAP Period | 30 minutes | 5 min - unlimited |
| Max Slippage | 2% (200 bps) | 0 - 10% |

### Authorized Collector

```solidity
function setCollector(address collector) external onlyOwner
```

Only the authorized collector can call `collectAndReinvestFees()`.

### Factory Control

```solidity
// Enable new fee tier
function enableFeeAmount(uint24 fee, int24 tickSpacing) external onlyOwner

// Transfer factory ownership (emergency)
function setFactoryOwner(address _owner) external onlyOwner
```

## Governance Events

```solidity
// Proposal lifecycle
event ProposalCreated(
    uint256 indexed proposalId,
    address indexed proposer,
    address indexed target,
    bytes data,
    uint256 executeAfter,
    string description
);

event ProposalExecuted(uint256 indexed proposalId, address indexed executor);
event ProposalVetoed(uint256 indexed proposalId, address indexed vetoer);
event ProposalFeeCollected(uint256 indexed proposalId, uint256 amount);
```

## Governance Constants

| Constant | Value | Description |
|----------|-------|-------------|
| `PROPOSAL_FEE` | 1,000 JUSD | Cost to create proposal |
| `MIN_APPLICATION_PERIOD` | 14 days | Minimum veto period |
| `QUORUM` | 2% | Voting power needed for veto |

## Best Practices

### For Proposers

1. **Discuss first** - Share your proposal in community forums
2. **Use longer periods** - Give time for review (21+ days recommended)
3. **Document clearly** - Explain what the proposal does and why
4. **Test thoroughly** - Verify the encoded call data

### For JUICE Holders

1. **Hold long-term** - Voting power increases over time
2. **Monitor proposals** - Watch for new governance activity
3. **Delegate wisely** - Choose delegates who share your values
4. **Veto responsibly** - Only block genuinely harmful proposals

## Integration with JuiceDollar

JuiceSwap governance uses the same JUICE token as JuiceDollar:

| Aspect | Shared |
|--------|--------|
| **Token** | JUICE (Equity) |
| **Voting mechanism** | Time-weighted |
| **Veto threshold** | 2% |
| **Delegation** | Same system |

This means:
- JUICE holders govern **both** JuiceDollar and JuiceSwap
- Voting power applies to both protocols
- A single delegate can veto proposals in either system

## Contract Addresses

### Mainnet (Chain ID: 4114)

| Contract | Address |
|----------|---------|
| JuiceSwapGovernor | [`0x51f3D5905C768CCA2D4904Ca7877614CeaD607ae`](https://citreascan.com/address/0x51f3D5905C768CCA2D4904Ca7877614CeaD607ae) |
| JuiceSwapFeeCollector | [`0xD2D68A452A6f5d9090153f52E64f23cc7fF8A97b`](https://citreascan.com/address/0xD2D68A452A6f5d9090153f52E64f23cc7fF8A97b) |
| JUICE (Equity) | [`0x2A36f2b204B46Fd82653cd06d00c7fF757C99ae4`](https://citreascan.com/address/0x2A36f2b204B46Fd82653cd06d00c7fF757C99ae4) |
| UniswapV3Factory | [`0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82`](https://citreascan.com/address/0xd809b1285aDd8eeaF1B1566Bf31B2B4C4Bba8e82) |

### Testnet (Chain ID: 5115)

| Contract | Address |
|----------|---------|
| JuiceSwapGovernor | [`0x8AFD7CB73Ce85b44996B86ec604c125af244A2B8`](https://testnet.citreascan.com/address/0x8AFD7CB73Ce85b44996B86ec604c125af244A2B8) |
| JuiceSwapFeeCollector | [`0xfac6303F78A2b316a20eD927Ba0f7a7d07AaC47E`](https://testnet.citreascan.com/address/0xfac6303F78A2b316a20eD927Ba0f7a7d07AaC47E) |
| JUICE (Equity) | [`0x7fa131991c8A7d8C21b11391C977Fc7c4c8e0D5E`](https://testnet.citreascan.com/address/0x7fa131991c8A7d8C21b11391C977Fc7c4c8e0D5E) |
| UniswapV3Factory | [`0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238`](https://testnet.citreascan.com/address/0xdd6Db52dB41CE2C03002bB1adFdCC8E91C594238) |
