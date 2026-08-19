import React, { useState } from 'react';
import {
  Users2,
  ShieldCheck,
  ShieldAlert,
  UserPlus,
  Lock,
  CheckCircle2,
  AlertCircle,
  Building,
  KeyRound,
  Shield,
  Edit3
} from 'lucide-react';
import { User, UserRole, CompanyCode, COMPANY_NAMES } from '../types';
import { useAuth } from '../context/AuthContext';
import { ConfirmationModal } from '../components/common/ConfirmationModal';

interface UsersPageProps {
  users: User[];
  onRefreshData?: () => void;
}

export const UsersPage: React.FC<UsersPageProps> = ({ users: initialUsers }) => {
  const { currentUser, isITManager } = useAuth();
  const [usersList, setUsersList] = useState<User[]>(initialUsers);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'IT_SUPPORT' as UserRole,
    allowedCompanies: ['AGIPL', 'ASSPL', 'ONYX'] as CompanyCode[],
  });

  // If unauthorized user accesses this page:
  if (!isITManager) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
          <Lock className="h-7 w-7" />
        </div>
        <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
          Access Restricted • IT Manager Privilege Required
        </h2>
        <p className="mx-auto mt-2 max-w-md text-xs text-slate-500">
          User account provisioning and group access management is restricted exclusively to{' '}
          <strong>Sameer Tupe (IT Manager / Super Admin)</strong>. As IT Support, you have access to hardware inventory, asset editing, and service logs.
        </p>
      </div>
    );
  }

  const handleCreateUser = () => {
    if (!newUserForm.name || !newUserForm.email) return;

    const created: User = {
      id: `usr-${Date.now()}`,
      name: newUserForm.name,
      email: newUserForm.email,
      role: newUserForm.role,
      designation: newUserForm.role === 'IT_MANAGER' ? 'IT Manager / Admin' : 'IT Support Specialist',
      organization: 'ALL',
      allowedCompanies: newUserForm.allowedCompanies,
      active: true,
      lastLogin: 'Never',
    };

    setUsersList([...usersList, created]);
    setAddModalOpen(false);
    setNewUserForm({
      name: '',
      email: '',
      role: 'IT_SUPPORT',
      allowedCompanies: ['AGIPL', 'ASSPL', 'ONYX'],
    });
  };

  const handleToggleStatus = (userId: string) => {
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, active: !u.active } : u))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
              User Management & Access Control
            </h1>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" /> IT Manager Only
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Provision staff accounts, assign roles, and configure organization access rules
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          <span>Provision New IT User</span>
        </button>
      </div>

      {/* Role Definitions & Matrix Banner */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-900 dark:bg-purple-950/20">
          <div className="flex items-center gap-2 font-bold text-xs text-purple-900 dark:text-purple-300">
            <ShieldCheck className="h-4 w-4 text-purple-600" />
            <span>Super Admin / IT Manager (Sameer Tupe)</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
            Full unconstrained administrative privileges across all 3 organizations: create, edit, decommission, import CSV, view valuation, audit history, user accounts, and settings.
          </p>
        </div>

        <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
          <div className="flex items-center gap-2 font-bold text-xs text-blue-900 dark:text-blue-300">
            <Shield className="h-4 w-4 text-blue-600" />
            <span>IT Support Engineer (Rahul Prasad)</span>
          </div>
          <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
            Operational access to add and edit assets, manage employee custody assignments, log maintenance, print tags, and import CSV. Restricted from modifying system users or deleting data.
          </p>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800">
            <tr>
              <th className="px-4 py-3.5">User Profile</th>
              <th className="px-4 py-3.5">System Role</th>
              <th className="px-4 py-3.5">Assigned Organizations</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-4 py-3.5">Last Active</th>
              <th className="px-4 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {usersList.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="px-4 py-3.5">
                  <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div>{user.name}</div>
                      <div className="text-[11px] font-normal text-slate-400">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      user.role === 'IT_MANAGER'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    }`}
                  >
                    {user.role === 'IT_MANAGER' ? 'IT Manager / Admin' : 'IT Support'}
                  </span>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex gap-1 flex-wrap">
                    {user.allowedCompanies.map((c) => (
                      <span key={c} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {c}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      user.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                    <span>{user.active ? 'Active' : 'Disabled'}</span>
                  </span>
                </td>
                <td className="px-4 py-3.5 font-mono text-[11px] text-slate-400">{user.lastLogin || 'Recent'}</td>
                <td className="px-4 py-3.5 text-right">
                  <button
                    onClick={() => handleToggleStatus(user.id)}
                    className="text-xs font-semibold text-blue-600 hover:underline"
                  >
                    {user.active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      <ConfirmationModal
        isOpen={addModalOpen}
        title="Provision New IT Inventory User"
        message="Create a login account for IT department staff members."
        confirmText="Provision User"
        onConfirm={handleCreateUser}
        onCancel={() => setAddModalOpen(false)}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name *
            </label>
            <input
              type="text"
              value={newUserForm.name}
              onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
              placeholder="e.g. Ramesh Deshmukh"
              className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              value={newUserForm.email}
              onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
              placeholder="e.g. ramesh@accurate.in"
              className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Assigned Role *
            </label>
            <select
              value={newUserForm.role}
              onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value as UserRole })}
              className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="IT_SUPPORT">IT Support (Asset Maintenance, Service Logs & CSV)</option>
              <option value="IT_MANAGER">IT Manager / Super Admin (Full Control)</option>
            </select>
          </div>
        </div>
      </ConfirmationModal>
    </div>
  );
};
