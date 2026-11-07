import React, { useState } from 'react';
import { User, UserRole } from '../types/inkloom';
import { store } from '../services/store';
import { api } from '../api/client';
import { Users, UserPlus, Shield, CheckCircle2 } from 'lucide-react';

interface UsersPageProps {
  currentUser: User;
}

export const UsersPage: React.FC<UsersPageProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>(store.users);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('creator');

  const isAdmin = currentUser.role === 'admin';

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await api.createUser({
      full_name: newName,
      email: newEmail,
      role: newRole,
    });
    setUsers([...users, created]);
    setIsInviteOpen(false);
    setNewName('');
    setNewEmail('');
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    if (!isAdmin) return;
    try {
      const updated = await api.updateUserRole(userId, role);
      setUsers(users.map((u) => (u.user_id === userId ? updated : u)));
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1B3A]">Team Members & Access Control (RBAC)</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage organization members, assign roles (Admin, Reviewer, Creator), and tenant permissions.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsInviteOpen(true)}
            className="px-4 py-2 bg-[#139A93] hover:bg-[#0D706B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Team Member</span>
          </button>
        )}
      </div>

      <div className="bg-white border border-[#D5DBE5] rounded-2xl shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100">
          {users.map((u) => (
            <div
              key={u.user_id}
              className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#139A93] flex items-center justify-center font-bold text-sm uppercase">
                  {u.full_name[0]}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#0B1B3A]">{u.full_name}</span>
                    {u.user_id === currentUser.user_id && (
                      <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.2 rounded font-bold uppercase">
                        You
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 font-mono">{u.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <select
                    value={u.role}
                    onChange={(e) => handleRoleChange(u.user_id, e.target.value as UserRole)}
                    className="text-xs font-semibold p-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="reviewer">Reviewer</option>
                    <option value="creator">Creator</option>
                  </select>
                ) : (
                  <span className="text-xs font-bold uppercase px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                    {u.role}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <form
            onSubmit={handleCreateUser}
            className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200"
          >
            <h3 className="text-sm font-bold text-[#0B1B3A]">Invite Team Member</h3>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
                className="w-full text-xs p-2.5 border rounded-xl"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                className="w-full text-xs p-2.5 border rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">
                Organization Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="w-full text-xs p-2.5 border rounded-xl"
              >
                <option value="creator">Creator (Submit & Revise)</option>
                <option value="reviewer">Reviewer (Decide & Approve)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setIsInviteOpen(false)}
                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-[#139A93] text-white text-xs font-semibold rounded-lg hover:bg-[#0D706B]"
              >
                Send Invitation
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
