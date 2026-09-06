import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import globals from 'globals';
import path from 'node:path';
import prettier from 'eslint-config-prettier';
import { includeIgnoreFile } from 'eslint/config';
import { defineConfig } from 'eslint/config';
import svelteConfig from './svelte.config';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	{
		ignores: ['coverage/**', 'build/**', '.svelte-kit/**']
	},
	js.configs.recommended,
	ts.configs.strictTypeChecked,
	ts.configs.stylisticTypeChecked,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: {
			globals: { ...globals.browser, ...globals.node },
			parserOptions: {
				projectService: true
			}
		},
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	},
	{
		// three@0.185 does not ship TypeScript declarations. Keep the unsafe-call
		// exception scoped to the two WebGL demos that import it instead of
		// weakening type-aware linting for the rest of the application.
		files: [
			'src/lib/components/ui-registry/GhostCursor.svelte',
			'src/lib/components/ui-registry/LaserFlow.svelte'
		],
		rules: {
			'@typescript-eslint/no-unsafe-call': 'off',
			'@typescript-eslint/no-unsafe-return': 'off'
		}
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					argsIgnorePattern: '^_',
					varsIgnorePattern: '^_',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
			'@typescript-eslint/restrict-template-expressions': 'off',
			'@typescript-eslint/no-unnecessary-condition': 'off',
			'@typescript-eslint/no-confusing-void-expression': 'off',
			'@typescript-eslint/prefer-nullish-coalescing': 'off',
			'@typescript-eslint/no-deprecated': 'off',
			'@typescript-eslint/prefer-optional-chain': 'off',
			'@typescript-eslint/no-unsafe-assignment': 'off',
			'@typescript-eslint/no-unsafe-member-access': 'off',
			'no-useless-assignment': 'off',
			'svelte/no-navigation-without-resolve': 'off'
		}
	}
);
