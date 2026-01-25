#!/usr/bin/env node

/**
 * Sync Addresses Script
 *
 * Synchronizes contract addresses in documentation with canonical addresses
 * from @juicedollar/jusd and @juiceswapxyz/sdk-core packages.
 *
 * Uses context-based replacement:
 * - Tracks current markdown section (headings)
 * - Replaces addresses based on section context or inline contract names
 *
 * Designed to run in GitHub Actions for continuous synchronization.
 */

const fs = require('fs')
const path = require('path')

// Chain ID for Citrea Testnet
const CHAIN_ID = 5115

// Ethereum address regex (full addresses)
const ETH_ADDRESS_REGEX = /0x[a-fA-F0-9]{40}/g

// Truncated address regex (e.g., 0x3b59...5153)
const TRUNCATED_ADDRESS_REGEX = /0x([a-fA-F0-9]{4})\.\.\.([a-fA-F0-9]{4})/g

// Helper to create truncated address from full address
function truncateAddress(addr) {
  return `0x${addr.slice(2, 6)}...${addr.slice(-4)}`
}

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

// Contract definitions with patterns for both inline and section-based matching
const CONTRACTS = [
  // JuiceDollar tokens
  {
    name: 'JUSD',
    address: jusdAddresses.juiceDollar,
    // Matches: "JUSD", "| JUSD |", but not "svJUSD"
    inlinePattern: /(?<![sv])\bJUSD\b(?!\s*\(Savings)/i,
    // Section heading patterns
    sectionPattern: /^#{1,4}\s*JUSD(?:\s|$)/i,
  },
  {
    name: 'JUICE',
    address: jusdAddresses.equity,
    // Matches: "JUICE", "JUICE (Equity)"
    inlinePattern: /\bJUICE\b(?:\s*\(Equity\))?/i,
    sectionPattern: /^#{1,4}\s*JUICE\b/i,
  },
  {
    name: 'svJUSD',
    address: jusdAddresses.savingsVaultJUSD,
    inlinePattern: /\bsvJUSD\b|SavingsVault(?:JUSD)?/i,
    sectionPattern: /^#{1,4}\s*(?:svJUSD|SavingsVault)/i,
  },
  {
    name: 'WcBTC',
    address: jusdAddresses.wcbtc, // May be undefined - will be skipped if not in package
    inlinePattern: /\bWcBTC\b|\bwcbtc\b/i,
    sectionPattern: /^#{1,4}\s*WcBTC/i,
  },

  // JuiceSwap contracts
  {
    name: 'JuiceSwapGateway',
    address: juiceswapAddresses.juiceSwapGatewayAddress,
    inlinePattern: /JuiceSwapGateway/i,
    sectionPattern: /^#{1,4}\s*JuiceSwapGateway/i,
  },
  {
    name: 'JuiceSwapGovernor',
    address: juiceswapAddresses.juiceSwapGovernorAddress,
    inlinePattern: /JuiceSwapGovernor/i,
    sectionPattern: /^#{1,4}\s*JuiceSwapGovernor/i,
  },
  {
    name: 'JuiceSwapFeeCollector',
    address: juiceswapAddresses.juiceSwapFeeCollectorAddress,
    inlinePattern: /JuiceSwapFeeCollector/i,
    sectionPattern: /^#{1,4}\s*JuiceSwapFeeCollector/i,
  },
  {
    name: 'UniswapV3Factory',
    address: juiceswapAddresses.v3CoreFactoryAddress,
    inlinePattern: /UniswapV3Factory|V3CoreFactory/i,
    sectionPattern: /^#{1,4}\s*(?:UniswapV3Factory|V3CoreFactory)/i,
  },
  {
    name: 'SwapRouter',
    address: juiceswapAddresses.swapRouter02Address,
    inlinePattern: /SwapRouter(?:02)?(?!\s*Address)/i,
    sectionPattern: /^#{1,4}\s*SwapRouter/i,
  },
  {
    name: 'NonfungiblePositionManager',
    address: juiceswapAddresses.nonfungiblePositionManagerAddress,
    inlinePattern: /NonfungiblePositionManager|PositionManager/i,
    sectionPattern: /^#{1,4}\s*(?:NonfungiblePositionManager|PositionManager)/i,
  },
]

console.log('Loaded canonical addresses:')
CONTRACTS.forEach(c => {
  console.log(`  ${c.name}: ${c.address}`)
})

// Files to update
const SRC_DIR = path.join(__dirname, '..', 'src')
const MD_FILES = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.md'))

// Process each file
let totalReplacements = 0
const changes = []

for (const filename of MD_FILES) {
  const filepath = path.join(SRC_DIR, filename)
  const content = fs.readFileSync(filepath, 'utf8')
  const lines = content.split('\n')
  let fileReplacements = 0
  let modified = false

  // Track current section for context-based replacement
  let currentSection = null

  const newLines = lines.map((line, lineNum) => {
    // Check if this is a heading that defines a section
    for (const contract of CONTRACTS) {
      if (contract.sectionPattern && contract.sectionPattern.test(line)) {
        currentSection = contract
        return line // Don't modify heading lines
      }
    }

    // Check for inline contract name matches first
    let matchedContract = null
    for (const contract of CONTRACTS) {
      if (contract.inlinePattern && contract.inlinePattern.test(line)) {
        matchedContract = contract
        break
      }
    }

    // If in a section and line has "Address" property, use section context
    if (!matchedContract && currentSection && /\*\*Address\*\*/.test(line)) {
      matchedContract = currentSection
    }

    // Reset section on horizontal rule or new major heading
    if (/^---\s*$/.test(line) || /^#{1,2}\s/.test(line)) {
      currentSection = null
    }

    if (!matchedContract || !matchedContract.address) return line

    let newLine = line

    // Find and replace full addresses on this line
    const addresses = line.match(ETH_ADDRESS_REGEX)
    if (addresses) {
      for (const addr of addresses) {
        if (addr.toLowerCase() === matchedContract.address.toLowerCase()) continue

        newLine = newLine.replace(new RegExp(addr, 'gi'), matchedContract.address)
        fileReplacements++
        modified = true
        changes.push({
          file: filename,
          line: lineNum + 1,
          contract: matchedContract.name,
          old: addr,
          new: matchedContract.address,
        })
      }
    }

    // Find and replace truncated addresses (e.g., 0x3b59...5153)
    const expectedTruncated = truncateAddress(matchedContract.address)
    const truncatedMatches = newLine.match(TRUNCATED_ADDRESS_REGEX)
    if (truncatedMatches) {
      for (const truncAddr of truncatedMatches) {
        if (truncAddr.toLowerCase() === expectedTruncated.toLowerCase()) continue

        newLine = newLine.replace(truncAddr, expectedTruncated)
        fileReplacements++
        modified = true
        changes.push({
          file: filename,
          line: lineNum + 1,
          contract: matchedContract.name,
          old: truncAddr,
          new: expectedTruncated,
        })
      }
    }

    return newLine
  })

  if (modified) {
    fs.writeFileSync(filepath, newLines.join('\n'))
    console.log(`\nUpdated ${filename} with ${fileReplacements} replacements`)
    totalReplacements += fileReplacements
  }
}

// Summary
console.log(`\n${'='.repeat(60)}`)
console.log(`Total: ${totalReplacements} address replacements`)

if (changes.length > 0) {
  console.log('\nChanges made:')
  changes.forEach(c => {
    console.log(`  ${c.file}:${c.line} [${c.contract}]`)
    console.log(`    - ${c.old}`)
    console.log(`    + ${c.new}`)
  })
}
