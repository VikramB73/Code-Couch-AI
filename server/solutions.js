// Comprehensive LeetCode Solutions Database
// Format: problem_key -> { leetcodeNum, title, solutions_by_language }

const solutions = {
  '1-two-sum': {
    leetcodeNum: 1,
    title: 'Two Sum',
    description: 'Given an array of integers and a target, find two numbers that add up to the target',
    solutions: {
      python: {
        brute: `def twoSum(nums, target):
    for i in range(len(nums)):
        for j in range(i + 1, len(nums)):
            if nums[i] + nums[j] == target:
                return [i, j]
    return []`,
        better: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
        optimal: `def twoSum(nums, target):
    num_map = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in num_map:
            return [num_map[complement], i]
        num_map[num] = i
    return []`
      },
      javascript: {
        brute: `var twoSum = function(nums, target) {
    for (let i = 0; i < nums.length; i++) {
        for (let j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] === target) {
                return [i, j];
            }
        }
    }
    return [];
};`,
        better: `var twoSum = function(nums, target) {
    const seen = {};
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (complement in seen) {
            return [seen[complement], i];
        }
        seen[nums[i]] = i;
    }
    return [];
};`,
        optimal: `var twoSum = function(nums, target) {
    const numMap = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (numMap.has(complement)) {
            return [numMap.get(complement), i];
        }
        numMap.set(nums[i], i);
    }
    return [];
};`
      },
      java: {
        brute: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++) {
            for (int j = i + 1; j < nums.length; j++) {
                if (nums[i] + nums[j] == target) {
                    return new int[] {i, j};
                }
            }
        }
        return new int[] {};
    }
}`,
        better: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (seen.containsKey(complement)) {
                return new int[] {seen.get(complement), i};
            }
            seen.put(nums[i], i);
        }
        return new int[] {};
    }
}`,
        optimal: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> numMap = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (numMap.containsKey(complement)) {
                return new int[] {numMap.get(complement), i};
            }
            numMap.put(nums[i], i);
        }
        return new int[] {};
    }
}`
      },
      cpp: {
        brute: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        for (int i = 0; i < nums.size(); i++) {
            for (int j = i + 1; j < nums.size(); j++) {
                if (nums[i] + nums[j] == target) {
                    return {i, j};
                }
            }
        }
        return {};
    }
};`,
        better: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> seen;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (seen.count(complement)) {
                return {seen[complement], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};`,
        optimal: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> numMap;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (numMap.find(complement) != numMap.end()) {
                return {numMap[complement], i};
            }
            numMap[nums[i]] = i;
        }
        return {};
    }
};`
      }
    },
    complexities: {
      brute: { time: 'O(n²)', space: 'O(1)' },
      better: { time: 'O(n)', space: 'O(n)' },
      optimal: { time: 'O(n)', space: 'O(n)' }
    },
    analysis: {
      brute: 'Check all pairs of numbers. Simple to understand but inefficient for large arrays.',
      better: 'Use a hash map to store seen numbers and check for complements in O(1) time.',
      optimal: 'Single-pass hash map solution. Optimal time and space efficiency.'
    }
  },

  '42-trapping-rain-water': {
    leetcodeNum: 42,
    title: 'Trapping Rain Water',
    description: 'Given n non-negative integers representing an elevation map, compute how much water it can trap after raining',
    solutions: {
      python: {
        brute: `def trap(height):
    water = 0
    for i in range(len(height)):
        left_max = max(height[:i+1]) if i >= 0 else 0
        right_max = max(height[i:]) if i < len(height) else 0
        water += min(left_max, right_max) - height[i]
    return water`,
        better: `def trap(height):
    n = len(height)
    if n == 0:
        return 0
    left_max = [0] * n
    right_max = [0] * n
    left_max[0] = height[0]
    right_max[n-1] = height[n-1]
    for i in range(1, n):
        left_max[i] = max(left_max[i-1], height[i])
    for i in range(n-2, -1, -1):
        right_max[i] = max(right_max[i+1], height[i])
    water = 0
    for i in range(n):
        water += min(left_max[i], right_max[i]) - height[i]
    return water`,
        optimal: `def trap(height):
    left, right = 0, len(height) - 1
    water = 0
    left_max, right_max = 0, 0
    while left < right:
        if height[left] < height[right]:
            left_max = max(left_max, height[left])
            water += left_max - height[left]
            left += 1
        else:
            right_max = max(right_max, height[right])
            water += right_max - height[right]
            right -= 1
    return water`
      },
      javascript: {
        brute: `var trap = function(height) {
    let water = 0;
    for (let i = 0; i < height.length; i++) {
        let leftMax = Math.max(...height.slice(0, i + 1));
        let rightMax = Math.max(...height.slice(i));
        water += Math.min(leftMax, rightMax) - height[i];
    }
    return water;
};`,
        better: `var trap = function(height) {
    const n = height.length;
    if (n === 0) return 0;
    const leftMax = new Array(n);
    const rightMax = new Array(n);
    leftMax[0] = height[0];
    rightMax[n-1] = height[n-1];
    for (let i = 1; i < n; i++) {
        leftMax[i] = Math.max(leftMax[i-1], height[i]);
    }
    for (let i = n-2; i >= 0; i--) {
        rightMax[i] = Math.max(rightMax[i+1], height[i]);
    }
    let water = 0;
    for (let i = 0; i < n; i++) {
        water += Math.min(leftMax[i], rightMax[i]) - height[i];
    }
    return water;
};`,
        optimal: `var trap = function(height) {
    let left = 0, right = height.length - 1;
    let water = 0, leftMax = 0, rightMax = 0;
    while (left < right) {
        if (height[left] < height[right]) {
            leftMax = Math.max(leftMax, height[left]);
            water += leftMax - height[left];
            left++;
        } else {
            rightMax = Math.max(rightMax, height[right]);
            water += rightMax - height[right];
            right--;
        }
    }
    return water;
};`
      },
      java: {
        brute: `class Solution {
    public int trap(int[] height) {
        int water = 0;
        for (int i = 0; i < height.length; i++) {
            int leftMax = 0, rightMax = 0;
            for (int j = 0; j <= i; j++) leftMax = Math.max(leftMax, height[j]);
            for (int j = i; j < height.length; j++) rightMax = Math.max(rightMax, height[j]);
            water += Math.min(leftMax, rightMax) - height[i];
        }
        return water;
    }
}`,
        better: `class Solution {
    public int trap(int[] height) {
        int n = height.length;
        if (n == 0) return 0;
        int[] leftMax = new int[n];
        int[] rightMax = new int[n];
        leftMax[0] = height[0];
        rightMax[n-1] = height[n-1];
        for (int i = 1; i < n; i++) {
            leftMax[i] = Math.max(leftMax[i-1], height[i]);
        }
        for (int i = n-2; i >= 0; i--) {
            rightMax[i] = Math.max(rightMax[i+1], height[i]);
        }
        int water = 0;
        for (int i = 0; i < n; i++) {
            water += Math.min(leftMax[i], rightMax[i]) - height[i];
        }
        return water;
    }
}`,
        optimal: `class Solution {
    public int trap(int[] height) {
        int left = 0, right = height.length - 1;
        int water = 0, leftMax = 0, rightMax = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                leftMax = Math.max(leftMax, height[left]);
                water += leftMax - height[left];
                left++;
            } else {
                rightMax = Math.max(rightMax, height[right]);
                water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
}`
      },
      cpp: {
        brute: `class Solution {
public:
    int trap(vector<int>& height) {
        int water = 0;
        for (int i = 0; i < height.size(); i++) {
            int leftMax = 0, rightMax = 0;
            for (int j = 0; j <= i; j++) leftMax = max(leftMax, height[j]);
            for (int j = i; j < height.size(); j++) rightMax = max(rightMax, height[j]);
            water += min(leftMax, rightMax) - height[i];
        }
        return water;
    }
};`,
        better: `class Solution {
public:
    int trap(vector<int>& height) {
        int n = height.size();
        if (n == 0) return 0;
        vector<int> leftMax(n), rightMax(n);
        leftMax[0] = height[0];
        rightMax[n-1] = height[n-1];
        for (int i = 1; i < n; i++) {
            leftMax[i] = max(leftMax[i-1], height[i]);
        }
        for (int i = n-2; i >= 0; i--) {
            rightMax[i] = max(rightMax[i+1], height[i]);
        }
        int water = 0;
        for (int i = 0; i < n; i++) {
            water += min(leftMax[i], rightMax[i]) - height[i];
        }
        return water;
    }
};`,
        optimal: `class Solution {
public:
    int trap(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int water = 0, leftMax = 0, rightMax = 0;
        while (left < right) {
            if (height[left] < height[right]) {
                leftMax = max(leftMax, height[left]);
                water += leftMax - height[left];
                left++;
            } else {
                rightMax = max(rightMax, height[right]);
                water += rightMax - height[right];
                right--;
            }
        }
        return water;
    }
};`
      }
    },
    complexities: {
      brute: { time: 'O(n²)', space: 'O(1)' },
      better: { time: 'O(n)', space: 'O(n)' },
      optimal: { time: 'O(n)', space: 'O(1)' }
    },
    analysis: {
      brute: 'For each position, find max height on left and right. Inefficient due to repeated calculations.',
      better: 'Pre-compute left and right max arrays. Better space-time tradeoff.',
      optimal: 'Two-pointer approach tracking max on the fly. Best solution with minimal space.'
    }
  },

  'fibonacci': {
    leetcodeNum: null,
    title: 'Fibonacci Number',
    description: 'Generate the Fibonacci sequence or find the nth Fibonacci number',
    solutions: {
      python: {
        brute: `def fib(n):
    if n <= 1:
        return n
    return fib(n-1) + fib(n-2)`,
        better: `def fib(n):
    if n <= 1:
        return n
    a, b = 0, 1
    for _ in range(2, n+1):
        a, b = b, a + b
    return b`,
        optimal: `def fib(n):
    if n <= 1:
        return n
    dp = [0, 1] + [0] * (n-1)
    for i in range(2, n+1):
        dp[i] = dp[i-1] + dp[i-2]
    return dp[n]`
      },
      javascript: {
        brute: `var fib = function(n) {
    if (n <= 1) return n;
    return fib(n-1) + fib(n-2);
};`,
        better: `var fib = function(n) {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
};`,
        optimal: `var fib = function(n) {
    if (n <= 1) return n;
    const dp = [0, 1];
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i-1] + dp[i-2];
    }
    return dp[n];
};`
      },
      java: {
        brute: `class Solution {
    public int fib(int n) {
        if (n <= 1) return n;
        return fib(n-1) + fib(n-2);
    }
}`,
        better: `class Solution {
    public int fib(int n) {
        if (n <= 1) return n;
        int a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            int temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }
}`,
        optimal: `class Solution {
    public int fib(int n) {
        if (n <= 1) return n;
        int[] dp = new int[n+1];
        dp[0] = 0; dp[1] = 1;
        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i-1] + dp[i-2];
        }
        return dp[n];
    }
}`
      },
      cpp: {
        brute: `class Solution {
public:
    int fib(int n) {
        if (n <= 1) return n;
        return fib(n-1) + fib(n-2);
    }
};`,
        better: `class Solution {
public:
    int fib(int n) {
        if (n <= 1) return n;
        int a = 0, b = 1;
        for (int i = 2; i <= n; i++) {
            int temp = a + b;
            a = b;
            b = temp;
        }
        return b;
    }
};`,
        optimal: `class Solution {
public:
    int fib(int n) {
        if (n <= 1) return n;
        vector<int> dp(n+1);
        dp[0] = 0; dp[1] = 1;
        for (int i = 2; i <= n; i++) {
            dp[i] = dp[i-1] + dp[i-2];
        }
        return dp[n];
    }
};`
      }
    },
    complexities: {
      brute: { time: 'O(2^n)', space: 'O(n)' },
      better: { time: 'O(n)', space: 'O(1)' },
      optimal: { time: 'O(n)', space: 'O(n)' }
    },
    analysis: {
      brute: 'Direct recursive implementation. Exponential time due to repeated calculations.',
      better: 'Iterative approach with two variables. Linear time, constant space.',
      optimal: 'Dynamic programming with array. Good for full sequence generation.'
    }
  }
};

function findSolution(query, language = 'python') {
  query = query.toLowerCase().trim();
  
  // Check for LeetCode problem number
  const leetcodeMatch = query.match(/leetcode\s*(\d+)/i) || query.match(/^(\d+)\s*-/);
  if (leetcodeMatch) {
    const problemNum = leetcodeMatch[1];
    for (const key in solutions) {
      if (solutions[key].leetcodeNum === parseInt(problemNum)) {
        return solutions[key];
      }
    }
  }

  // Check for exact problem key
  for (const key in solutions) {
    if (query.includes(key.split('-').join(' ')) || 
        query.includes(solutions[key].title.toLowerCase())) {
      return solutions[key];
    }
  }

  // Fuzzy matching for common keywords
  for (const key in solutions) {
    const title = solutions[key].title.toLowerCase();
    if (query.includes('fib') && title.includes('fib')) return solutions[key];
    if (query.includes('water') && query.includes('trap') && title.includes('water')) return solutions[key];
    if (query.includes('two') && query.includes('sum') && title.includes('two')) return solutions[key];
  }

  return null;
}

module.exports = { solutions, findSolution };
