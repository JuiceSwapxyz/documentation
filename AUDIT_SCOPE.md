# JuiceSwap Ecosystem - Audit Scope Document

## Repository References

The audit covers smart contracts deployed on **Citrea Testnet (Chain ID: 5115)** from the following repository states:

### 1. JuiceDollar Protocol
- **Repository**: https://github.com/JuiceDollar/smartContracts
- **Branch**: https://github.com/JuiceDollar/smartContracts/tree/main
- **Last Commit**: https://github.com/JuiceDollar/smartContracts/commit/eb89778bfcf8555560a407fd8a428adf0915b8b7
- **dEURO Baseline Commit**: https://github.com/JuiceDollar/smartContracts/commit/5b41929fc9924e843b65c1f3cff383c85a75646b
- **dEURO Baseline Audit Report**: https://reports.chainsecurity.com/DEURO/ChainSecurity_DEURO_DEURO_Audit.pdf
- **Audit Scope**: Modifications in the `/contracts` folder from [dEURO baseline](https://github.com/JuiceDollar/smartContracts/tree/5b41929fc9924e843b65c1f3cff383c85a75646b/contracts) to [last commit](https://github.com/JuiceDollar/smartContracts/tree/eb89778bfcf8555560a407fd8a428adf0915b8b7/contracts) on main branch as referenced above. **Excludes test files** (`contracts/test/`).
- **Audit Scope Git Diff**: https://github.com/JuiceDollar/smartContracts/compare/5b41929fc9924e843b65c1f3cff383c85a75646b...eb89778bfcf8555560a407fd8a428adf0915b8b7
- **Documents**: 20 production Solidity files (excludes 8 test files + 1 deleted file)
- **Lines of Code**: 3,596 total lines in modified production files (1,071 lines changed: +754/-317)

### 2. JuiceSwap V3 Core
- **Repository**: https://github.com/JuiceSwapxyz/v3-core
- **Branch**: https://github.com/JuiceSwapxyz/v3-core/tree/main
- **Last Commit**: https://github.com/JuiceSwapxyz/v3-core/commit/9384149d062cab307626109d9b47feb11e36a895
- **Uniswap V3 Core Baseline Commit**: https://github.com/JuiceSwapxyz/v3-core/commit/d8b1c635c275d2a9450bd6a78f3fa2484fef73eb
- **Uniswap V3 Core Audit Reports**: https://github.com/Uniswap/v3-core/tree/main/audits
- **Audit Scope**: Modifications in the `/contracts` folder from [Uniswap V3 Core baseline](https://github.com/JuiceSwapxyz/v3-core/tree/d8b1c635c275d2a9450bd6a78f3fa2484fef73eb/contracts) to [last commit](https://github.com/JuiceSwapxyz/v3-core/tree/9384149d062cab307626109d9b47feb11e36a895/contracts) on main branch as referenced above.
- **Audit Scope Git Diff**: https://github.com/JuiceSwapxyz/v3-core/compare/d8b1c635c275d2a9450bd6a78f3fa2484fef73eb...9384149d062cab307626109d9b47feb11e36a895
- **Documents**: 1 modified Solidity file
- **Lines of Code**: 870 total lines in modified production files (5 lines changed: +3/-2)

### 3. JuiceSwap V3 Periphery
- **Repository**: https://github.com/JuiceSwapxyz/v3-periphery
- **Branch**: https://github.com/JuiceSwapxyz/v3-periphery/tree/main
- **Last Commit**: https://github.com/JuiceSwapxyz/v3-periphery/commit/9e980ad7ac7915659bedb0e1a28aa866fa9e5cc9
- **Uniswap V3 Periphery Baseline Commit**: https://github.com/JuiceSwapxyz/v3-periphery/commit/0682387198a24c7cd63566a2c58398533860a5d1
- **Uniswap V3 Periphery Audit Reports**: https://github.com/Uniswap/v3-periphery/tree/main/audits
- **Audit Scope**: Modifications in the `/contracts` folder from [Uniswap V3 Periphery baseline](https://github.com/JuiceSwapxyz/v3-periphery/tree/0682387198a24c7cd63566a2c58398533860a5d1/contracts) to [last commit](https://github.com/JuiceSwapxyz/v3-periphery/tree/9e980ad7ac7915659bedb0e1a28aa866fa9e5cc9/contracts) on main branch as referenced above. **Excludes test files** (`contracts/test/`).
- **Audit Scope Git Diff**: https://github.com/JuiceSwapxyz/v3-periphery/compare/0682387198a24c7cd63566a2c58398533860a5d1...9e980ad7ac7915659bedb0e1a28aa866fa9e5cc9
- **Documents**: 21 production Solidity files (excludes 4 test files)
- **Lines of Code**: 3,355 total lines in modified production files (105 lines changed: +53/-52)

### 4. JuiceSwap Swap Router
- **Repository**: https://github.com/JuiceSwapxyz/swap-router-contracts
- **Branch**: https://github.com/JuiceSwapxyz/swap-router-contracts/tree/main
- **Last Commit**: https://github.com/JuiceSwapxyz/swap-router-contracts/commit/5a6d00db463b43b8cf9fc884b8b8b04b78ec61b8
- **Uniswap Swap Router Baseline Commit**: https://github.com/JuiceSwapxyz/swap-router-contracts/commit/70bc2e40dfca294c1cea9bf67a4036732ee54303
- **Audit Scope**: Modifications in the `/contracts` folder from [Uniswap Swap Router baseline](https://github.com/JuiceSwapxyz/swap-router-contracts/tree/70bc2e40dfca294c1cea9bf67a4036732ee54303/contracts) to [last commit](https://github.com/JuiceSwapxyz/swap-router-contracts/tree/5a6d00db463b43b8cf9fc884b8b8b04b78ec61b8/contracts) on main branch as referenced above. **Excludes test files** (`contracts/test/`).
- **Audit Scope Git Diff**: https://github.com/JuiceSwapxyz/swap-router-contracts/compare/70bc2e40dfca294c1cea9bf67a4036732ee54303...5a6d00db463b43b8cf9fc884b8b8b04b78ec61b8
- **Documents**: 20 production Solidity files (excludes 3 test files)
- **Lines of Code**: 1,950 total lines in modified production files (110 lines changed: +55/-55)

 ### 5. JuiceSwap Smart Contracts (Governance)
  - **Repository**: https://github.com/JuiceSwapxyz/smart-contracts
  - **Branch**: https://github.com/JuiceSwapxyz/smart-contracts/tree/main
  - **Last Commit**: https://github.com/JuiceSwapxyz/smart-contracts/commit/de0cdb3b22b114b646a0ae2270c079910ff84b14
  - **Uniswap V3 Core Baseline**: https://github.com/Uniswap/v3-core/commit/ed88be38ab2032d82bf10ac6f8d03aa631889d48
  - **Uniswap V3 Periphery Baseline**: https://github.com/Uniswap/v3-periphery/commit/697c2474757ea89fec12a4e6db16a574fe259610
  - **Uniswap V3 Core Audit Reports**: https://github.com/Uniswap/v3-core/tree/main/audits
  - **Uniswap V3 Periphery Audit Reports**: https://github.com/Uniswap/v3-periphery/tree/main/audits
  - **Audit Scope**: All contracts in [`/contracts/governance`](https://github.com/JuiceSwapxyz/smart-contracts/tree/de0cdb3b22b114b646a0ae2270c079910ff84b14/contracts/governance) folder, including custom JuiceSwap governance contracts (IEquity, JuiceSwapFeeCollector, JuiceSwapGovernor) and modifications to Uniswap V3 libraries and interfaces (see baseline references above).
  - **Documents**: 10 production Solidity files (3 original JuiceSwap contracts, 7 Uniswap library/interface adaptations)
  - **Lines of Code**: 1,303 total lines in production files (608 lines original JuiceSwap contracts, 695 lines from Uniswap sources with 237 lines modified: +111/-126)