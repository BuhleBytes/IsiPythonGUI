/**
 * isiPythonTranslator.ts
 * File to convert IsiPython Code to Python Code
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

/**
 * Escapes special regex characters in a string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * MAIN TRANSLATION FUNCTION
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
 * Get all available IsiPython keywords
 */
export function getIsiPythonKeywords(): string[] {
  return Object.keys(ISIPYTHON_TO_PYTHON_MAP);
}

/**
 * Get Python equivalent of an IsiPython keyword
 */
export function getPythonEquivalent(isiKeyword: string): string | null {
  return ISIPYTHON_TO_PYTHON_MAP[isiKeyword] || null;
}

/**
 * Translate multiple lines at once
 */
export function translateLines(lines: string[]): string[] {
  return lines.map((line) => translateIsiPythonToPython(line));
}

// Default export for convenience
export default {
  translateIsiPythonToPython,
  containsIsiPythonKeywords,
  getIsiPythonKeywords,
  getPythonEquivalent,
  translateLines,
};
