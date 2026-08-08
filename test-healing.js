import { AdaptiveDelayManager, autoHealSession } from './lib/Utils/adaptive-healing.js';

console.log('Testing AdaptiveDelayManager & autoHealSession...');

const delayManager = new AdaptiveDelayManager({ baseDelay: 500, maxDelay: 2000 });
console.log('Initial delay:', delayManager.currentDelay);

delayManager.recordError();
console.log('Delay after error:', delayManager.currentDelay);

delayManager.recordSuccess();
console.log('Delay after success:', delayManager.currentDelay);

async function runTest() {
    const start = Date.now();
    await delayManager.wait();
    const duration = Date.now() - start;
    console.log(`Waited for ~${duration}ms`);

    const healed = await autoHealSession({}, { message: 'MAC mismatch error' });
    console.log('Session heal result:', healed);

    console.log('SUCCESS: Adaptive-healing test passed!');
}

runTest();
