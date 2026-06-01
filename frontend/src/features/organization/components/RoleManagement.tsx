import React, { useState } from 'react';
import { useRoles } from '../hooks/useRoles';
import { Role, PERMISSIONS_LIST } from '../api/role.api';
import { Button } from '@/shared/ui/Button';
import { Plus, Save, Trash2, Check, X, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    orgId?: string;
    workspaceId?: string;
}

export const RoleManagement: React.FC<Props> = ({ orgId, workspaceId }) => {
    const { roles, isLoading, createRole, updateRole, deleteRole, isCreating, isUpdating } = useRoles(orgId, workspaceId);
    
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [isCreatingNew, setIsCreatingNew] = useState(false);
    const [editName, setEditName] = useState('');
    const [editColor, setEditColor] = useState('#94a3b8');
    const [editPermissions, setEditPermissions] = useState<string[]>([]);

    if (isLoading) return <div className="p-8 text-center animate-pulse">Đang tải cấu hình phân quyền...</div>;

    const handleSelectRole = (role: Role) => {
        setSelectedRole(role);
        setIsCreatingNew(false);
        setEditName(role.name);
        setEditColor(role.color || '#94a3b8');
        setEditPermissions(role.permissions || []);
    };

    const handleCreateNew = () => {
        setSelectedRole(null);
        setIsCreatingNew(true);
        setEditName('');
        setEditColor('#94a3b8');
        setEditPermissions([]);
    };

    const togglePermission = (perm: string) => {
        setEditPermissions(prev => 
            prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
        );
    };

    const handleSave = () => {
        if (!editName.trim()) {
            return toast.error('Tên vai trò không được để trống');
        }

        if (isCreatingNew) {
            if (!orgId) return toast.error('Thiếu ID tổ chức');
            createRole({ name: editName, color: editColor, organizationId: orgId, workspaceId, permissions: editPermissions }, {
                onSuccess: () => setIsCreatingNew(false)
            });
        } else if (selectedRole) {
            updateRole({ id: selectedRole._id, data: { name: editName, color: editColor, permissions: editPermissions } });
        }
    };

    const handleDelete = (role: Role) => {
        if (window.confirm(`Bạn có chắc muốn xóa vai trò "${role.name}"?`)) {
            deleteRole(role._id, {
                onSuccess: () => {
                    if (selectedRole?._id === role._id) setSelectedRole(null);
                }
            });
        }
    };

    // Phân nhóm quyền cho dễ nhìn
    const permissionGroups = {
        'Bảng (Board)': PERMISSIONS_LIST.filter(p => p.startsWith('board:')),
        'Danh sách (List)': PERMISSIONS_LIST.filter(p => p.startsWith('list:')),
        'Công việc (Task)': PERMISSIONS_LIST.filter(p => p.startsWith('task:')),
        'Thành viên (Member)': PERMISSIONS_LIST.filter(p => p.startsWith('member:')),
        'Khác': PERMISSIONS_LIST.filter(p => p.startsWith('workspace:') || p.startsWith('document:') || p.startsWith('analytics:'))
    };

    return (
        <div className="flex h-full gap-6 p-6">
            {/* Sidebar Danh sách Role */}
            <div className="w-64 flex flex-col gap-3 border-r pr-4 border-slate-200 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="font-bold text-lg dark:text-white">Vai trò (Roles)</h2>
                    <button 
                        onClick={handleCreateNew}
                        className="p-1.5 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
                        title="Tạo vai trò mới"
                    >
                        <Plus size={16} />
                    </button>
                </div>
                
                {roles.map(role => (
                    <div 
                        key={role._id} 
                        onClick={() => handleSelectRole(role)}
                        className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedRole?._id === role._id 
                                ? 'bg-blue-50 border-blue-200 border dark:bg-blue-900/20 dark:border-blue-500/30' 
                                : 'bg-slate-50 border-transparent border hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10'
                        }`}
                    >
                        <div className="flex items-center gap-2">
                            {role.isSystemDefault && <ShieldAlert size={14} className="text-orange-500" />}
                            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: role.color || '#94a3b8' }} />
                            <span className="font-medium text-sm dark:text-slate-200">{role.name}</span>
                        </div>
                        {!role.isSystemDefault && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(role); }}
                                className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {/* Main Area Edit Role */}
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {(selectedRole || isCreatingNew) ? (
                    <div className="space-y-6 max-w-3xl">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xl dark:text-white">
                                {isCreatingNew ? 'Tạo vai trò mới' : `Chỉnh sửa: ${selectedRole?.name}`}
                            </h3>
                            <Button onClick={handleSave} isLoading={isCreating || isUpdating} size="sm" className="gap-2">
                                <Save size={16} /> Lưu thay đổi
                            </Button>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-1.5 dark:text-slate-300">Tên vai trò</label>
                            <input 
                                type="text"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                disabled={selectedRole?.isSystemDefault}
                                placeholder="Ví dụ: Thực tập sinh..."
                                className="w-full px-4 py-2 bg-slate-50 dark:bg-[#1A2133] border border-slate-200 dark:border-white/10 rounded-lg outline-none focus:border-blue-500 dark:text-white disabled:opacity-50"
                            />
                            {selectedRole?.isSystemDefault && (
                                <p className="text-xs text-orange-500 mt-1">Vai trò hệ thống không thể đổi tên.</p>
                            )}
                        </div>

                        <div className="pl-1">
                            <label className="block text-sm font-semibold mb-1.5 dark:text-slate-300 -ml-1">Màu đại diện</label>
                            <div className="flex flex-wrap gap-3 py-1">
                                {['#94a3b8', '#ef4444', '#f97316', '#eab308', '#22c55e', '#0ea5e9', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e'].map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => setEditColor(color)}
                                        className={`w-8 h-8 rounded-full border-2 transition-transform shrink-0 ${editColor === color ? 'border-white dark:border-slate-800 scale-110 shadow-md ring-2 ring-blue-500' : 'border-transparent hover:scale-110'}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-3 dark:text-slate-300">Ma trận quyền hạn (Permissions)</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(permissionGroups).map(([groupName, perms]) => (
                                    <div key={groupName} className="bg-slate-50 dark:bg-[#1A2133]/50 p-4 rounded-xl border border-slate-200 dark:border-white/5">
                                        <h4 className="font-bold text-slate-700 dark:text-slate-200 mb-3 text-sm">{groupName}</h4>
                                        <div className="space-y-2">
                                            {perms.map(perm => {
                                                const isChecked = editPermissions.includes(perm);
                                                return (
                                                    <label key={perm} className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isChecked ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-slate-100 dark:hover:bg-white/5'}`}>
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${isChecked ? 'bg-blue-500 border-blue-500' : 'bg-white border-slate-300 dark:bg-transparent dark:border-slate-600'}`}>
                                                            {isChecked && <Check size={14} className="text-white" />}
                                                        </div>
                                                        <span className="text-sm dark:text-slate-300 select-none">
                                                            {perm}
                                                        </span>
                                                        <input 
                                                            type="checkbox" 
                                                            className="hidden" 
                                                            checked={isChecked}
                                                            onChange={() => togglePermission(perm)}
                                                            disabled={selectedRole?.isSystemDefault && selectedRole?.name === 'Manager'} // Manager luôn full quyền
                                                        />
                                                    </label>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <ShieldAlert size={48} className="mb-4 opacity-50" />
                        <p>Chọn một vai trò bên trái hoặc tạo mới để thiết lập quyền.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
