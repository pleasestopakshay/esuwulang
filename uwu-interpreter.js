// uwu programming language interpreter
// a kawaii esolang for the hack club twist challenge

class UwUInterpreter {
    constructor() {
        this.variables = {};
        this.functions = {};
        this.stack = [];
        this.output = [];
        this.errors = [];
    }

    // tokenizer - converts uwu code into tokens
    tokenize(code) {
        const tokens = [];
        let i = 0;
        
        // remove comments (lines starting with //)
        const lines = code.split('\n').filter(line => !line.trim().startsWith('//'));
        code = lines.join('\n');
        
        while (i < code.length) {
            const char = code[i];
            
            // Skip whitespace
            if (/\s/.test(char)) {
                i++;
                continue;
            }
            
            // String literals
            if (char === '"') {
                let str = '';
                i++; // Skip opening quote
                while (i < code.length && code[i] !== '"') {
                    str += code[i];
                    i++;
                }
                i++; // Skip closing quote
                tokens.push({ type: 'STRING', value: str });
                continue;
            }
            
            // Numbers (including negative numbers)
            if (/\d/.test(char) || (char === '-' && i + 1 < code.length && /\d/.test(code[i + 1]))) {
                let num = '';
                
                // Check if this is a negative number (not a minus operator)
                if (char === '-') {
                    // This is a negative number if:
                    // 1. It's at the start of the tokens
                    // 2. The previous token is an operator, comma, or opening parenthesis
                    const prevToken = tokens[tokens.length - 1];
                    const isNegativeNumber = !prevToken || 
                        prevToken.type === 'LPAREN' || 
                        prevToken.type === 'COMMA' ||
                        prevToken.type === 'PLUS' ||
                        prevToken.type === 'MINUS' ||
                        prevToken.type === 'MULTIPLY' ||
                        prevToken.type === 'DIVIDE' ||
                        prevToken.type === 'EQUALS' ||
                        prevToken.type === 'GREATER' ||
                        prevToken.type === 'LESS' ||
                        prevToken.type === 'ASSIGN';
                    
                    if (isNegativeNumber) {
                        num += char;
                        i++;
                    } else {
                        // This is a minus operator, not a negative number
                        // Let the multi-char token handler deal with it
                        const multiChar = this.getMultiCharToken(code, i);
                        if (multiChar) {
                            tokens.push(multiChar.token);
                            i += multiChar.length;
                            continue;
                        }
                    }
                }
                
                // Parse the number part
                while (i < code.length && /[\d.]/.test(code[i])) {
                    num += code[i];
                    i++;
                }
                tokens.push({ type: 'NUMBER', value: parseFloat(num) });
                continue;
            }
            
            // Multi-character operators and keywords
            const multiChar = this.getMultiCharToken(code, i);
            if (multiChar) {
                tokens.push(multiChar.token);
                i += multiChar.length;
                continue;
            }
            
            // Identifiers (variable names)
            if (/[a-zA-Z_]/.test(char)) {
                let identifier = '';
                while (i < code.length && /[a-zA-Z0-9_]/.test(code[i])) {
                    identifier += code[i];
                    i++;
                }
                tokens.push({ type: 'IDENTIFIER', value: identifier });
                continue;
            }
            
            // Single character tokens
            if (char === '(') tokens.push({ type: 'LPAREN', value: '(' });
            else if (char === ')') tokens.push({ type: 'RPAREN', value: ')' });
            else if (char === ',') tokens.push({ type: 'COMMA', value: ',' });
            else {
                // Unknown character, skip it
                i++;
                continue;
            }
            
            i++;
        }
        
        return tokens;
    }

