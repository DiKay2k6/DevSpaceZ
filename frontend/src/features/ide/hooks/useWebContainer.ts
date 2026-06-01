import { useState, useCallback, useEffect } from 'react';
import { WebContainer } from '@webcontainer/api';
import { LocalFileNode } from '@/features/ide/utils/local-fs.utils';
import { toast } from 'react-hot-toast';

let webcontainerInstance: WebContainer | null = null;

export const useWebContainer = (saveLocationHandle: any, projectName: string) => {
    const [wc, setWc] = useState<WebContainer | null>(null);
    const [fileSystem, setFileSystem] = useState<LocalFileNode[]>([]);
    const [isBooting, setIsBooting] = useState(false);
    const [projectLoaded, setProjectLoaded] = useState(false);

    // Xây dựng cây thư mục ảo từ handle thực tế
    const readDirectoryRecursive = async (dirHandle: FileSystemDirectoryHandle, parentNode: LocalFileNode) => {
        try {
            for await (const entry of (dirHandle as any).values()) {
                if (entry.kind === 'file') {
                    parentNode.children?.push({ name: entry.name, kind: 'file', handle: entry });
                } else if (entry.kind === 'directory') {
                    const dirNode: LocalFileNode = { name: entry.name, kind: 'directory', handle: entry, children: [] };
                    parentNode.children?.push(dirNode);
                    if (entry.name !== 'node_modules' && entry.name !== '.git') {
                        await readDirectoryRecursive(entry, dirNode);
                    }
                }
            }
        } catch (error) {
            console.error("Lỗi đọc thư mục:", error);
        }
    };

    const bootContainer = useCallback(async () => {
        if (!saveLocationHandle) {
            toast.error("Không có thông tin thư mục dự án");
            return;
        }
        setIsBooting(true);
        try {
            if (!webcontainerInstance) {
                webcontainerInstance = await WebContainer.boot();
            }
            setWc(webcontainerInstance);

            const projectHandle = await saveLocationHandle.getDirectoryHandle(projectName, { create: true });
            if (!projectHandle) throw new Error("Không thể truy cập thư mục dự án");

            await projectHandle.requestPermission({ mode: 'readwrite' });

            const rootNode: LocalFileNode = {
                name: projectName,
                kind: 'directory',
                handle: projectHandle,
                children: []
            };

            await readDirectoryRecursive(projectHandle, rootNode);
            setFileSystem(rootNode.children || []);

            const mountTree: any = {};
            const buildMountTree = async (node: LocalFileNode, treeLevel: any) => {
                if (node.kind === 'file' && node.handle) {
                    try {
                        const file = await (node.handle as FileSystemFileHandle).getFile();
                        const content = await file.text();
                        treeLevel[node.name] = { file: { contents: content } };
                    } catch (e) { }
                } else if (node.kind === 'directory' && node.children && node.name !== 'node_modules') {
                    treeLevel[node.name] = { directory: {} };
                    for (const child of node.children) {
                        await buildMountTree(child, treeLevel[node.name].directory);
                    }
                }
            };

            for (const child of rootNode.children || []) {
                await buildMountTree(child, mountTree);
            }

            await webcontainerInstance.mount(mountTree);
            setProjectLoaded(true);
        } catch (error: any) {
            console.error('Lỗi khởi động container:', error);
            toast.error('Lỗi khi nạp dự án vào IDE: ' + error.message);
        } finally {
            setIsBooting(false);
        }
    }, [saveLocationHandle, projectName]);

    const refreshFileSystem = useCallback(async () => {
        if (!saveLocationHandle) return;
        try {
            const projectHandle = await saveLocationHandle.getDirectoryHandle(projectName);
            const rootNode: LocalFileNode = {
                name: projectName,
                kind: 'directory',
                handle: projectHandle,
                children: []
            };
            await readDirectoryRecursive(projectHandle, rootNode);
            setFileSystem(rootNode.children || []);
            toast.success("Đã đồng bộ cây thư mục", { position: 'bottom-right' });
        } catch (e) {
            console.error(e);
            toast.error("Đồng bộ thư mục thất bại");
        }
    }, [saveLocationHandle, projectName]);

    return {
        wc,
        fileSystem,
        isBooting,
        projectLoaded,
        bootContainer,
        refreshFileSystem,
        setFileSystem
    };
};
