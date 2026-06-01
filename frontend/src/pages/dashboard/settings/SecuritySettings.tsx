import React from 'react';
import { KeyRound, Info } from 'lucide-react';
import { ChangePasswordForm } from '@/features/user/components/ChangePasswordForm';

const TIPS = [
    'Sử dụng ít nhất 8 ký tự.',
    'Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt.',
    'Không dùng chung mật khẩu cho nhiều dịch vụ.',
    'Thay đổi mật khẩu định kỳ mỗi 3–6 tháng.',
] as const;

const SecuritySettings: React.FC = () => (
    <div className="space-y-8 animate-in fade-in duration-300">

        {/* ── Page heading ─────────────────────────────────────────────────── */}
        <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bảo mật</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Quản lý mật khẩu và thiết lập bảo mật tài khoản.
            </p>
        </div>

        {/* ── Change password card ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#141b2d] rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <KeyRound size={16} />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Đổi mật khẩu</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cập nhật mật khẩu để bảo vệ tài khoản</p>
                </div>
            </div>
            <div className="px-6 py-5">
                <ChangePasswordForm />
            </div>
        </div>

        {/* ── Security tips ────────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#141b2d] rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm shadow-slate-200/50 dark:shadow-none overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Info size={16} />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Mẹo bảo mật</h3>
            </div>
            <ul className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                {TIPS.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 flex-shrink-0" />
                        {tip}
                    </li>
                ))}
            </ul>
        </div>

    </div>
);

export default SecuritySettings;
