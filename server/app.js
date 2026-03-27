require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { findSolution } = require('./solutions');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY is missing. Check server/.env');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function extractJSON(text) {
  try {
    // Try to find JSON object in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {}
  return null;
}

function generateGenericSolutions(problem, language = 'python') {
  const templates = {
    python: {
      brute: "def solve(input_data):\n    # Brute force: Check all possible combinations\n    result = None\n    for i in range(len(input_data)):\n        for j in range(i+1, len(input_data)):\n            # Process combinations\n            pass\n    return result",
      better: "def solve(input_data):\n    # Better: Use a dictionary or set for faster lookup\n    seen = set()\n    result = []\n    for item in input_data:\n        if item not in seen:\n            seen.add(item)\n            result.append(item)\n    return result",
      optimal: "def solve(input_data):\n    # Optimal: Use efficient data structures and algorithms\n    # Single pass with hash map or sorted approach\n    cache = {}\n    for item in input_data:\n        cache[item] = cache.get(item, 0) + 1\n    return sorted(cache.items())"
    },
    javascript: {
      brute: "function solve(inputData) {\n    // Brute force: Check all combinations\n    let result = null;\n    for (let i = 0; i < inputData.length; i++) {\n        for (let j = i + 1; j < inputData.length; j++) {\n            // Process combinations\n        }\n    }\n    return result;\n}",
      better: "function solve(inputData) {\n    // Better: Use Set for O(1) lookup\n    const seen = new Set();\n    const result = [];\n    for (const item of inputData) {\n        if (!seen.has(item)) {\n            seen.add(item);\n            result.push(item);\n        }\n    }\n    return result;\n}",
      optimal: "function solve(inputData) {\n    // Optimal: Single pass with Map\n    const cache = new Map();\n    inputData.forEach(item => {\n        cache.set(item, (cache.get(item) || 0) + 1);\n    });\n    return Array.from(cache.entries()).sort();\n}"
    },
    java: {
      brute: "public static Object solve(int[] input) {\n    // Brute force approach\n    for (int i = 0; i < input.length; i++) {\n        for (int j = i + 1; j < input.length; j++) {\n            // Check all combinations\n        }\n    }\n    return null;\n}",
      better: "public static Object solve(int[] input) {\n    // Better: Use HashSet for O(1) lookup\n    Set<Integer> seen = new HashSet<>();\n    List<Integer> result = new ArrayList<>();\n    for (int num : input) {\n        if (!seen.contains(num)) {\n            seen.add(num);\n            result.add(num);\n        }\n    }\n    return result;\n}",
      optimal: "public static Object solve(int[] input) {\n    // Optimal: Single pass with HashMap\n    Map<Integer, Integer> count = new HashMap<>();\n    for (int num : input) {\n        count.put(num, count.getOrDefault(num, 0) + 1);\n    }\n    return count.entrySet().stream().sorted().toList();\n}"
    },
    cpp: {
      brute: "vector<int> solve(vector<int>& input) {\n    // Brute force: O(n^2) solution\n    vector<int> result;\n    for (int i = 0; i < input.size(); i++) {\n        for (int j = i + 1; j < input.size(); j++) {\n            // Check combinations\n        }\n    }\n    return result;\n}",
      better: "vector<int> solve(vector<int>& input) {\n    // Better: Use unordered_set\n    unordered_set<int> seen;\n    vector<int> result;\n    for (int num : input) {\n        if (seen.find(num) == seen.end()) {\n            seen.insert(num);\n            result.push_back(num);\n        }\n    }\n    return result;\n}",
      optimal: "vector<int> solve(vector<int>& input) {\n    // Optimal: Single pass with map\n    unordered_map<int, int> count;\n    for (int num : input) count[num]++;\n    vector<int> result;\n    for (auto& p : count) result.push_back(p.first);\n    sort(result.begin(), result.end());\n    return result;\n}"
    }
  };

  const t = templates[language] || templates['python'];
  return {
    approaches: [
      {
        name: 'Brute Force Approach',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        code: t.brute,
        analysis: 'Explores all possible combinations exhaustively. Conceptually straightforward but inefficient for large inputs.'
      },
      {
        name: 'Better Approach',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        code: t.better,
        analysis: 'Uses hash structures (Set, HashMap) to reduce lookups from O(n) to O(1). Good balance between time and space.'
      },
      {
        name: 'Optimal Approach',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        code: t.optimal,
        analysis: 'Most efficient solution combining minimal iterations with optimal data structures. Best for interviews and production code.'
      }
    ]
  };
}

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

  const lang = (language || 'python').toLowerCase();

  // PRIORITY 1: Check solutions database for accurate, verified solutions
  const dbSolution = findSolution(problem, lang);
  if (dbSolution) {
    const solutions = dbSolution.solutions[lang] || dbSolution.solutions['python'];
    const complexities = dbSolution.complexities;
    const analysis = dbSolution.analysis;

    const response = {
      title: dbSolution.title,
      description: dbSolution.description,
      leetcodeNum: dbSolution.leetcodeNum,
      source: 'LeetCode Database',
      approaches: [
        {
          name: 'Brute Force Approach',
          timeComplexity: complexities.brute.time,
          spaceComplexity: complexities.brute.space,
          code: solutions.brute,
          analysis: analysis.brute
        },
        {
          name: 'Better Approach',
          timeComplexity: complexities.better.time,
          spaceComplexity: complexities.better.space,
          code: solutions.better,
          analysis: analysis.better
        },
        {
          name: 'Optimal Approach',
          timeComplexity: complexities.optimal.time,
          spaceComplexity: complexities.optimal.space,
          code: solutions.optimal,
          analysis: analysis.optimal
        }
      ]
    };
    
    return res.json(response);
  }

  // PRIORITY 2: Try Gemini API for problems not in database
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `You are a coding expert. Given the coding problem: "${problem}", provide exactly 3 different algorithmic solutions in ${lang}: 
1. Brute force approach
2. Better approach  
3. Optimal approach

For each approach, provide:
- Approach name
- Time complexity (e.g., O(n), O(n²))
- Space complexity
- Complete, syntactically correct, runnable code in ${lang}
- Detailed analysis explaining the approach

CRITICAL: Return ONLY a valid JSON object with this exact structure (no markdown, no comments):
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
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean the text to extract JSON
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Try multiple parsing strategies
    let data = null;
    try {
      data = JSON.parse(text);
    } catch (e) {
      // Try to extract JSON from malformed response
      data = extractJSON(text);
    }

    if (data && data.approaches && Array.isArray(data.approaches) && data.approaches.length >= 3) {
      return res.json({
        source: 'Gemini AI',
        approaches: data.approaches
      });
    }

    // If parsing fails, use fallback
    const fallback = fallbackSolutions(problem, lang);
    if (fallback) {
      return res.json({
        source: 'Fallback (Generic)',
        approaches: fallback.approaches
      });
    }

    // Last resort: generate generic solutions
    return res.json({
      source: 'Fallback (Generic)',
      approaches: generateGenericSolutions(problem, lang).approaches
    });
  } catch (error) {
    console.error('Gemini Error:', error);
    
    // PRIORITY 3: Fallback solutions
    const fallback = fallbackSolutions(problem, lang);
    if (fallback) {
      return res.json({
        source: 'Fallback (Generic)',
        approaches: fallback.approaches
      });
    }

    // Last resort: generic solutions
    return res.json({
      source: 'Fallback (Generic)',
      approaches: generateGenericSolutions(problem, lang).approaches
    });
  }
});

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API is live' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
  console.log(`GEMINI_API_KEY loaded: ${!!process.env.GEMINI_API_KEY}`);
});