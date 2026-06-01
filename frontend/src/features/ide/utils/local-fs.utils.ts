declare global {
    interface Window {
        showDirectoryPicker(options?: { mode: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>;
    }
}

export interface LocalFileNode {
    name: string;
    kind: 'file' | 'directory';
    handle: FileSystemHandle;
    children?: LocalFileNode[];
}

export const openLocalDirectory = async (): Promise<LocalFileNode | null> => {
    try {
        const dirHandle = await window.showDirectoryPicker({
            mode: 'readwrite',
        });
        
        const root: LocalFileNode = {
            name: dirHandle.name,
            kind: 'directory',
            handle: dirHandle,
            children: []
        };
        
        await readDirectoryRecursive(dirHandle, root);
        return root;
    } catch (error: any) {
        if (error.name !== 'AbortError') {
            console.error("Lỗi khi mở thư mục:", error);
        }
        return null;
    }
};

export const readDirectoryRecursive = async (dirHandle: FileSystemDirectoryHandle, node: LocalFileNode) => {
    node.children = [];
    // @ts-ignore (TypeScript might not have AsyncIterable for FileSystemDirectoryHandle values)
    for await (const entry of dirHandle.values()) {
        if (entry.name === 'node_modules' || entry.name === '.git') {
            continue; // Bỏ qua thư mục quá nặng
        }
        
        const childNode: LocalFileNode = {
            name: entry.name,
            kind: entry.kind,
            handle: entry
        };
        
        if (entry.kind === 'directory') {
            await readDirectoryRecursive(entry as FileSystemDirectoryHandle, childNode);
        }
        
        
        node.children.push(childNode);
    }
    
    // Sort: directories first, then files
    node.children.sort((a, b) => {
        if (a.kind === b.kind) return a.name.localeCompare(b.name);
        return a.kind === 'directory' ? -1 : 1;
    });
};

export const getLocalFileHandleByPath = (node: LocalFileNode, path: string): FileSystemFileHandle | null => {
    const parts = path.split('/');
    let current: LocalFileNode | undefined = node;
    
    for (let i = 0; i < parts.length; i++) {
        if (!current || !current.children) return null;
        current = current.children.find(c => c.name === parts[i]);
    }
    
    if (current && current.kind === 'file') {
        return current.handle as FileSystemFileHandle;
    }
    return null;
};

export const saveLocalFile = async (fileHandle: FileSystemFileHandle, content: string) => {
    try {
        const writable = await fileHandle.createWritable();
        await writable.write(content);
        await writable.close();
    } catch (error) {
        console.error("Lỗi khi lưu file cục bộ:", error);
        throw error;
    }
};

// Hàm chuyển đổi cây Local thành cấu trúc Mount cho WebContainer
export const convertLocalToWebContainerFileSystem = async (rootNode: LocalFileNode) => {
    const wcFs: any = {};
    
    const processNode = async (node: LocalFileNode, wcObj: any) => {
        if (!node.children) return;
        
        for (const child of node.children) {
            if (child.kind === 'directory') {
                wcObj[child.name] = { directory: {} };
                await processNode(child, wcObj[child.name].directory);
            } else {
                try {
                    const file = await (child.handle as FileSystemFileHandle).getFile();
                    // WebContainers only mounts text files via contents. For binary, it's more complex, but we'll stick to text for now.
                    if (file.size < 5 * 1024 * 1024) { // Chỉ nạp file < 5MB để tránh crash memory
                        const text = await file.text();
                        wcObj[child.name] = {
                            file: {
                                contents: text
                            }
                        };
                    }
                } catch (e) {
                    console.warn(`Bỏ qua file không thể đọc: ${child.name}`);
                }
            }
        }
    };
    
    await processNode(rootNode, wcFs);
    return wcFs;
};
