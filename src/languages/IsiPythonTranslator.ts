/**
 * isiPythonTranslator.ts
 * File to convert IsiPython Code to Python Code and vice versa
 */

// IsiPython to Python language mapping based on your rules
const ISIPYTHON_TO_PYTHON_MAP: Record<string, string> = {
  // Boolean and None values
  Ubuxoki: "False", // Means "falsehood"
  Inyaniso: "True", // Means "truth"
  Akukho: "None", // Means "nothing"

  // Logical operators
  kwaye: "and", // Logical AND
  okanye: "or", // Logical OR
  hayi: "not", // Logical NOT

  ngaphakathi: "in",
  njenge: "as",

  // Control flow keywords (order matters - longer phrases first)
  okanye_ukuba: "elif", // Elif (must come before "okanye")
  ekugqibeleni: "finally", // Finally
  ngaphandle: "except", // Except for
  ngokulandelelana: "for", // For loop
  ngexesha: "while", // While
  ukuba: "if", // If
  enye: "else", // Another/else

  // Function and class keywords
  chaza: "def", // Define function
  iklasi: "class", // Class
  umsebenzi: "lambda", // Anonymous function
  buyisela: "return", // Return / give back
  velisa: "yield", // Produce/generate

  // Import and module keywords
  ukusuka: "from", // from x import y
  ngenisa: "import", // Import

  // Exception handling
  zama: "try", // Attempt
  phakamisa: "raise", // Raise an error
  qinisekisa: "assert", // Ensure/verify

  // Loop control
  yekisa: "break", // Stop/interrupt
  qhubeka: "continue", // Continue
  dlula: "pass", // Pass through

  // Scope and async keywords
  jikelele: "global", // Global
  ingaphandle: "nonlocal", // Opposite of local
  ngemva: "async", // Async
  linda: "await", // Wait
  nge: "with", // With (context manager)

  // Operators and comparisons
  ngu: "is", // Is operator

  // Other keywords
  cima: "del", // Delete
  ngelixa: "while",
};

// Create reverse mapping for Python to IsiPython translation
const PYTHON_TO_ISIPYTHON_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(ISIPYTHON_TO_PYTHON_MAP).map(([isiKeyword, pythonKeyword]) => [
    pythonKeyword,
    isiKeyword,
  ])
);

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * MAIN TRANSLATION FUNCTION - IsiPython to Python
 * Converts IsiPython code to Python code
 *
 * @param isiCode - The IsiPython code to translate
 * @returns Translated Python code
 */
export function translateIsiPythonToPython(isiCode: string): string {
  if (!isiCode || !isiCode.trim()) {
    return "";
  }

  let translatedCode = isiCode;

  // Sort entries by length (longest first) to avoid partial replacements
  // This ensures "okanye_ukuba" is replaced before "okanye"
  const sortedEntries = Object.entries(ISIPYTHON_TO_PYTHON_MAP).sort(
    ([a], [b]) => b.length - a.length
  );

  // Replace each IsiPython keyword with its Python equivalent
  for (const [isiKeyword, pythonKeyword] of sortedEntries) {
    // Use word boundaries to ensure we only replace complete words
    const regex = new RegExp(`\\b${escapeRegExp(isiKeyword)}\\b`, "g");
    translatedCode = translatedCode.replace(regex, pythonKeyword);
  }

  return translatedCode;
}

/**
 * REVERSE TRANSLATION FUNCTION - Python to IsiPython
 * Converts Python code to IsiPython code
 *
 * @param pythonCode - The Python code to translate
 * @returns Translated IsiPython code
 */
export function translatePythonToIsiPython(pythonCode: string): string {
  if (!pythonCode || !pythonCode.trim()) {
    return "";
  }

  let translatedCode = pythonCode;

  // Sort entries by length (longest first) to avoid partial replacements
  // This ensures "elif" is replaced before "else" when translating back
  const sortedEntries = Object.entries(PYTHON_TO_ISIPYTHON_MAP).sort(
    ([a], [b]) => b.length - a.length
  );

  // Replace each Python keyword with its IsiPython equivalent
  for (const [pythonKeyword, isiKeyword] of sortedEntries) {
    // Use word boundaries to ensure we only replace complete words
    const regex = new RegExp(`\\b${escapeRegExp(pythonKeyword)}\\b`, "g");
    translatedCode = translatedCode.replace(regex, isiKeyword);
  }

  return translatedCode;
}

