import { Request, Response } from 'express';
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import os from 'os';

const execPromise = util.promisify(exec);

export const ideController = {
    executeCode: async (req: Request, res: Response) => {
        const { code, files, entrypoint, language } = req.body;

        if (!code && !files) {
            return res.status(400).json({ status: 'error', message: 'No code or files provided' });
        }

        // Tạo thư mục tạm thời độc lập cho mỗi lần chạy để cách ly
        const sessionId = crypto.randomBytes(16).toString('hex');
        const tmpDir = path.join(os.tmpdir(), `devspacez_ide_${sessionId}`);
        
        try {
            await fs.mkdir(tmpDir, { recursive: true });

            // Normalize payload
            const projectFiles: { [filename: string]: string } = files || {};
            if (code && !files) {
                if (language === 'python') projectFiles['main.py'] = code;
                else if (language === 'java') projectFiles['Main.java'] = code;
                else if (language === 'javascript' || language === 'typescript') projectFiles['index.js'] = code;
            }

            // Ghi tất cả files ra disk
            for (const [filename, content] of Object.entries(projectFiles)) {
                const filePath = path.join(tmpDir, filename);
                // Tạo folder nếu file nằm trong subfolder
                await fs.mkdir(path.dirname(filePath), { recursive: true });
                await fs.writeFile(filePath, content);
            }

            let output = '';
            let isError = false;

            if (language === 'javascript' || language === 'typescript') {
                const mainFile = entrypoint || 'index.js';
                try {
                    const cmd = `docker run --rm --network none --memory 256m --cpus 0.5 -v ${tmpDir}:/app -w /app node:18-alpine node ${mainFile}`;
                    const { stdout, stderr } = await execPromise(cmd, { timeout: 5000 });
                    output = stdout || stderr;
                    if (stderr) isError = true;
                } catch (execError: any) {
                    isError = true;
                    if (execError.killed) output = "Error: Code Execution Timeout (Vượt quá 5 giây). Có thể bạn đang bị lặp vô hạn (Infinite Loop).";
                    else output = execError.stderr || execError.message;
                }
            } else if (language === 'python') {
                const mainFile = entrypoint || 'main.py';
                try {
                    const cmd = `docker run --rm --network none --memory 256m --cpus 0.5 -v ${tmpDir}:/app -w /app python:3.9-alpine python ${mainFile}`;
                    const { stdout, stderr } = await execPromise(cmd, { timeout: 5000 });
                    output = stdout || stderr;
                    if (stderr) isError = true;
                } catch (execError: any) {
                    isError = true;
                    if (execError.killed) output = "Error: Code Execution Timeout.";
                    else output = execError.stderr || execError.message;
                }
            } else if (language === 'java') {
                const mainFile = entrypoint || 'Main.java';
                const mainClass = mainFile.replace('.java', '');
                try {
                    const cmd = `docker run --rm --network none --memory 512m --cpus 1.0 -v ${tmpDir}:/app -w /app openjdk:17-alpine sh -c "javac *.java && java ${mainClass}"`;
                    const { stdout, stderr } = await execPromise(cmd, { timeout: 10000 }); 
                    output = stdout || stderr;
                    if (stderr && !stdout) isError = true;
                } catch (execError: any) {
                    isError = true;
                    if (execError.killed) output = "Error: Code Execution Timeout.";
                    else output = execError.stderr || execError.message;
                }
            } else {
                return res.status(400).json({ status: 'error', message: `Language '${language}' is not supported yet.` });
            }

            // Dọn dẹp thư mục tạm
            await fs.rm(tmpDir, { recursive: true, force: true });

            return res.status(200).json({ 
                status: 'success', 
                data: {
                    output: output.trim(),
                    isError
                } 
            });

        } catch (error: any) {
            // Dọn dẹp an toàn nếu có lỗi hệ thống
            await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
            res.status(500).json({ status: 'error', message: 'Hệ thống thực thi lỗi: ' + error.message });
        }
    }
};
