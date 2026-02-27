'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import ProtectedLayout from '../../../components/layout/ProtectedLayout';
import Modal from '../../../components/ui/Modal';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { Plus, Edit2, UserX, Settings, Shield, User } from 'lucide-react';
import api from '../../../lib/api';
import { useAuth } from '../../../lib/auth';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';

function UserForm({ onSubmit, defaultValues, loading, isEdit }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">Full Name</label>
        <input className="form-input" placeholder="John Doe" {...register('name', { required: 'Required' })} />
        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
      </div>
      <div>
        <label className="form-label">Email</label>
        <input type="email" className="form-input" placeholder="user@sdmtea.com"
          {...register('email', { required: 'Required', pattern: { value: /^[^@\s]+@[^@\s]+\.[^@\s]+$/, message: 'Invalid email' } })} />
        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <label className="form-label">{isEdit ? 'New Password (leave blank to keep)' : 'Password'}</label>
        <input type="password" className="form-input" placeholder={isEdit ? 'Leave blank to keep current' : 'Min 6 characters'}
          {...register('password', isEdit ? { minLength: { value: 6, message: 'Min 6 chars' } } : { required: 'Required', minLength: { value: 6, message: 'Min 6 chars' } })} />
        {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
      </div>
      <div>
        <label className="form-label">Role</label>
        <select className="form-input" {...register('role', { required: 'Required' })}>
          <option value="staff">Staff</option>
          <option value="owner">Owner (Admin)</option>
        </select>
      </div>
      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : isEdit ? 'Update User' : 'Create User'}
        </button>
      </div>
    </form>
  );
}

export default function UsersPage() {
  const { user: currentUser, isOwner } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [deactivateUser, setDeactivateUser] = useState(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  useEffect(() => {
    if (!isOwner) { router.push('/dashboard'); return; }
    fetchUsers();
  }, [isOwner]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    setFormLoading(true);
    try {
      if (editUser) {
        const payload = { ...data };
        if (!payload.password) delete payload.password;
        await api.put(`/users/${editUser._id}`, payload);
        toast.success('User updated');
      } else {
        await api.post('/users', data);
        toast.success('User created');
      }
      setShowModal(false);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivateLoading(true);
    try {
      await api.delete(`/users/${deactivateUser._id}`);
      toast.success('User deactivated');
      setDeactivateUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to deactivate');
    } finally {
      setDeactivateLoading(false);
    }
  };

  const activeUsers = users.filter(u => u.isActive);

  return (
    <ProtectedLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-tea-900 flex items-center gap-2">
              <Settings className="w-6 h-6 text-tea-500" /> User Management
            </h1>
            <p className="text-tea-500 text-sm mt-1">
              {activeUsers.length}/5 active users · Owner access only
            </p>
          </div>
          {activeUsers.length < 5 && (
            <button className="btn-primary flex items-center gap-2" onClick={() => { setEditUser(null); setShowModal(true); }}>
              <Plus className="w-4 h-4" /> Add User
            </button>
          )}
        </div>

        {/* Users list */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 text-tea-400">Loading users...</div>
          ) : users.map((u) => (
            <div key={u._id} className={`bg-white rounded-xl p-5 shadow-sm border flex items-center justify-between ${!u.isActive ? 'opacity-50 border-tea-100' : 'border-tea-100'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${u.role === 'owner' ? 'bg-gold-400/20' : 'bg-tea-100'}`}>
                  {u.role === 'owner' ? <Shield className="w-5 h-5 text-gold-500" /> : <User className="w-5 h-5 text-tea-500" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-tea-900 text-sm">{u.name}</p>
                    {u._id === currentUser?.id && <span className="badge-green text-xs">You</span>}
                    {!u.isActive && <span className="badge-red text-xs">Inactive</span>}
                  </div>
                  <p className="text-xs text-tea-500">{u.email}</p>
                  <p className="text-xs text-tea-400 mt-0.5">
                    {u.role === 'owner' ? '🛡️ Owner (Admin)' : '👤 Staff'} · Joined {format(new Date(u.createdAt), 'MMM yyyy')}
                  </p>
                </div>
              </div>
              {u._id !== currentUser?.id && u.isActive && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { setEditUser(u); setShowModal(true); }}
                    className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => setDeactivateUser(u)}
                    className="py-1.5 px-3 text-xs border border-red-200 text-red-500 hover:bg-red-50 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                  >
                    <UserX className="w-3.5 h-3.5" /> Deactivate
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>

        <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditUser(null); }}
          title={editUser ? 'Edit User' : 'Create New User'}>
          <UserForm
            onSubmit={handleSubmit}
            loading={formLoading}
            isEdit={!!editUser}
            defaultValues={editUser ? { name: editUser.name, email: editUser.email, role: editUser.role } : { role: 'staff' }}
          />
        </Modal>

        <ConfirmDialog
          isOpen={!!deactivateUser}
          onClose={() => setDeactivateUser(null)}
          onConfirm={handleDeactivate}
          title="Deactivate User"
          message={`Deactivate ${deactivateUser?.name}? They will no longer be able to log in.`}
          loading={deactivateLoading}
        />
      </div>
    </ProtectedLayout>
  );
}
