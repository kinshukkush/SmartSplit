// src/context/ExpenseContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// --- TYPE DEFINITIONS ---

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  color?: string;
  paymentMethods: PaymentMethod[];
  createdAt: string;
  isActive: boolean;
  preferences: {
    defaultCurrency: string;
    notifications: NotificationSettings;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'bank' | 'upi' | 'card' | 'cash' | 'paypal' | 'venmo';
  name: string;
  identifier: string; // UPI ID, card last 4 digits, etc.
  isDefault: boolean;
}

export interface NotificationSettings {
  expenseAdded: boolean;
  paymentReceived: boolean;
  paymentRequest: boolean;
  reminders: boolean;
  weeklyReports: boolean;
}

export interface Participant {
  id: string; // User ID
  name: string;
  email?: string;
  avatar?: string;
  owedAmount: number;
  paidAmount: number;
  netAmount: number; // negative if they owe, positive if they're owed
  settled: boolean;
  splitType: 'equal' | 'percentage' | 'exact' | 'shares';
  splitValue?: number; // percentage, exact amount, or number of shares
  itemizedSplit?: ItemizedSplit[];
}

export interface ItemizedSplit {
  itemId: string;
  itemName: string;
  itemCost: number;
  quantity: number;
  participants: string[]; // User IDs who share this item
}

export interface Payment {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  date: string;
  method: PaymentMethod;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  notes?: string;
  relatedExpenseIds: string[];
}

export interface Expense {
  id: string;
  title: string;
  description: string;
  baseAmount: number;
  tax: number;
  tip: number;
  totalAmount: number;
  currency: string;
  exchangeRate?: number; // If different from default currency
  splitType: 'equal' | 'percentage' | 'exact' | 'shares' | 'itemized';
  participants: Participant[];
  paidBy: string[]; // Multiple users can pay
  paymentBreakdown: { userId: string; amount: number; method: PaymentMethod }[];
  category: string;
  subcategory?: string;
  date: string;
  location?: {
    name: string;
    address: string;
    coordinates?: { lat: number; lng: number };
  };
  settled: boolean;
  receiptUrl?: string;
  receiptImages?: string[];
  tags: string[];
  groupId?: string;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  attachments?: Attachment[];
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval: number; // every N days/weeks/months/years
  endDate?: string;
  nextDate: string;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[]; // User IDs
  admins: string[]; // User IDs who can modify group
  color: string;
  avatar?: string;
  category: string;
  settings: GroupSettings;
  createdAt: string;
  createdBy: string;
  isActive: boolean;
  totalExpenses: number;
  totalAmount: number;
  lastActivity: string;
}

export interface GroupSettings {
  defaultSplitType: 'equal' | 'percentage' | 'exact' | 'shares';
  defaultCurrency: string;
  allowMemberInvites: boolean;
  requireApprovalForExpenses: boolean;
  categories: string[];
}

export interface Reminder {
  id: string;
  type: 'payment_due' | 'expense_added' | 'settlement_suggestion';
  title: string;
  message: string;
  fromUserId: string;
  toUserId: string;
  amount?: number;
  currency?: string;
  expenseIds: string[];
  dueDate?: string;
  status: 'pending' | 'sent' | 'acknowledged' | 'dismissed';
  createdAt: string;
  sentAt?: string;
  method: 'in_app' | 'email' | 'sms' | 'push';
}

export interface Settlement {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  expenseIds: string[];
  suggestedDate: string;
  status: 'suggested' | 'agreed' | 'completed' | 'declined';
  method?: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: Subcategory[];
  isDefault: boolean;
  usageCount: number;
}

export interface Subcategory {
  id: string;
  name: string;
  icon: string;
  parentCategoryId: string;
}

export interface ActivityFeedItem {
  id: string;
  type: 'expense_added' | 'expense_updated' | 'payment_made' | 'user_joined' | 'group_created' | 'reminder_sent';
  title: string;
  description: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  timestamp: string;
  relatedEntityId?: string; // expense ID, group ID, etc.
  metadata?: Record<string, any>;
}

