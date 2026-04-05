#!/usr/bin/env bun
/**
 * Environment variables setup script for ROBOPO.
 * Creates @robopo/web/.env interactively.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path"
import { createInterface } from "node:readline"

const WEB_DIR = resolve(import.meta.dirname, "../@robopo/web")
const ENV_FILE = resolve(WEB_DIR, ".env")

interface EnvVar {
  key: string
  description: string
  defaultValue: string
  secret: boolean
}

const ENV_VARS: EnvVar[] = [
  {
    key: "BETTER_AUTH_URL",
    description: "Better Auth URL (authentication server URL)",
    defaultValue: "http://localhost:3000",
    secret: false,
  },
  {
    key: "BETTER_AUTH_SECRET",
    description: "Better Auth Secret (authentication secret key)",
    defaultValue: "",
    secret: true,
  },
  {
    key: "DATABASE_URL",
    description: "Neon Postgres connection string (database URL)",
    defaultValue: "",
    secret: true,
  },
]

function generateSecret(length = 32): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return Buffer.from(bytes).toString("base64")
}

function parseEnvFile(path: string): Map<string, string> {
  const map = new Map<string, string>()
  if (!existsSync(path)) {
    return map
  }
  for (const line of readFileSync(path, "utf-8").split("\n")) {
    const trimmed = line.trim()
    if (trimmed === "" || trimmed.startsWith("#")) {
      continue
    }
    const eqIndex = trimmed.indexOf("=")
    if (eqIndex === -1) {
      continue
    }
    map.set(trimmed.slice(0, eqIndex), trimmed.slice(eqIndex + 1))
  }
  return map
}

async function prompt(
  rl: ReturnType<typeof createInterface>,
  question: string,
): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve))
}

async function main() {
  console.log("\n🤖 ROBOPO Environment Variables Setup\n")

  const existing = parseEnvFile(ENV_FILE)
  if (existing.size > 0) {
    console.log(`ℹ️  Existing .env file detected: ${ENV_FILE}`)
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const result = new Map<string, string>()

  for (const envVar of ENV_VARS) {
    const current = existing.get(envVar.key)
    const displayDefault = current ?? envVar.defaultValue

    let hint = ""
    if (envVar.key === "BETTER_AUTH_SECRET" && !displayDefault) {
      hint = " (press Enter to auto-generate)"
    }

    const displayValue =
      envVar.secret && displayDefault
        ? `${displayDefault.slice(0, 8)}...`
        : displayDefault

    const answer = await prompt(
      rl,
      `${envVar.description}\n  ${envVar.key}${displayValue ? ` [${displayValue}]` : ""}${hint}: `,
    )

    let value = answer.trim() || displayDefault
    if (envVar.key === "BETTER_AUTH_SECRET" && !value) {
      value = generateSecret()
      console.log("  🔑 Secret key auto-generated")
    }

    result.set(envVar.key, value)
  }

  rl.close()

  const content = ENV_VARS.map((v) => `${v.key}=${result.get(v.key)}`).join(
    "\n",
  )
  writeFileSync(ENV_FILE, `${content}\n`)
  console.log(`\n✅ .env file created: ${ENV_FILE}\n`)
}

main().catch((err) => {
  console.error("❌ An error occurred:", err)
  process.exit(1)
})