    // Get multi-character tokens (keywords and operators)
    getMultiCharToken(code, index) {
        const keywords = {
            'uwu': { type: 'DECLARE', value: 'uwu' },
            'owo': { type: 'PRINT', value: 'owo' },
            '>w<': { type: 'IF', value: '>w<' },
            'T~T': { type: 'ELSE', value: 'T~T' },
            '^w^': { type: 'FUNCTION', value: '^w^' },
            '(´･ω･`)': { type: 'RETURN', value: '(´･ω･`)' },
            '(╯°□°）╯': { type: 'THROW', value: '(╯°□°）╯' },
            '(っ◔◡◔)っ': { type: 'TRY', value: '(っ◔◡◔)っ' },
            '(╥﹏╥)': { type: 'CATCH', value: '(╥﹏╥)' },
            '~(˘▾˘~)': { type: 'WHILE', value: '~(˘▾˘~)' },
            '(～￣▽￣)～': { type: 'FOR', value: '(～￣▽￣)～' },
            '｡◕‿◕｡': { type: 'END', value: '｡◕‿◕｡' },
            '♡': { type: 'PLUS', value: '♡' },
            '💔': { type: 'MINUS', value: '💔' },
            '✨': { type: 'MULTIPLY', value: '✨' },
            '🌟': { type: 'DIVIDE', value: '🌟' },
            '🤔': { type: 'EQUALS', value: '🤔' },
            '😍': { type: 'GREATER', value: '😍' },
            '🥺': { type: 'LESS', value: '🥺' },
            '💝': { type: 'ASSIGN', value: '💝' }
        };
        
        // Check for longest match first
        const sortedKeys = Object.keys(keywords).sort((a, b) => b.length - a.length);
        
        for (const keyword of sortedKeys) {
            if (code.substr(index, keyword.length) === keyword) {
                return {
                    token: keywords[keyword],
                    length: keyword.length
                };
            }
        }
        
        return null;
    }

    // Parser - converts tokens to AST
    parse(tokens) {
        const ast = [];
        let i = 0;
        
        while (i < tokens.length) {
            const statement = this.parseStatement(tokens, i);
            if (statement) {
                ast.push(statement.node);
                i = statement.nextIndex;
            } else {
                i++;
            }
        }
        
        return ast;
    }

    parseStatement(tokens, index) {
        const token = tokens[index];
        
        if (!token) return null;
        
        switch (token.type) {
            case 'DECLARE':
                return this.parseVariableDeclaration(tokens, index);
            case 'PRINT':
                return this.parsePrint(tokens, index);
            case 'IF':
                return this.parseIf(tokens, index);
            case 'FUNCTION':
                return this.parseFunction(tokens, index);
            case 'RETURN':
                return this.parseReturn(tokens, index);
            case 'WHILE':
                return this.parseWhile(tokens, index);
            case 'TRY':
                return this.parseTry(tokens, index);
            case 'THROW':
                return this.parseThrow(tokens, index);
            case 'IDENTIFIER':
                // Check if it's an assignment
                if (tokens[index + 1] && tokens[index + 1].type === 'ASSIGN') {
                    // variable_name 💝 value (for reassignment)
                    const varName = tokens[index].value;
                    const valueResult = this.parseExpression(tokens, index + 2);
                    
                    if (valueResult) {
                        return {
                            node: {
                                type: 'ASSIGNMENT',
                                name: varName,
                                value: valueResult.node
                            },
                            nextIndex: valueResult.nextIndex
                        };
                    }
                }
                // Otherwise it's an expression statement
                return this.parseExpression(tokens, index);
            default:
                return this.parseExpression(tokens, index);
        }
    }

    parseVariableDeclaration(tokens, index) {
        // uwu variable_name 💝 value
        if (tokens[index + 1] && tokens[index + 1].type === 'IDENTIFIER' &&
            tokens[index + 2] && tokens[index + 2].type === 'ASSIGN') {
            
            const varName = tokens[index + 1].value;
            const valueResult = this.parseExpression(tokens, index + 3);
            
            if (valueResult) {
                return {
                    node: {
                        type: 'VARIABLE_DECLARATION',
                        name: varName,
                        value: valueResult.node
                    },
                    nextIndex: valueResult.nextIndex
                };
            }
        }
        return null;
    }

    parsePrint(tokens, index) {
        // owo expression
        const exprResult = this.parseExpression(tokens, index + 1);
        if (exprResult) {
            return {
                node: {
                    type: 'PRINT',
                    expression: exprResult.node
                },
                nextIndex: exprResult.nextIndex
            };
        }
        return null;
    }

    parseIf(tokens, index) {
        // >w< condition ... T~T ... ｡◕‿◕｡
        const conditionResult = this.parseExpression(tokens, index + 1);
        if (!conditionResult) return null;
        
        let i = conditionResult.nextIndex;
        const thenStatements = [];
        const elseStatements = [];
        let inElse = false;
        
        while (i < tokens.length && tokens[i].type !== 'END') {
            if (tokens[i].type === 'ELSE') {
                inElse = true;
                i++;
                continue;
            }
            
            const stmtResult = this.parseStatement(tokens, i);
            if (stmtResult) {
                if (inElse) {
                    elseStatements.push(stmtResult.node);
                } else {
                    thenStatements.push(stmtResult.node);
                }
                i = stmtResult.nextIndex;
            } else {
                i++;
            }
        }
        
        return {
            node: {
                type: 'IF',
                condition: conditionResult.node,
                then: thenStatements,
                else: elseStatements
            },
            nextIndex: i + 1
        };
    }

