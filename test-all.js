import { chromium } from 'playwright'

const BASE = 'http://localhost:3000'
const STRUCTURES = ['array', 'linkedlist', 'stack', 'queue', 'bst', 'hashtable', 'graph', 'heap']
const RESULTS = []

async function run() {
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()

  const errors = []
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()) })
  page.on('pageerror', err => errors.push(err.message))

  await page.goto(BASE, { waitUntil: 'networkidle' })
  console.log('\u2713 App loaded\n')

  for (const dsName of STRUCTURES) {
    const dsResult = { name: dsName, operations: [], errors: [] }
    RESULTS.push(dsResult)

    console.log(`\n${'\u2550'.repeat(60)}`)
    console.log(`  Testing: ${dsName.toUpperCase()}`)
    console.log('\u2550'.repeat(60))

    const tab = page.locator(`[data-structure="${dsName}"]`)
    try { await tab.click() } catch (e) { console.log(`  \u26A0 Could not click tab for ${dsName}`) }
    await page.waitForTimeout(800)

    const preErrors = errors.length

    let ops = []
    try {
      const sel = page.locator('#operationSelect')
      const count = await sel.locator('option').count()
      for (let i = 0; i < count; i++) ops.push((await sel.locator('option').nth(i).textContent()).trim())
    } catch (e) { console.log(`  \u26A0 Could not read options: ${e.message.split('\n')[0]}`) }

    const expectedCounts = { array: 6, linkedlist: 7, stack: 3, queue: 3, bst: 6, hashtable: 3, graph: 5, heap: 3 }
    if (ops.length !== (expectedCounts[dsName] || 0)) {
      console.log(`  \u26A0 Expected ${expectedCounts[dsName]} ops, got ${ops.length}. Retrying...`)
      try { await tab.click() } catch (e) {}
      await page.waitForTimeout(800)
      ops = []
      try {
        const sel = page.locator('#operationSelect')
        const count = await sel.locator('option').count()
        for (let i = 0; i < count; i++) ops.push((await sel.locator('option').nth(i).textContent()).trim())
      } catch (e) {}
      console.log(`  Operations after retry: [${ops.join(', ')}]`)
    }

    if (ops.length === 0) { console.log(`  \u26A0 No operations for ${dsName}`); continue }
    console.log(`  Operations: [${ops.join(', ')}]`)

    try { await page.locator('#randomBtn').click(); await page.waitForTimeout(1000); console.log('  \u2713 Randomize'); dsResult.operations.push('Randomize') }
    catch (e) { console.log(`  \u26A0 Randomize error: ${e.message.split('\n')[0]}`) }

    for (const op of ops) {
      if (op.toLowerCase().includes('select') || op === '' || op.toLowerCase().includes('inorder') || op.toLowerCase().includes('preorder') || op.toLowerCase().includes('postorder')) continue

      try { await page.locator('#valueInput').fill(String(Math.floor(Math.random() * 100))) } catch (e) {}

      let selected = false
      try { await page.locator('#operationSelect').selectOption({ label: op }); selected = true }
      catch (e) {
        try { await page.locator('#operationSelect').selectOption(op.toLowerCase().replace(/\s+/g, '')); selected = true }
        catch (e2) {}
      }
      if (!selected) { console.log(`  - ${op}: skipping`); continue }

      try { await page.locator('#executeBtn').click(); await page.waitForTimeout(1500); console.log(`  \u2713 ${op}`); dsResult.operations.push(op) }
      catch (e) { console.log(`  \u26A0 ${op}: ${e.message.split('\n')[0]}`) }
    }

    const dsErrors = errors.slice(preErrors)
    if (dsErrors.length > 0) { dsResult.errors = dsErrors; console.log(`  \uD83D\uDD34 ${dsErrors.length} error(s):`); dsErrors.forEach(e => console.log(`     ${e}`)) }
    else { console.log('  \u2705 No errors') }
  }

  console.log(`\n\n${'\u2605'.repeat(60)}\n  SUMMARY\n${'\u2605'.repeat(60)}`)
  let totalErrors = 0
  for (const r of RESULTS) {
    const status = r.errors.length === 0 ? '\u2705' : '\uD83D\uDD34'
    console.log(`\n${status} ${r.name}: ${r.operations.length} ops tested, ${r.errors.length} errors`)
    if (r.errors.length > 0) { totalErrors += r.errors.length; r.errors.forEach(e => console.log(`   ${e}`)) }
  }
  console.log(`\nTotal errors: ${totalErrors}`)
  await browser.close()
  process.exit(totalErrors > 0 ? 1 : 0)
}

run().catch(e => { console.error('FATAL:', e); process.exit(1) })
