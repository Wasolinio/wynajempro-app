import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'functions/node_modules', 'scripts/archive', '_legacy', '_design-reference', '.agents', '.claude']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
    },
  },
  {
    /*
      Cloud Functions — CommonJS, środowisko Node, bez Reacta.
      Do 2026-08-19 cały katalog `functions/` był w `globalIgnores`, więc backend
      (Stripe, iCal, usuwanie kont, panel administratora) nie przechodził przez ŻADEN
      linter, a „lint 0" w dzienniku dotyczyło wyłącznie frontu. Wykryte przy przeglądzie
      panelu administratora. Ignorowane zostają wyłącznie `node_modules`.
    */
    files: ['functions/**/*.{js,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      // Sygnatury handlerów v2 bywają szersze, niż ciało potrzebuje (np. `event`
      // w funkcjach cyklicznych) — podkreślenie oznacza „świadomie nieużywane".
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
])
