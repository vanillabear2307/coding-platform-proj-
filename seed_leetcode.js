require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("./server/model/question");

const questions = [
  {
    language: "python",
    title: "Merge Sorted Array (LC-88)",
    medium: "easy",
    instruction: "Merge two sorted arrays nums1 and nums2 in-place as one sorted array.",
    tag: "array",
    description: "You are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order, and two integers `m` and `n`, representing the number of elements in `nums1` and `nums2` respectively.\n\nMerge `nums1` and `nums2` into a single array sorted in non-decreasing order.\n\n### Input Format\n- Line 1: two integers `m` and `n` separated by a space.\n- Line 2: `m` space-separated integers representing `nums1`.\n- Line 3: `n` space-separated integers representing `nums2`.\n\n### Output Format\n- Space-separated integers representing the merged sorted array.",
    solution: "```python\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines: \n        return\n    m = int(lines[0])\n    n = int(lines[1])\n    nums1 = [int(x) for x in lines[2:2+m]]\n    nums2 = [int(x) for x in lines[2+m:2+m+n]]\n    res = sorted(nums1 + nums2)\n    print(*(res))\n\nsolve()\n```",
    testCases: [
      { input: "3 3\n1 2 3\n2 5 6", output: "1 2 2 3 5 6" },
      { input: "1 0\n1\n", output: "1" },
      { input: "0 1\n\n1", output: "1" }
    ]
  },
  {
    language: "python",
    title: "Valid Anagram (LC-242)",
    medium: "easy",
    instruction: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.",
    tag: "string",
    description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\n\nAn anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.\n\n### Input Format\n- Line 1: string `s`\n- Line 2: string `t`\n\n### Output Format\n- `true` or `false` (in lowercase)",
    solution: "```python\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if len(lines) < 2:\n        return\n    s, t = lines[0], lines[1]\n    print(\"true\" if sorted(s) == sorted(t) else \"false\")\n\nsolve()\n```",
    testCases: [
      { input: "anagram\nnagaram", output: "true" },
      { input: "rat\ncar", output: "false" }
    ]
  },
  {
    language: "python",
    title: "Rotate Array (LC-189)",
    medium: "medium",
    instruction: "Given an array, rotate the array to the right by k steps, where k is non-negative.",
    tag: "array",
    description: "Given an integer array `nums`, rotate the array to the right by `k` steps, where `k` is non-negative.\n\n### Input Format\n- Line 1: two integers `n` and `k` (the size of the array and the number of steps to rotate).\n- Line 2: `n` space-separated integers representing the array elements.\n\n### Output Format\n- Space-separated integers representing the rotated array.",
    solution: "```python\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0])\n    k = int(lines[1])\n    nums = [int(x) for x in lines[2:2+n]]\n    k = k % n\n    nums = nums[-k:] + nums[:-k]\n    print(*nums)\n\nsolve()\n```",
    testCases: [
      { input: "7 3\n1 2 3 4 5 6 7", output: "5 6 7 1 2 3 4" },
      { input: "4 2\n-1 -100 3 99", output: "3 99 -1 -100" }
    ]
  },
  {
    language: "python",
    title: "Palindrome Number (LC-9)",
    medium: "easy",
    instruction: "Determine whether an integer is a palindrome. Return true or false.",
    tag: "algorithms",
    description: "Given an integer `x`, return `true` if `x` is a palindrome, and `false` otherwise.\n\n### Input Format\n- A single integer `x`.\n\n### Output Format\n- `true` or `false` (in lowercase)",
    solution: "```python\nimport sys\n\ndef solve():\n    val = sys.stdin.read().strip()\n    if not val:\n        return\n    print(\"true\" if val == val[::-1] else \"false\")\n\nsolve()\n```",
    testCases: [
      { input: "121", output: "true" },
      { input: "-121", output: "false" },
      { input: "10", output: "false" }
    ]
  },
  {
    language: "python",
    title: "Valid Palindrome (LC-125)",
    medium: "easy",
    instruction: "Determine if a string is a palindrome, considering only alphanumeric characters and ignoring cases.",
    tag: "string",
    description: "A phrase is a palindrome if, after converting all uppercase characters into lowercase characters and removing all non-alphanumeric characters, it reads the same forward and backward.\n\n### Input Format\n- A single line containing the string.\n\n### Output Format\n- `true` or `false` (in lowercase)",
    solution: "```python\nimport sys\n\ndef solve():\n    s = sys.stdin.read().strip()\n    clean = \"\".join(c.lower() for c in s if c.isalnum())\n    print(\"true\" if clean == clean[::-1] else \"false\")\n\nsolve()\n```",
    testCases: [
      { input: "A man, a plan, a canal: Panama", output: "true" },
      { input: "race a car", output: "false" },
      { input: " ", output: "true" }
    ]
  },
  {
    language: "python",
    title: "Two Sum (LC-1)",
    medium: "easy",
    instruction: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.",
    tag: "array",
    description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.\n\n### Input Format\n- Line 1: two integers `n` (size of array) and `target`.\n- Line 2: `n` space-separated integers representing the array elements.\n\n### Output Format\n- Two space-separated integers representing the indices in ascending order.",
    solution: "```python\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0])\n    target = int(lines[1])\n    nums = [int(x) for x in lines[2:2+n]]\n    lookup = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in lookup:\n            print(f\"{lookup[diff]} {i}\")\n            break\n        lookup[num] = i\n\nsolve()\n```",
    testCases: [
      { input: "4 9\n2 7 11 15", output: "0 1" },
      { input: "3 6\n3 2 4", output: "1 2" },
      { input: "2 6\n3 3", output: "0 1" }
    ]
  },
  {
    language: "python",
    title: "Binary Search (LC-704)",
    medium: "easy",
    instruction: "Given a sorted array of integers nums and an integer target, write a function to search target in nums.",
    tag: "algorithms",
    description: "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.\n\n### Input Format\n- Line 1: two integers `n` (size of the array) and `target`.\n- Line 2: `n` space-separated integers representing the sorted array.\n\n### Output Format\n- The index of target, or `-1` if target is not found.",
    solution: "```python\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0])\n    target = int(lines[1])\n    nums = [int(x) for x in lines[2:2+n]]\n    l, r = 0, n - 1\n    found = -1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target:\n            found = mid\n            break\n        elif nums[mid] < target:\n            l = mid + 1\n        else:\n            r = mid - 1\n    print(found)\n\nsolve()\n```",
    testCases: [
      { input: "6 9\n-1 0 3 5 9 12", output: "4" },
      { input: "6 2\n-1 0 3 5 9 12", output: "-1" }
    ]
  },
  {
    language: "python",
    title: "Reverse String (LC-344)",
    medium: "easy",
    instruction: "Write a function that reverses a string.",
    tag: "string",
    description: "Write a function that reverses a string.\n\n### Input Format\n- A single string containing the characters.\n\n### Output Format\n- The reversed string.",
    solution: "```python\nimport sys\n\ndef solve():\n    s = sys.stdin.read().strip()\n    print(s[::-1])\n\nsolve()\n```",
    testCases: [
      { input: "hello", output: "olleh" },
      { input: "Hannah", output: "hannaH" }
    ]
  },
  {
    language: "python",
    title: "Move Zeroes (LC-283)",
    medium: "easy",
    instruction: "Move all 0's in an array to the end of it while maintaining the relative order of the non-zero elements.",
    tag: "array",
    description: "Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative order of the non-zero elements.\n\nNote that you must do this in-place without making a copy of the array.\n\n### Input Format\n- Line 1: an integer `n` (size of the array).\n- Line 2: `n` space-separated integers representing the array elements.\n\n### Output Format\n- Space-separated integers representing the modified array.",
    solution: "```python\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:1+n]]\n    non_zeros = [x for x in nums if x != 0]\n    zeros = [0] * (n - len(non_zeros))\n    print(*(non_zeros + zeros))\n\nsolve()\n```",
    testCases: [
      { input: "5\n0 1 0 3 12", output: "1 3 12 0 0" },
      { input: "1\n0", output: "0" }
    ]
  },
  {
    language: "python",
    title: "Best Time to Buy and Sell Stock (LC-121)",
    medium: "easy",
    instruction: "Find the maximum profit you can achieve from buying and selling a single stock on different days.",
    tag: "array",
    description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`-th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return `0`.\n\n### Input Format\n- Line 1: an integer `n` (number of days).\n- Line 2: `n` space-separated integers representing the stock prices.\n\n### Output Format\n- An integer representing the maximum profit.",
    solution: "```python\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0])\n    prices = [int(x) for x in lines[1:1+n]]\n    min_price = float('inf')\n    max_profit = 0\n    for price in prices:\n        if price < min_price:\n            min_price = price\n        elif price - min_price > max_profit:\n            max_profit = price - min_price\n    print(max_profit)\n\nsolve()\n```",
    testCases: [
      { input: "6\n7 1 5 3 6 4", output: "5" },
      { input: "5\n7 6 4 3 1", output: "0" }
    ]
  },
  {
    language: "python",
    title: "Majority Element (LC-169)",
    medium: "easy",
    instruction: "Given an array of size n, return the majority element.",
    tag: "array",
    description: "Given an array `nums` of size `n`, return the majority element.\n\nThe majority element is the element that appears more than `⌊n / 2⌋` times. You may assume that the majority element always exists in the array.\n\n### Input Format\n- Line 1: an integer `n`.\n- Line 2: `n` space-separated integers.\n\n### Output Format\n- The majority element integer.",
    solution: "```python\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:1+n]]\n    candidate = None\n    count = 0\n    for num in nums:\n        if count == 0:\n            candidate = num\n        count += (1 if num == candidate else -1)\n    print(candidate)\n\nsolve()\n```",
    testCases: [
      { input: "3\n3 2 3", output: "3" },
      { input: "7\n2 2 1 1 1 2 2", output: "2" }
    ]
  },
  {
    language: "python",
    title: "Find the Duplicate Number (LC-287)",
    medium: "medium",
    instruction: "Given an array nums containing n + 1 integers where each integer is in the range [1, n], find the duplicate.",
    tag: "array",
    description: "Given an array of integers `nums` containing `n + 1` integers where each integer is in the range `[1, n]` inclusive.\n\nThere is only one repeated number in `nums`, return this repeated number.\n\nYou must solve the problem without modifying the array `nums` and uses only constant extra space.\n\n### Input Format\n- Line 1: an integer `n_plus_1` representing the array size.\n- Line 2: `n_plus_1` space-separated integers.\n\n### Output Format\n- The duplicated integer.",
    solution: "```python\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:1+n]]\n    slow = nums[0]\n    fast = nums[0]\n    while True:\n        slow = nums[slow]\n        fast = nums[nums[fast]]\n        if slow == fast:\n            break\n    slow = nums[0]\n    while slow != fast:\n        slow = nums[slow]\n        fast = nums[fast]\n    print(slow)\n\nsolve()\n```",
    testCases: [
      { input: "5\n1 3 4 2 2", output: "2" },
      { input: "5\n3 1 3 4 2", output: "3" }
    ]
  },
  {
    language: "python",
    title: "Find Pivot Index (LC-724)",
    medium: "easy",
    instruction: "Calculate the pivot index of an array.",
    tag: "array",
    description: "Given an array of integers `nums`, calculate the pivot index of this array.\n\nThe pivot index is the index where the sum of all the numbers strictly to the left of the index is equal to the sum of all the numbers strictly to the index's right.\n\nIf no such index exists, return `-1`. If there are multiple pivot indexes, return the left-most pivot index.\n\n### Input Format\n- Line 1: an integer `n`.\n- Line 2: `n` space-separated integers.\n\n### Output Format\n- The pivot index, or `-1` if it doesn't exist.",
    solution: "```python\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0])\n    nums = [int(x) for x in lines[1:1+n]]\n    total = sum(nums)\n    left_sum = 0\n    pivot = -1\n    for i, x in enumerate(nums):\n        if left_sum == (total - left_sum - x):\n            pivot = i\n            break\n        left_sum += x\n    print(pivot)\n\nsolve()\n```",
    testCases: [
      { input: "6\n1 7 3 6 5 6", output: "3" },
      { input: "3\n1 2 3", output: "-1" },
      { input: "3\n2 1 -1", output: "0" }
    ]
  },
  {
    language: "python",
    title: "Range Sum Query - Immutable (LC-303)",
    medium: "easy",
    instruction: "Handle multiple range sum queries on an array.",
    tag: "array",
    description: "Given an integer array `nums`, handle multiple range sum queries.\n\n### Input Format\n- Line 1: two integers `n` (array size) and `q` (number of queries).\n- Line 2: `n` space-separated integers.\n- Next `q` lines: two space-separated integers `i` and `j` representing query range indices.\n\n### Output Format\n- `q` lines, each containing the sum of elements from index `i` to `j` inclusive.",
    solution: "```python\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0])\n    q = int(lines[1])\n    nums = [int(x) for x in lines[2:2+n]]\n    prefixes = [0] * (n + 1)\n    for i in range(n):\n        prefixes[i+1] = prefixes[i] + nums[i]\n    \n    idx = 2 + n\n    for _ in range(q):\n        if idx + 1 < len(lines):\n            i = int(lines[idx])\n            j = int(lines[idx+1])\n            print(prefixes[j+1] - prefixes[i])\n            idx += 2\n\nsolve()\n```",
    testCases: [
      { input: "6 3\n-2 0 3 -5 2 -1\n0 2\n2 5\n0 5", output: "1\n-1\n-3" }
    ]
  },
  {
    language: "python",
    title: "Subarray Sum Equals K (LC-560)",
    medium: "medium",
    instruction: "Find the total number of subarrays whose sum equals to k.",
    tag: "array",
    description: "Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`.\n\n### Input Format\n- Line 1: two integers `n` and `k`.\n- Line 2: `n` space-separated integers.\n\n### Output Format\n- An integer representing the count of subarrays whose sum equals `k`.",
    solution: "```python\nimport sys\n\ndef solve():\n    lines = sys.stdin.read().split()\n    if not lines:\n        return\n    n = int(lines[0])\n    k = int(lines[1])\n    nums = [int(x) for x in lines[2:2+n]]\n    counts = {0: 1}\n    curr_sum = 0\n    ans = 0\n    for x in nums:\n        curr_sum += x\n        if curr_sum - k in counts:\n            ans += counts[curr_sum - k]\n        counts[curr_sum] = counts.get(curr_sum, 0) + 1\n    print(ans)\n\nsolve()\n```",
    testCases: [
      { input: "3 2\n1 1 1", output: "2" },
      { input: "3 3\n1 2 3", output: "2" }
    ]
  }
];

mongoose.connect(process.env.DB_MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("Connected to MongoDB successfully!");
  
  for (const q of questions) {
    console.log(`Upserting question: ${q.title}`);
    await Question.updateOne(
      { title: q.title },
      { $set: q },
      { upsert: true }
    );
  }
  
  console.log("Successfully upserted 15 questions in the database!");
  process.exit(0);
}).catch(err => {
  console.error("Database connection/migration error:", err);
  process.exit(1);
});
