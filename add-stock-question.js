require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("./server/model/question");

const newQuestion = {
    language: "cpp",
    title: "Best Time to Buy and Sell Stock",
    medium: "easy",
    instruction: "You are given an array prices where prices[i] is the price of a given stock on the ith day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\n\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.",
    tag: "array",
    description: "Find the maximum profit from buying and selling a stock once.",
    solution: "```cpp\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint maxProfit(vector<int>& prices) {\n    if (prices.empty()) return 0;\n    int minPrice = prices[0];\n    int maxProf = 0;\n    for (int i = 1; i < prices.size(); i++) {\n        if (prices[i] < minPrice) {\n            minPrice = prices[i];\n        } else if (prices[i] - minPrice > maxProf) {\n            maxProf = prices[i] - minPrice;\n        }\n    }\n    return maxProf;\n}\n\nint main() {\n    int n;\n    if (!(cin >> n)) return 0;\n    vector<int> prices(n);\n    for (int i = 0; i < n; i++) {\n        cin >> prices[i];\n    }\n    cout << maxProfit(prices) << \"\\n\";\n    return 0;\n}\n```",
    testCases: [
      { input: "6\n7 1 5 3 6 4", output: "5\n" },
      { input: "5\n7 6 4 3 1", output: "0\n" }
    ]
};

mongoose.connect(process.env.DB_MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
}).then(async () => {
  console.log("Connected to DB, inserting stock question...");
  await Question.create(newQuestion);
  console.log("Successfully added the question!");
  process.exit(0);
}).catch(err => {
  console.error("DB Connection Error:", err);
  process.exit(1);
});