    parseFunction(tokens, index) {
        // ^w^ function_name(param1, param2) ... ｡◕‿◕｡
        if (tokens[index + 1] && tokens[index + 1].type === 'IDENTIFIER') {
            const funcName = tokens[index + 1].value;
            const params = [];
            let i = index + 2;
            
            // Parse parameters
            if (tokens[i] && tokens[i].type === 'LPAREN') {
                i++; // Skip (
                while (i < tokens.length && tokens[i].type !== 'RPAREN') {
                    if (tokens[i].type === 'IDENTIFIER') {
                        params.push(tokens[i].value);
                    }
                    i++;
                }
                i++; // Skip )
            }
            
            // Parse function body
            const body = [];
            while (i < tokens.length && tokens[i].type !== 'END') {
                const stmtResult = this.parseStatement(tokens, i);
                if (stmtResult) {
                    body.push(stmtResult.node);
                    i = stmtResult.nextIndex;
                } else {
                    i++;
                }
            }
            
            return {
                node: {
                    type: 'FUNCTION',
                    name: funcName,
                    params: params,
                    body: body
                },
                nextIndex: i + 1
            };
        }
        return null;
    }

    parseReturn(tokens, index) {
        // (´･ω･`) expression
        const exprResult = this.parseExpression(tokens, index + 1);
        if (exprResult) {
            return {
                node: {
                    type: 'RETURN',
                    expression: exprResult.node
                },
                nextIndex: exprResult.nextIndex
            };
        }
        return null;
    }

    parseWhile(tokens, index) {
        // ~(˘▾˘~) condition ... ｡◕‿◕｡
        const conditionResult = this.parseExpression(tokens, index + 1);
        if (!conditionResult) return null;
        
        let i = conditionResult.nextIndex;
        const body = [];
        
        while (i < tokens.length && tokens[i].type !== 'END') {
            const stmtResult = this.parseStatement(tokens, i);
            if (stmtResult) {
                body.push(stmtResult.node);
                i = stmtResult.nextIndex;
            } else {
                i++;
            }
        }
        
        return {
            node: {
                type: 'WHILE',
                condition: conditionResult.node,
                body: body
            },
            nextIndex: i + 1
        };
    }

    parseTry(tokens, index) {
        // (っ◔◡◔)っ ... (╥﹏╥) error ... ｡◕‿◕｡
        let i = index + 1;
        const tryBlock = [];
        const catchBlock = [];
        let catchVar = null;
        let inCatch = false;
        
        while (i < tokens.length && tokens[i].type !== 'END') {
            if (tokens[i].type === 'CATCH') {
                inCatch = true;
                if (tokens[i + 1] && tokens[i + 1].type === 'IDENTIFIER') {
                    catchVar = tokens[i + 1].value;
                    i += 2;
                } else {
                    i++;
                }
                continue;
            }
            
            const stmtResult = this.parseStatement(tokens, i);
            if (stmtResult) {
                if (inCatch) {
                    catchBlock.push(stmtResult.node);
                } else {
                    tryBlock.push(stmtResult.node);
                }
                i = stmtResult.nextIndex;
            } else {
                i++;
            }
        }
        
        return {
            node: {
                type: 'TRY',
                tryBlock: tryBlock,
                catchBlock: catchBlock,
                catchVar: catchVar
            },
            nextIndex: i + 1
        };
    }

    parseThrow(tokens, index) {
        // (╯°□°）╯ expression
        const exprResult = this.parseExpression(tokens, index + 1);
        if (exprResult) {
            return {
                node: {
                    type: 'THROW',
                    expression: exprResult.node
                },
                nextIndex: exprResult.nextIndex
            };
        }
        return null;
    }

    parseExpression(tokens, index) {
        return this.parseComparison(tokens, index);
    }

