#!/usr/bin/env node

/**
 * Generate Addresses Script
 *
 * This script updates contract addresses in documentation files
 * using the canonical addresses from @juicedollar/jusd and @juiceswapxyz/sdk-core packages.
 *
 * Run: npm run generate-addresses
 */

const fs = require('fs')
const path = require('path')

// Chain ID for Citrea Testnet
const CHAIN_ID = 5115

// Load addresses from packages
let jusdAddresses, juiceswapAddresses

try {
  const { ADDRESS } = require('@juicedollar/jusd')
  jusdAddresses = ADDRESS[CHAIN_ID]
  if (!jusdAddresses) {
    throw new Error(`No addresses found for chain ID ${CHAIN_ID} in @juicedollar/jusd`)
  }
} catch (err) {
  console.error('Failed to load @juicedollar/jusd:', err.message)
  console.error('Run: npm install')
  process.exit(1)
}

try {
  const { CHAIN_TO_ADDRESSES_MAP, ChainId } = require('@juiceswapxyz/sdk-core')
  juiceswapAddresses = CHAIN_TO_ADDRESSES_MAP[ChainId.CITREA_TESTNET]
  if (!juiceswapAddresses) {
    throw new Error('No addresses found for CITREA_TESTNET in @juiceswapxyz/sdk-core')
  }
} catch (err) {
  console.error('Failed to load @juiceswapxyz/sdk-core:', err.message)
  console.error('Run: npm install')
  process.exit(1)
}

// Combined address map with display names
const ADDRESSES = {
  // JuiceDollar tokens
  JUSD: jusdAddresses.juiceDollar,
  JUICE: jusdAddresses.equity,
  SV_JUSD: jusdAddresses.savingsVaultJUSD,
  WCBTC: jusdAddresses.wcbtc || '0x8d0c9d1c17aE5e40ffF9bE350f57840E9E66Cd93', // fallback if not in package

  // JuiceSwap contracts
  GATEWAY: juiceswapAddresses.juiceSwapGatewayAddress,
  GOVERNOR: juiceswapAddresses.juiceSwapGovernorAddress,
  FEE_COLLECTOR: juiceswapAddresses.juiceSwapFeeCollectorAddress,
  FACTORY: juiceswapAddresses.v3CoreFactoryAddress,
  SWAP_ROUTER: juiceswapAddresses.swapRouter02Address,
  POSITION_MANAGER: juiceswapAddresses.nonfungiblePositionManagerAddress,
}

console.log('Loaded addresses:')
console.log(JSON.stringify(ADDRESSES, null, 2))

// Files to update
const SRC_DIR = path.join(__dirname, '..', 'src')
const FILES_TO_UPDATE = ['smart-contracts.md', 'governance.md', 'overview.md', 'liquidity.md', 'swap.md', 'imprint.md']

// Known old/incorrect addresses to replace
const ADDRESS_REPLACEMENTS = [
  // JuiceDollar tokens
  {
    old: '0xFdB0a83d94CD65151148a131167Eb499Cb85d015',
    new: ADDRESSES.JUSD,
    name: 'JUSD',
  },
  {
    old: '0x7b2A560bf72B0Dd2EAbE3271F829C2597c8420d5',
    new: ADDRESSES.JUICE,
    name: 'JUICE',
  },
  {
    old: '0x9580498224551E3f2e3A04330a684BF025111C53',
    new: ADDRESSES.SV_JUSD,
    name: 'svJUSD',
  },

  // JuiceSwap contracts
  {
    old: '0x3b59BCd4eFe392d715f4c57fA4218BFCAD5FB153',
    new: ADDRESSES.GATEWAY,
    name: 'JuiceSwapGateway',
  },
  {
    old: '0x205903c54C56bCED8C97f2DC250BA53d715174e9',
    new: ADDRESSES.GOVERNOR,
    name: 'JuiceSwapGovernor',
  },
  {
    old: '0xc3d817C394d55aB57f5bF0Fc5C6878ccE033E32a',
    new: ADDRESSES.FEE_COLLECTOR,
    name: 'JuiceSwapFeeCollector',
  },
  {
    old: '0x9136D17Ec096AAd031D442a796cd5984128cF0b2',
    new: ADDRESSES.FACTORY,
    name: 'UniswapV3Factory',
  },
  {
    old: '0x2d11a82633adD5b8742311fDa0E751264d093E7f',
    new: ADDRESSES.SWAP_ROUTER,
    name: 'SwapRouter',
  },
  {
    old: '0x56D63E0F763b29F62bb7242420d028F86e9402E1',
    new: ADDRESSES.POSITION_MANAGER,
    name: 'NonfungiblePositionManager',
  },
]

// Process each file
let totalReplacements = 0

for (const filename of FILES_TO_UPDATE) {
  const filepath = path.join(SRC_DIR, filename)

  if (!fs.existsSync(filepath)) {
    console.warn(`Warning: ${filename} not found, skipping`)
    continue
  }

  let content = fs.readFileSync(filepath, 'utf8')
  let fileReplacements = 0

  for (const replacement of ADDRESS_REPLACEMENTS) {
    if (replacement.old.toLowerCase() === replacement.new.toLowerCase()) {
      continue // Skip if addresses are the same
    }

    // Case-insensitive replacement
    const regex = new RegExp(replacement.old, 'gi')
    const matches = content.match(regex)

    if (matches) {
      content = content.replace(regex, replacement.new)
      fileReplacements += matches.length
      console.log(`  ${filename}: Replaced ${matches.length}x ${replacement.name} address`)
    }
  }

  if (fileReplacements > 0) {
    fs.writeFileSync(filepath, content)
    totalReplacements += fileReplacements
    console.log(`Updated ${filename} with ${fileReplacements} replacements`)
  } else {
    console.log(`${filename}: No replacements needed`)
  }
}

console.log(`\nTotal: ${totalReplacements} address replacements`)

// Write addresses to JSON file for reference
const addressesJsonPath = path.join(SRC_DIR, '.vuepress', 'addresses.json')
const addressesDir = path.dirname(addressesJsonPath)

if (!fs.existsSync(addressesDir)) {
  fs.mkdirSync(addressesDir, { recursive: true })
}

fs.writeFileSync(
  addressesJsonPath,
  JSON.stringify(
    {
      chainId: CHAIN_ID,
      network: 'Citrea Testnet',
      generatedAt: new Date().toISOString(),
      juiceDollar: {
        jusd: ADDRESSES.JUSD,
        juice: ADDRESSES.JUICE,
        svJusd: ADDRESSES.SV_JUSD,
        wcbtc: ADDRESSES.WCBTC,
      },
      juiceSwap: {
        gateway: ADDRESSES.GATEWAY,
        governor: ADDRESSES.GOVERNOR,
        feeCollector: ADDRESSES.FEE_COLLECTOR,
        factory: ADDRESSES.FACTORY,
        swapRouter: ADDRESSES.SWAP_ROUTER,
        positionManager: ADDRESSES.POSITION_MANAGER,
      },
    },
    null,
    2
  )
)

console.log(`\nAddresses written to ${addressesJsonPath}`)