/**
 * Check if code contains IsiPython keywords
 */
export function containsIsiPythonKeywords(code: string): boolean {
  if (!code || !code.trim()) {
    return false;
  }

  const isiKeywords = Object.keys(ISIPYTHON_TO_PYTHON_MAP);

  for (const keyword of isiKeywords) {
    const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`);
    if (regex.test(code)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if code contains Python keywords that can be translated to IsiPython
 */
export function containsPythonKeywords(code: string): boolean {
  if (!code || !code.trim()) {
    return false;
  }

  const pythonKeywords = Object.keys(PYTHON_TO_ISIPYTHON_MAP);

  for (const keyword of pythonKeywords) {
    const regex = new RegExp(`\\b${escapeRegExp(keyword)}\\b`);
    if (regex.test(code)) {
      return true;
    }
  }

  return false;
}

/**
 * Auto-detect language and translate to the opposite
 *
 * @param code - Code to translate (auto-detects language)
 * @returns Object containing the translated code and detected source language
 */
export function autoTranslate(code: string): {
  translatedCode: string;
  sourceLanguage: "isipython" | "python" | "unknown";
  targetLanguage: "isipython" | "python" | "none";
} {
  if (!code || !code.trim()) {
    return {
      translatedCode: "",
      sourceLanguage: "unknown",
      targetLanguage: "none",
    };
  }

  const hasIsiPython = containsIsiPythonKeywords(code);
  const hasPython = containsPythonKeywords(code);

  if (hasIsiPython && !hasPython) {
    return {
      translatedCode: translateIsiPythonToPython(code),
      sourceLanguage: "isipython",
      targetLanguage: "python",
    };
  } else if (hasPython && !hasIsiPython) {
    return {
      translatedCode: translatePythonToIsiPython(code),
      sourceLanguage: "python",
      targetLanguage: "isipython",
    };
  } else if (hasIsiPython && hasPython) {
    // Mixed code - prioritize IsiPython to Python translation
    return {
      translatedCode: translateIsiPythonToPython(code),
      sourceLanguage: "isipython",
      targetLanguage: "python",
    };
  } else {
    return {
      translatedCode: code,
      sourceLanguage: "unknown",
      targetLanguage: "none",
    };
  }
}

/**
 * Get all available IsiPython keywords
 */
export function getIsiPythonKeywords(): string[] {
  return Object.keys(ISIPYTHON_TO_PYTHON_MAP);
}

/**
 * Get all available Python keywords that can be translated
 */
export function getPythonKeywords(): string[] {
  return Object.keys(PYTHON_TO_ISIPYTHON_MAP);
}

/**
 * Get Python equivalent of an IsiPython keyword
 */
export function getPythonEquivalent(isiKeyword: string): string | null {
  return ISIPYTHON_TO_PYTHON_MAP[isiKeyword] || null;
}

/**
 * Get IsiPython equivalent of a Python keyword
 */
export function getIsiPythonEquivalent(pythonKeyword: string): string | null {
  return PYTHON_TO_ISIPYTHON_MAP[pythonKeyword] || null;
}

/**
 * Translate multiple lines at once (IsiPython to Python)
 */
export function translateLines(lines: string[]): string[] {
  return lines.map((line) => translateIsiPythonToPython(line));
}

/**
 * Translate multiple lines at once (Python to IsiPython)
 */
export function translatePythonLines(lines: string[]): string[] {
  return lines.map((line) => translatePythonToIsiPython(line));
}

/**
 * Get translation mapping in both directions
 */
export function getTranslationMaps(): {
  isiPythonToPython: Record<string, string>;
  pythonToIsiPython: Record<string, string>;
} {
  return {
    isiPythonToPython: { ...ISIPYTHON_TO_PYTHON_MAP },
    pythonToIsiPython: { ...PYTHON_TO_ISIPYTHON_MAP },
  };
}

// Default export for convenience
export default {
  // Translation functions
  translateIsiPythonToPython,
  translatePythonToIsiPython,
  autoTranslate,

  // Detection functions
  containsIsiPythonKeywords,
  containsPythonKeywords,

  // Keyword functions
  getIsiPythonKeywords,
  getPythonKeywords,
  getPythonEquivalent,
  getIsiPythonEquivalent,

  // Utility functions
  translateLines,
  translatePythonLines,
  getTranslationMaps,
};
