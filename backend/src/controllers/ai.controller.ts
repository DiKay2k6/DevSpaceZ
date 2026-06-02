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
        const { boardId, prompt } = req.body;

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
                                                title: { type: SchemaType.STRING, description: "Tên công việc cần làm" },
                                                description: { type: SchemaType.STRING, description: "Mô tả công việc chi tiết" },
                                                priority: { type: SchemaType.STRING, description: "Low, Medium, High" },
                                                type: { type: SchemaType.STRING, description: "Task, Feature, Bug, Chore, Epic" }
                                            },
                                            required: ["title", "description", "priority", "type"]
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

        const promptText = `Hãy phân tích dự án sau và chia nhỏ thành các Cột (Lists) và Công việc (Tasks) chi tiết:
        "${prompt}"
        
        Yêu cầu:
        - Tạo ra ít nhất 2 cột hợp lý với dự án.
        - Mỗi cột tạo khoảng 3-5 tasks.
        - Viết bằng Tiếng Việt.`;

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
            
            for (const listData of aiData.lists) {
                // Tạo List
                const newList = await List.create([{
                    title: listData.title,
                    boardId: boardId,
                    order: currentListOrder
                }]);

                currentListOrder += 1000;
                let currentTaskOrder = 1000;

                // Tạo Tasks cho List này
                if (listData.tasks && listData.tasks.length > 0) {
                    const tasksToCreate = listData.tasks.map((task: any) => ({
                        title: task.title,
                        description: task.description,
                        priority: task.priority || 'Medium',
                        type: task.type || 'Task',
                        listId: newList[0]._id,
                        boardId: boardId,
                        order: currentTaskOrder += 1000
                    }));

                    await Task.insertMany(tasksToCreate);
                    createdCount += tasksToCreate.length;
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
