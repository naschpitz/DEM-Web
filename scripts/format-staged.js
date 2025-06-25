#!/usr/bin/env node

/**
 * Format only staged files for git commits
 */

const { execSync } = require("child_process")

try {
  // Get staged files that can be formatted
  const stagedFiles = execSync("git diff --cached --name-only --diff-filter=ACM", {
    encoding: "utf8",
  })
    .trim()
    .split("\n")
    .filter(file => file.trim())
    .filter(file => /\.(js|jsx|ts|tsx|css|scss|json|html)$/.test(file))

  if (stagedFiles.length === 0) {
    console.log("No staged files to format.")
    process.exit(0)
  }

  console.log(`Formatting ${stagedFiles.length} staged files...`)

  // Format the files
  execSync(`npx prettier --write ${stagedFiles.map(f => `"${f}"`).join(" ")}`, {
    stdio: "inherit",
  })

  // Re-stage the formatted files
  execSync(`git add ${stagedFiles.map(f => `"${f}"`).join(" ")}`, {
    stdio: "inherit",
  })

  console.log("✅ Staged files formatted successfully!")
} catch (error) {
  console.error("❌ Error formatting staged files:", error.message)
  process.exit(1)
}