export interface DebtSummary {
  userId: string;
  userName: string;
  userAvatar?: string;
  totalOwed: number;
  totalOwing: number;
  netAmount: number;
  currency: string;
  lastActivity: string;
  expenseCount: number;
}

// --- STATE AND ACTIONS ---

interface ExpenseState {
  users: User[];
  expenses: Expense[];
  groups: Group[];
  payments: Payment[];
  reminders: Reminder[];
  settlements: Settlement[];
  categories: Category[];
  activityFeed: ActivityFeedItem[];
  currentUser: User | null;
  settings: AppSettings;
  isLoading: boolean;
  error: string | null;
  syncStatus: 'idle' | 'syncing' | 'error';
  lastSyncAt?: string;
}

interface AppSettings {
  defaultCurrency: string;
  supportedCurrencies: string[];
  notifications: NotificationSettings;
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: string;
  numberFormat: string;
  autoSettleThreshold: number;
  reminderFrequency: 'daily' | 'weekly' | 'monthly';
  backupEnabled: boolean;
  biometricEnabled: boolean;
}

type ExpenseAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SYNC_STATUS'; payload: 'idle' | 'syncing' | 'error' }
  | { type: 'LOAD_DATA'; payload: Partial<ExpenseState> }
  | { type: 'SET_CURRENT_USER'; payload: User | null }

  // User actions
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string }

  // Expense actions
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SETTLE_EXPENSE'; payload: string }

  // Group actions
  | { type: 'ADD_GROUP'; payload: Group }
  | { type: 'UPDATE_GROUP'; payload: Group }
  | { type: 'DELETE_GROUP'; payload: string }
  | { type: 'ADD_GROUP_MEMBER'; payload: { groupId: string; userId: string } }
  | { type: 'REMOVE_GROUP_MEMBER'; payload: { groupId: string; userId: string } }

  // Payment actions
  | { type: 'ADD_PAYMENT'; payload: Payment }
  | { type: 'UPDATE_PAYMENT'; payload: Payment }
  | { type: 'DELETE_PAYMENT'; payload: string }

  // Reminder actions
  | { type: 'ADD_REMINDER'; payload: Reminder }
  | { type: 'UPDATE_REMINDER'; payload: Reminder }
  | { type: 'DELETE_REMINDER'; payload: string }
  | { type: 'DISMISS_REMINDER'; payload: string }

  // Settlement actions
  | { type: 'ADD_SETTLEMENT'; payload: Settlement }
  | { type: 'UPDATE_SETTLEMENT'; payload: Settlement }
  | { type: 'DELETE_SETTLEMENT'; payload: string }

  // Category actions
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }

  // Activity feed actions
  | { type: 'ADD_ACTIVITY'; payload: ActivityFeedItem }
  | { type: 'CLEAR_ACTIVITY_FEED' }

  // Settings actions
  | { type: 'UPDATE_SETTINGS'; payload: Partial<AppSettings> }
  | { type: 'RESET_SETTINGS' };

