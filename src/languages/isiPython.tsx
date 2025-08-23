//=================================== Registering the language =======================================================
// #region Registering IsiPython Language (Keywords & Suggestions)
export const registerIsiPython = (monaco) => {
  monaco.languages.register({ id: "isipython" });

  monaco.languages.setMonarchTokensProvider("isipython", {
    tokenizer: {
      root: [
        // Keywords - these will be highlighted
        [
          /\b(Ubuxoki|Inyaniso|Akukho|kwaye|njenge|qinisekisa|ngemva|linda|yekisa|iklasi|qhubeka|chaza|cima|okanye|enye|ngaphandle|ekugqibeleni|jikelele|ukuba|ngenisa|ngaphakathi|umsebenzi|ingaphandle|hayi|dlula|phakamisa|buyisela|zama|ngelixa|nge|velisa|ngokulandelelana|ukusuka|ngu|okanye_ukuba|print|eval|input|len)\b/,

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
        // Boolean values
        {
          label: "Ubuxoki",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "Ubuxoki",
          detail: 'False - means "falsehood"',
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

        // Logical operators
        {
          label: "kwaye",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "kwaye",
          detail: "and - Logical AND",
        },
        {
          label: "okanye",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "okanye",
          detail: "or - Logical OR",
        },
        {
          label: "hayi",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "hayi",
          detail: "not - Logical NOT",
        },

        // Control structures
        {
          label: "ukuba",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "ukuba ${1:(imeko)}:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "if - conditional statement",
        },
        {
          label: "okanye_ukuba",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "okanye_ukuba ${1:(imeko)}:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "elif - else if statement",
        },
        {
          label: "enye",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "enye:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: 'else - means "another/else"',
        },

        // Loops
        {
          label: "ngelixa",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "ngelixa ${1:(imeko)}:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "while - while loop",
        },
        {
          label: "ngokulandelelana",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText:
            "ngokulandelelana ${1:item} ngaphakathi ${2:iterable}:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "for - for loop",
        },

        // Functions and classes
        {
          label: "chaza",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "chaza ${1:function_name}(${2:parameters}):\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "def - define function",
        },
        {
          label: "iklasi",
          kind: monaco.languages.CompletionItemKind.Class,
          insertText: "iklasi ${1:class_name}:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "class - define class",
        },
        {
          label: "umsebenzi",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "umsebenzi ${1:parameters}: ${2:expression}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "lambda - anonymous function",
        },

        // Exception handling
        {
          label: "zama",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "zama:\n\t${1:code}\n",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "try - attempt code execution",
        },
        {
          label: "ngaphandle",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "ngaphandle ${1:Exception}:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "except - handle exceptions",
        },
        {
          label: "ekugqibeleni",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "ekugqibeleni:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "finally - final execution block",
        },

        // Control flow
        {
          label: "buyisela",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "buyisela ${1:value}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "return - return value from function",
        },
        {
          label: "yekisa",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "yekisa",
          detail: "break - exit loop",
        },
        {
          label: "qhubeka",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "qhubeka",
          detail: "continue - skip to next iteration",
        },
        {
          label: "dlula",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "dlula",
          detail: "pass - do nothing placeholder",
        },
        {
          label: "phakamisa",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "phakamisa ${1:Exception}(${2:message})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "raise - raise an exception",
        },

        // Import and context
        {
          label: "ngenisa",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "ngenisa ${1:module}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "import - import module",
        },
        {
          label: "ukusuka",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "ukusuka ${1:module} ngenisa ${2:item}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "from - import from module",
        },
        {
          label: "nge",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "nge ${1:context}:\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "with - context manager",
        },

        // Async/await
        {
          label: "ngemva",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "ngemva chaza ${1:function_name}(${2:parameters}):\n\t$0",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "async - asynchronous function",
        },
        {
          label: "linda",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "linda ${1:awaitable}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "await - wait for async operation",
        },

        // Other keywords
        {
          label: "ngaphakathi",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "ngaphakathi",
          detail: "in - membership test",
        },
        {
          label: "ngu",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "ngu",
          detail: "is - identity comparison",
        },
        {
          label: "njenge",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "njenge ${1:alias}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "as - used in aliasing",
        },
        {
          label: "jikelele",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "jikelele ${1:variable}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "global - declare global variable",
        },
        {
          label: "ingaphandle",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "ingaphandle ${1:variable}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "nonlocal - access enclosing scope variable",
        },
        {
          label: "qinisekisa",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "qinisekisa ${1:condition}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "assert - ensure condition is true",
        },
        {
          label: "cima",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "cima ${1:object}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "del - delete object",
        },
        {
          label: "velisa",
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: "velisa ${1:value}",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "yield - generate value in iterator",
        },

        // Print functions
        {
          label: "print",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "print(${1:message})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "print - print message to screen",
        },
        {
          label: "eval",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "eval(${1:expression})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "eval - evaluate expression",
        },
        {
          label: "input",
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: "input(${1:prompt})",
          insertTextRules:
            monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          detail: "input - input prompt",
        },
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
