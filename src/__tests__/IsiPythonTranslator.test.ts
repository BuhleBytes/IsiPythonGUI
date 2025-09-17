// src/__tests__/IsiPythonTranslator.test.ts
import {
  autoTranslate,
  containsIsiPythonKeywords,
  containsPythonKeywords,
  getIsiPythonEquivalent,
  getIsiPythonKeywords,
  getPythonEquivalent,
  getPythonKeywords,
  translateIsiPythonToPython,
  translatePythonToIsiPython,
} from "../languages/IsiPythonTranslator";

describe("IsiPython Translator", () => {
  describe("translateIsiPythonToPython", () => {
    test("translates basic keywords", () => {
      expect(translateIsiPythonToPython("ukuba")).toBe("if");
      expect(translateIsiPythonToPython("chaza")).toBe("def");
      expect(translateIsiPythonToPython("buyisela")).toBe("return");
      expect(translateIsiPythonToPython("Inyaniso")).toBe("True");
      expect(translateIsiPythonToPython("Ubuxoki")).toBe("False");
    });

    test("translates complete function", () => {
      const isiCode = `chaza hello():
    ukuba Inyaniso:
        buyisela "Hello World"`;

      const expected = `def hello():
    if True:
        return "Hello World"`;

      expect(translateIsiPythonToPython(isiCode)).toBe(expected);
    });

    test("handles empty input", () => {
      expect(translateIsiPythonToPython("")).toBe("");
      expect(translateIsiPythonToPython("   ")).toBe(""); // Whitespace-only returns empty string
    });
  });

  describe("translatePythonToIsiPython", () => {
    test("translates basic Python keywords", () => {
      expect(translatePythonToIsiPython("if")).toBe("ukuba");
      expect(translatePythonToIsiPython("def")).toBe("chaza");
      expect(translatePythonToIsiPython("return")).toBe("buyisela");
      expect(translatePythonToIsiPython("True")).toBe("Inyaniso");
      expect(translatePythonToIsiPython("False")).toBe("Ubuxoki");
    });
  });

  describe("autoTranslate", () => {
    test("detects IsiPython and translates to Python", () => {
      const result = autoTranslate("ukuba Inyaniso:");
      expect(result.sourceLanguage).toBe("isipython");
      expect(result.targetLanguage).toBe("python");
      expect(result.translatedCode).toBe("if True:");
    });

    test("detects Python and translates to IsiPython", () => {
      const result = autoTranslate("if True:");
      expect(result.sourceLanguage).toBe("python");
      expect(result.targetLanguage).toBe("isipython");
      expect(result.translatedCode).toBe("ukuba Inyaniso:");
    });
  });

  describe("keyword detection", () => {
    test("detects IsiPython keywords", () => {
      expect(containsIsiPythonKeywords("ukuba x > 5:")).toBe(true);
      expect(containsIsiPythonKeywords("if x > 5:")).toBe(false);
      expect(containsIsiPythonKeywords("")).toBe(false);
    });

    test("detects Python keywords", () => {
      expect(containsPythonKeywords("if x > 5:")).toBe(true);
      expect(containsPythonKeywords("ukuba x > 5:")).toBe(false);
      expect(containsPythonKeywords("")).toBe(false);
    });
  });

  describe("utility functions", () => {
    test("gets keyword lists", () => {
      const isiKeywords = getIsiPythonKeywords();
      const pythonKeywords = getPythonKeywords();

      expect(isiKeywords).toContain("ukuba");
      expect(pythonKeywords).toContain("if");
      expect(isiKeywords.length).toBeGreaterThan(10);
    });

    test("gets equivalents", () => {
      expect(getPythonEquivalent("ukuba")).toBe("if");
      expect(getIsiPythonEquivalent("if")).toBe("ukuba");
      expect(getPythonEquivalent("nonexistent")).toBeNull();
    });
  });
});
