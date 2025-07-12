// UwU Programming Language Test Suite

const UwUInterpreter = require('./uwu-interpreter.js');

function runTest(name, code, expectedOutput, expectedErrors = []) {
    console.log(`\nTesting: ${name}`);
    console.log(`Code: ${code}`);
    
    const interpreter = new UwUInterpreter();
    const result = interpreter.run(code);
    
    console.log(`Output: ${JSON.stringify(result.output)}`);
    console.log(`Errors: ${JSON.stringify(result.errors)}`);
    
    let passed = true;
    
    if (JSON.stringify(result.output) !== JSON.stringify(expectedOutput)) {
        console.log(`❌ Output mismatch! Expected: ${JSON.stringify(expectedOutput)}`);
        passed = false;
    }
    
    if (JSON.stringify(result.errors) !== JSON.stringify(expectedErrors)) {
        console.log(`❌ Error mismatch! Expected: ${JSON.stringify(expectedErrors)}`);
        passed = false;
    }
    
    if (passed) {
        console.log('✅ Test passed!');
    }
    
    return passed;
}

console.log('UwU Programming Language Test Suite');
console.log('Testing all the kawaii features...\n');

let totalTests = 0;
let passedTests = 0;

// Test 1: Basic Hello World
if (runTest('Hello World', 'owo "Hello, World! UwU"', ['Hello, World! UwU'])) passedTests++;
totalTests++;

// Test 2: Variables
if (runTest('Variables', 'uwu x 💝 42\nowo x', ['42'])) passedTests++;
totalTests++;

// Test 3: Math Operations
if (runTest('Addition', 'uwu a 💝 5\nuwu b 💝 3\nowo a ♡ b', ['8'])) passedTests++;
totalTests++;

if (runTest('Subtraction', 'uwu a 💝 10\nuwu b 💝 4\nowo a 💔 b', ['6'])) passedTests++;
totalTests++;

if (runTest('Multiplication', 'uwu a 💝 6\nuwu b 💝 7\nowo a ✨ b', ['42'])) passedTests++;
totalTests++;

if (runTest('Division', 'uwu a 💝 20\nuwu b 💝 4\nowo a 🌟 b', ['5'])) passedTests++;
totalTests++;

// Test 4: Functions
if (runTest('Simple Function', 
    '^w^ double(x)\n    (´･ω･`) x ✨ 2\n｡◕‿◕｡\n\nuwu result 💝 double(5)\nowo result', 
    ['10'])) passedTests++;
totalTests++;

// Test 5: Conditionals
if (runTest('If Statement', 
    'uwu x 💝 10\n>w< x 😍 5\n    owo "big"\nT~T\n    owo "small"\n｡◕‿◕｡', 
    ['big'])) passedTests++;
totalTests++;

if (runTest('If-Else False', 
    'uwu x 💝 3\n>w< x 😍 5\n    owo "big"\nT~T\n    owo "small"\n｡◕‿◕｡', 
    ['small'])) passedTests++;
totalTests++;

// Test 6: Loops
if (runTest('While Loop', 
    'uwu i 💝 1\n~(˘▾˘~) i 🥺 4\n    owo i\n    i 💝 i ♡ 1\n｡◕‿◕｡', 
    ['1', '2', '3'])) passedTests++;
totalTests++;

// Test 7: Error Handling
if (runTest('Division by Zero', 
    'uwu result 💝 10 🌟 0\nowo result', 
    [], ["Division by zero! That's not kawaii uwu"])) passedTests++;
totalTests++;

if (runTest('Try-Catch', 
    '(っ◔◡◔)っ\n    uwu result 💝 10 🌟 0\n(╥﹏╥) error\n    owo "Caught: " ♡ error\n｡◕‿◕｡', 
    ['Caught: Division by zero! That\'s not kawaii uwu'])) passedTests++;
totalTests++;

// Test 8: String Concatenation
if (runTest('String Concatenation', 
    'uwu name 💝 "UwU"\nowo "Hello, " ♡ name ♡ "!"', 
    ['Hello, UwU!'])) passedTests++;
totalTests++;

// Test 9: Comparison Operations
if (runTest('Equality', 
    'uwu a 💝 5\nuwu b 💝 5\nowo a 🤔 b', 
    ['true'])) passedTests++;
totalTests++;

if (runTest('Less Than', 
    'uwu a 💝 3\nuwu b 💝 7\nowo a 🥺 b', 
    ['true'])) passedTests++;
totalTests++;

if (runTest('Greater Than', 
    'uwu a 💝 10\nuwu b 💝 5\nowo a 😍 b', 
    ['true'])) passedTests++;
totalTests++;

// Test 10: Complex Function
if (runTest('Factorial Function', 
    '^w^ factorial(n)\n    >w< n 🥺 2\n        (´･ω･`) 1\n    T~T\n        (´･ω･`) n ✨ factorial(n 💔 1)\n    ｡◕‿◕｡\n｡◕‿◕｡\n\nuwu result 💝 factorial(4)\nowo result', 
    ['24'])) passedTests++;
totalTests++;

console.log(`\nTest Results: ${passedTests}/${totalTests} tests passed`);
console.log(`Success rate: ${Math.round((passedTests / totalTests) * 100)}%`);

if (passedTests === totalTests) {
    console.log('✅ All tests passed! The UwU language is working perfectly!');
} else {
    console.log('Some tests failed, but that\'s okay! UwU is still learning!');
}
