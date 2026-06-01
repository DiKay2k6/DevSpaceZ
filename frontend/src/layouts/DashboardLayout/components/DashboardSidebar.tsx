import React from 'react';
import { NavLink, Link } from 'react-router-dom'; // Dùng NavLink thay cho button
import { LucideIcon, LayoutDashboard, Loader2, AlertCircle } from 'lucide-react';
import { mainNavItems, bottomNavItems } from '../constants/dashboardData';
import myLogo from '@/assets/images/logo.png';
import { useBoards } from '@/features/board/hooks/useBoards';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useQuery } from '@tanstack/react-query';
import { organizationApi } from '@/features/organization/api/organization.api';
import { useOrganizationStore } from '@/entities/organization/model/organizationStore';
import { ChevronDown, Building2, Plus, User, Kanban } from 'lucide-react';
import { CreateOrganizationModal } from '@/features/organization/components/CreateOrganizationModal';

interface DashboardSidebarProps {
    isExpanded: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

interface NavItemProps {
    icon: LucideIcon;
    label: string;
    path: string;
    isExpanded: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, path, isExpanded }) => (
    // NavLink tự động cung cấp biến isActive để ta biết route nào đang được chọn
    <NavLink
        to={path}
        end={path === '/dashboard'} // end giúp route gốc không bị sáng đèn sai
        className={({ isActive }) => `w-full flex items-center ${isExpanded ? 'px-4 justify-start' : 'px-0 justify-center'} py-3.5 rounded-2xl transition-all duration-300 ${isActive
            ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-lg shadow-blue-200 dark:shadow-blue-900/20'
            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#ffffff0a] hover:text-slate-900 dark:hover:text-white'
            }`}
    >
        <Icon size={20} className="shrink-0" />
        <span className={`whitespace-nowrap font-medium overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-w-[150px] ml-3 opacity-100' : 'max-w-0 ml-0 opacity-0'}`}>
            {label}
        </span>
    </NavLink>
);

