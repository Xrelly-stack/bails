import { AntiBan, wrapSocket, RateLimiter } from './lib/Utils/antiban.js';

console.log('Testing AntiBan module import...');
console.log('AntiBan:', typeof AntiBan);
console.log('wrapSocket:', typeof wrapSocket);
console.log('RateLimiter:', typeof RateLimiter);

if (typeof AntiBan === 'function' && typeof wrapSocket === 'function' && typeof RateLimiter === 'function') {
    console.log('SUCCESS: AntiBan module loaded successfully without errors!');
} else {
    console.error('ERROR: Some AntiBan exports are missing or not a function.');
    process.exit(1);
}
