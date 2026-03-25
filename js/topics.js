// topics.js - Contains all the math questions following NCUK curriculum

// Helper function to shuffle options (will be called when generating questions)
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Function to randomize question options
function randomizeQuestion(question) {
    const originalCorrect = question.correct;
    const options = [...question.options];
    const shuffled = shuffleArray([...options]);
    return {
        ...question,
        options: shuffled,
        correct: originalCorrect
    };
}

const TOPICS = {
    algebra: {
        name: "Algebra & Simultaneous Equations",
        icon: "fas fa-calculator",
        order: 0,
        questions: [
            { text: "Expand and simplify: (4x - 3)(2x + 5)", options: ["8x² + 14x - 15", "8x² - 14x - 15", "8x² + 14x + 15", "8x² - 14x + 15"], correct: "8x² + 14x - 15", hint: "Use FOIL: 4x·2x=8x², 4x·5=20x, -3·2x=-6x, -3·5=-15, combine: 20x-6x=14x" },
            { text: "Factorise completely: 3x² + 11x + 6", options: ["(3x+2)(x+3)", "(3x+3)(x+2)", "(x+3)(3x+2)", "(x+2)(3x+3)"], correct: "(3x+2)(x+3)", hint: "Factors of 18 that sum to 11 are 9 and 2: 3x²+9x+2x+6 = 3x(x+3)+2(x+3) = (3x+2)(x+3)" },
            { text: "Solve simultaneously: y = 4x - 5 and 3x + y = 12", options: ["x=3, y=7", "x=2, y=3", "x=4, y=11", "x=2.43, y=4.72"], correct: "x=3, y=7", hint: "Substitute: 3x + (4x-5) = 12 → 7x = 17 → x≈2.43, y=4.72" },
            { text: "Solve: 4(x + 3) = 2(x - 5)", options: ["x = -11", "x = 11", "x = -7", "x = 7"], correct: "x = -11", hint: "4x+12=2x-10 → 2x=-22 → x=-11" },
            { text: "Factorise: 16x² - 25", options: ["(4x-5)(4x+5)", "(16x-5)(x+5)", "(4x-5)(4x-5)", "(4x+5)(4x+5)"], correct: "(4x-5)(4x+5)", hint: "Difference of squares: (4x)² - 5² = (4x-5)(4x+5)" },
            { text: "Solve the system: 2x + 3y = 13, 5x - y = 7", options: ["x=2, y=3", "x=3, y=2", "x=4, y=1.67", "x=1, y=3.67"], correct: "x=2, y=3", hint: "From second: y=5x-7, substitute: 2x+3(5x-7)=13 → 2x+15x-21=13 → 17x=34 → x=2, y=3" },
            { text: "Simplify: (x⁴y³)⁶", options: ["x²⁴y¹⁸", "x¹⁰y⁹", "x²⁴y⁹", "x¹⁰y¹⁸"], correct: "x²⁴y¹⁸", hint: "Multiply exponents: 4×6=24, 3×6=18 → x²⁴y¹⁸" },
            { text: "Solve: 2^(x) = 64", options: ["x=6", "x=5", "x=7", "x=8"], correct: "x=6", hint: "64 = 2⁶, therefore x=6" },
            { text: "Expand: (3x - 2)³", options: ["27x³ - 54x² + 36x - 8", "27x³ + 54x² + 36x + 8", "27x³ - 36x² + 54x - 8", "27x³ - 54x² - 36x - 8"], correct: "27x³ - 54x² + 36x - 8", hint: "Use (a-b)³ = a³ - 3a²b + 3ab² - b³ with a=3x, b=2" },
            { text: "Factorise: 64x³ - 27", options: ["(4x-3)(16x²+12x+9)", "(4x+3)(16x²-12x+9)", "(4x-3)(16x²-12x+9)", "(4x+3)(16x²+12x+9)"], correct: "(4x-3)(16x²+12x+9)", hint: "Difference of cubes: (4x)³ - 3³ = (4x-3)(16x²+12x+9)" },
            { text: "Solve: 9x² - 36 = 0", options: ["x = 2 or x = -2", "x = 6 or x = -6", "x = 3 or x = -3", "x = 4 or x = -4"], correct: "x = 2 or x = -2", hint: "9x²=36 → x²=4 → x=±2" },
            { text: "Simplify: (a²b⁻⁴)⁻³", options: ["a⁻⁶b¹²", "a⁶b⁻¹²", "a⁻⁶b⁻¹²", "a⁶b¹²"], correct: "a⁻⁶b¹²", hint: "Multiply exponents: 2×(-3)=-6, (-4)×(-3)=12 → a⁻⁶b¹²" },
            { text: "Solve: 3x - 8 = 5x + 4", options: ["x = -6", "x = 6", "x = -2", "x = 2"], correct: "x = -6", hint: "-8-4=5x-3x → -12=2x → x=-6" },
            { text: "Factorise: x² - 14x + 49", options: ["(x-7)²", "(x+7)²", "(x-49)(x-1)", "(x-7)(x+7)"], correct: "(x-7)²", hint: "Perfect square: (x-7)² = x² - 14x + 49" },
            { text: "Solve simultaneously: 3x + y = 10, x - 2y = 1", options: ["x=3, y=1", "x=2, y=4", "x=4, y=-2", "x=1, y=7"], correct: "x=3, y=1", hint: "From first: y=10-3x, substitute: x-2(10-3x)=1 → x-20+6x=1 → 7x=21 → x=3, y=1" },
            { text: "Expand: (x + 5)(x² - 5x + 25)", options: ["x³ + 125", "x³ - 125", "x³ + 25x + 125", "x³ + 125x"], correct: "x³ + 125", hint: "Sum of cubes: (x+5)(x²-5x+25) = x³ + 5³ = x³ + 125" },
            { text: "Solve: 4^(2x) = 256", options: ["x=2", "x=3", "x=4", "x=1"], correct: "x=2", hint: "256 = 4⁴, so 2x=4 → x=2" },
            { text: "Simplify: (2x³y²)³ × (3xy²)²", options: ["72x¹¹y¹⁰", "72x⁹y⁸", "108x¹¹y¹⁰", "108x⁹y⁸"], correct: "72x¹¹y¹⁰", hint: "(8x⁹y⁶) × (9x²y⁴) = 72x¹¹y¹⁰" },
            { text: "Factorise: x³ + 27", options: ["(x+3)(x²-3x+9)", "(x-3)(x²+3x+9)", "(x+3)(x²+3x+9)", "(x-3)(x²-3x+9)"], correct: "(x+3)(x²-3x+9)", hint: "Sum of cubes: x³ + 3³ = (x+3)(x² - 3x + 9)" },
            { text: "Solve the inequality: 5x - 3 < 2x + 12", options: ["x < 5", "x > 5", "x < 3", "x > 3"], correct: "x < 5", hint: "5x-2x < 12+3 → 3x < 15 → x < 5" }
        ]
    },
    quadratics: {
        name: "Quadratics & Inequalities",
        icon: "fas fa-chart-line",
        order: 1,
        questions: [
            { text: "Solve: x² + 5x - 14 = 0", options: ["x = 2 or x = -7", "x = -2 or x = 7", "x = 2 or x = 7", "x = -2 or x = -7"], correct: "x = 2 or x = -7", hint: "Factor: (x+7)(x-2)=0 → x=-7 or x=2" },
            { text: "Solve using quadratic formula: 2x² - 5x - 3 = 0", options: ["x = 3 or x = -0.5", "x = -3 or x = 0.5", "x = 3 or x = 0.5", "x = -3 or x = -0.5"], correct: "x = 3 or x = -0.5", hint: "x = [5 ± √(25+24)]/4 = [5 ± 7]/4 → x=3 or x=-0.5" },
            { text: "Solve inequality: x² - 6x + 8 < 0", options: ["2 < x < 4", "x < 2 or x > 4", "x > 4", "x < 2"], correct: "2 < x < 4", hint: "Factor: (x-4)(x-2)<0, solution between roots: 2 < x < 4" },
            { text: "Find the vertex of y = 3x² - 12x + 5", options: ["(2, -7)", "(-2, 41)", "(4, 5)", "(1, -4)"], correct: "(2, -7)", hint: "x = -b/(2a) = 12/(6)=2, y=3(4)-24+5=12-24+5=-7" },
            { text: "Solve: 9x² + 12x + 4 = 0", options: ["x = -2/3", "x = 2/3", "x = ±2/3", "No solution"], correct: "x = -2/3", hint: "Perfect square: (3x+2)²=0 → 3x+2=0 → x=-2/3" },
            { text: "Find discriminant of 3x² - 4x - 2 = 0", options: ["40", "16", "28", "52"], correct: "40", hint: "b²-4ac = 16 - 4(3)(-2) = 16+24=40" },
            { text: "Solve: 3x² = 48", options: ["x = 4 or x = -4", "x = 16 or x = -16", "x = √16", "x = 8 or x = -8"], correct: "x = 4 or x = -4", hint: "x²=16 → x=±4" },
            { text: "Complete square: x² - 6x + 13", options: ["(x-3)² + 4", "(x-3)² - 4", "(x+3)² + 4", "(x+3)² - 4"], correct: "(x-3)² + 4", hint: "Take half of -6 = -3, then (x-3)² -9+13 = (x-3)²+4" },
            { text: "Solve: 4x² - 20x = 0", options: ["x = 0 or x = 5", "x = 0 or x = -5", "x = 2 or x = 10", "x = 0 or x = 4"], correct: "x = 0 or x = 5", hint: "Factor: 4x(x-5)=0 → x=0 or x=5" },
            { text: "Inequality: x² - 16 < 0", options: ["-4 < x < 4", "x < -4 or x > 4", "x > 4", "x < -4"], correct: "-4 < x < 4", hint: "x² < 16 → |x| < 4 → -4 < x < 4" },
            { text: "Find the minimum value of x² + 8x + 20", options: ["4", "20", "8", "12"], correct: "4", hint: "Complete square: (x+4)²+4, minimum when (x+4)²=0 → y=4" },
            { text: "Solve: (x-3)(x+4) = 0", options: ["x = 3 or x = -4", "x = -3 or x = 4", "x = 3 or x = 4", "x = -3 or x = -4"], correct: "x = 3 or x = -4", hint: "Zero product property: x-3=0 or x+4=0 → x=3 or x=-4" },
            { text: "Determine the nature of roots for 2x² + 4x + 3 = 0", options: ["Complex (no real roots)", "Real and distinct", "Real and equal", "Rational"], correct: "Complex (no real roots)", hint: "Discriminant = 16-24 = -8 < 0, so complex roots" },
            { text: "Solve: 3x² + 10x - 8 = 0", options: ["x = 2/3 or x = -4", "x = -2/3 or x = 4", "x = 4/3 or x = -2", "x = -4/3 or x = 2"], correct: "x = 2/3 or x = -4", hint: "Factor: (3x-2)(x+4)=0 → x=2/3 or x=-4" },
            { text: "Find the sum of roots of 4x² - 16x + 7 = 0", options: ["4", "16", "-16", "-4"], correct: "4", hint: "Sum = -b/a = 16/4 = 4" },
            { text: "Product of roots of 3x² + 9x - 6 = 0", options: ["-2", "2", "-3", "3"], correct: "-2", hint: "Product = c/a = -6/3 = -2" },
            { text: "Solve: x² + 6x - 16 = 0", options: ["x = 2 or x = -8", "x = -2 or x = 8", "x = 8 or x = -2", "x = -8 or x = 2"], correct: "x = 2 or x = -8", hint: "Factor: (x+8)(x-2)=0 → x=-8 or x=2" },
            { text: "Inequality: 3x² - 7x - 6 > 0", options: ["x < -2/3 or x > 3", "-2/3 < x < 3", "x > 3", "x < -2/3"], correct: "x < -2/3 or x > 3", hint: "Factor: (3x+2)(x-3)>0, solution outside roots: x < -2/3 or x > 3" },
            { text: "Find the axis of symmetry for y = 3x² - 6x + 2", options: ["x = 1", "x = -1", "x = 2", "x = 3"], correct: "x = 1", hint: "x = -b/(2a) = 6/(6) = 1" },
            { text: "Solve: x² - 8x - 20 = 0", options: ["x = 10 or x = -2", "x = -10 or x = 2", "x = 10 or x = 2", "x = -10 or x = -2"], correct: "x = 10 or x = -2", hint: "Factor: (x-10)(x+2)=0 → x=10 or x=-2" }
        ]
    },
    functions: {
        name: "Functions & Transformations",
        icon: "fas fa-chart-simple",
        order: 2,
        questions: [
            { text: "If f(x)=x², describe transformation to y=(x-4)² + 3", options: ["Right 4 units, up 3 units", "Left 4 units, up 3 units", "Right 4 units, down 3 units", "Left 4 units, down 3 units"], correct: "Right 4 units, up 3 units", hint: "h=4 (shift right), k=3 (shift up)" },
            { text: "Find vertex of y=(x-2)² + 5", options: ["(2, 5)", "(-2, 5)", "(2, -5)", "(-2, -5)"], correct: "(2, 5)", hint: "Vertex at (h,k) where h=2, k=5" },
            { text: "If g(x)=5x-3, find g⁻¹(x)", options: ["(x+3)/5", "(x-3)/5", "5x+3", "x/5+3"], correct: "(x+3)/5", hint: "Swap: x=5y-3 → 5y=x+3 → y=(x+3)/5" },
            { text: "f(x)=x², what is f(x+2)?", options: ["(x+2)²", "x²+2", "x²+4", "x²+4x+4"], correct: "(x+2)²", hint: "Replace x with (x+2): f(x+2) = (x+2)²" },
            { text: "If f(x)=5x-2, find f(3)", options: ["13", "17", "10", "15"], correct: "13", hint: "5(3)-2=15-2=13" },
            { text: "Domain of f(x)=√(x-3)", options: ["x ≥ 3", "x > 3", "x ≤ 3", "All real numbers"], correct: "x ≥ 3", hint: "Inside square root must be ≥ 0: x-3 ≥ 0 → x ≥ 3" },
            { text: "If f(x)=x² and g(x)=3x+2, find f(g(x))", options: ["(3x+2)²", "3x²+2", "9x²+12x+4", "9x²+4"], correct: "(3x+2)²", hint: "f(g(x)) = (3x+2)² = 9x²+12x+4" },
            { text: "Find inverse of f(x)=√(x-2), x≥2", options: ["x²+2", "x²-2", "√(x+2)", "x+2"], correct: "x²+2", hint: "Swap: x=√(y-2) → x²=y-2 → y=x²+2" },
            { text: "Range of f(x)=x² + 3", options: ["y ≥ 3", "y > 3", "y ≤ 3", "All real numbers"], correct: "y ≥ 3", hint: "Minimum value is 3 when x=0, so y ≥ 3" },
            { text: "If f(x)=x/3, find f⁻¹(9)", options: ["27", "3", "9", "18"], correct: "27", hint: "f⁻¹(x)=3x, so 3×9=27" },
            { text: "Describe transformation: y = f(-x)", options: ["Reflection in y-axis", "Reflection in x-axis", "Shift right", "Shift left"], correct: "Reflection in y-axis", hint: "Negative inside flips horizontally across y-axis" },
            { text: "Find f(3) if f(x)=3x² - 2x + 4", options: ["25", "19", "31", "22"], correct: "25", hint: "3(9)-6+4=27-6+4=25" },
            { text: "If f(x)=x-1 and g(x)=x², find g(f(x))", options: ["(x-1)²", "x²-1", "x²-2x+1", "x²+1"], correct: "(x-1)²", hint: "g(f(x)) = (x-1)² = x²-2x+1" },
            { text: "Domain of f(x)=1/(x+2)", options: ["x ≠ -2", "x > -2", "x < -2", "All real numbers"], correct: "x ≠ -2", hint: "Denominator cannot be zero: x+2 ≠ 0 → x ≠ -2" },
            { text: "Find inverse of f(x)=x² - 9, x≥0", options: ["√(x+9)", "√(x-9)", "x²+9", "x²-9"], correct: "√(x+9)", hint: "Swap: x=y²-9 → y²=x+9 → y=√(x+9)" },
            { text: "If f(x)=3x-2, find f(2x)", options: ["6x-2", "3x-2", "6x-4", "3x-4"], correct: "6x-2", hint: "3(2x)-2=6x-2" },
            { text: "What transformation gives y=f(x-3)?", options: ["Right 3 units", "Left 3 units", "Up 3 units", "Down 3 units"], correct: "Right 3 units", hint: "x replaced by x-3 shifts graph right" },
            { text: "Find g⁻¹(4) if g(x)=2x+1", options: ["1.5", "2", "9", "3"], correct: "1.5", hint: "g⁻¹(x)=(x-1)/2, so (4-1)/2=3/2=1.5" },
            { text: "Range of f(x)=|x| - 2", options: ["y ≥ -2", "y > -2", "y ≤ -2", "All real numbers"], correct: "y ≥ -2", hint: "Absolute value ≥0, minus 2 gives y ≥ -2" },
            { text: "If f(x)=x⁴, find f(3x)", options: ["81x⁴", "3x⁴", "x⁴", "12x⁴"], correct: "81x⁴", hint: "(3x)⁴ = 81x⁴" }
        ]
    },
    calculus: {
        name: "Differentiation & Newton-Raphson",
        icon: "fas fa-infinity",
        order: 3,
        questions: [
            { text: "Find f'(x) for f(x)=4x³ - 3x² + 2x - 5", options: ["12x² - 6x + 2", "12x² - 3x + 2", "4x² - 6x + 2", "12x² - 6x - 2"], correct: "12x² - 6x + 2", hint: "Power rule: 3×4x²=12x², 2×(-3)x=-6x, derivative of 2x=2" },
            { text: "Newton-Raphson: f(x)=x²-3, f'(x)=2x, x₀=1.8, find x₁", options: ["1.75", "1.72", "1.78", "1.8"], correct: "1.75", hint: "x₁ = 1.8 - (3.24-3)/(3.6) = 1.8 - 0.24/3.6 = 1.8 - 0.067 = 1.733 ≈1.73" },
            { text: "Derivative of 3x⁵", options: ["15x⁴", "3x⁴", "15x⁵", "5x⁴"], correct: "15x⁴", hint: "3×5×x⁴=15x⁴" },
            { text: "Find stationary point of f(x)=x²-8x+10", options: ["(4, -6)", "(4, 10)", "(8, 10)", "(-4, 58)"], correct: "(4, -6)", hint: "f'(x)=2x-8=0 → x=4, f(4)=16-32+10=-6" },
            { text: "Derivative of ln(5x)", options: ["1/x", "5/x", "1/(5x)", "5"], correct: "1/x", hint: "d/dx[ln(ax)] = 1/x" },
            { text: "Derivative of e^(2x)", options: ["2e^(2x)", "e^(2x)", "2e^x", "e^(2x)/2"], correct: "2e^(2x)", hint: "Chain rule: d/dx[e^(2x)] = 2e^(2x)" },
            { text: "Find f'(x) for f(x)=∛x", options: ["1/(3∛x²)", "3∛x²", "1/∛x²", "∛x/3"], correct: "1/(3∛x²)", hint: "Write as x^(1/3), derivative = (1/3)x^(-2/3) = 1/(3x^(2/3))" },
            { text: "Second derivative of 5x⁴", options: ["60x²", "20x³", "60x³", "20x²"], correct: "60x²", hint: "First:20x³, second:60x²" },
            { text: "Integral of 6x dx", options: ["3x² + C", "6x² + C", "x² + C", "12x² + C"], correct: "3x² + C", hint: "∫xⁿ dx = xⁿ⁺¹/(n+1) → 6 × x²/2 = 3x² + C" },
            { text: "Newton iteration for f(x)=x³-5, x₀=1.7", options: ["≈1.71", "≈1.75", "≈1.68", "≈1.73"], correct: "≈1.71", hint: "x₁ = 1.7 - (4.913-5)/(3×2.89) = 1.7 - (-0.087/8.67) ≈ 1.71" },
            { text: "Derivative of sin(2x)", options: ["2cos(2x)", "cos(2x)", "-2cos(2x)", "2sin(2x)"], correct: "2cos(2x)", hint: "Chain rule: d/dx[sin(2x)] = 2cos(2x)" },
            { text: "Derivative of cos(3x)", options: ["-3sin(3x)", "3sin(3x)", "-3cos(3x)", "3cos(3x)"], correct: "-3sin(3x)", hint: "Chain rule: d/dx[cos(3x)] = -3sin(3x)" },
            { text: "Find gradient of y=x⁴ at x=2", options: ["32", "16", "64", "8"], correct: "32", hint: "dy/dx=4x³, at x=2: 4×8=32" },
            { text: "Integral of 1/(2x) dx", options: ["½ ln|x| + C", "ln|2x| + C", "1/x² + C", "2 ln|x| + C"], correct: "½ ln|x| + C", hint: "∫(1/(2x))dx = (1/2)∫(1/x)dx = (1/2)ln|x| + C" },
            { text: "Find f'(x) for f(x)=x³ln(x)", options: ["3x² ln(x) + x²", "3x² ln(x)", "x² ln(x) + x²", "3x² + ln(x)"], correct: "3x² ln(x) + x²", hint: "Product rule: 3x²·ln(x) + x³·(1/x) = 3x² ln(x) + x²" },
            { text: "Stationary point of y=x³-27x", options: ["x = 3 or x = -3", "x = 9 or x = -9", "x = 0", "x = 1 or x = -1"], correct: "x = 3 or x = -3", hint: "dy/dx=3x²-27=0 → x²=9 → x=±3" },
            { text: "Second derivative of 3x⁶", options: ["90x⁴", "18x⁵", "90x⁵", "18x⁴"], correct: "90x⁴", hint: "First:18x⁵, second:90x⁴" },
            { text: "Integral of 5e^x dx", options: ["5e^x + C", "e^x + C", "5x e^x + C", "e^(5x) + C"], correct: "5e^x + C", hint: "∫5e^x dx = 5∫e^x dx = 5e^x + C" },
            { text: "Newton-Raphson: f(x)=x²-8, x₀=2.8, find x₁", options: ["2.83", "2.85", "2.8", "2.87"], correct: "2.83", hint: "x₁ = 2.8 - (7.84-8)/(5.6) = 2.8 - (-0.16/5.6) = 2.83" },
            { text: "Derivative of sec²(x)", options: ["2sec²(x)tan(x)", "sec(x)tan(x)", "2tan(x)", "2sec(x)"], correct: "2sec²(x)tan(x)", hint: "Chain rule: derivative of sec²x = 2sec x × sec x tan x = 2sec²x tan x" }
        ]
    },
    trigonometry: {
        name: "Trigonometry & Radians",
        icon: "fas fa-sine",
        order: 4,
        questions: [
            { text: "Solve sin x = 1/2 for 0° ≤ x ≤ 360°", options: ["30° and 150°", "60° and 120°", "30° and 210°", "60° and 300°"], correct: "30° and 150°", hint: "sin 30° = 1/2, sin 150° = sin(180°-30°) = 1/2" },
            { text: "Arc length: radius = 6cm, angle = 2.2 rad", options: ["13.2 cm", "12 cm", "14.4 cm", "11 cm"], correct: "13.2 cm", hint: "s = rθ = 6 × 2.2 = 13.2 cm" },
            { text: "Sector area: radius = 5cm, angle = 1.8 rad", options: ["22.5 cm²", "25 cm²", "20 cm²", "18 cm²"], correct: "22.5 cm²", hint: "A = ½r²θ = 0.5 × 25 × 1.8 = 22.5 cm²" },
            { text: "cos 60° = ?", options: ["1/2", "√3/2", "√2/2", "1"], correct: "1/2", hint: "Standard value: cos 60° = 1/2" },
            { text: "tan 45° = ?", options: ["1", "√3", "√3/3", "0"], correct: "1", hint: "tan 45° = sin45°/cos45° = (√2/2)/(√2/2)=1" },
            { text: "Convert 135° to radians", options: ["3π/4", "π/2", "2π/3", "5π/6"], correct: "3π/4", hint: "135° × π/180° = 135π/180 = 3π/4" },
            { text: "Convert 3π/2 to degrees", options: ["270°", "180°", "360°", "90°"], correct: "270°", hint: "3π/2 × 180°/π = 270°" },
            { text: "Amplitude of h(t)=10+6sin t", options: ["6", "10", "16", "4"], correct: "6", hint: "Amplitude is the coefficient of sine: 6" },
            { text: "Maximum value of h(t)=20+15sin t", options: ["35", "20", "15", "5"], correct: "35", hint: "Maximum when sin t = 1: 20+15×1=35" },
            { text: "sin 90° = ?", options: ["1", "0", "0.5", "√2/2"], correct: "1", hint: "sin 90° = 1" },
            { text: "cos 90° = ?", options: ["0", "1", "-1", "0.5"], correct: "0", hint: "cos 90° = 0" },
            { text: "Solve sin x = 0 for 0° ≤ x ≤ 360°", options: ["0°, 180°, 360°", "90°, 270°", "0°, 90°", "180°, 360°"], correct: "0°, 180°, 360°", hint: "sin 0°=0, sin 180°=0, sin 360°=0" },
            { text: "Period of y=cos(3x)", options: ["2π/3", "2π", "π", "4π"], correct: "2π/3", hint: "Period = 2π/3" },
            { text: "Solve tan x = √3 for 0° ≤ x ≤ 180°", options: ["60°", "120°", "60° and 240°", "30°"], correct: "60°", hint: "tan 60°=√3, tan also positive in QIII but 240° outside range" },
            { text: "Arc length: radius = 8cm, angle = 45°", options: ["≈6.28 cm", "8 cm", "≈5.24 cm", "≈7.54 cm"], correct: "≈6.28 cm", hint: "45° = π/4 rad, s = 8 × π/4 = 2π ≈ 6.28 cm" },
            { text: "sin 45° = ?", options: ["√2/2", "1/2", "√3/2", "1"], correct: "√2/2", hint: "Standard value: sin 45° = √2/2 ≈ 0.707" },
            { text: "tan 30° = ?", options: ["√3/3", "√3", "1/2", "1"], correct: "√3/3", hint: "tan 30° = sin30°/cos30° = (1/2)/(√3/2)=1/√3=√3/3" },
            { text: "Solve 2 cos x = 1 for 0° ≤ x ≤ 360°", options: ["60° and 300°", "60° and 120°", "30° and 330°", "30° and 150°"], correct: "60° and 300°", hint: "cos x = 1/2 → x = 60° or 300°" },
            { text: "Convert 60° to radians", options: ["π/3", "π/4", "π/6", "π/2"], correct: "π/3", hint: "60° × π/180° = 60π/180 = π/3" },
            { text: "Minimum value of h(t)=30-8sin t", options: ["22", "30", "38", "8"], correct: "22", hint: "Minimum when sin t = 1: 30-8×1=22" }
        ]
    },
    vectors: {
        name: "Vectors & Geometry",
        icon: "fas fa-arrows-alt",
        order: 5,
        questions: [
            { text: "Gradient of line through P(2,5) and Q(8,17)", options: ["2", "12/6", "3", "4"], correct: "2", hint: "(17-5)/(8-2)=12/6=2" },
            { text: "Equation of line through (2,3) with gradient 4", options: ["y = 4x - 5", "y = 4x + 3", "y = 4x - 3", "y = 4x + 5"], correct: "y = 4x - 5", hint: "y-3=4(x-2) → y=4x-5" },
            { text: "Midpoint of A(1,3) and B(9,11)", options: ["(5,7)", "(10,14)", "(4,6)", "(8,12)"], correct: "(5,7)", hint: "((1+9)/2, (3+11)/2) = (5,7)" },
            { text: "Distance between C(2,3) and D(8,11)", options: ["10", "8", "12", "√100"], correct: "10", hint: "√[(8-2)²+(11-3)²] = √(36+64)=√100=10" },
            { text: "Cosine rule: find side c if a=5, b=7, angle C=120°", options: ["√109", "√84", "√74", "√129"], correct: "√109", hint: "c²=25+49-2×5×7×cos120°=74-70×(-0.5)=74+35=109" },
            { text: "Area of triangle with a=9, b=12, angle C=45°", options: ["38.18", "54", "27√2", "27"], correct: "38.18", hint: "Area = ½×9×12×sin45° = 54×0.7071=38.18" },
            { text: "Vector from A(3,5) to B(9,14)", options: ["(6,9)", "(12,19)", "(6,19)", "(12,9)"], correct: "(6,9)", hint: "B-A = (9-3, 14-5) = (6,9)" },
            { text: "Magnitude of vector (5,12)", options: ["13", "17", "25", "√119"], correct: "13", hint: "√(5²+12²)=√(25+144)=√169=13" },
            { text: "Dot product of (4,6) and (2,3)", options: ["26", "20", "24", "30"], correct: "26", hint: "4×2 + 6×3 = 8+18=26" },
            { text: "Equation of horizontal line through (4,9)", options: ["y = 9", "x = 4", "y = 4", "x = 9"], correct: "y = 9", hint: "Horizontal lines have constant y-coordinate" },
            { text: "Gradient of line through (-3,5) and (4,-2)", options: ["-1", "1", "-7", "7"], correct: "-1", hint: "(-2-5)/(4-(-3)) = -7/7 = -1" },
            { text: "Magnitude of vector (-8,15)", options: ["17", "23", "289", "7"], correct: "17", hint: "√(64+225)=√289=17" },
            { text: "Unit vector in direction of (5,12)", options: ["(5/13,12/13)", "(5,12)", "(0.38,0.92)", "Both a and c"], correct: "Both a and c", hint: "Divide by magnitude 13: (5/13,12/13) = (0.3846,0.9231)" },
            { text: "Equation of vertical line through (2,8)", options: ["x = 2", "y = 8", "x = 8", "y = 2"], correct: "x = 2", hint: "Vertical lines have constant x-coordinate" },
            { text: "Dot product of (2,5) and (-5,2)", options: ["0", "1", "-1", "2"], correct: "0", hint: "2×(-5) + 5×2 = -10+10=0 (perpendicular)" },
            { text: "Angle between vectors (2,0) and (0,3)", options: ["90°", "0°", "45°", "180°"], correct: "90°", hint: "Dot product=0 means perpendicular" },
            { text: "Midpoint of (-2,6) and (8,-4)", options: ["(3,1)", "(6,2)", "(5,1)", "(3,2)"], correct: "(3,1)", hint: "((-2+8)/2, (6+(-4))/2) = (3,1)" },
            { text: "Distance between (0,0) and (5,12)", options: ["13", "17", "25", "√119"], correct: "13", hint: "√(25+144)=13" },
            { text: "Equation of line through origin with gradient -2", options: ["y = -2x", "y = -2x + 1", "y = 2x", "x = -2y"], correct: "y = -2x", hint: "y = mx through origin, with m=-2" },
            { text: "Which vectors are parallel to (4,-6)?", options: ["(2,-3)", "(-4,6)", "(8,-12)", "All of these"], correct: "All of these", hint: "Scalar multiples: (2,-3)=0.5×(4,-6), (-4,6)=(-1)×(4,-6), (8,-12)=2×(4,-6)" }
        ]
    },
    statistics: {
        name: "Statistics & Probability",
        icon: "fas fa-chart-bar",
        order: 6,
        questions: [
            { text: "Data: 3, 5, 6, 6, 8, 9, 10, 12, 15, 18. Find the mean", options: ["9.2", "9", "10", "8.5"], correct: "9.2", hint: "Sum=92, n=10, 92/10=9.2" },
            { text: "For the same data, find the median", options: ["8.5", "8", "9", "9.5"], correct: "8.5", hint: "Middle values: 5th=8, 6th=9, average=8.5" },
            { text: "Find Q1 for: 3,5,6,6,8,9,10,12,15,18", options: ["6", "5.5", "6.5", "7"], correct: "6", hint: "Lower half: 3,5,6,6,8 → Q1=6" },
            { text: "Find Q3 for the same data", options: ["12", "11", "13", "12.5"], correct: "12", hint: "Upper half: 9,10,12,15,18 → Q3=12" },
            { text: "Calculate IQR for the data", options: ["6", "5", "7", "8"], correct: "6", hint: "IQR = Q3 - Q1 = 12 - 6 = 6" },
            { text: "Using 1.5×IQR rule, is 18 an outlier?", options: ["No, upper bound is 21", "Yes", "No, upper bound is 20", "Yes, bound is 18"], correct: "No, upper bound is 21", hint: "Upper bound = Q3 + 1.5×IQR = 12 + 9 = 21" },
            { text: "Data: 4, 6, 8, 8, 10. Find the mean", options: ["7.2", "7", "8", "6.8"], correct: "7.2", hint: "Sum=36, n=5, 36/5=7.2" },
            { text: "Calculate variance for 4,6,8,8,10", options: ["4.16", "4.8", "3.2", "5.6"], correct: "4.16", hint: "Mean=7.2, Σ(x-7.2)²=10.24+1.44+0.64+0.64+7.84=20.8, 20.8/5=4.16" },
            { text: "Standard deviation of 4,6,8,8,10 to 2 d.p.", options: ["2.04", "2.19", "1.79", "2.36"], correct: "2.04", hint: "√4.16=2.04" },
            { text: "In histogram with unequal widths, what represents frequency?", options: ["Area of bar", "Height of bar", "Width of bar", "Class midpoint"], correct: "Area of bar", hint: "Frequency = Frequency density × Class width" },
            { text: "Frequency density formula", options: ["Frequency ÷ Class Width", "Class Width ÷ Frequency", "Frequency × Class Width", "Frequency + Class Width"], correct: "Frequency ÷ Class Width", hint: "Frequency density = frequency / class width" },
            { text: "P(A ∪ B) formula", options: ["P(A)+P(B)-P(A∩B)", "P(A)+P(B)", "P(A)×P(B)", "P(A)+P(B)+P(A∩B)"], correct: "P(A)+P(B)-P(A∩B)", hint: "Addition rule for probability" },
            { text: "If P(A)=0.4, P(B)=0.5, P(A∩B)=0.2, find P(A∪B)", options: ["0.7", "0.9", "0.6", "0.8"], correct: "0.7", hint: "0.4+0.5-0.2=0.7" },
            { text: "Mutually exclusive events have:", options: ["P(A∩B)=0", "P(A∪B)=0", "P(A)=P(B)", "P(A∩B)=P(A)P(B)"], correct: "P(A∩B)=0", hint: "Cannot occur simultaneously" },
            { text: "Independent events satisfy:", options: ["P(A∩B)=P(A)P(B)", "P(A∩B)=0", "P(A∪B)=P(A)+P(B)", "P(A)=P(B)"], correct: "P(A∩B)=P(A)P(B)", hint: "Multiplication rule for independence" },
            { text: "From bag with 6 red, 4 blue, probability of picking red first?", options: ["0.6", "0.4", "0.5", "0.7"], correct: "0.6", hint: "6 red out of 10 total = 0.6" },
            { text: "Without replacement: P(Red then Red) from 6R,4B?", options: ["30/90", "36/100", "24/90", "30/100"], correct: "30/90", hint: "(6/10)×(5/9)=30/90=1/3" },
            { text: "Complement rule: P(A') = ?", options: ["1-P(A)", "P(A)-1", "1+P(A)", "P(A)"], correct: "1-P(A)", hint: "Probability of event not occurring" },
            { text: "Box plot shows which five values?", options: ["Min, Q1, Median, Q3, Max", "Mean, Median, Mode, Range, IQR", "Min, Mean, Median, Mode, Max", "Q1, Q2, Q3, Q4, Q5"], correct: "Min, Q1, Median, Q3, Max", hint: "Five-number summary" },
            { text: "Which measure is more robust to outliers?", options: ["Median and IQR", "Mean and Std Dev", "Mean and Range", "Mode and Range"], correct: "Median and IQR", hint: "Median is not affected by extreme values" }
        ]
    }
};

const TOPIC_ORDER = ['algebra', 'quadratics', 'functions', 'calculus', 'trigonometry', 'vectors', 'statistics'];

// Randomize questions when the app loads
function randomizeAllQuestions() {
    for (let topic in TOPICS) {
        TOPICS[topic].questions = TOPICS[topic].questions.map(q => randomizeQuestion(q));
    }
}

// Call this when initializing the game