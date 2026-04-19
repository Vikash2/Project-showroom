import { useState, useEffect } from 'react';
import { Users, Plus, Trash2, Shield, X, Save } from 'lucide-react';
import { useAuth } from '../../state/AuthContext';
import { useShowroom } from '../../state/ShowroomContext';
import toast from 'react-hot-toast';
import * as userService from '../../services/userService';
import * as showroomService from '../../services/showroomService';
import type { User, Role } from '../../types/auth';
import type { CreateUserPayload } from '../../services/userService';
import type { Showroom } from '../../types/showroom';

export default function UserManagement() {
  const { user: currentUser, hasRole } = useAuth();
  const { activeShowroom: _ } = useShowroom();
  const [users, setUsers] = useState<User[]>([]);
  const [showrooms, setShowrooms] = useState<Showroom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateUserPayload>({
    email: '',
    password: '',
    name: '',
    mobile: '',
    role: 'Sales Executive',
    showroomId: '',
  });

  const roles: Role[] = [
    'Super Admin',
    'Showroom Manager',
    'Sales Executive',
    'Accountant',
    'Documentation Officer',
  ];

  // Load users and showrooms on mount
  useEffect(() => {
    loadUsers();
    loadShowrooms();
  }, []);

  const loadShowrooms = async () => {
    const result = await showroomService.listShowrooms({ isActive: true });
    if (result.success && result.showrooms) {
      const mappedShowrooms: Showroom[] = result.showrooms.map((s: any) => ({
        showroomId: s.showroomId || '',
        name: s.name || '',
        brand: s.brand || '',
        tagline: s.tagline || '',
        state: s.state || '',
        gstNumber: s.gstNumber || '',
        contact: s.contact || { phone: '', email: '', whatsapp: '' },
        address: s.address || { street: '', city: '', state: '', pincode: '', mapLink: '', coordinates: { lat: 0, lng: 0 } },
        branding: s.branding || { primaryColor: '#DC2626', secondaryColor: '#991B1B', logoUrl: '' },
        workingHours: s.workingHours || { weekdays: '', sunday: '' },
      }));
      setShowrooms(mappedShowrooms);
    }
  };

  const loadUsers = async () => {
    setIsLoading(true);
    const result = await userService.listUsers();
    if (result.success) {
      setUsers(result.users);
    } else {
      toast.error('Failed to load users');
    }
    setIsLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password || !formData.name || !formData.mobile) {
      toast.error('Please fill all required fields');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (!/^\d{10}$/.test(formData.mobile)) {
      toast.error('Mobile number must be 10 digits');
      return;
    }

    if (formData.role !== 'Super Admin' && !formData.showroomId) {
      toast.error('Please select a showroom for this user');
      return;
    }

    setIsSubmitting(true);

    const payload: CreateUserPayload = {
      ...formData,
      showroomId: formData.role === 'Super Admin' ? undefined : formData.showroomId,
    };

    const result = await userService.createUser(payload);

    if (result.success) {
      toast.success('User created successfully');
      setShowCreateModal(false);
      resetForm();
      loadUsers();
    } else {
      toast.error(result.error?.message || 'Failed to create user');
    }

    setIsSubmitting(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    const result = await userService.deleteUser(userId);
    if (result.success) {
      toast.success('User deleted successfully');
      loadUsers();
    } else {
      toast.error(result.error?.message || 'Failed to delete user');
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      mobile: '',
      role: 'Sales Executive',
      showroomId: '',
    });
  };

  const getRoleBadgeColor = (role: Role) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'Showroom Manager':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Sales Executive':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'Accountant':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Documentation Officer':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  if (!hasRole(['Super Admin'])) {
    return (
      <div className="p-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <Shield className="mx-auto mb-4 text-red-500" size={48} />
          <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
            Access Denied
          </h2>
          <p className="text-red-600 dark:text-red-400">
            Only Super Admins can manage users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] mb-2">
            User Management
          </h1>
          <p className="text-[var(--text-secondary)]">
            Manage showroom staff and administrators
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Create User
        </button>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-[var(--text-secondary)]">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-[var(--card-bg)] rounded-xl border border-[var(--border)]">
          <Users className="mx-auto mb-4 text-[var(--text-muted)]" size={48} />
          <p className="text-[var(--text-secondary)]">No users found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="bg-[var(--card-bg)] border border-[var(--border)] rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {user.fullName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-[var(--text-primary)] text-lg">
                      {user.fullName}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)]">
                      {user.email}
                    </p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {user.mobile}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                    {user.showroomId && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        {showrooms.find((s) => s.showroomId === user.showroomId)?.name ||
                          user.showroomId}
                      </p>
                    )}
                  </div>

                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Delete user"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--card-bg)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-center sticky top-0 bg-[var(--card-bg)] z-10">
              <h2 className="text-2xl font-black text-[var(--text-primary)]">
                Create New User
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="p-6 space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Enter full name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="user@example.com"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) =>
                    setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '') })
                  }
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="10-digit mobile number"
                  required
                  maxLength={10}
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                  className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                >
                  {roles.map((role: Role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              {/* Showroom (if not Super Admin) */}
              {formData.role !== 'Super Admin' && (
                <div>
                  <label className="block text-sm font-bold text-[var(--text-primary)] mb-2">
                    Showroom *
                  </label>
                  <select
                    value={formData.showroomId}
                    onChange={(e) => setFormData({ ...formData, showroomId: e.target.value })}
                    className="w-full px-4 py-3 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  >
                    <option value="">Select Showroom</option>
                    {showrooms.map((showroom: Showroom) => (
                      <option key={showroom.showroomId} value={showroom.showroomId}>
                        {showroom.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-3 border border-[var(--border)] rounded-xl font-bold hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Create User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
