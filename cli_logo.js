#!/usr/bin/env node

const TEAL  = '\x1b[36m'
const BLUE  = '\x1b[34m'
const BOLD  = '\x1b[1m'
const RESET = '\x1b[0m'
const WHITE = '\x1b[97m'
const DIM   = '\x1b[2m'
const RED   = '\x1b[31m'

function printLogo() {
  console.clear()
  console.log('')
  console.log(`${TEAL}${BOLD}  ╔══════════════════════════════════════════╗${RESET}`)
  console.log(`${TEAL}${BOLD}  ║                                          ║${RESET}`)
  console.log(`${TEAL}${BOLD}  ║   ${RED}✓${TEAL}  ${WHITE}${BOLD}CheckRezerve${RESET}${TEAL}${BOLD}                       ║${RESET}`)
  console.log(`${TEAL}${BOLD}  ║   ${WHITE}Rezervasyon Yönetim Sistemi${TEAL}           ║${RESET}`)
  console.log(`${TEAL}${BOLD}  ║                                          ║${RESET}`)
  console.log(`${TEAL}${BOLD}  ╚══════════════════════════════════════════╝${RESET}`)
  console.log('')
  console.log(`${DIM}  v1.0.0  |  checkrezerve.com  |  © 2026${RESET}`)
  console.log('')
}

printLogo()