const defaultCategories: Category[] = [
  {
    id: 'general',
    name: 'General',
    icon: '💰',
    color: '#6366f1',
    isDefault: true,
    usageCount: 0,
    subcategories: [
      { id: 'general-misc', name: 'Miscellaneous', icon: '🔄', parentCategoryId: 'general' }
    ]
  },
  {
    id: 'food',
    name: 'Food & Dining',
    icon: '🍽️',
    color: '#f59e0b',
    isDefault: true,
    usageCount: 0,
    subcategories: [
      { id: 'food-restaurant', name: 'Restaurant', icon: '🏪', parentCategoryId: 'food' },
      { id: 'food-groceries', name: 'Groceries', icon: '🛒', parentCategoryId: 'food' },
      { id: 'food-takeout', name: 'Takeout', icon: '🥡', parentCategoryId: 'food' }
    ]
  },
  {
    id: 'transport',
    name: 'Transportation',
    icon: '🚗',
    color: '#10b981',
    isDefault: true,
    usageCount: 0,
    subcategories: [
      { id: 'transport-taxi', name: 'Taxi/Ride Share', icon: '🚕', parentCategoryId: 'transport' },
      { id: 'transport-gas', name: 'Gas', icon: '⛽', parentCategoryId: 'transport' },
      { id: 'transport-parking', name: 'Parking', icon: '🅿️', parentCategoryId: 'transport' }
    ]
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: '#ec4899',
    isDefault: true,
    usageCount: 0,
    subcategories: [
      { id: 'entertainment-movies', name: 'Movies', icon: '🎭', parentCategoryId: 'entertainment' },
      { id: 'entertainment-games', name: 'Games', icon: '🎮', parentCategoryId: 'entertainment' },
      { id: 'entertainment-events', name: 'Events', icon: '🎪', parentCategoryId: 'entertainment' }
    ]
  },
  {
    id: 'utilities',
    name: 'Utilities',
    icon: '💡',
    color: '#8b5cf6',
    isDefault: true,
    usageCount: 0,
    subcategories: [
      { id: 'utilities-electricity', name: 'Electricity', icon: '⚡', parentCategoryId: 'utilities' },
      { id: 'utilities-water', name: 'Water', icon: '💧', parentCategoryId: 'utilities' },
      { id: 'utilities-internet', name: 'Internet', icon: '📡', parentCategoryId: 'utilities' }
    ]
  }
];

const initialState: ExpenseState = {
  users: [
    {
      id: 'user-1',
      name: 'You',
      email: 'you@example.com',
      phone: '+1234567890',
      avatar: '',
      color: '#6366f1',
      paymentMethods: [
        {
          id: 'pm-1',
          type: 'upi',
          name: 'Primary UPI',
          identifier: 'you@paytm',
          isDefault: true
        }
      ],
      createdAt: new Date().toISOString(),
      isActive: true,
      preferences: {
        defaultCurrency: 'INR',
        notifications: {
          expenseAdded: true,
          paymentReceived: true,
          paymentRequest: true,
          reminders: true,
          weeklyReports: false
        }
      }
    }
  ],
  expenses: [],
  groups: [],
  payments: [],
  reminders: [],
  settlements: [],
  categories: defaultCategories,
  activityFeed: [],
  currentUser: null,
  settings: {
    defaultCurrency: 'INR',
    supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    notifications: {
      expenseAdded: true,
      paymentReceived: true,
      paymentRequest: true,
      reminders: true,
      weeklyReports: false
    },
    theme: 'system',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    numberFormat: '1,00,000.00',
    autoSettleThreshold: 10,
    reminderFrequency: 'weekly',
    backupEnabled: true,
    biometricEnabled: false
  },
  isLoading: true,
  error: null,
  syncStatus: 'idle'
};

