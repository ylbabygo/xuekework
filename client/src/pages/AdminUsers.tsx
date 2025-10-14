import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Shield, 
  ShieldCheck, 
  Mail, 
  Calendar, 
  MoreVertical,
  X,
  Check,
  AlertTriangle,
  UserPlus,
  Download,
  Upload
} from 'lucide-react';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin: string;
  avatar?: string;
}

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student' as User['role'],
    status: 'active' as User['status']
  });

  // 模拟数据
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: 'admin',
        status: 'active',
        createdAt: '2024-01-15',
        lastLogin: '2024-01-20 10:30'
      },
      {
        id: '2',
        username: 'teacher1',
        email: 'teacher1@example.com',
        role: 'teacher',
        status: 'active',
        createdAt: '2024-01-16',
        lastLogin: '2024-01-19 14:20'
      },
      {
        id: '3',
        username: 'student1',
        email: 'student1@example.com',
        role: 'student',
        status: 'active',
        createdAt: '2024-01-17',
        lastLogin: '2024-01-20 09:15'
      },
      {
        id: '4',
        username: 'student2',
        email: 'student2@example.com',
        role: 'student',
        status: 'inactive',
        createdAt: '2024-01-18',
        lastLogin: '2024-01-18 16:45'
      }
    ];
    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  }, []);

  // 过滤用户
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, statusFilter]);

  const getRoleIcon = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return <ShieldCheck className="w-4 h-4" />;
      case 'teacher':
        return <Shield className="w-4 h-4" />;
      default:
        return <Users className="w-4 h-4" />;
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'text-red-400 bg-red-400/10';
      case 'teacher':
        return 'text-blue-400 bg-blue-400/10';
      default:
        return 'text-green-400 bg-green-400/10';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'text-green-400 bg-green-400/10';
      case 'inactive':
        return 'text-gray-400 bg-gray-400/10';
      case 'suspended':
        return 'text-red-400 bg-red-400/10';
      default:
        return 'text-gray-400 bg-gray-400/10';
    }
  };

  const handleAddUser = async () => {
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      const user: User = {
        id: Date.now().toString(),
        ...newUser,
        createdAt: new Date().toISOString().split('T')[0],
        lastLogin: '从未登录'
      };
      setUsers([...users, user]);
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'student',
        status: 'active'
      });
      setShowAddModal(false);
      setLoading(false);
    }, 1000);
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setUsers(users.map(user => 
        user.id === selectedUser.id ? selectedUser : user
      ));
      setShowEditModal(false);
      setSelectedUser(null);
      setLoading(false);
    }, 1000);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setLoading(true);
    // 模拟API调用
    setTimeout(() => {
      setUsers(users.filter(user => user.id !== selectedUser.id));
      setShowDeleteModal(false);
      setSelectedUser(null);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      {/* 页面标题和操作按钮 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Users className="w-8 h-8 text-white" />
          <h1 className="text-3xl font-light text-white">用户管理</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
            <Download className="w-4 h-4" />
            <span>导出</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200">
            <Upload className="w-4 h-4" />
            <span>导入</span>
          </button>
          <button 
            className="flex items-center space-x-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors duration-200"
            onClick={() => setShowAddModal(true)}
          >
            <UserPlus className="w-4 h-4" />
            <span>添加用户</span>
          </button>
        </div>
      </div>

      {/* 搜索和过滤 */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索用户名或邮箱..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none transition-colors duration-200"
          >
            <option value="all">所有角色</option>
            <option value="admin">管理员</option>
            <option value="teacher">教师</option>
            <option value="student">学生</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none transition-colors duration-200"
          >
            <option value="all">所有状态</option>
            <option value="active">活跃</option>
            <option value="inactive">非活跃</option>
            <option value="suspended">已暂停</option>
          </select>
        </div>
      </div>

      {/* 用户统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">总用户数</p>
              <p className="text-2xl font-light text-white">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">活跃用户</p>
              <p className="text-2xl font-light text-white">{users.filter(u => u.status === 'active').length}</p>
            </div>
            <Eye className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">管理员</p>
              <p className="text-2xl font-light text-white">{users.filter(u => u.role === 'admin').length}</p>
            </div>
            <ShieldCheck className="w-8 h-8 text-red-400" />
          </div>
        </div>
        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">教师</p>
              <p className="text-2xl font-light text-white">{users.filter(u => u.role === 'teacher').length}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
        </div>
      </div>

      {/* 用户列表 */}
      <div className="bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-800 border-b border-gray-700">
              <tr>
                <th className="text-left p-4 text-gray-300 font-medium">用户</th>
                <th className="text-left p-4 text-gray-300 font-medium">角色</th>
                <th className="text-left p-4 text-gray-300 font-medium">状态</th>
                <th className="text-left p-4 text-gray-300 font-medium">创建时间</th>
                <th className="text-left p-4 text-gray-300 font-medium">最后登录</th>
                <th className="text-left p-4 text-gray-300 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors duration-200">
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {getRoleIcon(user.role)}
                      <span>{user.role === 'admin' ? '管理员' : user.role === 'teacher' ? '教师' : '学生'}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status === 'active' ? '活跃' : user.status === 'inactive' ? '非活跃' : '已暂停'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{user.createdAt}</td>
                  <td className="p-4 text-gray-400">{user.lastLogin}</td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors duration-200"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors duration-200"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 添加用户模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-xl font-medium text-white">添加用户</h3>
              <button
                className="text-gray-400 hover:text-white transition-colors duration-200"
                onClick={() => setShowAddModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">用户名</label>
                <input
                  type="text"
                  value={newUser.username}
                  onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                  placeholder="输入用户名"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">邮箱</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                  placeholder="输入邮箱地址"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">密码</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                  placeholder="输入密码"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">角色</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as User['role']})}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none transition-colors duration-200"
                >
                  <option value="student">学生</option>
                  <option value="teacher">教师</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">状态</label>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser({...newUser, status: e.target.value as User['status']})}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none transition-colors duration-200"
                >
                  <option value="active">活跃</option>
                  <option value="inactive">非活跃</option>
                  <option value="suspended">已暂停</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-800">
              <button 
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                onClick={() => setShowAddModal(false)}
              >
                取消
              </button>
              <button
                className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleAddUser}
                disabled={loading || !newUser.username || !newUser.email || !newUser.password}
              >
                {loading ? '添加中...' : '添加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 编辑用户模态框 */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-xl font-medium text-white">编辑用户</h3>
              <button
                className="text-gray-400 hover:text-white transition-colors duration-200"
                onClick={() => setShowEditModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">用户名</label>
                <input
                  type="text"
                  value={selectedUser.username}
                  onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">邮箱</label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:border-white focus:outline-none transition-colors duration-200"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">角色</label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({...selectedUser, role: e.target.value as User['role']})}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none transition-colors duration-200"
                >
                  <option value="student">学生</option>
                  <option value="teacher">教师</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">状态</label>
                <select
                  value={selectedUser.status}
                  onChange={(e) => setSelectedUser({...selectedUser, status: e.target.value as User['status']})}
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-white focus:outline-none transition-colors duration-200"
                >
                  <option value="active">活跃</option>
                  <option value="inactive">非活跃</option>
                  <option value="suspended">已暂停</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-800">
              <button 
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                onClick={() => setShowEditModal(false)}
              >
                取消
              </button>
              <button
                className="px-6 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleEditUser}
                disabled={loading}
              >
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg border border-gray-800 w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h3 className="text-xl font-medium text-white">确认删除</h3>
              <button
                className="text-gray-400 hover:text-white transition-colors duration-200"
                onClick={() => setShowDeleteModal(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
                <div>
                  <p className="text-white font-medium">删除用户</p>
                  <p className="text-gray-400 text-sm">此操作无法撤销</p>
                </div>
              </div>
              <p className="text-gray-300">
                确定要删除用户 <span className="text-white font-medium">{selectedUser.username}</span> 吗？
              </p>
            </div>
            <div className="flex justify-end space-x-4 p-6 border-t border-gray-800">
              <button 
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
                onClick={() => setShowDeleteModal(false)}
              >
                取消
              </button>
              <button
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDeleteUser}
                disabled={loading}
              >
                {loading ? '删除中...' : '删除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;