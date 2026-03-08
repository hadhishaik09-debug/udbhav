import { extractMedicineName } from './utils/extractMedicineName';

const testOcr = `
PARACETAMOL 500MG
Batch No 28H32
MFG JAN 2024
`;

const res = extractMedicineName(testOcr);
console.log('Extracted name:', res);

if (res === 'PARACETAMOL') {
    console.log('SUCCESS: Logic working correctly');
} else {
    console.log('FAILURE: Expected PARACETAMOL, got', res);
}
