import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintImport from 'eslint-plugin-import';
import eslintReact from 'eslint-plugin-react';
import eslintReactHooks from 'eslint-plugin-react-hooks';
import eslintSecurity from 'eslint-plugin-security';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  eslintConfigPrettier,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    ignores: [
      'build/', // 빌드 결과물 무시
      'dist/', // 빌드 결과물 무시
      'node_modules/', // 의존성 폴더 무시
      'public/', // 공개 폴더 무시
      'coverage/', // 커버리지 폴더 무시
      '.vscode/', // 에디터 설정 폴더 무시
      '**/*.config.js', // 모든 경로의 config.js 파일 무시
    ],
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      import: eslintImport,
      react: eslintReact,
      'react-hooks': eslintReactHooks,
      security: eslintSecurity,
    },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    rules: {
      // 기본 규칙 설정
      'no-unused-vars': 'off',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      'no-else-return': 'warn', // else 반환 불필요 시 제거
      'no-empty-pattern': ['error', { allowObjectPatternsAsParameters: true }],
      // React 관련 규칙
      'react/jsx-uses-vars': 'warn',
      'react/jsx-no-leaked-render': 'warn',
      // React Hooks 관련 규칙
      'react-hooks/rules-of-hooks': 'warn', // Hook 규칙 위반 시 에러
      'react-hooks/exhaustive-deps': 'warn', // useEffect 의존성 배열 검사
      // TypeScript 관련 규칙
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off', // 빈 객체 허용
      '@typescript-eslint/explicit-function-return-type': 'warn', // 함수 반환 타입 명시
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // security 규칙
      'security/detect-object-injection': 'warn',
      // import 관련 규칙
      'import/no-duplicates': 'error', // 중복 import 방지
      'import/newline-after-import': 'warn', // import 후 빈 줄 추가
      'import/first': 'error', // import는 파일 최상단에 위치
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'type', 'internal', ['parent', 'sibling', 'index']],
          pathGroups: [
            {
              pattern: 'react',
              group: 'external',
              position: 'before', // external 그룹 내에서 react를 최상단에 위치
            },
            {
              pattern: 'react-dom',
              group: 'external',
              position: 'before', // react-dom도 react 다음으로 위치
            },
            {
              pattern: 'react-router-dom',
              group: 'external',
              position: 'before', // react-router-dom react-dom 다음으로 위치
            },
          ],
          pathGroupsExcludedImportTypes: ['react'], // 중복 그룹 제외
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
);
