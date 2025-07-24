//=================================== Registering the language =======================================================
// #region Registering IsiPython Language (Keywords & Suggestions)
export const registerIsiPython = (monaco) => {
  monaco.languages.register({ id: "isipython" });

  monaco.languages.setMonarchTokensProvider("isipython", {
    tokenizer: {
      root: [
        // Keywords - these will be highlighted
        [
          /\b(Ubuxoki|Inyaniso|Akukho|kwaye|njenga|qinisekisa|nge-asynchronous|linda|yekisa|iklasi|qhubeka|chaza|cima|okanye|enye|ngaphandle|ekugqibeleni|jikelele|ukuba|ingenisa|ku|phakathi|umsebenzi|hayi-indawo|hayi|okanye|dlula|phakamisa|buyisela|zama|ngexesha|nge|velisa|printa|print|shicilela)\b/,
          "keyword",
        ],

        // Numbers
        [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
        [/\d+/, "number"],

        // Strings
        [/"([^"\\]|\\.)*$/, "string.invalid"], // non-terminated string
        [/'([^'\\]|\\.)*$/, "string.invalid"], // non-terminated string
        [/"/, "string", "@string_double"],
        [/'/, "string", "@string_single"],

        // Comments (using # like Python)
        [/#.*$/, "comment"],

        // Operators
        [/[{}()\[\]]/, "@brackets"],
        [/[<>](?!@symbols)/, "@brackets"],
        [/@symbols/, "operator"],

        // Whitespace
        { include: "@whitespace" },

        // Identifiers
        [/[a-zA-Z_]\w*/, "identifier"],
      ],

      string_double: [
        [/[^\\"]+/, "string"],
        [/\\./, "string.escape.invalid"],
        [/"/, "string", "@pop"],
      ],

      string_single: [
        [/[^\\']+/, "string"],
        [/\\./, "string.escape.invalid"],
        [/'/, "string", "@pop"],
      ],

      whitespace: [
        [/[ \t\r\n]+/, "white"],
        [/#.*$/, "comment"],
      ],
    },

    symbols: /[=><!~?:&|+\-*\/\^%]+/,
  });

  // Configure the theme
  monaco.editor.defineTheme("isipython-theme", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "keyword", foreground: "0000ff", fontStyle: "bold" }, // Blue keywords
      { token: "comment", foreground: "008000", fontStyle: "italic" }, // Green comments
      { token: "string", foreground: "a31515" }, // Red strings
      { token: "number", foreground: "098658" }, // Dark green numbers
      { token: "operator", foreground: "000000" }, // Black operators
      { token: "identifier", foreground: "001080" }, // Dark blue identifiers
    ],
    colors: {
      "editor.background": "#ffffff",
      "editor.foreground": "#000000",
    },
  });

  // Language configuration for bracket matching, auto-closing, etc.
  monaco.languages.setLanguageConfiguration("isipython", {
    comments: {
      lineComment: "#",
    },
    brackets: [
      ["{", "}"],
      ["[", "]"],
      ["(", ")"],
    ],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"', notIn: ["string"] },
      { open: "'", close: "'", notIn: ["string", "comment"] },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    indentationRules: {
      increaseIndentPattern: /^((?!#).)*:[\s]*$/,
      decreaseIndentPattern: /^[\s]*(?:elif|else|except|finally)\b.*:[\s]*$/,
    },
  });

  // Register completion provider
  monaco.languages.registerCompletionItemProvider("isipython", {
    provideCompletionItems: (model, position) => {
      // Get all text in the editor
      const textUntilPosition = model.getValueInRange({
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      });

      const allText = model.getValue();

      // Extract user-defined functions and variables
      const userDefinedItems = extractUserDefinitions(allText);

      // Your static keyword suggestions
      const staticSuggestions = [
        {
          label: "Ubuxoki",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "Ubuxoki",
          detail: 'False - means "falsehood"',
        },
        {
          label: "dlula",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "dlula",
          detail: 'pass - means "pass-through"',
        },
        {
          label: "Inyaniso",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "Inyaniso",
          detail: 'True - means "truth"',
        },
        {
          label: "Akukho",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "Akukho",
          detail: 'None - means "nothing"',
        },
        {
          label: "ekugqibeleni",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "ekugqibeleni",
          detail: 'finally - means "finally"',
        },

        // Control structures
        {
          label: "ukuba",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "ukuba ${1:condition}:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "if statement",
        },
        {
          label: "okanye",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "okanye ${1:condition}:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "elif - alternative to if",
        },
        {
          label: "enye",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "enye:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'else - means "another/else"',
        },

        {
          label: "hayi",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "hayi:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'not - means "Logical NOT"',
        },

        // Loops
        {
          label: "ngexesha",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "ngexesha ${1:condition}:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "while loop",
        },

        // Functions
        {
          label: "chaza",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "chaza ${1:function_name}(${2:parameters}):\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "def - define or explain",
        },
        {
          label: "iklasi",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "iklasi ${1:class_name}:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "iklasi - borrowed word from 'class'",
        },
        {
          label: "print",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "print(${1:message})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "print - means 'print' a message from screen",
        },
        {
          label: "printa",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "printa(${1:umlayezo})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "print - means 'print' a message to the screen",
        },
        {
          label: "shicilela",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "shicilela(${1:umlayezo})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "shicilela - mean 'print' a message to the screen screen",
        },
        // ... other keywords
      ];

      // Combine static and dynamic suggestions
      const allSuggestions = [...staticSuggestions, ...userDefinedItems];

      return { suggestions: allSuggestions };
    },
  });

  // Helper function to extract user definitions
  function extractUserDefinitions(code) {
    const suggestions = [];
    const lines = code.split("\n");

    lines.forEach((line) => {
      // Match function definitions: chaza function_name(...):
      const functionMatch = line.match(/chaza\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/);
      if (functionMatch) {
        suggestions.push({
          label: functionMatch[1],
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: `${functionMatch[1]}($0)`,
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "User-defined function",
          sortText: "0", // Prioritize user-defined items
        });
      }

      // Match variable assignments: variable_name = value
      const variableMatch = line.match(/^(\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*=/);
      if (variableMatch) {
        const varName = variableMatch[2];
        // Avoid suggesting keywords as variables
        if (!isKeyword(varName)) {
          suggestions.push({
            label: varName,
            kind: monaco.languages.CompletionItemKind.Variable,
            insertText: varName,
            detail: "User-defined variable",
            sortText: "0", // Prioritize user-defined items
          });
        }
      }
    });

    // Remove duplicates
    return suggestions.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t.label === item.label)
    );
  }

  function isKeyword(word) {
    const keywords = [
      "Ubuxoki",
      "Inyaniso",
      "Akukho",
      "ukuba",
      "okanye",
      "enye",
      "ngexesha",
      "chaza",
      "kwaye",
      "njenga",
      "qinisekis",
      "nge-asynchronous",
      "linda",
      "yekisa",
      "iklasi",
      "qhubeka",
      "cima",
      "ngaphandle",
      "ekugqibeleni",
      "jikelele",
      "ngenisa",
      "phakathi",
      "dlula",
      "buyisela",
      "zama",
      "velisa",
      /* ... add all your keywords */
    ];
    return keywords.includes(word);
  }

  // Register diagnostic provider for syntax validation
  monaco.languages.registerCodeActionProvider("isipython", {
    provideCodeActions: () => ({ actions: [], dispose: () => {} }),
  });

  let timeoutId;

  const validateSyntax = (model) => {
    const code = model.getValue();
    const errors = checkIsiPythonSyntax(code);

    // Convert errors to Monaco markers
    const markers = errors.map((error) => ({
      severity: monaco.MarkerSeverity.Error,
      startLineNumber: error.line,
      startColumn: error.column,
      endLineNumber: error.line,
      endColumn: error.endColumn || error.column + 1,
      message: error.message,
      source: "IsiPython",
    }));

    monaco.editor.setModelMarkers(model, "isipython", markers);
  };

  // Listen for content changes
  monaco.editor.onDidCreateModel((model) => {
    if (model.getLanguageId() === "isipython") {
      // Validate on creation
      validateSyntax(model);

      // Validate on changes (debounced)
      model.onDidChangeContent(() => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => validateSyntax(model), 500);
      });
    }
  });
};
// #endregion
//=================================== Registering the language =======================================================

// Syntax validation function
function checkIsiPythonSyntax(code) {
  const errors = [];
  const lines = code.split("\n");

  //Track Variable scopes
  const scopeStack = [new Set()]; // Global scope
  let currentScope = scopeStack[0];

  // Built-in variables/functions that are always available
  const builtins = new Set([
    "chaza",
    "buyisela",
    "phakamisa",
    "len",
    "str",
    "int",
    "float",
  ]);

  lines.forEach((line, index) => {
    const lineNumber = index + 1;
    const trimmedLine = line.trim();

    if (trimmedLine === "") return;

    // Check for Python syntax patterns with IsiXhosa keywords

    // 1. Check if/elif/else structure
    if (trimmedLine.match(/^(ukuba|okanye)\s/)) {
      if (!trimmedLine.endsWith(":")) {
        errors.push({
          line: lineNumber,
          column: line.length,
          message: "Expected ':' after condition",
        });
      }
    }

    // 2. Check else statement
    if (trimmedLine === "enye" && !trimmedLine.endsWith(":")) {
      errors.push({
        line: lineNumber,
        column: line.length,
        message: "Expected ':' after 'enye'",
      });
    }

    // 3. Check function definitions
    if (trimmedLine.match(/^chaza\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/)) {
      if (!trimmedLine.endsWith(":")) {
        errors.push({
          line: lineNumber,
          column: line.length,
          message: "Expected ':' after function definition",
        });
      }
    }

    // 4. Check while loops
    if (trimmedLine.match(/^ngexesha\s/)) {
      if (!trimmedLine.endsWith(":")) {
        errors.push({
          line: lineNumber,
          column: line.length,
          message: "Expected ':' after while condition",
        });
      }
    }

    // 5. Check for unmatched parentheses/brackets
    const openParens = (line.match(/\(/g) || []).length;
    const closeParens = (line.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      errors.push({
        line: lineNumber,
        column: 1,
        message: "Unmatched parentheses",
      });
    }

    // 6. Check indentation after control structures
    if (lineNumber < lines.length) {
      const currentLine = lines[index];
      const nextLine = lines[index + 1];

      if (currentLine.trim().match(/^(ukuba|okanye|enye|ngexesha|chaza.*):$/)) {
        if (
          nextLine &&
          nextLine.trim() !== "" &&
          !nextLine.startsWith("    ") &&
          !nextLine.startsWith("\t")
        ) {
          errors.push({
            line: lineNumber + 1,
            column: 1,
            message: "Expected indented block",
          });
        }
      }
    }

    // 7. Check for invalid keyword usage (using Python keywords instead of IsiXhosa)
    const pythonKeywords = [
      "if",
      "elif",
      "else",
      "while",
      "def",
      "for",
      "try",
      "except",
      "finally",
    ];
    pythonKeywords.forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "g");
      let match;
      while ((match = regex.exec(line)) !== null) {
        const isiXhosaEquivalent = getPythonToIsiXhosaMapping(keyword);
        errors.push({
          line: lineNumber,
          column: match.index + 1,
          endColumn: match.index + keyword.length + 1,
          message: `Use '${isiXhosaEquivalent}' instead of '${keyword}'`,
        });
      }
    });
  });

  return errors;
}

// Helper function to map Python keywords to IsiXhosa
function getPythonToIsiXhosaMapping(pythonKeyword) {
  const mapping = {
    if: "ukuba",
    elif: "okanye",
    else: "enye",
    while: "ngexesha",
    def: "chaza",
    for: "—", // You'll need to add IsiXhosa equivalent
    try: "zama",
    except: "ngaphandle",
    finally: "ekugqibeleni",
    True: "Inyariso",
    False: "Ubuxoki",
    None: "Akukho",
  };
  return mapping[pythonKeyword] || pythonKeyword;
}