function expenseReducer(state: ExpenseState, action: ExpenseAction): ExpenseState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, isLoading: false, error: action.payload };

    case 'SET_SYNC_STATUS':
      return {
        ...state,
        syncStatus: action.payload,
        lastSyncAt: action.payload === 'idle' ? new Date().toISOString() : state.lastSyncAt
      };

    case 'LOAD_DATA':
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null,
        categories: action.payload.categories || defaultCategories
      };

    case 'SET_CURRENT_USER':
      return { ...state, currentUser: action.payload };

    // User actions
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload],
        activityFeed: [{
          id: `activity-${Date.now()}`,
          type: 'user_joined',
          title: 'New user added',
          description: `${action.payload.name} joined SmartSplit`,
          userId: action.payload.id,
          userName: action.payload.name,
          userAvatar: action.payload.avatar,
          timestamp: new Date().toISOString(),
          relatedEntityId: action.payload.id
        }, ...state.activityFeed.slice(0, 49)]
      };

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        )
      };

    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload)
      };

    // Expense actions
    case 'ADD_EXPENSE':
      const newExpense = action.payload;
      return {
        ...state,
        expenses: [...state.expenses, newExpense],
        categories: state.categories.map(cat =>
          cat.id === newExpense.category
            ? { ...cat, usageCount: cat.usageCount + 1 }
            : cat
        ),
        activityFeed: [{
          id: `activity-${Date.now()}`,
          type: 'expense_added',
          title: 'New expense added',
          description: `${newExpense.title} - ${newExpense.currency} ${newExpense.totalAmount}`,
          userId: newExpense.createdBy,
          userName: state.users.find(u => u.id === newExpense.createdBy)?.name || 'Unknown',
          userAvatar: state.users.find(u => u.id === newExpense.createdBy)?.avatar,
          timestamp: new Date().toISOString(),
          relatedEntityId: newExpense.id,
          metadata: { amount: newExpense.totalAmount, currency: newExpense.currency }
        }, ...state.activityFeed.slice(0, 49)]
      };

    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(exp =>
          exp.id === action.payload.id ? { ...action.payload, updatedAt: new Date().toISOString() } : exp
        )
      };

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(exp => exp.id !== action.payload)
      };

    case 'SETTLE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(exp =>
          exp.id === action.payload
            ? {
              ...exp,
              settled: true,
              participants: exp.participants.map(p => ({ ...p, settled: true })),
              updatedAt: new Date().toISOString()
            }
            : exp
        )
      };

    // Group actions
    case 'ADD_GROUP':
      return {
        ...state,
        groups: [...state.groups, action.payload],
        activityFeed: [{
          id: `activity-${Date.now()}`,
          type: 'group_created',
          title: 'New group created',
          description: `${action.payload.name} group was created`,
          userId: action.payload.createdBy,
          userName: state.users.find(u => u.id === action.payload.createdBy)?.name || 'Unknown',
          userAvatar: state.users.find(u => u.id === action.payload.createdBy)?.avatar,
          timestamp: new Date().toISOString(),
          relatedEntityId: action.payload.id
        }, ...state.activityFeed.slice(0, 49)]
      };

    case 'UPDATE_GROUP':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.id ? action.payload : group
        )
      };

    case 'DELETE_GROUP':
      return {
        ...state,
        groups: state.groups.filter(group => group.id !== action.payload)
      };

    case 'ADD_GROUP_MEMBER':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.groupId
            ? { ...group, members: [...group.members, action.payload.userId] }
            : group
        )
      };

    case 'REMOVE_GROUP_MEMBER':
      return {
        ...state,
        groups: state.groups.map(group =>
          group.id === action.payload.groupId
            ? { ...group, members: group.members.filter(id => id !== action.payload.userId) }
            : group
        )
      };

    // Payment actions
    case 'ADD_PAYMENT':
      return {
        ...state,
        payments: [...state.payments, action.payload],
        activityFeed: [{
          id: `activity-${Date.now()}`,
          type: 'payment_made',
          title: 'Payment recorded',
          description: `${action.payload.currency} ${action.payload.amount} payment`,
          userId: action.payload.fromUserId,
          userName: state.users.find(u => u.id === action.payload.fromUserId)?.name || 'Unknown',
          userAvatar: state.users.find(u => u.id === action.payload.fromUserId)?.avatar,
          timestamp: new Date().toISOString(),
          relatedEntityId: action.payload.id,
          metadata: { amount: action.payload.amount, currency: action.payload.currency }
        }, ...state.activityFeed.slice(0, 49)]
      };

    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment =>
          payment.id === action.payload.id ? action.payload : payment
        )
      };

    case 'DELETE_PAYMENT':
      return {
        ...state,
        payments: state.payments.filter(payment => payment.id !== action.payload)
      };

    // Reminder actions
    case 'ADD_REMINDER':
      return { ...state, reminders: [...state.reminders, action.payload] };

    case 'UPDATE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map(reminder =>
          reminder.id === action.payload.id ? action.payload : reminder
        )
      };

    case 'DELETE_REMINDER':
      return {
        ...state,
        reminders: state.reminders.filter(reminder => reminder.id !== action.payload)
      };

    case 'DISMISS_REMINDER':
      return {
        ...state,
        reminders: state.reminders.map(reminder =>
          reminder.id === action.payload
            ? { ...reminder, status: 'dismissed' as const }
            : reminder
        )
      };

    // Settlement actions
    case 'ADD_SETTLEMENT':
      return { ...state, settlements: [...state.settlements, action.payload] };

    case 'UPDATE_SETTLEMENT':
      return {
        ...state,
        settlements: state.settlements.map(settlement =>
          settlement.id === action.payload.id ? action.payload : settlement
        )
      };

    case 'DELETE_SETTLEMENT':
      return {
        ...state,
        settlements: state.settlements.filter(settlement => settlement.id !== action.payload)
      };

    // Category actions
    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(category =>
          category.id === action.payload.id ? action.payload : category
        )
      };

    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(category => category.id !== action.payload)
      };

    // Activity feed actions
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activityFeed: [action.payload, ...state.activityFeed.slice(0, 49)] // Keep last 50 activities
      };

    case 'CLEAR_ACTIVITY_FEED':
      return { ...state, activityFeed: [] };

    // Settings actions
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };

    case 'RESET_SETTINGS':
      return { ...state, settings: initialState.settings };

    default:
      return state;
  }
}

