#!/usr/bin/env node

import { startServer } from "./server"

startServer().catch((err) => {
  console.error("TAC Agent failed to start:")
  console.error(err?.message || err)
  process.exit(1)
})
