const RipplesGridCompiler = require('./grid-compiler.js');

console.log("RIPPLES // GRID COMPILER TEST\n");

// 1. Initialize Compiler
const compiler = new RipplesGridCompiler(10, 6); // Small grid for visibility
console.log(`Initialized ${compiler.width}x${compiler.height} Grid.`);

// 2. Create Mock Entities
const entities = [
    { x: 2.5, y: 1.2, type: 'animate', name: 'ant', value: 4 },     // Should be 'N' with value '4' at (2,1)
    { x: 5.1, y: 3.8, type: 'inanimate', name: 'wall' },           // Should be 'H' at (5,3)
    { x: 8.9, y: 4.1, type: 'abstract', name: 'shadow' }           // Should be 'V' at (8,4)
];

console.log("\nInput Entities:");
entities.forEach(e => console.log(`- ${e.name} (${e.type}) at [${e.x}, ${e.y}] val:${e.value}`));

// 3. Compile
const orcaString = compiler.compile(entities);

// 4. Output
console.log("\nGenerated ORCA Grid:");
console.log("-".repeat(12));
console.log(orcaString);
console.log("-".repeat(12));

// 5. Validation Logic (Manual for now)
// (2,1) should be N4
// (5,3) should be H
// (8,4) should be V
