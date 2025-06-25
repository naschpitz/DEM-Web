#!/usr/bin/env node

/**
 * Setup git hooks for automatic code formatting
 */

const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

const hookContent = `#!/bin/sh

# Pre-commit hook to automatically format staged files with Prettier
# This ensures all committed code follows consistent formatting

echo "🔍 Running Prettier on staged files..."

# Run the format:staged script
npm run format:staged

# Check if the formatting script succeeded
if [ $? -ne 0 ]; then
    echo "❌ Prettier formatting failed. Commit aborted."
    exit 1
fi

echo "✅ Code formatting complete. Proceeding with commit..."
`

function setupPreCommitHook() {
  const hookPath = ".git/hooks/pre-commit"

  try {
    // Check if .git directory exists
    if (!fs.existsSync(".git")) {
      console.log("❌ Not a git repository. Please run this from the project root.")
      process.exit(1)
    }

    // Create hooks directory if it doesn't exist
    if (!fs.existsSync(".git/hooks")) {
      fs.mkdirSync(".git/hooks", { recursive: true })
    }

    // Write the hook file
    fs.writeFileSync(hookPath, hookContent)

    // Make it executable
    execSync(`chmod +x ${hookPath}`)

    console.log("✅ Pre-commit hook installed successfully!")
    console.log("📝 The hook will automatically format staged files before each commit.")
    console.log("")
    console.log("💡 To test it, try:")
    console.log("   git add some-file.js")
    console.log('   git commit -m "test commit"')
  } catch (error) {
    console.error("❌ Error setting up git hook:", error.message)
    process.exit(1)
  }
}

function removePreCommitHook() {
  const hookPath = ".git/hooks/pre-commit"

  try {
    if (fs.existsSync(hookPath)) {
      fs.unlinkSync(hookPath)
      console.log("✅ Pre-commit hook removed successfully!")
    } else {
      console.log("ℹ️  No pre-commit hook found.")
    }
  } catch (error) {
    console.error("❌ Error removing git hook:", error.message)
    process.exit(1)
  }
}

function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  if (command === "remove" || command === "uninstall") {
    removePreCommitHook()
  } else {
    setupPreCommitHook()
  }
}

if (require.main === module) {
  main()
}