export const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isExpanded, onMouseEnter, onMouseLeave }) => {
    const { currentOrganization, setCurrentOrganization, setOrganizations } = useOrganizationStore();
    const { data: boards, isLoading: isLoadingBoards, isError } = useBoards(currentOrganization?._id);
    const { user } = useAuthStore();
    
    const [showOrgMenu, setShowOrgMenu] = React.useState(false);
    const [isCreateOrgModalOpen, setIsCreateOrgModalOpen] = React.useState(false);

    const { data: organizations, isLoading: isLoadingOrgs } = useQuery({
        queryKey: ['organizations'],
        queryFn: organizationApi.getOrganizations,
    });

    // Sync orgs from query to store
    React.useEffect(() => {
        if (organizations) {
            setOrganizations(organizations);
            // Verify current organization still exists in the fetched list
            if (currentOrganization && !organizations.find(org => org._id === currentOrganization._id)) {
                setCurrentOrganization(null as any);
            }
        }
    }, [organizations, currentOrganization, setCurrentOrganization, setOrganizations]);

    return (
        <aside
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`${isExpanded ? 'w-72' : 'w-24'} border-r flex flex-col shrink-0 transition-all duration-300 ease-in-out z-30 bg-white dark:bg-[#111520] border-slate-200 dark:border-[#ffffff1a]`}
        >
            <div className="h-24 flex items-center justify-center px-6">
                <Link to="/" className="flex items-center">
                    <img src={myLogo} alt="Logo" className="w-10 h-10 object-contain shrink-0" />
                    <span className={`text-xl font-bold tracking-tighter whitespace-nowrap overflow-hidden transition-all duration-300 ease-in-out text-slate-900 dark:text-white ${isExpanded ? 'max-w-[150px] ml-3 opacity-100' : 'max-w-0 ml-0 opacity-0'}`}>
                        devspace<span className="text-blue-500">z</span>
                    </span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
                
                {/* Organization Selector */}
                <div className={`relative transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100 h-auto mb-6' : 'opacity-0 h-0 overflow-hidden mb-0'}`}>
                    <div 
                        onClick={() => setShowOrgMenu(!showOrgMenu)}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-white/5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${currentOrganization ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'}`}>
                                {currentOrganization ? <Building2 size={16} /> : <User size={16} />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 font-medium whitespace-nowrap">
                                    {currentOrganization ? 'Tổ chức' : 'Không gian'}
                                </p>
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate whitespace-nowrap">
                                    {isLoadingOrgs ? 'Đang tải...' : currentOrganization?.name || 'Cá nhân'}
                                </p>
                            </div>
                        </div>
                        <ChevronDown size={16} className={`text-slate-400 shrink-0 transition-transform ${showOrgMenu ? 'rotate-180' : ''}`} />
                    </div>

                    {showOrgMenu && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#151A26] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg z-50 py-1 max-h-64 overflow-y-auto custom-scrollbar flex flex-col">
                            {organizations && organizations.length > 0 ? (
                                <>
                                    <button
                                        onClick={() => {
                                            setCurrentOrganization(null as any);
                                            setShowOrgMenu(false);
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${!currentOrganization ? 'text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/10' : 'text-slate-700 dark:text-slate-300'}`}
                                    >
                                        <span className="flex items-center gap-2 whitespace-nowrap">
                                            <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">👤</div>
                                            Không gian Cá nhân
                                        </span>
                                    </button>
                                    <div className="h-px bg-slate-100 dark:bg-white/5 my-1 mx-2"></div>
                                    {organizations.map(org => (
                                        <button
                                            key={org._id}
                                            onClick={() => {
                                                setCurrentOrganization(org);
                                                setShowOrgMenu(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${currentOrganization?._id === org._id ? 'text-blue-600 font-bold bg-blue-50 dark:bg-blue-900/10' : 'text-slate-700 dark:text-slate-300'}`}
                                        >
                                            <span className="flex items-center gap-2 whitespace-nowrap overflow-hidden text-ellipsis">
                                                <div className="w-6 h-6 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-xs font-bold">{org.name.substring(0,1).toUpperCase()}</div>
                                                {org.name}
                                            </span>
                                        </button>
                                    ))}
                                </>
                            ) : (
                                <div className="px-4 py-3 text-sm text-slate-500 italic whitespace-nowrap">Không có tổ chức nào</div>
                            )}
                            
                            <div className="p-2 mt-1 border-t border-slate-100 dark:border-slate-800">
                                <button 
                                    onClick={() => {
                                        setShowOrgMenu(false);
                                        setIsCreateOrgModalOpen(true);
                                    }}
                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors whitespace-nowrap"
                                >
                                    <Plus size={16} /> Tạo Tổ chức mới
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Menu Chính */}
                <div className="space-y-2">
                    {mainNavItems.map(item => (
                        <NavItem key={item.id} icon={item.icon} label={item.label} path={item.path} isExpanded={isExpanded} />
                    ))}
                </div>

                {/* Danh sách Dự án Đã Ghim */}
                <div>
                    <div className={`px-4 mb-2 flex items-center justify-between transition-all duration-300 ${isExpanded ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden m-0 p-0'}`}>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                            Dự án Đã ghim
                        </span>
                    </div>
                    
                    <div className="space-y-1">
                        {isLoadingBoards && isExpanded && (
                            <div className="flex items-center justify-center py-4 text-slate-400">
                                <Loader2 size={18} className="animate-spin" />
                            </div>
                        )}
                        
                        {isError && isExpanded && (
                            <div className="flex items-center gap-2 px-4 py-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/10 rounded-xl">
                                <AlertCircle size={16} /> Lỗi tải dữ liệu
                            </div>
                        )}

                        {boards?.filter(b => user?.pinned_boards?.includes(b._id)).map(board => (
                            <NavItem 
                                key={board._id} 
                                icon={Kanban} 
                                label={board.title} 
                                path={`/dashboard/board/${board._id}`} 
                                isExpanded={isExpanded} 
                            />
                        ))}

                        {boards?.filter(b => user?.pinned_boards?.includes(b._id)).length === 0 && !isLoadingBoards && (
                            <div className={`mx-auto text-xs text-slate-500 text-center italic transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${isExpanded ? 'opacity-100 max-w-[200px] px-4 py-3' : 'opacity-0 max-w-0 px-0 py-0'}`}>
                                Bạn chưa ghim dự án nào
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <div className="p-4 border-t border-slate-200 dark:border-[#ffffff1a] space-y-2">
                {bottomNavItems.map(item => (
                    <NavItem key={item.id} icon={item.icon} label={item.label} path={item.path} isExpanded={isExpanded} />
                ))}
            </div>
            <CreateOrganizationModal 
                isOpen={isCreateOrgModalOpen}
                onClose={() => setIsCreateOrgModalOpen(false)}
            />
        </aside>
    );
};