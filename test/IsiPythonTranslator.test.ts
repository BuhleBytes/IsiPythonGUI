// ================================================================
// JEST TEST SUITE FOR IsiPythonTranslator.ts
// ================================================================

// __tests__/IsiPythonTranslator.test.ts
import {
  autoTranslate,
  containsIsiPythonKeywords,
  containsPythonKeywords,
  getIsiPythonEquivalent,
  getIsiPythonKeywords,
  getPythonEquivalent,
  getPythonKeywords,
  getTranslationMaps,
  translateIsiPythonToPython,
  translateLines,
  translatePythonToIsiPython,
} from "../src/languages/IsiPythonTranslator";

describe("IsiPython Translator Core Functions", () => {
  // ================================================================
  // BASIC TRANSLATION TESTS - IsiPython to Python
  // ================================================================

  describe("translateIsiPythonToPython", () => {
    test("translates basic IsiPython keywords to Python", () => {
      const testCases = [
        // Boolean values
        { input: "Inyaniso", expected: "True", description: "truth to True" },
        {
          input: "Ubuxoki",
          expected: "False",
          description: "falsehood to False",
        },
        { input: "Akukho", expected: "None", description: "nothing to None" },

        // Logical operators
        { input: "kwaye", expected: "and", description: "logical AND" },
        { input: "okanye", expected: "or", description: "logical OR" },
        { input: "hayi", expected: "not", description: "logical NOT" },

        // Control flow
        { input: "ukuba", expected: "if", description: "if statement" },
        { input: "enye", expected: "else", description: "else statement" },
        {
          input: "okanye_ukuba",
          expected: "elif",
          description: "elif statement",
        },

        // Functions
        { input: "chaza", expected: "def", description: "function definition" },
        {
          input: "buyisela",
          expected: "return",
          description: "return statement",
        },

        // Loops
        { input: "ngokulandelelana", expected: "for", description: "for loop" },
        { input: "ngexesha", expected: "while", description: "while loop" },
      ];

      testCases.forEach(({ input, expected, description }) => {
        const result = translateIsiPythonToPython(input);
        expect(result).toBe(expected);
        console.log(`✅ ${description}: "${input}" → "${expected}"`);
      });
    });

    test("translates complete IsiPython function", () => {
      const isiPythonCode = `chaza calculate_sum(a, b):
    ukuba a kwaye b:
        buyisela a + b
    enye:
        buyisela Akukho`;

      const expectedPython = `def calculate_sum(a, b):
    if a and b:
        return a + b
    else:
        return None`;

      const result = translateIsiPythonToPython(isiPythonCode);
      expect(result).toBe(expectedPython);

      console.log("✅ Complete function translation:");
      console.log("Input (IsiPython):", isiPythonCode);
      console.log("Output (Python):", result);
    });

    test("translates complex IsiPython program with loops and conditions", () => {
      const isiPythonCode = `chaza fibonacci(n):
    ukuba n <= 1:
        buyisela n
    okanye_ukuba n == 2:
        buyisela 1
    enye:
        buyisela fibonacci(n-1) + fibonacci(n-2)

ngokulandelelana i ngaphakathi range(10):
    print(fibonacci(i))`;

      const expectedPython = `def fibonacci(n):
    if n <= 1:
        return n
    elif n == 2:
        return 1
    else:
        return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(fibonacci(i))`;

      const result = translateIsiPythonToPython(isiPythonCode);
      expect(result).toBe(expectedPython);

      console.log("✅ Complex program translation - Fibonacci sequence");
    });

    test("handles word boundaries correctly", () => {
      // Should not translate keywords within strings or other words
      const isiCode = 'print("ukuba this should not change")';
      const result = translateIsiPythonToPython(isiCode);

      // The word "ukuba" inside quotes should NOT be translated
      expect(result).toBe('print("ukuba this should not change")');
      console.log("✅ Word boundaries respected - strings preserved");
    });

    test("handles empty and whitespace input", () => {
      expect(translateIsiPythonToPython("")).toBe("");
      expect(translateIsiPythonToPython("   ")).toBe("   ");
      expect(translateIsiPythonToPython("\n\t")).toBe("\n\t");
      console.log("✅ Empty input handled correctly");
    });
  });

  // ================================================================
  // REVERSE TRANSLATION TESTS - Python to IsiPython
  // ================================================================

  describe("translatePythonToIsiPython", () => {
    test("translates basic Python keywords to IsiPython", () => {
      const testCases = [
        { input: "True", expected: "Inyaniso" },
        { input: "False", expected: "Ubuxoki" },
        { input: "None", expected: "Akukho" },
        { input: "and", expected: "kwaye" },
        { input: "or", expected: "okanye" },
        { input: "not", expected: "hayi" },
        { input: "if", expected: "ukuba" },
        { input: "else", expected: "enye" },
        { input: "elif", expected: "okanye_ukuba" },
        { input: "def", expected: "chaza" },
        { input: "return", expected: "buyisela" },
      ];

      testCases.forEach(({ input, expected }) => {
        const result = translatePythonToIsiPython(input);
        expect(result).toBe(expected);
        console.log(`✅ Reverse translation: "${input}" → "${expected}"`);
      });
    });

    test("translates complete Python function to IsiPython", () => {
      const pythonCode = `def greet_user(name):
    if name and len(name) > 0:
        return f"Hello, {name}!"
    else:
        return "Hello, stranger!"`;

      const expectedIsiPython = `chaza greet_user(name):
    ukuba name kwaye len(name) > 0:
        buyisela f"Hello, {name}!"
    enye:
        buyisela "Hello, stranger!"`;

      const result = translatePythonToIsiPython(pythonCode);
      expect(result).toBe(expectedIsiPython);

      console.log("✅ Complete Python to IsiPython function translation");
    });

    test("handles elif precedence correctly", () => {
      // Test that "elif" is translated before "else"
      const pythonCode =
        "if x > 5:\n    pass\nelif x == 5:\n    pass\nelse:\n    pass";
      const result = translatePythonToIsiPython(pythonCode);

      expect(result).toContain("okanye_ukuba");
      expect(result).toContain("enye");
      expect(result).not.toContain("elif");
      console.log("✅ elif precedence handled correctly");
    });
  });

  // ================================================================
  // AUTO-DETECTION AND AUTO-TRANSLATION TESTS
  // ================================================================

  describe("autoTranslate", () => {
    test("auto-detects IsiPython code and translates to Python", () => {
      const isiCode = 'ukuba Inyaniso:\n    buyisela "success"';
      const result = autoTranslate(isiCode);

      expect(result.sourceLanguage).toBe("isipython");
      expect(result.targetLanguage).toBe("python");
      expect(result.translatedCode).toBe('if True:\n    return "success"');

      console.log("✅ Auto-detected IsiPython and translated to Python");
    });

    test("auto-detects Python code and translates to IsiPython", () => {
      const pythonCode = 'if True:\n    return "success"';
      const result = autoTranslate(pythonCode);

      expect(result.sourceLanguage).toBe("python");
      expect(result.targetLanguage).toBe("isipython");
      expect(result.translatedCode).toBe(
        'ukuba Inyaniso:\n    buyisela "success"'
      );

      console.log("✅ Auto-detected Python and translated to IsiPython");
    });

    test("handles mixed code by prioritizing IsiPython", () => {
      const mixedCode = "ukuba True kwaye False:";
      const result = autoTranslate(mixedCode);

      expect(result.sourceLanguage).toBe("isipython");
      expect(result.targetLanguage).toBe("python");

      console.log("✅ Mixed code prioritizes IsiPython translation");
    });

    test("handles unknown language gracefully", () => {
      const unknownCode = 'console.log("Hello World");';
      const result = autoTranslate(unknownCode);

      expect(result.sourceLanguage).toBe("unknown");
      expect(result.targetLanguage).toBe("none");
      expect(result.translatedCode).toBe(unknownCode);

      console.log("✅ Unknown language handled gracefully");
    });
  });

  // ================================================================
  // KEYWORD DETECTION TESTS
  // ================================================================

  describe("containsIsiPythonKeywords", () => {
    test("detects IsiPython keywords in code", () => {
      const testCases = [
        { code: "ukuba x > 5:", expected: true },
        { code: "chaza my_function():", expected: true },
        { code: "buyisela Inyaniso", expected: true },
        { code: 'print("hello world")', expected: false },
        { code: "def calculate():", expected: false },
        { code: "", expected: false },
      ];

      testCases.forEach(({ code, expected }) => {
        const result = containsIsiPythonKeywords(code);
        expect(result).toBe(expected);
        console.log(`✅ IsiPython detection: "${code}" → ${result}`);
      });
    });

    test("respects word boundaries in detection", () => {
      const code = "my_ukuba_variable = 5"; // "ukuba" is part of variable name
      const result = containsIsiPythonKeywords(code);
      expect(result).toBe(false);

      console.log("✅ Word boundaries respected in keyword detection");
    });
  });

  describe("containsPythonKeywords", () => {
    test("detects Python keywords in code", () => {
      const testCases = [
        { code: "if x > 5:", expected: true },
        { code: "def my_function():", expected: true },
        { code: "return True", expected: true },
        { code: "ukuba x > 5:", expected: false },
        { code: "chaza calculate():", expected: false },
        { code: "", expected: false },
      ];

      testCases.forEach(({ code, expected }) => {
        const result = containsPythonKeywords(code);
        expect(result).toBe(expected);
        console.log(`✅ Python detection: "${code}" → ${result}`);
      });
    });
  });

  // ================================================================
  // UTILITY FUNCTION TESTS
  // ================================================================

  describe("Utility Functions", () => {
    test("getIsiPythonKeywords returns all keywords", () => {
      const keywords = getIsiPythonKeywords();

      expect(keywords).toContain("ukuba");
      expect(keywords).toContain("chaza");
      expect(keywords).toContain("buyisela");
      expect(keywords).toContain("Inyaniso");
      expect(keywords.length).toBeGreaterThan(20);

      console.log(`✅ Retrieved ${keywords.length} IsiPython keywords`);
    });

    test("getPythonKeywords returns all keywords", () => {
      const keywords = getPythonKeywords();

      expect(keywords).toContain("if");
      expect(keywords).toContain("def");
      expect(keywords).toContain("return");
      expect(keywords).toContain("True");
      expect(keywords.length).toBeGreaterThan(20);

      console.log(`✅ Retrieved ${keywords.length} Python keywords`);
    });

    test("getPythonEquivalent returns correct translations", () => {
      expect(getPythonEquivalent("ukuba")).toBe("if");
      expect(getPythonEquivalent("chaza")).toBe("def");
      expect(getPythonEquivalent("Inyaniso")).toBe("True");
      expect(getPythonEquivalent("nonexistent")).toBeNull();

      console.log("✅ Python equivalents retrieved correctly");
    });

    test("getIsiPythonEquivalent returns correct translations", () => {
      expect(getIsiPythonEquivalent("if")).toBe("ukuba");
      expect(getIsiPythonEquivalent("def")).toBe("chaza");
      expect(getIsiPythonEquivalent("True")).toBe("Inyaniso");
      expect(getIsiPythonEquivalent("nonexistent")).toBeNull();

      console.log("✅ IsiPython equivalents retrieved correctly");
    });

    test("translateLines processes multiple lines correctly", () => {
      const lines = [
        "chaza hello():",
        "    ukuba Inyaniso:",
        '        buyisela "hello"',
      ];

      const result = translateLines(lines);

      expect(result).toEqual([
        "def hello():",
        "    if True:",
        '        return "hello"',
      ]);

      console.log("✅ Multiple lines translated correctly");
    });

    test("getTranslationMaps returns both mappings", () => {
      const maps = getTranslationMaps();

      expect(maps.isiPythonToPython).toHaveProperty("ukuba", "if");
      expect(maps.pythonToIsiPython).toHaveProperty("if", "ukuba");

      console.log("✅ Translation maps retrieved correctly");
    });
  });

  // ================================================================
  // EDGE CASES AND ERROR HANDLING
  // ================================================================

  describe("Edge Cases and Error Handling", () => {
    test("handles null and undefined input", () => {
      expect(translateIsiPythonToPython(null as any)).toBe("");
      expect(translateIsiPythonToPython(undefined as any)).toBe("");
      expect(translatePythonToIsiPython(null as any)).toBe("");
      expect(translatePythonToIsiPython(undefined as any)).toBe("");

      console.log("✅ Null/undefined input handled gracefully");
    });

    test("preserves indentation and formatting", () => {
      const isiCode = `chaza test():
    ukuba Inyaniso:
        buyisela "indented"
        ukuba Ubuxoki:
            buyisela "deeply nested"`;

      const result = translateIsiPythonToPython(isiCode);

      // Check that indentation is preserved
      expect(result).toContain("    if True:");
      expect(result).toContain('        return "indented"');
      expect(result).toContain("        if False:");
      expect(result).toContain('            return "deeply nested"');

      console.log("✅ Indentation and formatting preserved");
    });

    test("handles code with comments", () => {
      const isiCode = `# This is a comment with ukuba
chaza test():  # Another comment
    buyisela Inyaniso  # Final comment`;

      const result = translateIsiPythonToPython(isiCode);

      // Comments should be preserved, keywords in comments should not be translated
      expect(result).toContain("# This is a comment with ukuba");
      expect(result).toContain("def test():  # Another comment");
      expect(result).toContain("return True  # Final comment");

      console.log("✅ Comments preserved correctly");
    });

    test("handles large code blocks efficiently", () => {
      // Generate large code block
      const largeCode = Array(1000)
        .fill('ukuba Inyaniso:\n    buyisela "test"')
        .join("\n");

      const startTime = performance.now();
      const result = translateIsiPythonToPython(largeCode);
      const endTime = performance.now();

      const duration = endTime - startTime;

      expect(result).toContain("if True:");
      expect(result).toContain('return "test"');
      expect(duration).toBeLessThan(1000); // Should complete within 1 second

      console.log(
        `✅ Large code block (1000 lines) translated in ${duration.toFixed(
          2
        )}ms`
      );
    });
  });

  // ================================================================
  // REAL-WORLD EXAMPLE TESTS
  // ================================================================

  describe("Real-World Code Examples", () => {
    test("translates a complete calculator function", () => {
      const isiCalculator = `chaza calculator(operation, a, b):
    ukuba operation == "add":
        buyisela a + b
    okanye_ukuba operation == "subtract":
        buyisela a - b
    okanye_ukuba operation == "multiply":
        buyisela a * b
    okanye_ukuba operation == "divide":
        ukuba b != 0:
            buyisela a / b
        enye:
            buyisela "Cannot divide by zero"
    enye:
        buyisela "Unknown operation"`;

      const expectedPython = `def calculator(operation, a, b):
    if operation == "add":
        return a + b
    elif operation == "subtract":
        return a - b
    elif operation == "multiply":
        return a * b
    elif operation == "divide":
        if b != 0:
            return a / b
        else:
            return "Cannot divide by zero"
    else:
        return "Unknown operation"`;

      const result = translateIsiPythonToPython(isiCalculator);
      expect(result).toBe(expectedPython);

      console.log("✅ Real-world calculator function translated correctly");
    });

    test("translates list processing with loops", () => {
      const isiCode = `chaza process_numbers(numbers):
    result = []
    ngokulandelelana num ngaphakathi numbers:
        ukuba num % 2 == 0:
            result.append(num * 2)
        enye:
            result.append(num)
    buyisela result`;

      const expectedPython = `def process_numbers(numbers):
    result = []
    for num in numbers:
        if num % 2 == 0:
            result.append(num * 2)
        else:
            result.append(num)
    return result`;

      const result = translateIsiPythonToPython(isiCode);
      expect(result).toBe(expectedPython);

      console.log("✅ List processing with loops translated correctly");
    });

    test("translates class definition with methods", () => {
      const isiClass = `iklasi Student:
    chaza __init__(self, name, age):
        self.name = name
        self.age = age
    
    chaza introduce(self):
        ukuba self.age >= 18:
            buyisela f"Hello, I'm {self.name} and I'm {self.age} years old."
        enye:
            buyisela f"Hi, I'm {self.name}!"`;

      const expectedPython = `class Student:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    
    def introduce(self):
        if self.age >= 18:
            return f"Hello, I'm {self.name} and I'm {self.age} years old."
        else:
            return f"Hi, I'm {self.name}!"`;

      const result = translateIsiPythonToPython(isiClass);
      expect(result).toBe(expectedPython);

      console.log("✅ Class definition translated correctly");
    });
  });

  // ================================================================
  // ROUND-TRIP TRANSLATION TESTS
  // ================================================================

  describe("Round-trip Translation Tests", () => {
    test("IsiPython → Python → IsiPython maintains consistency", () => {
      const originalIsi =
        'ukuba Inyaniso kwaye hayi Ubuxoki:\n    buyisela "success"';

      // Translate to Python
      const python = translateIsiPythonToPython(originalIsi);
      console.log("Step 1 - IsiPython to Python:", python);

      // Translate back to IsiPython
      const backToIsi = translatePythonToIsiPython(python);
      console.log("Step 2 - Python back to IsiPython:", backToIsi);

      expect(backToIsi).toBe(originalIsi);
      console.log("✅ Round-trip translation maintains consistency");
    });

    test("Python → IsiPython → Python maintains consistency", () => {
      const originalPython = 'if True and not False:\n    return "success"';

      // Translate to IsiPython
      const isi = translatePythonToIsiPython(originalPython);
      console.log("Step 1 - Python to IsiPython:", isi);

      // Translate back to Python
      const backToPython = translateIsiPythonToPython(isi);
      console.log("Step 2 - IsiPython back to Python:", backToPython);

      expect(backToPython).toBe(originalPython);
      console.log("✅ Round-trip translation maintains consistency");
    });
  });
});