    parseComparison(tokens, index) {
        let left = this.parseArithmetic(tokens, index);
        if (!left) return null;
        
        let i = left.nextIndex;
        
        while (i < tokens.length && 
               (tokens[i].type === 'EQUALS' || tokens[i].type === 'GREATER' || tokens[i].type === 'LESS')) {
            const operator = tokens[i].value;
            const right = this.parseArithmetic(tokens, i + 1);
            if (!right) break;
            
            left = {
                node: {
                    type: 'BINARY_OP',
                    operator: operator,
                    left: left.node,
                    right: right.node
                },
                nextIndex: right.nextIndex
            };
            i = right.nextIndex;
        }
        
        return left;
    }

    parseArithmetic(tokens, index) {
        let left = this.parseTerm(tokens, index);
        if (!left) return null;
        
        let i = left.nextIndex;
        
        while (i < tokens.length && (tokens[i].type === 'PLUS' || tokens[i].type === 'MINUS')) {
            const operator = tokens[i].value;
            const right = this.parseTerm(tokens, i + 1);
            if (!right) break;
            
            left = {
                node: {
                    type: 'BINARY_OP',
                    operator: operator,
                    left: left.node,
                    right: right.node
                },
                nextIndex: right.nextIndex
            };
            i = right.nextIndex;
        }
        
        return left;
    }

    parseTerm(tokens, index) {
        let left = this.parseFactor(tokens, index);
        if (!left) return null;
        
        let i = left.nextIndex;
        
        while (i < tokens.length && (tokens[i].type === 'MULTIPLY' || tokens[i].type === 'DIVIDE')) {
            const operator = tokens[i].value;
            const right = this.parseFactor(tokens, i + 1);
            if (!right) break;
            
            left = {
                node: {
                    type: 'BINARY_OP',
                    operator: operator,
                    left: left.node,
                    right: right.node
                },
                nextIndex: right.nextIndex
            };
            i = right.nextIndex;
        }
        
        return left;
    }

    parseFactor(tokens, index) {
        const token = tokens[index];
        if (!token) return null;
        
        if (token.type === 'NUMBER') {
            return {
                node: { type: 'NUMBER', value: token.value },
                nextIndex: index + 1
            };
        }
        
        if (token.type === 'STRING') {
            return {
                node: { type: 'STRING', value: token.value },
                nextIndex: index + 1
            };
        }
        
        if (token.type === 'IDENTIFIER') {
            // Check if it's a function call
            if (tokens[index + 1] && tokens[index + 1].type === 'LPAREN') {
                const funcName = token.value;
                const args = [];
                let i = index + 2;
                
                while (i < tokens.length && tokens[i].type !== 'RPAREN') {
                    if (tokens[i].type === 'COMMA') {
                        i++;
                        continue;
                    }
                    
                    const argResult = this.parseExpression(tokens, i);
                    if (argResult) {
                        args.push(argResult.node);
                        i = argResult.nextIndex;
                    } else {
                        i++;
                    }
                }
                
                return {
                    node: {
                        type: 'FUNCTION_CALL',
                        name: funcName,
                        args: args
                    },
                    nextIndex: i + 1
                };
            }
            
            // It's a variable
            return {
                node: { type: 'VARIABLE', name: token.value },
                nextIndex: index + 1
            };
        }
        
        if (token.type === 'LPAREN') {
            const exprResult = this.parseExpression(tokens, index + 1);
            if (exprResult && tokens[exprResult.nextIndex] && tokens[exprResult.nextIndex].type === 'RPAREN') {
                return {
                    node: exprResult.node,
                    nextIndex: exprResult.nextIndex + 1
                };
            }
        }
        
        return null;
    }

    // Interpreter - executes the AST
    interpret(ast) {
        this.output = [];
        this.errors = [];
        
        try {
            for (const statement of ast) {
                this.executeStatement(statement);
            }
        } catch (error) {
            this.errors.push(error.message);
        }
        
        return {
            output: this.output,
            errors: this.errors
        };
    }

