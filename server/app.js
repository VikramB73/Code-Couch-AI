require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is missing. Check server/.env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function fallbackSolutions(problem, language) {
  if (problem.toLowerCase().includes('fibonacci')) {
    let codeTemplate = {
      python: {
        brute: "def fib(n):\n    if n <= 1:\n        return n\n    return fib(n-1) + fib(n-2)",
        better: "def fib(n):\n    if n <= 1:\n        return n\n    a, b = 0, 1\n    for _ in range(2, n+1):\n        a, b = b, a + b\n    return b",
        optimal: "def fib(n):\n    if n <= 1:\n        return n\n    table = [0, 1] + [0] * (n-1)\n    for i in range(2, n+1):\n        table[i] = table[i-1] + table[i-2]\n    return table[n]"
      },
      javascript: {
        brute: "function fib(n) { if (n <= 1) return n; return fib(n-1) + fib(n-2); }",
        better: "function fib(n) { if (n <= 1) return n; let a = 0, b = 1; for (let i = 2; i <= n; i++) { [a, b] = [b, a+b]; } return b; }",
        optimal: "function fib(n) { if (n <= 1) return n; const dp = [0, 1]; for (let i = 2; i <= n; i++) dp[i] = dp[i-1] + dp[i-2]; return dp[n]; }"
      },
      java: {
        brute: "public static int fib(int n) {\n    if (n <= 1) return n;\n    return fib(n-1) + fib(n-2);\n}",
        better: "public static int fib(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; i++) {\n        int temp = a + b;\n        a = b;\n        b = temp;\n    }\n    return b;\n}",
        optimal: "public static int fib(int n) {\n    if (n <= 1) return n;\n    int[] dp = new int[n+1];\n    dp[0] = 0; dp[1] = 1;\n    for (int i = 2; i <= n; i++) {\n        dp[i] = dp[i-1] + dp[i-2];\n    }\n    return dp[n];\n}"
      },
      cpp: {
        brute: "int fib(int n) {\n    if (n <= 1) return n;\n    return fib(n-1) + fib(n-2);\n}",
        better: "int fib(int n) {\n    if (n <= 1) return n;\n    int a = 0, b = 1;\n    for (int i = 2; i <= n; i++) {\n        int temp = a + b;\n        a = b;\n        b = temp;\n    }\n    return b;\n}",
        optimal: "int fib(int n) {\n    if (n <= 1) return n;\n    vector<int> dp(n+1);\n    dp[0] = 0; dp[1] = 1;\n    for (int i = 2; i <= n; i++) {\n        dp[i] = dp[i-1] + dp[i-2];\n    }\n    return dp[n];\n}"
      }
    };

    const c = codeTemplate[language] || codeTemplate['python'];
    return {
      approaches: [
        {
          name: 'Brute Force (Recursive)',
          timeComplexity: 'O(2^n)',
          spaceComplexity: 'O(n) recursion depth',
          code: c.brute,
          analysis: 'Recursive approach that directly implements the mathematical definition. Causes exponential repeated calculations but is conceptually simple.'
        },
        {
          name: 'Better (Iterative)',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          code: c.better,
          analysis: 'Uses two variables to track the last two Fibonacci numbers, building up from 0 upward. No extra space needed, significantly faster than recursion.'
        },
        {
          name: 'Optimal (Dynamic Programming / Tabulation)',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          code: c.optimal,
          analysis: 'Stores all results in an array to avoid recomputation. Useful when you need the entire sequence or plan to query multiple values.'
        }
      ]
    };
  }
  return null;
}

app.post('/generate-solutions', async (req, res) => {
  const { problem, language } = req.body;
  if (!problem) {
    return res.status(400).json({ error: 'Problem description is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a coding expert. Given the coding problem or topic: "${problem}", provide exactly 3 different algorithmic solutions in ${language}: 
1. Brute force approach
2. Better approach  
3. Optimal approach

For each approach, structure your response as:
- Approach name
- Time complexity
- Space complexity
- Complete code in ${language}
- Detailed analysis explaining the approach

Return ONLY a valid JSON object with this exact structure:
{
  "approaches": [
    {
      "name": "string",
      "timeComplexity": "string",
      "spaceComplexity": "string", 
      "code": "string",
      "analysis": "string"
    },
    {...},
    {...}
  ]
}

Ensure the code is syntactically correct and runnable. If the problem is a topic like "fibonacci series", provide solutions for common problems related to it, such as generating the series or finding the nth number.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean the text to extract JSON
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    const data = JSON.parse(text);
    res.json(data);
  } catch (error) {
    console.error('Error:', error);
    const fallback = fallbackSolutions(problem, language || 'python');
    if (fallback) {
      return res.json(fallback);
    }
    res.status(500).json({ error: 'Failed to generate solutions. Please try rephrasing your problem.' });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API is live' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`GEMINI_API_KEY loaded: ${!!process.env.GEMINI_API_KEY}`);
});