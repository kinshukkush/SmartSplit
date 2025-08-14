// src/components/Groups.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Users,
  Edit,
  Trash2,
  UserPlus,
  QrCode,
  Search,
  Filter,
  MoreVertical,
  Crown,
  Settings,
  TrendingUp,
  Calendar,
  DollarSign,
  Eye,
  Share,
  Copy,
  Mail,
  MessageSquare,
  Bell,
  BellOff,
  Star,
  Archive,
  Unarchive,
  Download,
  Upload,
  Zap,
  Target,
  PieChart,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  UserMinus,
  Shield,
  Sparkles
} from 'lucide-react';

import { useExpense, Group, User, generateId, formatCurrency } from '../context/ExpenseContext';
import LoadingSpinner from './common/LoadingSpinner';
import EmptyState from './common/EmptyState';
import GroupCard from './groups/GroupCard';
import CreateGroupModal from './groups/CreateGroupModal';
import InviteMembersModal from './groups/InviteMembersModal';
import GroupSettingsModal from './groups/GroupSettingsModal';
import GroupAnalytics from './groups/GroupAnalytics';
import QRCodeModal from './common/QRCodeModal';
import ConfirmDialog from './common/ConfirmDialog';
import toast from 'react-hot-toast';

const Groups: React.FC = () => {
  const { state, dispatch, helpers } = useExpense();
  const navigate = useNavigate();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'name' | 'members' | 'activity'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showArchived, setShowArchived] = useState(false);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  
  // Confirmation dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'info'
  });

  // Loading states
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Categories for filtering
  const groupCategories = [
    { id: 'all', name: 'All Groups', icon: Users },
    { id: 'recent', name: 'Recent Activity', icon: Clock },
    { id: 'favorites', name: 'Favorites', icon: Star },
    { id: 'archived', name: 'Archived', icon: Archive }
  ];

  // Enhanced group data with calculations
  const enhancedGroups = useMemo(() => {
    return state.groups.map(group => {
      const groupExpenses = helpers.getExpensesByGroup(group.id);
      const groupBalance = helpers.calculateGroupBalance(group.id);
      const recentActivity = state.activityFeed.filter(activity => 
        activity.relatedEntityId === group.id ||
        groupExpenses.some(exp => exp.id === activity.relatedEntityId)
      ).slice(0, 5);

      const totalAmount = groupExpenses.reduce((sum, exp) => sum + exp.totalAmount, 0);
      const settledAmount = groupExpenses
        .filter(exp => exp.settled)
        .reduce((sum, exp) => sum + exp.totalAmount, 0);
      const pendingAmount = totalAmount - settledAmount;

      const memberBalances = Array.from(groupBalance.entries()).map(([userId, balance]) => {
        const user = state.users.find(u => u.id === userId);
        return {
          user,
          balance,
          isOwed: balance > 0,
          isOwing: balance < 0
        };
      });

      const lastActivity = recentActivity.length > 0 
        ? recentActivity[0].timestamp 
        : group.createdAt;

      return {
        ...group,
        stats: {
          totalExpenses: groupExpenses.length,
          totalAmount,
          settledAmount,
          pendingAmount,
          settlementRate: totalAmount > 0 ? (settledAmount / totalAmount) * 100 : 0,
          memberCount: group.members.length,
          activeMembers: memberBalances.filter(m => Math.abs(m.balance) > 0).length
        },
        memberBalances,
        recentActivity,
        lastActivity,
        isOwedMoney: memberBalances.some(m => m.user?.id === state.currentUser?.id && m.isOwed),
        isOwingMoney: memberBalances.some(m => m.user?.id === state.currentUser?.id && m.isOwing),
        isFavorite: false, // This would come from user preferences
        hasUnreadActivity: recentActivity.some(activity => 
          new Date(activity.timestamp) > new Date(Date.now() - 24 * 60 * 60 * 1000)
        )
      };
    });
  }, [state.groups, state.expenses, state.users, state.currentUser, helpers]);

  // Filtered and sorted groups
  const filteredGroups = useMemo(() => {
    let filtered = enhancedGroups.filter(group => {
      // Search filter
      const matchesSearch = !searchQuery || 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.members.some(memberId => {
          const user = state.users.find(u => u.id === memberId);
          return user?.name.toLowerCase().includes(searchQuery.toLowerCase());
        });

      // Category filter
      const matchesCategory = selectedCategory === 'all' ||
        (selectedCategory === 'recent' && group.hasUnreadActivity) ||
        (selectedCategory === 'favorites' && group.isFavorite) ||
        (selectedCategory === 'archived' && !group.isActive);

      // Archived filter
      const matchesArchived = showArchived ? !group.isActive : group.isActive;

      return matchesSearch && matchesCategory && matchesArchived;
    });

    // Sort groups
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'members':
          return b.stats.memberCount - a.stats.memberCount;
        case 'activity':
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
        case 'recent':
        default:
          return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      }
    });

    return filtered;
  }, [enhancedGroups, searchQuery, selectedCategory, sortBy, showArchived]);

  // Quick stats
  const quickStats = useMemo(() => {
    const activeGroups = enhancedGroups.filter(g => g.isActive);
    const totalMembers = new Set(activeGroups.flatMap(g => g.members)).size;
    const totalExpenses = activeGroups.reduce((sum, g) => sum + g.stats.totalExpenses, 0);
    const totalAmount = activeGroups.reduce((sum, g) => sum + g.stats.totalAmount, 0);
    const youOweTotal = activeGroups.reduce((sum, g) => {
      const userBalance = g.memberBalances.find(m => m.user?.id === state.currentUser?.id);
      return sum + (userBalance && userBalance.isOwing ? Math.abs(userBalance.balance) : 0);
    }, 0);
    const youAreOwedTotal = activeGroups.reduce((sum, g) => {
      const userBalance = g.memberBalances.find(m => m.user?.id === state.currentUser?.id);
      return sum + (userBalance && userBalance.isOwed ? userBalance.balance : 0);
    }, 0);

    return {
      totalGroups: activeGroups.length,
      totalMembers,
      totalExpenses,
      totalAmount,
      youOweTotal,
      youAreOwedTotal,
      netBalance: youAreOwedTotal - youOweTotal
    };
  }, [enhancedGroups, state.currentUser]);

  // Handlers
  const handleCreateGroup = () => {
    setSelectedGroup(null);
    setShowCreateModal(true);
  };

  const handleEditGroup = (group: Group) => {
    setSelectedGroup(group);
    setShowCreateModal(true);
  };

  const handleDeleteGroup = (group: Group) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Group',
      message: `Are you sure you want to delete "${group.name}"? This action cannot be undone and will remove all associated data.`,
      onConfirm: async () => {
        setLoadingStates(prev => ({ ...prev, [`delete-${group.id}`]: true }));
        try {
          dispatch({ type: 'DELETE_GROUP', payload: group.id });
          toast.success('Group deleted successfully');
        } catch (error) {
          toast.error('Failed to delete group');
        } finally {
          setLoadingStates(prev => ({ ...prev, [`delete-${group.id}`]: false }));
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
      type: 'danger'
    });
  };

  const handleArchiveGroup = async (group: Group) => {
    setLoadingStates(prev => ({ ...prev, [`archive-${group.id}`]: true }));
    try {
      const updatedGroup = { ...group, isActive: !group.isActive };
      dispatch({ type: 'UPDATE_GROUP', payload: updatedGroup });
      toast.success(`Group ${group.isActive ? 'archived' : 'unarchived'} successfully`);
    } catch (error) {
      toast.error(`Failed to ${group.isActive ? 'archive' : 'unarchive'} group`);
    } finally {
      setLoadingStates(prev => ({ ...prev, [`archive-${group.id}`]: false }));
    }
  };

  const handleInviteMembers = (group: Group) => {
    setSelectedGroup(group);
    setShowInviteModal(true);
  };

  const handleGenerateQR = (group: Group) => {
    setSelectedGroup(group);
    setShowQRModal(true);
  };

  const handleGroupSettings = (group: Group) => {
    setSelectedGroup(group);
    setShowSettingsModal(true);
  };

  const handleViewAnalytics = (group: Group) => {
    setSelectedGroup(group);
    setShowAnalytics(true);
  };

  const handleLeaveGroup = (group: Group) => {
    if (!state.currentUser) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Leave Group',
      message: `Are you sure you want to leave "${group.name}"? You'll need to be re-invited to join again.`,
      onConfirm: async () => {
        try {
          dispatch({ 
            type: 'REMOVE_GROUP_MEMBER', 
            payload: { groupId: group.id, userId: state.currentUser!.id } 
          });
          toast.success('Left group successfully');
        } catch (error) {
          toast.error('Failed to leave group');
        }
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      },
      type: 'warning'
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div>
          <h1 className={`text-3xl font-bold ${
            state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}>
            Groups 👥
          </h1>
          <p className={`text-lg mt-2 ${
            state.settings.theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Organize friends and track shared expenses
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAnalytics(true)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              state.settings.theme === 'dark'
                ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Analytics</span>
          </button>

          <motion.button
            onClick={handleCreateGroup}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus className="w-5 h-5" />
            <span>Create Group</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Stats */}
      {state.groups.length > 0 && (
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`rounded-xl p-4 ${
            state.settings.theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700/50'
              : 'bg-white border border-gray-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Groups
                </p>
                <p className={`text-2xl font-bold ${
                  state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {quickStats.totalGroups}
                </p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className={`rounded-xl p-4 ${
            state.settings.theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700/50'
              : 'bg-white border border-gray-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Expenses
                </p>
                <p className={`text-2xl font-bold ${
                  state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  {quickStats.totalExpenses}
                </p>
              </div>
              <Receipt className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className={`rounded-xl p-4 ${
            state.settings.theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700/50'
              : 'bg-white border border-gray-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  You Owe
                </p>
                <p className="text-2xl font-bold text-red-500">
                  {formatCurrency(quickStats.youOweTotal, state.settings.defaultCurrency)}
                </p>
              </div>
              <ArrowUpRight className="w-8 h-8 text-red-500" />
            </div>
          </div>

                    <div className={`rounded-xl p-4 ${
            state.settings.theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700/50'
              : 'bg-white border border-gray-200/50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${
                  state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  You're Owed
                </p>
                <p className="text-2xl font-bold text-green-500">
                  {formatCurrency(quickStats.youAreOwedTotal, state.settings.defaultCurrency)}
                </p>
              </div>
              <ArrowDownLeft className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Filters and Search */}
      <motion.div variants={itemVariants} className={`rounded-xl p-6 ${
        state.settings.theme === 'dark'
          ? 'bg-gray-800/50 border border-gray-700/50'
          : 'bg-white/80 border border-gray-200/50'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search groups or members..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                state.settings.theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
              }`}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                state.settings.theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
              }`}
            >
              {groupCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`px-3 py-2 rounded-lg border transition-colors ${
                state.settings.theme === 'dark'
                  ? 'bg-gray-700 border-gray-600 text-white focus:ring-purple-500 focus:border-purple-500'
                  : 'bg-white border-gray-300 text-gray-900 focus:ring-purple-500 focus:border-purple-500'
              }`}
            >
              <option value="recent">Recent Activity</option>
              <option value="name">Name</option>
              <option value="members">Member Count</option>
              <option value="activity">Last Activity</option>
            </select>

            {/* View Mode Toggle */}
            <div className={`flex rounded-lg border ${
              state.settings.theme === 'dark'
                ? 'bg-gray-700 border-gray-600'
                : 'bg-white border-gray-300'
            }`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-l-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-purple-500 text-white'
                    : state.settings.theme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-r-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-purple-500 text-white'
                    : state.settings.theme === 'dark'
                      ? 'text-gray-400 hover:text-white'
                      : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Show Archived Toggle */}
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                showArchived
                  ? 'bg-purple-500 border-purple-500 text-white'
                  : state.settings.theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Archive className="w-4 h-4" />
              <span>Archived</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Groups Display */}
      <AnimatePresence mode="wait">
        {filteredGroups.length > 0 ? (
          <motion.div
            key="groups-list"
            variants={itemVariants}
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
            }
          >
            {filteredGroups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <GroupCard
                  group={group}
                  viewMode={viewMode}
                  onEdit={() => handleEditGroup(group)}
                  onDelete={() => handleDeleteGroup(group)}
                  onArchive={() => handleArchiveGroup(group)}
                  onInvite={() => handleInviteMembers(group)}
                  onQRCode={() => handleGenerateQR(group)}
                  onSettings={() => handleGroupSettings(group)}
                  onAnalytics={() => handleViewAnalytics(group)}
                  onLeave={() => handleLeaveGroup(group)}
                  onViewDetails={() => navigate(`/groups/${group.id}`)}
                  isLoading={loadingStates[`delete-${group.id}`] || loadingStates[`archive-${group.id}`]}
                  currentUserId={state.currentUser?.id}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            {state.groups.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No groups yet"
                description="Create your first group to start organizing expenses with friends"
                action={{
                  label: 'Create Your First Group',
                  onClick: handleCreateGroup
                }}
                suggestions={[
                  { label: 'Roommates', onClick: handleCreateGroup },
                  { label: 'Travel Group', onClick: handleCreateGroup },
                  { label: 'Friends', onClick: handleCreateGroup }
                ]}
              />
            ) : (
              <EmptyState
                icon={Search}
                title="No groups found"
                description={`No groups match your current search and filter criteria`}
                action={{
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setShowArchived(false);
                  }
                }}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions Floating Menu */}
      {state.groups.length > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <div className="flex flex-col space-y-2">
            {/* Analytics */}
            <motion.button
              onClick={() => setShowAnalytics(true)}
              className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 ${
                state.settings.theme === 'dark'
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <BarChart3 className="w-5 h-5" />
            </motion.button>

            {/* Create Group */}
            <motion.button
              onClick={handleCreateGroup}
              className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
            >
              <Plus className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {/* Create/Edit Group Modal */}
        {showCreateModal && (
          <CreateGroupModal
            group={selectedGroup}
            isOpen={showCreateModal}
            onClose={() => {
              setShowCreateModal(false);
              setSelectedGroup(null);
            }}
            onSave={(groupData) => {
              if (selectedGroup) {
                const updatedGroup = { ...selectedGroup, ...groupData };
                dispatch({ type: 'UPDATE_GROUP', payload: updatedGroup });
                toast.success('Group updated successfully');
              } else {
                const newGroup: Group = {
                  ...groupData,
                  id: generateId('group'),
                  createdAt: new Date().toISOString(),
                  createdBy: state.currentUser?.id || '',
                  isActive: true,
                  totalExpenses: 0,
                  totalAmount: 0,
                  lastActivity: new Date().toISOString()
                };
                dispatch({ type: 'ADD_GROUP', payload: newGroup });
                toast.success('Group created successfully');
              }
              setShowCreateModal(false);
              setSelectedGroup(null);
            }}
          />
        )}

        {/* Invite Members Modal */}
        {showInviteModal && selectedGroup && (
          <InviteMembersModal
            group={selectedGroup}
            isOpen={showInviteModal}
            onClose={() => {
              setShowInviteModal(false);
              setSelectedGroup(null);
            }}
            onInvite={(userIds, inviteMethod) => {
              // Handle invite logic
              userIds.forEach(userId => {
                dispatch({
                  type: 'ADD_GROUP_MEMBER',
                  payload: { groupId: selectedGroup.id, userId }
                });
              });
              toast.success(`Invited ${userIds.length} member(s) to ${selectedGroup.name}`);
              setShowInviteModal(false);
              setSelectedGroup(null);
            }}
          />
        )}

        {/* Group Settings Modal */}
        {showSettingsModal && selectedGroup && (
          <GroupSettingsModal
            group={selectedGroup}
            isOpen={showSettingsModal}
            onClose={() => {
              setShowSettingsModal(false);
              setSelectedGroup(null);
            }}
            onSave={(settings) => {
              const updatedGroup = { ...selectedGroup, settings };
              dispatch({ type: 'UPDATE_GROUP', payload: updatedGroup });
              toast.success('Group settings updated');
              setShowSettingsModal(false);
              setSelectedGroup(null);
            }}
          />
        )}

        {/* QR Code Modal */}
        {showQRModal && selectedGroup && (
          <QRCodeModal
            isOpen={showQRModal}
            onClose={() => {
              setShowQRModal(false);
              setSelectedGroup(null);
            }}
            title={`Join ${selectedGroup.name}`}
            data={`${window.location.origin}/groups/join/${selectedGroup.id}`}
            description="Share this QR code or link to invite people to your group"
          />
        )}

        {/* Group Analytics Modal */}
        {showAnalytics && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowAnalytics(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-6xl max-h-[90vh] overflow-hidden"
            >
              <GroupAnalytics
                groups={selectedGroup ? [selectedGroup] : enhancedGroups.filter(g => g.isActive)}
                onClose={() => {
                  setShowAnalytics(false);
                  setSelectedGroup(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}

        {/* Confirmation Dialog */}
        {confirmDialog.isOpen && (
          <ConfirmDialog
            isOpen={confirmDialog.isOpen}
            title={confirmDialog.title}
            message={confirmDialog.message}
            type={confirmDialog.type}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          />
        )}
      </AnimatePresence>

      {/* Recent Activity Summary */}
      {state.groups.length > 0 && (
        <motion.div
          variants={itemVariants}
          className={`rounded-xl p-6 ${
            state.settings.theme === 'dark'
              ? 'bg-gray-800/50 border border-gray-700/50'
              : 'bg-white/80 border border-gray-200/50'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-lg font-semibold ${
              state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              Recent Group Activity
            </h3>
            <Link
              to="/activity?filter=groups"
              className="text-purple-500 hover:text-purple-400 text-sm font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {state.activityFeed
              .filter(activity => 
                enhancedGroups.some(group => 
                  group.id === activity.relatedEntityId ||
                  helpers.getExpensesByGroup(group.id).some(exp => exp.id === activity.relatedEntityId)
                )
              )
              .slice(0, 5)
              .map(activity => (
                <div
                  key={activity.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg ${
                    state.settings.theme === 'dark'
                      ? 'bg-gray-700/50'
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-medium">
                    {activity.userName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${
                      state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      <span className="font-medium">{activity.userName}</span> {activity.description}
                    </p>
                    <p className={`text-xs ${
                      state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {new Date(activity.timestamp).toRelative()}
                    </p>
                  </div>
                  {activity.metadata?.amount && (
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        state.settings.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {formatCurrency(activity.metadata.amount, activity.metadata.currency)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {state.activityFeed.length === 0 && (
            <div className="text-center py-8">
              <Activity className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className={`text-sm ${
                state.settings.theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                No recent activity in your groups
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Groups;