// --- CONTEXT DEFINITION ---

const ExpenseContext = createContext<{
  state: ExpenseState;
  dispatch: React.Dispatch<ExpenseAction>;
  // Helper functions
  helpers: {
    calculateBalance: (userId: string) => DebtSummary;
    getSettlementSuggestions: () => Settlement[];
    getUserDebts: (userId: string) => { owes: DebtSummary[]; owed: DebtSummary[] };
    getExpensesByGroup: (groupId: string) => Expense[];
    getExpensesByCategory: (categoryId: string) => Expense[];
    getExpensesByDateRange: (startDate: string, endDate: string) => Expense[];
    calculateGroupBalance: (groupId: string) => Map<string, number>;
    getUnreadReminders: (userId: string) => Reminder[];
    createAutoReminder: (expenseId: string, dueDate: string) => void;
    optimizeSettlements: (userIds: string[]) => Settlement[];
    exportData: (format: 'json' | 'csv', dateRange?: { start: string; end: string }) => string;
    importData: (data: string, format: 'json') => Promise<void>;
  };
}>({
  state: initialState,
  dispatch: () => { },
  helpers: {} as any
});

export const useExpense = () => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

// --- HELPER FUNCTIONS ---

const createHelpers = (state: ExpenseState, dispatch: React.Dispatch<ExpenseAction>) => ({

  calculateBalance: (userId: string): DebtSummary => {
    const user = state.users.find(u => u.id === userId);
    if (!user) {
      return {
        userId,
        userName: 'Unknown User',
        totalOwed: 0,
        totalOwing: 0,
        netAmount: 0,
        currency: state.settings.defaultCurrency,
        lastActivity: new Date().toISOString(),
        expenseCount: 0
      };
    }

    let totalOwed = 0;
    let totalOwing = 0;
    let expenseCount = 0;
    let lastActivity = new Date(0).toISOString();

    state.expenses.forEach(expense => {
      if (new Date(expense.date) > new Date(lastActivity)) {
        lastActivity = expense.date;
      }

      const participant = expense.participants.find(p => p.id === userId);
      if (participant && !participant.settled) {
        expenseCount++;
        if (participant.netAmount < 0) {
          totalOwing += Math.abs(participant.netAmount);
        } else if (participant.netAmount > 0) {
          totalOwed += participant.netAmount;
        }
      }
    });

    return {
      userId,
      userName: user.name,
      userAvatar: user.avatar,
      totalOwed,
      totalOwing,
      netAmount: totalOwed - totalOwing,
      currency: state.settings.defaultCurrency,
      lastActivity,
      expenseCount
    };
  },

  getSettlementSuggestions: (): Settlement[] => {
    const suggestions: Settlement[] = [];
    const userBalances = new Map<string, number>();

    // Calculate net balances for all users
    state.users.forEach(user => {
      const balance = createHelpers(state, dispatch).calculateBalance(user.id);
      userBalances.set(user.id, balance.netAmount);
    });

    // Create settlement suggestions
    const creditors = Array.from(userBalances.entries()).filter(([_, balance]) => balance > 0);
    const debtors = Array.from(userBalances.entries()).filter(([_, balance]) => balance < 0);

    creditors.forEach(([creditorId, creditAmount]) => {
      debtors.forEach(([debtorId, debtAmount]) => {
        const settlementAmount = Math.min(creditAmount, Math.abs(debtAmount));

        if (settlementAmount >= state.settings.autoSettleThreshold) {
          const relatedExpenses = state.expenses
            .filter(exp =>
              exp.participants.some(p => p.id === creditorId && p.netAmount > 0) &&
              exp.participants.some(p => p.id === debtorId && p.netAmount < 0) &&
              !exp.settled
            )
            .map(exp => exp.id);

          if (relatedExpenses.length > 0) {
            suggestions.push({
              id: `settlement-${debtorId}-${creditorId}-${Date.now()}`,
              fromUserId: debtorId,
              toUserId: creditorId,
              amount: settlementAmount,
              currency: state.settings.defaultCurrency,
              expenseIds: relatedExpenses,
              suggestedDate: new Date().toISOString(),
              status: 'suggested',
              createdAt: new Date().toISOString()
            });
          }
        }
      });
    });

    return suggestions;
  },

  getUserDebts: (userId: string) => {
    const owes: DebtSummary[] = [];
    const owed: DebtSummary[] = [];
    const userDebts = new Map<string, number>();

    state.expenses.forEach(expense => {
      const userParticipant = expense.participants.find(p => p.id === userId);
      if (userParticipant && !userParticipant.settled) {
        expense.participants.forEach(participant => {
          if (participant.id !== userId && !participant.settled) {
            const currentDebt = userDebts.get(participant.id) || 0;

            if (userParticipant.netAmount < 0 && participant.netAmount > 0) {
              // User owes this participant
              const amount = Math.min(Math.abs(userParticipant.netAmount), participant.netAmount);
              userDebts.set(participant.id, currentDebt - amount);
            } else if (userParticipant.netAmount > 0 && participant.netAmount < 0) {
              // Participant owes user
              const amount = Math.min(userParticipant.netAmount, Math.abs(participant.netAmount));
              userDebts.set(participant.id, currentDebt + amount);
            }
          }
        });
      }
    });

    userDebts.forEach((amount, participantId) => {
      const participant = state.users.find(u => u.id === participantId);
      if (participant) {
        const summary: DebtSummary = {
          userId: participantId,
          userName: participant.name,
          userAvatar: participant.avatar,
          totalOwed: amount > 0 ? amount : 0,
          totalOwing: amount < 0 ? Math.abs(amount) : 0,
          netAmount: amount,
          currency: state.settings.defaultCurrency,
          lastActivity: new Date().toISOString(),
          expenseCount: 0
        };

        if (amount < 0) {
          owes.push(summary);
        } else if (amount > 0) {
          owed.push(summary);
        }
      }
    });

    return { owes, owed };
  },

  getExpensesByGroup: (groupId: string): Expense[] => {
    return state.expenses.filter(expense => expense.groupId === groupId);
  },

  getExpensesByCategory: (categoryId: string): Expense[] => {
    return state.expenses.filter(expense => expense.category === categoryId);
  },

  getExpensesByDateRange: (startDate: string, endDate: string): Expense[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return state.expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= start && expenseDate <= end;
    });
  },

  calculateGroupBalance: (groupId: string): Map<string, number> => {
    const balances = new Map<string, number>();
    const groupExpenses = createHelpers(state, dispatch).getExpensesByGroup(groupId);

    groupExpenses.forEach(expense => {
      expense.participants.forEach(participant => {
        const currentBalance = balances.get(participant.id) || 0;
        balances.set(participant.id, currentBalance + participant.netAmount);
      });
    });

    return balances;
  },

  getUnreadReminders: (userId: string): Reminder[] => {
    return state.reminders.filter(reminder =>
      reminder.toUserId === userId &&
      reminder.status === 'pending'
    );
  },

  createAutoReminder: (expenseId: string, dueDate: string): void => {
    const expense = state.expenses.find(exp => exp.id === expenseId);
    if (!expense) return;

    const unpaidParticipants = expense.participants.filter(p => !p.settled && p.netAmount < 0);

    unpaidParticipants.forEach(participant => {
      const reminder: Reminder = {
        id: `reminder-${expenseId}-${participant.id}-${Date.now()}`,
        type: 'payment_due',
        title: 'Payment Due',
        message: `You owe ${expense.currency} ${Math.abs(participant.netAmount)} for "${expense.title}"`,
        fromUserId: expense.createdBy,
        toUserId: participant.id,
        amount: Math.abs(participant.netAmount),
        currency: expense.currency,
        expenseIds: [expenseId],
        dueDate,
        status: 'pending',
        createdAt: new Date().toISOString(),
        method: 'in_app'
      };

      dispatch({ type: 'ADD_REMINDER', payload: reminder });
    });
  },

  optimizeSettlements: (userIds: string[]): Settlement[] => {
    const balances = new Map<string, number>();

    // Calculate net balances for specified users
    userIds.forEach(userId => {
      const balance = createHelpers(state, dispatch).calculateBalance(userId);
      balances.set(userId, balance.netAmount);
    });

    const optimizedSettlements: Settlement[] = [];
    const creditors = Array.from(balances.entries())
      .filter(([_, balance]) => balance > 0)
      .sort((a, b) => b[1] - a[1]);

    const debtors = Array.from(balances.entries())
      .filter(([_, balance]) => balance < 0)
      .sort((a, b) => a[1] - b[1]);

    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const [creditorId, creditAmount] = creditors[i];
      const [debtorId, debtAmount] = debtors[j];

      const settlementAmount = Math.min(creditAmount, Math.abs(debtAmount));

      if (settlementAmount > 0) {
        optimizedSettlements.push({
          id: `optimized-settlement-${Date.now()}-${i}-${j}`,
          fromUserId: debtorId,
          toUserId: creditorId,
          amount: settlementAmount,
          currency: state.settings.defaultCurrency,
          expenseIds: [], // Would need to calculate related expenses
          suggestedDate: new Date().toISOString(),
          status: 'suggested',
          createdAt: new Date().toISOString()
        });

        creditors[i] = [creditorId, creditAmount - settlementAmount];
        debtors[j] = [debtorId, debtAmount + settlementAmount];

        if (creditors[i][1] === 0) i++;
        if (debtors[j][1] === 0) j++;
      }
    }

    return optimizedSettlements;
  },

  exportData: (format: 'json' | 'csv', dateRange?: { start: string; end: string }): string => {
    let expenses = state.expenses;

    if (dateRange) {
      expenses = createHelpers(state, dispatch).getExpensesByDateRange(dateRange.start, dateRange.end);
    }

    if (format === 'json') {
      return JSON.stringify({
        expenses,
        users: state.users,
        groups: state.groups,
        payments: state.payments,
        exportedAt: new Date().toISOString()
      }, null, 2);
    } else if (format === 'csv') {
      const headers = ['Date', 'Title', 'Amount', 'Currency', 'Category', 'Paid By', 'Participants', 'Settled'];
      const rows = expenses.map(expense => [
        expense.date,
        expense.title,
        expense.totalAmount.toString(),
        expense.currency,
        expense.category,
        state.users.find(u => expense.paidBy.includes(u.id))?.name || 'Unknown',
        expense.participants.map(p => p.name).join('; '),
        expense.settled ? 'Yes' : 'No'
      ]);

      return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    return '';
  },

  importData: async (data: string, format: 'json'): Promise<void> => {
    try {
      if (format === 'json') {
        const parsedData = JSON.parse(data);

        // Validate and merge data
        if (parsedData.expenses) {
          parsedData.expenses.forEach((expense: Expense) => {
            dispatch({ type: 'ADD_EXPENSE', payload: expense });
          });
        }

        if (parsedData.users) {
          parsedData.users.forEach((user: User) => {
            if (!state.users.find(u => u.id === user.id)) {
              dispatch({ type: 'ADD_USER', payload: user });
            }
          });
        }

        if (parsedData.groups) {
          parsedData.groups.forEach((group: Group) => {
            if (!state.groups.find(g => g.id === group.id)) {
              dispatch({ type: 'ADD_GROUP', payload: group });
            }
          });
        }
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Failed to import data. Please check the format.' });
    }
  }
});

