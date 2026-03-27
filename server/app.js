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

  if (problem.toLowerCase().includes('water') && problem.toLowerCase().includes('trap')) {
    let codeTemplate = {
      python: {
        brute: "def trap(height):\n    water = 0\n    for i in range(len(height)):\n        left_max = max(height[:i+1])\n        right_max = max(height[i:])\n        water += min(left_max, right_max) - height[i]\n    return water",
        better: "def trap(height):\n    n = len(height)\n    left_max = [0] * n\n    right_max = [0] * n\n    left_max[0] = height[0]\n    right_max[n-1] = height[n-1]\n    for i in range(1, n):\n        left_max[i] = max(left_max[i-1], height[i])\n        right_max[n-1-i] = max(right_max[n-i], height[n-1-i])\n    water = sum(min(left_max[i], right_max[i]) - height[i] for i in range(n))\n    return water",
        optimal: "def trap(height):\n    left, right = 0, len(height) - 1\n    water = 0\n    left_max, right_max = 0, 0\n    while left < right:\n        if height[left] < height[right]:\n            left_max = max(left_max, height[left])\n            water += left_max - height[left]\n            left += 1\n        else:\n            right_max = max(right_max, height[right])\n            water += right_max - height[right]\n            right -= 1\n    return water"
      },
      javascript: {
        brute: "function trap(height) {\n    let water = 0;\n    for (let i = 0; i < height.length; i++) {\n        let leftMax = Math.max(...height.slice(0, i + 1));\n        let rightMax = Math.max(...height.slice(i));\n        water += Math.min(leftMax, rightMax) - height[i];\n    }\n    return water;\n}",
        better: "function trap(height) {\n    const n = height.length;\n    const leftMax = new Array(n);\n    const rightMax = new Array(n);\n    leftMax[0] = height[0];\n    rightMax[n-1] = height[n-1];\n    for (let i = 1; i < n; i++) {\n        leftMax[i] = Math.max(leftMax[i-1], height[i]);\n        rightMax[n-1-i] = Math.max(rightMax[n-i], height[n-1-i]);\n    }\n    let water = 0;\n    for (let i = 0; i < n; i++) water += Math.min(leftMax[i], rightMax[i]) - height[i];\n    return water;\n}",
        optimal: "function trap(height) {\n    let left = 0, right = height.length - 1;\n    let water = 0, leftMax = 0, rightMax = 0;\n    while (left < right) {\n        if (height[left] < height[right]) {\n            leftMax = Math.max(leftMax, height[left]);\n            water += leftMax - height[left];\n            left++;\n        } else {\n            rightMax = Math.max(rightMax, height[right]);\n            water += rightMax - height[right];\n            right--;\n        }\n    }\n    return water;\n}"
      },
      java: {
        brute: "public static int trap(int[] height) {\n    int water = 0;\n    for (int i = 0; i < height.length; i++) {\n        int leftMax = 0, rightMax = 0;\n        for (int j = 0; j <= i; j++) leftMax = Math.max(leftMax, height[j]);\n        for (int j = i; j < height.length; j++) rightMax = Math.max(rightMax, height[j]);\n        water += Math.min(leftMax, rightMax) - height[i];\n    }\n    return water;\n}",
        better: "public static int trap(int[] height) {\n    int n = height.length;\n    int[] leftMax = new int[n];\n    int[] rightMax = new int[n];\n    leftMax[0] = height[0];\n    rightMax[n-1] = height[n-1];\n    for (int i = 1; i < n; i++) {\n        leftMax[i] = Math.max(leftMax[i-1], height[i]);\n        rightMax[n-1-i] = Math.max(rightMax[n-i], height[n-1-i]);\n    }\n    int water = 0;\n    for (int i = 0; i < n; i++) water += Math.min(leftMax[i], rightMax[i]) - height[i];\n    return water;\n}",
        optimal: "public static int trap(int[] height) {\n    int left = 0, right = height.length - 1;\n    int water = 0, leftMax = 0, rightMax = 0;\n    while (left < right) {\n        if (height[left] < height[right]) {\n            leftMax = Math.max(leftMax, height[left]);\n            water += leftMax - height[left];\n            left++;\n        } else {\n            rightMax = Math.max(rightMax, height[right]);\n            water += rightMax - height[right];\n            right--;\n        }\n    }\n    return water;\n}"
      },
      cpp: {
        brute: "int trap(vector<int>& height) {\n    int water = 0;\n    for (int i = 0; i < height.size(); i++) {\n        int leftMax = *max_element(height.begin(), height.begin() + i + 1);\n        int rightMax = *max_element(height.begin() + i, height.end());\n        water += min(leftMax, rightMax) - height[i];\n    }\n    return water;\n}",
        better: "int trap(vector<int>& height) {\n    int n = height.size();\n    vector<int> leftMax(n), rightMax(n);\n    leftMax[0] = height[0];\n    rightMax[n-1] = height[n-1];\n    for (int i = 1; i < n; i++) {\n        leftMax[i] = max(leftMax[i-1], height[i]);\n        rightMax[n-1-i] = max(rightMax[n-i], height[n-1-i]);\n    }\n    int water = 0;\n    for (int i = 0; i < n; i++) water += min(leftMax[i], rightMax[i]) - height[i];\n    return water;\n}",
        optimal: "int trap(vector<int>& height) {\n    int left = 0, right = height.size() - 1;\n    int water = 0, leftMax = 0, rightMax = 0;\n    while (left < right) {\n        if (height[left] < height[right]) {\n            leftMax = max(leftMax, height[left]);\n            water += leftMax - height[left];\n            left++;\n        } else {\n            rightMax = max(rightMax, height[right]);\n            water += rightMax - height[right];\n            right--;\n        }\n    }\n    return water;\n}"
      }
    };

    const c = codeTemplate[language] || codeTemplate['python'];
    return {
      approaches: [
        {
          name: 'Brute Force (Max Finding)',
          timeComplexity: 'O(n²)',
          spaceComplexity: 'O(1)',
          code: c.brute,
          analysis: 'For each bar, find the maximum height on its left and right. Water trapped at that position is the minimum of the two maxes minus the bar height. Simple but inefficient due to repeated max calculations.'
        },
        {
          name: 'Better (Prefix & Suffix Arrays)',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(n)',
          code: c.better,
          analysis: 'Pre-compute left max and right max for each position using two passes. Then calculate trapped water in a third pass. Eliminates repeated calculations at the cost of extra space.'
        },
        {
          name: 'Optimal (Two-Pointer)',
          timeComplexity: 'O(n)',
          spaceComplexity: 'O(1)',
          code: c.optimal,
          analysis: 'Use two pointers moving inward. Track left max and right max on the fly. Move the pointer with smaller height to guarantee correct water calculation. Most efficient and elegant solution.'
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