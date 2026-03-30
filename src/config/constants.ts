export const EXPENSE_CATEGORIES = [
  'food',
  'transport',
  'shopping',
  'entertainment',
  'house',
  'medical',
  'education',
  'other_expense',
];

export const INCOME_CATEGORIES = [
  'salary',
  'bonus',
  'investment',
  'other_income',
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const VALID_ROLES = ['husband', 'wife'] as const;

export const VALID_PERSONS = ['husband', 'wife'] as const;

export const VALID_RECORD_TYPES = ['income', 'expense'] as const;