// --- PROVIDER COMPONENT ---

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // Create helper functions
  const helpers = createHelpers(state, dispatch);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedData = localStorage.getItem('smartsplit-data');
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          dispatch({ type: 'LOAD_DATA', payload: parsedData });

          // Set current user if exists
          if (parsedData.currentUser) {
            dispatch({ type: 'SET_CURRENT_USER', payload: parsedData.currentUser });
          } else if (parsedData.users && parsedData.users.length > 0) {
            dispatch({ type: 'SET_CURRENT_USER', payload: parsedData.users[0] });
          }
        } else {
          // First time user - set default current user
          dispatch({ type: 'SET_CURRENT_USER', payload: initialState.users[0] });
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Failed to load data from localStorage', error);
        dispatch({ type: 'SET_ERROR', payload: 'Could not load saved data. Starting fresh.' });
        dispatch({ type: 'SET_CURRENT_USER', payload: initialState.users[0] });
      }
    };

    loadData();
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!state.isLoading && state.currentUser) {
      const { isLoading, error, syncStatus, ...dataToSave } = state;
      try {
        localStorage.setItem('smartsplit-data', JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Failed to save data to localStorage', error);
        dispatch({ type: 'SET_ERROR', payload: 'Could not save data locally.' });
      }
    }
  }, [state, state.isLoading]);

  // Auto-create reminders for overdue payments
  useEffect(() => {
    if (!state.isLoading && state.currentUser) {
      const now = new Date();
      const overdueThreshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago

      state.expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        if (expenseDate < overdueThreshold && !expense.settled) {
          const hasReminder = state.reminders.some(reminder =>
            reminder.expenseIds.includes(expense.id) &&
            reminder.status === 'pending'
          );

          if (!hasReminder) {
            helpers.createAutoReminder(expense.id, now.toISOString());
          }
        }
      });
    }
  }, [state.expenses, state.isLoading, state.currentUser]);

  return (
    <ExpenseContext.Provider value={{ state, dispatch, helpers }}>
      {children}
    </ExpenseContext.Provider>
  );
};

