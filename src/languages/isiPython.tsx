// Export the configuration function
export const registerIsiPython = (monaco) => {
  monaco.languages.register({ id: "isipython" });

  monaco.languages.setMonarchTokensProvider("isipython", {
    tokenizer: {
      root: [
        // Keywords - these will be highlighted
        [
          /\b(Ubuxoki|Inyaniso|Akukho|kwaye|njenga|qinisekisa|nge-asynchronous|linda|yekisa|iklasi|qhubeka|chaza|cima|okanye|enye|ngaphandle|ekugqibeleni|jikelele|ukuba|ingenisa|ku|phakathi|umsebenzi|hayi-indawo|hayi|okanye|dlula|phakamisa|buyisela|zama|ngexesha|nge|velisa|printa|print)\b/,
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
      const suggestions = [
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

        // Add more keywords as needed...
      ];

      return { suggestions };
    },
  });
};
