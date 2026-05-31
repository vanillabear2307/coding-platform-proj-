require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("./server/model/question");

const questions = [
  {
    language: "cpp",
    title: "Print Hello World",
    medium: "easy",
    instruction: "Write a program that prints 'Hello World' to the standard output.",
    tag: "none",
    description: "This is a simple problem to get you started. Your task is to output the exact string 'Hello World' without quotes.",
    solution: "```cpp\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << \"Hello World\";\n    return 0;\n}\n```",
    testCases: [
      { input: "", output: "Hello World" }
    ]
  },
  {
    language: "python",
    title: "Sum of Two Numbers",
    medium: "easy",
    instruction: "Read two space-separated integers from standard input and print their sum.",
    tag: "none",
    description: "Given two numbers A and B, calculate and print their sum.",
    solution: "```python\na, b = map(int, input().split())\nprint(a + b)\n```",
    testCases: [
      { input: "3 5", output: "8\n" },
      { input: "10 20", output: "30\n" }
    ]
  },
  {
    language: "java",
    title: "Check Even or Odd",
    medium: "easy",
    instruction: "Write a program to check if a given number is even or odd.",
    tag: "none",
    description: "Read an integer from standard input. If it is even, print 'Even'. If it is odd, print 'Odd'.",
    solution: "```java\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        int num = scanner.nextInt();\n        if(num % 2 == 0) {\n            System.out.println(\"Even\");\n        } else {\n            System.out.println(\"Odd\");\n        }\n    }\n}\n```",
    testCases: [
      { input: "4", output: "Even\n" },
      { input: "7", output: "Odd\n" }
    ]
  }
];

mongoose.connect(process.env.DB_MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  console.log("Connected to DB, clearing existing questions...");
  await Question.deleteMany({});
  console.log("Inserting new questions...");
  await Question.insertMany(questions);
  console.log("Successfully added 3 questions to the database!");
  process.exit(0);
}).catch(err => {
  console.error("DB Connection Error:", err);
  process.exit(1);
});