    executeStatement(statement) {
        switch (statement.type) {
            case 'VARIABLE_DECLARATION':
                const declValue = this.evaluateExpression(statement.value);
                this.variables[statement.name] = declValue;
                break;
            
            case 'ASSIGNMENT':
                const assignValue = this.evaluateExpression(statement.value);
                this.variables[statement.name] = assignValue;
                break;
            
            case 'PRINT':
                const value = this.evaluateExpression(statement.expression);
                this.output.push(String(value));
                break;
            
            case 'IF':
                const condition = this.evaluateExpression(statement.condition);
                if (condition) {
                    for (const stmt of statement.then) {
                        this.executeStatement(stmt);
                    }
                } else if (statement.else) {
                    for (const stmt of statement.else) {
                        this.executeStatement(stmt);
                    }
                }
                break;
            
            case 'FUNCTION':
                this.functions[statement.name] = statement;
                break;
            
            case 'RETURN':
                const returnValue = this.evaluateExpression(statement.expression);
                throw new ReturnException(returnValue);
            
            case 'WHILE':
                while (this.evaluateExpression(statement.condition)) {
                    for (const stmt of statement.body) {
                        this.executeStatement(stmt);
                    }
                }
                break;
            
            case 'TRY':
                try {
                    for (const stmt of statement.tryBlock) {
                        this.executeStatement(stmt);
                    }
                } catch (error) {
                    // Re-throw ReturnException so functions can handle returns properly
                    if (error instanceof ReturnException) {
                        throw error;
                    }
                    
                    if (statement.catchVar) {
                        this.variables[statement.catchVar] = error.message;
                    }
                    for (const stmt of statement.catchBlock) {
                        this.executeStatement(stmt);
                    }
                }
                break;
            
            case 'THROW':
                const errorMessage = this.evaluateExpression(statement.expression);
                throw new Error(String(errorMessage));
            
            case 'FUNCTION_CALL':
                this.callFunction(statement.name, statement.args);
                break;
            
            default:
                // If it's an expression, evaluate it (for function calls as statements)
                if (statement.type) {
                    this.evaluateExpression(statement);
                }
        }
    }

    evaluateExpression(expression) {
        switch (expression.type) {
            case 'NUMBER':
                return expression.value;
            
            case 'STRING':
                return expression.value;
            
            case 'VARIABLE':
                if (expression.name in this.variables) {
                    return this.variables[expression.name];
                }
                throw new Error(`Undefined variable: ${expression.name}`);
            
            case 'BINARY_OP':
                const left = this.evaluateExpression(expression.left);
                const right = this.evaluateExpression(expression.right);
                
                switch (expression.operator) {
                    case '♡': return left + right;
                    case '💔': return left - right;
                    case '✨': return left * right;
                    case '🌟': 
                        if (right === 0) throw new Error('Division by zero! That\'s not kawaii uwu');
                        return left / right;
                    case '🤔': return left === right;
                    case '😍': return left > right;
                    case '🥺': return left < right;
                    default:
                        throw new Error(`Unknown operator: ${expression.operator}`);
                }
            
            case 'FUNCTION_CALL':
                return this.callFunction(expression.name, expression.args);
            
            default:
                throw new Error(`Unknown expression type: ${expression.type}`);
        }
    }

    callFunction(name, args) {
        if (!(name in this.functions)) {
            throw new Error(`Undefined function: ${name}`);
        }
        
        const func = this.functions[name];
        const argValues = args.map(arg => this.evaluateExpression(arg));
        
        // Create new scope
        const savedVars = { ...this.variables };
        
        // Bind parameters
        for (let i = 0; i < func.params.length; i++) {
            this.variables[func.params[i]] = argValues[i] || 0;
        }
        
        let returnValue = null;
        try {
            for (const statement of func.body) {
                this.executeStatement(statement);
            }
        } catch (error) {
            if (error instanceof ReturnException) {
                returnValue = error.value;
            } else {
                // Restore scope before throwing
                this.variables = savedVars;
                throw error;
            }
        }
        
        // Restore scope
        this.variables = savedVars;
        
        return returnValue;
    }

    run(code) {
        try {
            const tokens = this.tokenize(code);
            const ast = this.parse(tokens);
            return this.interpret(ast);
        } catch (error) {
            return {
                output: [],
                errors: [error.message]
            };
        }
    }
}

class ReturnException extends Error {
    constructor(value) {
        super('Return');
        this.value = value;
    }
}

// Export for Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UwUInterpreter;
}

// Command line interface
if (typeof process !== 'undefined' && process.argv && process.argv.length > 2) {
    const fs = require('fs');
    const filename = process.argv[2];
    
    try {
        const code = fs.readFileSync(filename, 'utf8');
        const interpreter = new UwUInterpreter();
        const result = interpreter.run(code);
        
        result.output.forEach(line => console.log(line));
        result.errors.forEach(error => console.error('UwU Error:', error));
    } catch (error) {
        console.error('File error:', error.message);
    }
}