// --- UTILITY FUNCTIONS ---

export const generateId = (prefix: string = 'id'): string => {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const formatCurrency = (amount: number, currency: string, locale: string = 'en-IN'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export const calculateSplitAmounts = (
  totalAmount: number,
  participants: Omit<Participant, 'owedAmount' | 'paidAmount' | 'netAmount'>[],
  splitType: Expense['splitType']
): Participant[] => {
  const result: Participant[] = participants.map(p => ({
    ...p,
    owedAmount: 0,
    paidAmount: 0,
    netAmount: 0
  }));

  switch (splitType) {
    case 'equal':
      const equalAmount = totalAmount / participants.length;
      result.forEach(p => {
        p.owedAmount = equalAmount;
        p.netAmount = -equalAmount; // They owe this amount
      });
      break;

    case 'percentage':
      const totalPercentage = participants.reduce((sum, p) => sum + (p.splitValue || 0), 0);
      if (totalPercentage !== 100) {
        throw new Error('Percentages must add up to 100%');
      }
      result.forEach(p => {
        const amount = (totalAmount * (p.splitValue || 0)) / 100;
        p.owedAmount = amount;
        p.netAmount = -amount;
      });
      break;

    case 'exact':
      const totalExact = participants.reduce((sum, p) => sum + (p.splitValue || 0), 0);
      if (Math.abs(totalExact - totalAmount) > 0.01) {
        throw new Error('Exact amounts must equal the total amount');
      }
      result.forEach(p => {
        const amount = p.splitValue || 0;
        p.owedAmount = amount;
        p.netAmount = -amount;
      });
      break;

    case 'shares':
      const totalShares = participants.reduce((sum, p) => sum + (p.splitValue || 1), 0);
      result.forEach(p => {
        const amount = (totalAmount * (p.splitValue || 1)) / totalShares;
        p.owedAmount = amount;
        p.netAmount = -amount;
      });
      break;
  }

  return result;
};

export default ExpenseContext;