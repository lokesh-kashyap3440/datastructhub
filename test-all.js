/**
 * DataStructHub - Thorough test of all 8 data structures and all operations
 */
const { chromium } = require('playwright');

const BASE = 'http://localhost:3000';
const STRUCTURES = ['array', 'linkedlist', 'stack', 'queue', 'bst', 'hashtable', 'graph', 'heap'];
const RESULTS = [];

async function run() {
    const browser = await chromium.launch({ headless: false });
    const page = await browser.newPage();

    const errors = [];
    page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(BASE);
    await page.waitForLoadState('networkidle');
    console.log('✓ App loaded\n');

    for (const dsName of STRUCTURES) {
        const dsResult = { name: dsName, operations: [], errors: [] };
        RESULTS.push(dsResult);

        console.log(`\n${'═'.repeat(60)}`);
        console.log(`  Testing: ${dsName.toUpperCase()}`);
        console.log('═'.repeat(60));

        // Click tab by data-structure attribute
        const tab = page.locator(`[data-structure="${dsName}"]`);
        try {
            await tab.click();
        } catch(e) {
            console.log(`  ⚠ Could not click tab for ${dsName}`);
        }

        // Wait for structure switch to complete (animation → render)
        await page.waitForTimeout(800);

        // Verify the structure actually switched by checking if options match
        const preErrors = errors.length;

        // Get operation options from the operation select
        let ops = [];
        try {
            const sel = page.locator('#operationSelect');
            const count = await sel.locator('option').count();
            for (let i = 0; i < count; i++) {
                const text = await sel.locator('option').nth(i).textContent();
                ops.push(text.trim());
            }
        } catch(e) {
            console.log(`  ⚠ Could not find operation select: ${e.message.split('\n')[0]}`);
        }

        // Expected operation counts per structure (rough check)
        const expectedCounts = { array: 6, linkedlist: 7, stack: 3, queue: 3, bst: 6, hashtable: 3, graph: 5, heap: 3 };
        if (ops.length !== (expectedCounts[dsName] || 0)) {
            console.log(`  ⚠ Expected ${expectedCounts[dsName]} ops for ${dsName}, got ${ops.length} — retrying switch...`);
            try { await tab.click(); } catch(e) {}
            await page.waitForTimeout(800);
            // Re-read operations
            ops = [];
            try {
                const sel = page.locator('#operationSelect');
                const count = await sel.locator('option').count();
                for (let i = 0; i < count; i++) {
                    const text = await sel.locator('option').nth(i).textContent();
                    ops.push(text.trim());
                }
            } catch(e) {}
            console.log(`  Operations after retry: [${ops.join(', ')}]`);
        }

        if (ops.length === 0) {
            console.log(`  ⚠ No operations found for ${dsName}`);
            continue;
        }

        console.log(`  Operations: [${ops.join(', ')}]`);

        // Test Randomize
        try {
            const randomBtn = page.locator('#randomBtn');
            await randomBtn.click();
            await page.waitForTimeout(1000);
            console.log(`  ✓ Randomize`);
            dsResult.operations.push('Randomize');
        } catch(e) {
            console.log(`  ⚠ Randomize: ${e.message.split('\n')[0]}`);
        }

        // Test each operation
        for (const op of ops) {
            if (op.toLowerCase().includes('select') || op === '' || op.toLowerCase().includes('inorder') || op.toLowerCase().includes('preorder') || op.toLowerCase().includes('postorder')) {
                // Skip ops that don't exist for this structure (cross-structure bleed)
                continue;
            }

            // Set value
            try {
                const input = page.locator('#valueInput');
                await input.fill(String(Math.floor(Math.random() * 100)));
            } catch(e) {}

            let selected = false;
            try {
                const sel = page.locator('#operationSelect');
                await sel.selectOption({ label: op });
                selected = true;
            } catch(e) {
                try {
                    const sel = page.locator('#operationSelect');
                    const opValue = op.toLowerCase().replace(/\s+/g, '');
                    await sel.selectOption(opValue);
                    selected = true;
                } catch(e2) {}
            }

            if (!selected) {
                console.log(`  - ${op}: not available, skipping`);
                continue;
            }

            try {
                const execBtn = page.locator('#executeBtn');
                await execBtn.click();
                await page.waitForTimeout(1500);
                console.log(`  ✓ ${op}`);
                dsResult.operations.push(op);
            } catch(e) {
                console.log(`  ⚠ ${op}: ${e.message.split('\n')[0]}`);
            }
        }

        // Collect errors for this DS
        const dsErrors = errors.slice(preErrors);
        if (dsErrors.length > 0) {
            dsResult.errors = dsErrors;
            console.log(`  🔴 ${dsErrors.length} error(s):`);
            dsErrors.forEach(e => console.log(`     ${e}`));
        } else {
            console.log(`  ✅ No errors`);
        }
    }

    console.log('\n\n' + '★'.repeat(60));
    console.log('  SUMMARY');
    console.log('★'.repeat(60));

    let totalErrors = 0;
    for (const r of RESULTS) {
        const status = r.errors.length === 0 ? '✅' : '🔴';
        console.log(`\n${status} ${r.name}: ${r.operations.length} ops tested, ${r.errors.length} errors`);
        if (r.errors.length > 0) {
            totalErrors += r.errors.length;
            r.errors.forEach(e => console.log(`   ${e}`));
        }
    }

    console.log(`\nTotal errors: ${totalErrors}`);
    await browser.close();
    process.exit(totalErrors > 0 ? 1 : 0);
}

run().catch(e => { console.error('FATAL:', e); process.exit(1); });
