class Parser {
    constructor(expression) {
        this.expression = expression.replace(/\s+/g, ''); // Remove whitespace
        this.index = 0;
    }

    parse() {
        return this.parseExpression();
    }

    parseExpression() {
        let result = this.parseTerm();
        while (this.peek() === '+' || this.peek() === '-') {
            let operator = this.next();
            let right = this.parseTerm();
            if (operator === '+') {
                result += right;
            } else {
                result -= right;
            }
        }
        return result;
    }

    parseTerm() {
        let result = this.parseFactor();
        while (this.peek() === '*' || this.peek() === '/') {
            let operator = this.next();
            let right = this.parseFactor();
            if (operator === '*') {
                result *= right;
            } else {
                result /= right;
            }
        }
        return result;
    }

    parseFactor() {
        if (this.peek() === '(') {
            this.next(); // consume '('
            let result = this.parseExpression();
            this.next(); // consume ')'
            return result;
        } else {
            return this.parseNumber();
        }
    }

    parseNumber() {
        let start = this.index;
        while (this.peek() >= '0' && this.peek() <= '9') {
            this.next();
        }
        return parseInt(this.expression.slice(start, this.index), 10);
    }

    peek() {
        return this.expression[this.index];
    }

    next() {
        return this.expression[this.index++];
    }
}

// Example usage:
let parser = new Parser("3 + 5 * (2 - 8)");
console.log(parser.parse()); // Output: -13
//
//write a function to generate expressions to be parsed by the parser

function generateExpression(depth = 2) {
    const operators = ['+', '-', '*'];
    const maxNumber = 10;

    function getRandomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function getRandomOperator() {
        return operators[getRandomInt(operators.length)];
    }

    function generateSubExpression(currentDepth) {
        if (currentDepth === 0) {
            return getRandomInt(maxNumber).toString();
        }

        const left = generateSubExpression(currentDepth - 1);
        const operator = getRandomOperator();
        const right = generateSubExpression(currentDepth - 1);

        if (Math.random() > 0.5) {
            return `(${left} ${operator} ${right})`;
        } else {
            return `${left} ${operator} ${right}`;
        }
    }

    return generateSubExpression(depth);
}

// Example usage:
console.log(generateExpression()); // Output: A random arithmetic expression
