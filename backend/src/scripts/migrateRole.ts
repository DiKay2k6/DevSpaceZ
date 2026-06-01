import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Organization } from '../models/organization.model';
import { Workspace } from '../models/workspace.model';
import { SubTeam } from '../models/subteam.model';
import { PERMISSIONS } from '../models/role.model';
import dotenv from 'dotenv';
import path from 'path';

// Nạp biến môi trường từ file .env
dotenv.config({ path: path.join(__dirname, '../../.env') });

const migrateRoles = async () => {
    try {
        console.log('--- Bắt đầu chạy Migration: Đổi Admin thành Manager ---');
        
        // 1. Kết nối DB
        const mongoUri = process.env.MONGO_URI;
        if (!mongoUri) throw new Error('Không tìm thấy MONGO_URI trong .env');
        await mongoose.connect(mongoUri);
        console.log('✅ Đã kết nối MongoDB thành công.');

        // 2. Migrate Bảng Users (Global Role)
        const userUpdateResult = await User.updateMany(
            { role: 'Admin' as any },
            { $set: { role: 'Manager' } }
        );
        console.log(`✅ Đã cập nhật ${userUpdateResult.modifiedCount} Users từ Admin sang Manager.`);

        // 3. Migrate Bảng Organization (Members array)
        const orgUpdateResult = await Organization.updateMany(
            { 'members.role': 'Admin' },
            { $set: { 'members.$[elem].role': 'Manager' } },
            { arrayFilters: [{ 'elem.role': 'Admin' }] }
        );
        console.log(`✅ Đã cập nhật ${orgUpdateResult.modifiedCount} Organizations (thành viên Admin -> Manager).`);

        // 4. Migrate Bảng Workspace (Members array)
        const wsUpdateResult = await Workspace.updateMany(
            { 'members.role': 'Admin' },
            { $set: { 'members.$[elem].role': 'Manager' } },
            { arrayFilters: [{ 'elem.role': 'Admin' }] }
        );
        console.log(`✅ Đã cập nhật ${wsUpdateResult.modifiedCount} Workspaces (thành viên Admin -> Manager).`);

        // 5. Migrate Bảng SubTeam (Members array)
        const subteamUpdateResult = await SubTeam.updateMany(
            { 'members.role': 'Admin' as any },
            { $set: { 'members.$[elem].role': 'Manager' } },
            { arrayFilters: [{ 'elem.role': 'Admin' }] }
        );
        console.log(`✅ Đã cập nhật ${subteamUpdateResult.modifiedCount} SubTeams (thành viên Admin -> Manager).`);

        // 6. Thêm Role Manager vào bảng Roles cho tất cả Organization
        const orgs = await Organization.find().select('_id');
        let roleAddedCount = 0;
        
        for (const org of orgs) {
            const existingManager = await mongoose.model('Role').findOne({ organizationId: org._id, name: 'Manager' });
            if (!existingManager) {
                await mongoose.model('Role').create({
                    name: 'Manager',
                    description: 'Quản lý: Có toàn quyền điều hành dự án, ngoại trừ việc thay đổi quyền của Owner',
                    organizationId: org._id,
                    permissions: [...PERMISSIONS],
                    isSystemDefault: true,
                    color: '#3b82f6'
                });
                roleAddedCount++;
            }
        }
        console.log(`✅ Đã thêm Role Manager cho ${roleAddedCount} Organizations.`);

        console.log('🎉 Hoàn tất Migration thành công!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Lỗi khi chạy Migration:', error);
        process.exit(1);
    }
};

migrateRoles();
