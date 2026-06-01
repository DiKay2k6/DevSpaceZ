import { Request, Response } from 'express';
import { DocumentModel } from '../models/document.model';
import { Workspace } from '../models/workspace.model';
import { Organization } from '../models/organization.model';
import { AppError } from '../utils/appError';
import * as mammoth from 'mammoth';
import HTMLtoDOCX from 'html-to-docx';
import translate from 'google-translate-api-x';

const isOwnerOrManager = async (workspaceId: string, userId: string) => {
    const workspace = await Workspace.findById(workspaceId).lean();
    if (!workspace) return false;
    if (workspace.ownerId.toString() === userId) return true;
    const directMember = workspace.members?.find((m: any) => m.userId.toString() === userId);
    if (directMember && directMember.role === 'Manager') return true;
    if (workspace.organizationId) {
        const org = await Organization.findById(workspace.organizationId).lean();
        const orgMember = org?.members?.find((m: any) => m.userId.toString() === userId);
        if (orgMember && orgMember.role === 'Manager') return true;
    }
    return false;
};

export const documentController = {
    getAll: async (req: Request, res: Response) => {
        try {
            const workspaceId = req.query.workspaceId as string;
            const userId = (req as any).user.id;
            if (!workspaceId) throw new AppError(400, 'Thiếu workspaceId');
            
            const hasFullAccess = await isOwnerOrManager(workspaceId, userId);
            
            const query: any = { workspaceId };
            if (!hasFullAccess) {
                query.$or = [
                    { visibility: 'workspace' },
                    { ownerId: userId },
                    { 'collaborators.userId': userId }
                ];
            }
            
            const docs = await DocumentModel.find(query).sort({ isFolder: -1, updatedAt: -1 }).select('title isFolder parentId visibility collaborators createdAt updatedAt');
            res.status(200).json({ status: 'success', data: docs });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },
    
    getById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = (req as any).user.id;
            const doc = await DocumentModel.findById(id).populate('collaborators.userId', 'fullname email avatar');
            if (!doc) throw new AppError(404, 'Không tìm thấy tài liệu');
            
            const hasFullAccess = await isOwnerOrManager(doc.workspaceId.toString(), userId);
            
            if (!hasFullAccess && doc.visibility !== 'workspace' && doc.ownerId.toString() !== userId) {
                const isCollab = doc.collaborators.some(c => c.userId._id.toString() === userId);
                if (!isCollab) throw new AppError(403, 'Bạn không có quyền xem tài liệu này');
            }
            
            res.status(200).json({ status: 'success', data: doc });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },
    
    create: async (req: Request, res: Response) => {
        try {
            const { title, content, workspaceId, isFolder, parentId } = req.body;
            const userId = (req as any).user.id;
            
            const doc = await DocumentModel.create({
                title,
                content: content || '',
                workspaceId,
                ownerId: userId,
                isFolder: isFolder || false,
                parentId: parentId || null
            });
            
            res.status(201).json({ status: 'success', data: doc });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },
    
    update: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { title, content } = req.body;
            
            const doc = await DocumentModel.findByIdAndUpdate(
                id,
                { title, content },
                { new: true, runValidators: true }
            );
            if (!doc) throw new AppError(404, 'Không tìm thấy tài liệu');
            
            res.status(200).json({ status: 'success', data: doc });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },
    
    delete: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const doc = await DocumentModel.findByIdAndDelete(id);
            if (!doc) throw new AppError(404, 'Không tìm thấy tài liệu');
            
            // Nếu là folder, đưa các con của nó ra ngoài root
            if (doc.isFolder) {
                await DocumentModel.updateMany({ parentId: id }, { $set: { parentId: null } });
            }
            
            res.status(200).json({ status: 'success', message: 'Đã xóa tài liệu' });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },
    
    updateCollaborators: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { visibility, collaborators } = req.body;
            const userId = (req as any).user.id;
            
            const doc = await DocumentModel.findById(id);
            if (!doc) throw new AppError(404, 'Không tìm thấy tài liệu');
            
            const hasFullAccess = await isOwnerOrManager(doc.workspaceId.toString(), userId);
            if (!hasFullAccess && doc.ownerId.toString() !== userId) {
                throw new AppError(403, 'Chỉ chủ sở hữu hoặc Quản lý mới được đổi quyền chia sẻ');
            }
            
            if (visibility) doc.visibility = visibility;
            if (collaborators) doc.collaborators = collaborators;
            
            await doc.save();
            res.status(200).json({ status: 'success', message: 'Cập nhật quyền chia sẻ thành công' });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },
    
    move: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { parentId } = req.body;
            
            const doc = await DocumentModel.findByIdAndUpdate(
                id,
                { parentId: parentId || null },
                { new: true }
            );
            if (!doc) throw new AppError(404, 'Không tìm thấy tài liệu');
            
            res.status(200).json({ status: 'success', data: doc });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },
    
    importWord: async (req: Request, res: Response) => {
        try {
            const { workspaceId, parentId } = req.body;
            const userId = (req as any).user.id;
            const file = req.file;
            
            if (!workspaceId) throw new AppError(400, 'Thiếu workspaceId');
            if (!file) throw new AppError(400, 'Vui lòng đính kèm file .docx');
            
            const hasFullAccess = await isOwnerOrManager(workspaceId, userId);
            
            const mammothAny = mammoth as any;
            const options = {
                transformDocument: mammothAny.transforms.paragraph(function(paragraph: any) {
                    if (paragraph.alignment === "center") {
                        return {...paragraph, styleId: "AlignCenter", styleName: "AlignCenter"};
                    } else if (paragraph.alignment === "right") {
                        return {...paragraph, styleId: "AlignRight", styleName: "AlignRight"};
                    } else if (paragraph.alignment === "both") {
                        return {...paragraph, styleId: "AlignJustify", styleName: "AlignJustify"};
                    }
                    return paragraph;
                }),
                styleMap: [
                    "p[style-name='AlignCenter'] => p.align-center",
                    "p[style-name='AlignRight'] => p.align-right",
                    "p[style-name='AlignJustify'] => p.align-justify"
                ],
                convertImage: mammoth.images.imgElement(function(image) {
                    return image.read("base64").then(function(imageBuffer) {
                        return {
                            src: "data:" + image.contentType + ";base64," + imageBuffer
                        };
                    });
                })
            };
            
            const result = await mammoth.convertToHtml({ buffer: file.buffer }, options);
            let htmlContent = result.value;
            
            // Post-process classes to inline styles for TipTap TextAlign extension
            htmlContent = htmlContent.replace(/class="align-center"/g, 'style="text-align: center"');
            htmlContent = htmlContent.replace(/class="align-right"/g, 'style="text-align: right"');
            htmlContent = htmlContent.replace(/class="align-justify"/g, 'style="text-align: justify"'); // The generated HTML
            
            // Clean up basic HTML to make it more TipTap friendly if needed
            // TipTap can usually handle standard HTML generated by Mammoth
            
            // Fix Multer's latin1 encoding issue with UTF-8 filenames (e.g. Vietnamese accents)
            const originalNameUtf8 = Buffer.from(file.originalname, 'latin1').toString('utf8');
            
            const newDoc = await DocumentModel.create({
                title: originalNameUtf8.replace('.docx', ''),
                content: htmlContent,
                workspaceId,
                parentId: parentId || null,
                ownerId: userId,
                visibility: hasFullAccess ? 'workspace' : 'private'
            });
            
            res.status(201).json({ status: 'success', data: newDoc });
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },

    exportWord: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const userId = (req as any).user.id;
            
            const doc = await DocumentModel.findById(id);
            if (!doc) throw new AppError(404, 'Không tìm thấy tài liệu');
            
            const hasFullAccess = await isOwnerOrManager(doc.workspaceId.toString(), userId);
            
            if (!hasFullAccess && doc.visibility !== 'workspace' && doc.ownerId.toString() !== userId) {
                const isCollab = doc.collaborators.some(c => c.userId.toString() === userId);
                if (!isCollab) throw new AppError(403, 'Bạn không có quyền tải tài liệu này');
            }
            
            // Format HTML to ensure tables and basic styles look good in Word
            const cleanHtml = `
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <title>${doc.title}</title>
                    </head>
                    <body>
                        ${doc.content || '<p></p>'}
                    </body>
                </html>
            `;
            
            const fileBuffer = await HTMLtoDOCX(cleanHtml, null, {
                table: { row: { cantSplit: true } },
                footer: true,
                pageNumber: true,
            });
            
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.title)}.docx"`);
            res.send(fileBuffer);
        } catch (error: any) {
            res.status(error.statusCode || 500).json({ status: 'error', message: error.message });
        }
    },
    
    translateContent: async (req: Request, res: Response) => {
        try {
            const { html, to } = req.body;
            if (!html || !to) throw new AppError(400, 'Thiếu dữ liệu để dịch');

            const IT_TERMS = [
                'Frontend', 'Backend', 'Database', 'Server', 'React', 'Node.js', 'API', 'Docker', 
                'Component', 'UI', 'UX', 'Bug', 'Code', 'Framework', 'Library', 'Deploy', 'Repository', 
                'Git', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'App', 'Web'
            ];

            // 1. Placeholder substitution
            let processedHtml = html;
            const placeholders: string[] = [];
            
            IT_TERMS.forEach((term, index) => {
                // Regex matches the term not inside HTML tags (rough approximation)
                const regex = new RegExp(`(?<!<[^>]*)\\b${term}\\b(?![^<]*>)`, 'gi');
                processedHtml = processedHtml.replace(regex, (match: string) => {
                    placeholders.push(match);
                    return `__IT_TERM_${placeholders.length - 1}__`;
                });
            });

            // 1.5. Code Block Freeze (Prevent translating code snippets)
            const codePlaceholders: string[] = [];
            processedHtml = processedHtml.replace(/<(pre|code)\b[^>]*>[\s\S]*?<\/\1>/gi, (match: string) => {
                codePlaceholders.push(match);
                return `__CODE_BLOCK_${codePlaceholders.length - 1}__`;
            });

            // 2. Chunk HTML to avoid Google Translate limits (max ~5000 chars)
            const chunkHtml = (htmlStr: string, maxChunkSize: number = 4000): string[] => {
                const chunks: string[] = [];
                let currentChunk = "";
                const blocks = htmlStr.split(/(<\/(?:p|h1|h2|h3|h4|h5|h6|li|tr|div)>)/g);
                
                for (let i = 0; i < blocks.length; i += 2) {
                    const text = blocks[i];
                    const tag = blocks[i + 1] || "";
                    const block = text + tag;
                    
                    if (currentChunk.length + block.length > maxChunkSize && currentChunk.length > 0) {
                        chunks.push(currentChunk);
                        currentChunk = block;
                    } else {
                        currentChunk += block;
                    }
                }
                if (currentChunk) chunks.push(currentChunk);
                return chunks;
            };

            const htmlChunks = chunkHtml(processedHtml, 4000);
            let translatedHtml = "";

            // 3. Call Google Translate for each chunk sequentially
            for (const chunk of htmlChunks) {
                if (!chunk.trim()) continue;
                const translateRes: any = await translate(chunk, { to });
                translatedHtml += translateRes.text;
            }

            // 4. Restore Placeholders
            placeholders.forEach((originalTerm, index) => {
                const regex = new RegExp(`__IT_TERM_${index}__`, 'g');
                translatedHtml = translatedHtml.replace(regex, originalTerm);
            });

            codePlaceholders.forEach((originalCode, index) => {
                const regex = new RegExp(`__CODE_BLOCK_${index}__`, 'g');
                translatedHtml = translatedHtml.replace(regex, originalCode);
            });

            res.status(200).json({ status: 'success', data: translatedHtml });
        } catch (error: any) {
            res.status(500).json({ status: 'error', message: 'Lỗi dịch thuật: ' + error.message });
        }
    }
};