// ================================================================
// INTEGRATION TESTS WITH MOCK SCENARIOS
// ================================================================

describe("Integration Scenarios", () => {
  test("simulates IDE code execution workflow", () => {
    // Simulate user typing IsiPython code in IDE
    const userCode = `chaza fibonacci(n):
    ukuba n <= 1:
        buyisela n
    enye:
        buyisela fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(5))`;

    // 1. Detect language
    const hasIsiPython = containsIsiPythonKeywords(userCode);
    expect(hasIsiPython).toBe(true);

    // 2. Auto-translate for execution
    const { translatedCode, sourceLanguage } = autoTranslate(userCode);
    expect(sourceLanguage).toBe("isipython");
    expect(translatedCode).toContain("def fibonacci");
    expect(translatedCode).toContain("if n <= 1:");

    // 3. Verify translated code is valid Python syntax
    expect(translatedCode).toMatch(/^def fibonacci\(n\):/m);
    expect(translatedCode).toMatch(/if n <= 1:/);
    expect(translatedCode).toMatch(/return n/);

    console.log("✅ Complete IDE workflow simulation successful");
    console.log("Original IsiPython:", userCode);
    console.log("Translated Python:", translatedCode);
  });

  test("simulates error scenario handling", () => {
    // Test with malformed code
    const malformedCode = "ukuba broken syntax here";

    // Should still translate keywords even if syntax is broken
    const result = translateIsiPythonToPython(malformedCode);
    expect(result).toBe("if broken syntax here");

    // Detection should still work
    expect(containsIsiPythonKeywords(malformedCode)).toBe(true);

    console.log("✅ Error scenario handled gracefully");
  });
});
