import {
  TransactionCategory,
  TransactionPaymentMethod,
  TransactionType,
} from "@prisma/client";

export const TRANSACTION_PAYMENT_METHOD_ICONS = {
  [TransactionPaymentMethod.CREDIT_CARD]: "credit-card.svg",
  [TransactionPaymentMethod.DEBIT_CARD]: "debit-card.svg",
  [TransactionPaymentMethod.BANK_TRANSFER]: "bank-transfer.svg",
  [TransactionPaymentMethod.BANK_SLIP]: "bank-slip.svg",
  [TransactionPaymentMethod.CASH]: "money.svg",
  [TransactionPaymentMethod.PIX]: "pix.svg",
  [TransactionPaymentMethod.OTHER]: "other.svg",
};

export const TRANSACTION_CATEGORY_LABELS = {
  EDUCATION: "Educação",
  ENTERTAINMENT: "Entretenimento",
  FOOD: "Alimentação",
  HEALTH: "Saúde",
  HOUSING: "Moradia",
  OTHER: "Outros",
  SALARY: "Salário",
  INTEREST: "Rendimentos",
  TRANSPORTATION: "Transporte",
  INVESTMENT: "Poupança",
};

export const TRANSACTION_PAYMENT_METHOD_LABELS = {
  BANK_TRANSFER: "Transferência Bancária",
  BANK_SLIP: "Boleto Bancário",
  CASH: "Dinheiro",
  CREDIT_CARD: "Cartão de Crédito",
  DEBIT_CARD: "Cartão de Débito",
  OTHER: "Outros",
  PIX: "Pix",
};

export const TRANSACTION_TYPE_OPTIONS = [
  {
    value: TransactionType.EXPENSE,
    label: "Despesa",
  },
  {
    value: TransactionType.DEPOSIT,
    label: "Renda",
  },
  {
    value: TransactionType.INVESTMENT,
    label: "Investimento",
  },
];

export const TRANSACTION_PAYMENT_METHOD_OPTIONS = [
  {
    value: TransactionPaymentMethod.BANK_TRANSFER,
    label:
      TRANSACTION_PAYMENT_METHOD_LABELS[TransactionPaymentMethod.BANK_TRANSFER],
  },
  {
    value: TransactionPaymentMethod.BANK_SLIP,
    label:
      TRANSACTION_PAYMENT_METHOD_LABELS[TransactionPaymentMethod.BANK_SLIP],
  },
  {
    value: TransactionPaymentMethod.CASH,
    label: TRANSACTION_PAYMENT_METHOD_LABELS[TransactionPaymentMethod.CASH],
  },
  {
    value: TransactionPaymentMethod.CREDIT_CARD,
    label:
      TRANSACTION_PAYMENT_METHOD_LABELS[TransactionPaymentMethod.CREDIT_CARD],
  },
  {
    value: TransactionPaymentMethod.DEBIT_CARD,
    label:
      TRANSACTION_PAYMENT_METHOD_LABELS[TransactionPaymentMethod.DEBIT_CARD],
  },
  {
    value: TransactionPaymentMethod.OTHER,
    label: TRANSACTION_PAYMENT_METHOD_LABELS[TransactionPaymentMethod.OTHER],
  },
  {
    value: TransactionPaymentMethod.PIX,
    label: TRANSACTION_PAYMENT_METHOD_LABELS[TransactionPaymentMethod.PIX],
  },
];

export const TRANSACTION_CATEGORY_OPTIONS = [
  {
    value: TransactionCategory.EDUCATION,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.EDUCATION],
  },
  {
    value: TransactionCategory.ENTERTAINMENT,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.ENTERTAINMENT],
  },
  {
    value: TransactionCategory.FOOD,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.FOOD],
  },
  {
    value: TransactionCategory.HEALTH,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.HEALTH],
  },
  {
    value: TransactionCategory.HOUSING,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.HOUSING],
  },
  {
    value: TransactionCategory.OTHER,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.OTHER],
  },
  {
    value: TransactionCategory.SALARY,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.SALARY],
  },
  {
    value: TransactionCategory.TRANSPORTATION,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.TRANSPORTATION],
  },
  {
    value: TransactionCategory.INVESTMENT,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.INVESTMENT],
  },
  {
    value: TransactionCategory.INTEREST,
    label: TRANSACTION_CATEGORY_LABELS[TransactionCategory.INTEREST],
  },
];

export const getTransactionCategoryOptions = (type: TransactionType) => {
  // Se o tipo de transação for 'DEPOSIT' (Renda), retornar categorias 'Outros' e 'Salário'
  if (type === TransactionType.DEPOSIT) {
    return [
      {
        value: TransactionCategory.OTHER,
        label: "Outros",
      },
      {
        value: TransactionCategory.INTEREST,
        label: "Rendimentos",
      },
      {
        value: TransactionCategory.SALARY,
        label: "Salário",
      },
    ];
  }

  // Se o tipo de transação for 'EXPENSE' (Despesa), retornar categorias comuns
  if (type === TransactionType.EXPENSE) {
    return [
      {
        value: TransactionCategory.FOOD,
        label: "Alimentação",
      },
      {
        value: TransactionCategory.EDUCATION,
        label: "Educação",
      },
      {
        value: TransactionCategory.ENTERTAINMENT,
        label: "Entretenimento",
      },
      {
        value: TransactionCategory.HOUSING,
        label: "Moradia",
      },
      {
        value: TransactionCategory.OTHER,
        label: "Outros",
      },
      {
        value: TransactionCategory.HEALTH,
        label: "Saúde",
      },
      {
        value: TransactionCategory.TRANSPORTATION,
        label: "Transporte",
      },
    ];
  }

  // Se o tipo de transação for 'INVESTMENT' (Investimento), retornar categorias 'Investimentos' e 'Outros'
  if (type === TransactionType.INVESTMENT) {
    return [
      {
        value: TransactionCategory.OTHER,
        label: "Outros",
      },
      {
        value: TransactionCategory.INVESTMENT,
        label: "Poupança",
      },
    ];
  }

  // Se o tipo de transação não for nenhum dos casos anteriores, retornar as categorias padrão
  return [
    {
      value: TransactionCategory.OTHER,
      label: "Outros",
    },
  ];
};
