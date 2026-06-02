import { Request, Response } from 'express';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { AppError } from '../utils/appError';
import { List } from '../models/list.model';
import { Task } from '../models/task.model';
import { Board } from '../models/board.model';
import mongoose from 'mongoose';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

export const chatWithAI = async (req: Request, res: Response) => {
    try {
        const { prompt } = req.body;
        
        if (!prompt) {
            throw new AppError(400, 'Prompt là bắt buộc');
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const systemPrompt = `Bạn là DevSpaceZ Copilot - một trợ lý AI thông minh chuyên hỗ trợ quản lý dự án, DevOps và lập trình viên. 
        Hãy trả lời các câu hỏi ngắn gọn, rõ ràng, và hữu ích nhất có thể. Format bằng Markdown.`;

        const result = await model.generateContent({
            contents: [
                { role: 'user', parts: [{ text: systemPrompt + '\n\nCâu hỏi: ' + prompt }] }
            ]
        });
        
        const text = result.response.text();

        res.status(200).json({
            status: 'success',
            data: {
                reply: text
            }
        });
    } catch (error: any) {
        console.error('AI Chat Error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Đã xảy ra lỗi khi gọi AI API'
        });
    }
};

export const generateKanbanTasks = async (req: Request, res: Response) => {
    try {
        const { boardId, prompt, workspaceMembers = [] } = req.body;

        if (!boardId || !prompt) {
            throw new AppError(400, 'boardId và prompt là bắt buộc');
        }

        const board = await Board.findById(boardId);
        if (!board) {
            throw new AppError(404, 'Không tìm thấy bảng dự án');
        }

        const model = genAI.getGenerativeModel({ 
            model: 'gemini-2.5-flash',
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: SchemaType.OBJECT,
                    properties: {
                        lists: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    title: { type: SchemaType.STRING, description: "Tên cột. Ví dụ: Backend, Frontend, DevOps" },
                                    tasks: {
                                        type: SchemaType.ARRAY,
                                        items: {
                                            type: SchemaType.OBJECT,
                                            properties: {
                                                tempId: { type: SchemaType.STRING, description: "ID định danh tạm thời, vd: task_1, task_2" },
                                                title: { type: SchemaType.STRING, description: "Tên công việc cần làm" },
                                                description: { type: SchemaType.STRING, description: "Mô tả công việc chi tiết" },
                                                priority: { type: SchemaType.STRING, description: "Low, Medium, High" },
                                                type: { type: SchemaType.STRING, description: "Task, Feature, Bug, Chore, Epic" },
                                                component: { type: SchemaType.STRING, description: "Chọn một: Frontend, Backend, Database, DevOps, Design, Other" },
                                                storyPoints: { type: SchemaType.NUMBER, description: "Độ khó/Thời gian ước lượng (Fibonacci: 1,2,3,5,8)" },
                                                startDate: { type: SchemaType.STRING, description: "ISO 8601 string" },
                                                dueDate: { type: SchemaType.STRING, description: "ISO 8601 string" },
                                                assignees: {
                                                    type: SchemaType.ARRAY,
                                                    items: { type: SchemaType.STRING, description: "userId của thành viên được giao" }
                                                },
                                                parentId: { type: SchemaType.STRING, description: "tempId của task cha (nếu có)" },
                                                dependencies: {
                                                    type: SchemaType.ARRAY,
                                                    items: { type: SchemaType.STRING, description: "tempId của task mà task này phụ thuộc" }
                                                }
                                            },
                                            required: ["tempId", "title", "description", "priority", "type"]
                                        }
                                    }
                                },
                                required: ["title", "tasks"]
                            }
                        }
                    },
                    required: ["lists"]
                }
            }
        });

        // Prepare context data
        const currentDateStr = new Date().toISOString();
        const membersContext = workspaceMembers.map((m: any) => 
            `- ID: ${m.userId?._id || m.userId}, Tên: ${m.full_name || m.userId?.full_name}, Vai trò (Role): ${m.role}, Chức danh/Chuyên môn: ${m.title || 'Không rõ'}`
        ).join('\n');

        const promptText = `Bạn là một Senior Technical Project Manager và Agile Coach. 
Hôm nay là ngày: ${currentDateStr}.
Danh sách nhân sự trong dự án:
${membersContext || '(Không có thành viên nào)'}

Nhiệm vụ: Hãy phân tích yêu cầu sau và thiết lập một bảng Kanban hoàn chỉnh:
"${prompt}"

Quy tắc bắt buộc:
1. Tư duy hệ thống: Tự động break down thành các lớp (VD: Database, Backend API, Frontend UI, DevOps) nếu yêu cầu chung chung.
2. Tạo tempId: Mỗi task BẮT BUỘC có 1 "tempId" duy nhất (vd: "task_1", "task_2").
3. Thiết lập Component: Bắt buộc chọn đúng 1 trong các giá trị: Frontend, Backend, Database, DevOps, Design, Other.
4. Thời gian (startDate, dueDate): Bắt đầu từ ngày hôm nay. Các task liên tiếp phải có ngày nối tiếp nhau hợp lý. Tính bằng định dạng ISO 8601.
5. Story Points: Đánh giá độ khó theo dãy Fibonacci (1, 2, 3, 5, 8).
6. Phụ thuộc (Dependencies) & ParentId: Dùng tempId để liên kết. Backend phải làm trước Frontend (Frontend block bởi Backend). Epic chứa Task.
7. Phân công (Assignees): Đọc danh sách nhân sự (nếu có). Phân tích role và chức danh/chuyên môn để gán userId cho hợp lý. Nếu role là Developer mà chức danh là Backend thì giao việc Backend. Nếu thiếu thông tin, tự phán đoán logic nhất. Điền mảng các userId vào assignees. Trả về mảng rỗng nếu không có ai hợp.
8. Trả về ngôn ngữ Tiếng Việt.`;

        const result = await model.generateContent(promptText);
        const text = result.response.text();
        
        // Dọn dẹp markdown bọc quanh JSON (nếu có)
        const cleanText = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        let aiData;
        try {
            aiData = JSON.parse(cleanText);
        } catch (e) {
            throw new AppError(500, 'AI trả về định dạng không hợp lệ');
        }

        // Lấy order cao nhất hiện tại của list trong board này
        const lastList = await List.findOne({ boardId }).sort('-order');
        let currentListOrder = lastList ? lastList.order + 1000 : 1000;

        try {
            let createdCount = 0;
            const tempIdMap = new Map<string, mongoose.Types.ObjectId>();
            const tasksWithDependencies: any[] = [];
            
            // Pass 1: Tạo Lists và Insert Tasks
            for (const listData of aiData.lists) {
                const newList = await List.create([{
                    title: listData.title,
                    boardId: boardId,
                    order: currentListOrder
                }]);

                currentListOrder += 1000;
                let currentTaskOrder = 1000;

                if (listData.tasks && listData.tasks.length > 0) {
                    const tasksToCreate = listData.tasks.map((task: any) => ({
                        title: task.title,
                        description: task.description,
                        priority: task.priority || 'Medium',
                        type: task.type || 'Task',
                        listId: newList[0]._id,
                        boardId: boardId,
                        order: currentTaskOrder += 1000,
                        component: task.component,
                        storyPoints: task.storyPoints,
                        startDate: task.startDate ? new Date(task.startDate) : undefined,
                        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
                        assignees: task.assignees || [],
                        // Temp fields to resolve later
                        _tempId: task.tempId,
                        _tempParentId: task.parentId,
                        _tempDependencies: task.dependencies
                    }));

                    const insertedTasks = await Task.insertMany(tasksToCreate);
                    createdCount += insertedTasks.length;

                    // Build Map and collect dependencies
                    insertedTasks.forEach((t: any, index: number) => {
                        const originalTask = tasksToCreate[index];
                        if (originalTask._tempId) {
                            tempIdMap.set(originalTask._tempId, t._id);
                        }
                        if (originalTask._tempParentId || (originalTask._tempDependencies && originalTask._tempDependencies.length > 0)) {
                            tasksWithDependencies.push({
                                taskId: t._id,
                                tempParentId: originalTask._tempParentId,
                                tempDependencies: originalTask._tempDependencies
                            });
                        }
                    });
                }
            }
            
            // Pass 2: Bulk Update ParentId and Dependencies
            if (tasksWithDependencies.length > 0) {
                const bulkOps = tasksWithDependencies.map(t => {
                    const updateData: any = {};
                    if (t.tempParentId && tempIdMap.has(t.tempParentId)) {
                        updateData.parentId = tempIdMap.get(t.tempParentId);
                    }
                    if (t.tempDependencies && t.tempDependencies.length > 0) {
                        const validDeps = t.tempDependencies
                            .map((depId: string) => tempIdMap.get(depId))
                            .filter(Boolean);
                        if (validDeps.length > 0) {
                            updateData.dependencies = validDeps;
                        }
                    }
                    return {
                        updateOne: {
                            filter: { _id: t.taskId },
                            update: { $set: updateData }
                        }
                    };
                });
                
                if (bulkOps.length > 0) {
                    await Task.bulkWrite(bulkOps);
                }
            }

            res.status(200).json({
                status: 'success',
                message: `Đã tạo thành công ${aiData.lists.length} Cột và ${createdCount} Công việc`,
            });
        } catch (error) {
            throw error;
        }
        
    } catch (error: any) {
        console.error('AI Generate Error:', error);
        res.status(error.statusCode || 500).json({
            status: 'error',
            message: error.message || 'Đã xảy ra lỗi khi gọi AI API'
        });
    }
};
