import React from 'react';
import { ProfileForm } from '@/features/user/components/ProfileForm';
import { AvatarUpload } from '@/features/user/components/AvatarUpload';

const AccountSettings: React.FC = () => (
    <div className="space-y-8 animate-in fade-in duration-300">

        {/* ── Page heading ─────────────────────────────────────────────────── */}
        <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Hồ sơ cá nhân</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Quản lý thông tin hiển thị công khai của bạn.
            </p>
        </div>

        {/* ── Unified profile card ─────────────────────────────────────────── */}
        <div className="bg-white dark:bg-[#141b2d] rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm shadow-slate-200/50 dark:shadow-none overflow-hidden">

            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/50">
                <div>
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Ảnh & Thông tin</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cập nhật ảnh đại diện, tên và chuyên môn của bạn</p>
                </div>
            </div>

            {/* Avatar row */}
            <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-700/40">
                <AvatarUpload />
            </div>

            {/* Form fields */}
            <div className="px-6 py-5">
                <ProfileForm />
            </div>
        </div>

    </div>
);

export default AccountSettings;
