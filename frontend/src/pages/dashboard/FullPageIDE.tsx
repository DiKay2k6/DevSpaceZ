import React, { useEffect, useState, useRef } from 'react';
import { WebContainer } from '@webcontainer/api';
import { CodeEditor } from '@/features/ide/components/CodeEditor';
import { FileExplorer, FileNode } from '@/features/ide/components/FileExplorer';
import { useMonaco } from '@monaco-editor/react';
import { Code2, Loader2, FolderOpen, FilePlus, Terminal as TerminalIcon } from 'lucide-react';
import { useTheme } from '@/shared/contexts/ThemeContext';
import { ideApi } from '@/features/ide/api/ide.api';
import toast from 'react-hot-toast';
import { openLocalDirectory, convertLocalToWebContainerFileSystem, saveLocalFile, LocalFileNode, readDirectoryRecursive, getLocalFileHandleByPath } from '@/features/ide/utils/local-fs.utils';
import { generateBoilerplate } from '@/features/ide/utils/boilerplate';
import { IDEHeader } from '@/features/ide/components/layout/IDEHeader';
import { IDEEditorTabs } from '@/features/ide/components/layout/IDEEditorTabs';
import { IDEBottomPanel } from '@/features/ide/components/layout/IDEBottomPanel';
import { FilePermissionModal } from '@/features/ide/components/FilePermissionModal';
import { setupATA } from '@/features/ide/utils/ata.utils';
import { useIDECollaboration } from '@/features/ide/hooks/useIDECollaboration';
import * as Y from 'yjs';

// Singleton cho WebContainer để tránh khởi tạo nhiều lần
let webcontainerInstance: WebContainer | null = null;

export const FullPageIDE: React.FC = () => {
    const { theme } = useTheme();
    const monaco = useMonaco();
    const [isBooting, setIsBooting] = useState(false);
    const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('MyApplication');
    const [saveLocation, setSaveLocation] = useState<LocalFileNode | null>(null);
    const [projectLanguage, setProjectLanguage] = useState('Java');
    const [wc, setWc] = useState<WebContainer | null>(null);
    const [currentLanguage, setCurrentLanguage] = useState('javascript');
    const [currentFile, setCurrentFile] = useState('index.js');
    const [codeContent, setCodeContent] = useState('');
    const [openFiles, setOpenFiles] = useState<string[]>(['index.js']);
    const [ideMode, setIdeMode] = useState<'web' | 'script'>('web');
    const [isExecuting, setIsExecuting] = useState(false);
    const [scriptOutput, setScriptOutput] = useState<{text: string, isError: boolean} | null>(null);
    const [fileSystem, setFileSystem] = useState<FileNode[]>([]);
    
    // Trạng thái dự án
    const [projectLoaded, setProjectLoaded] = useState(false);
    const [localRootNode, setLocalRootNode] = useState<LocalFileNode | null>(null);
    const [markers, setMarkers] = useState<any[]>([]);
    const [bottomTab, setBottomTab] = useState<'terminal' | 'problems'>('terminal');
    const [isQuickOpenModalOpen, setIsQuickOpenModalOpen] = useState(false);
    const [quickOpenQuery, setQuickOpenQuery] = useState('');
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const ataRef = useRef<((code: string) => void) | null>(null);
    const quickOpenQueryRef = useRef(quickOpenQuery);
    const openFilesRef = useRef(openFiles);
    const validDepsRef = useRef<Set<string>>(new Set());
    const validLocalFilesRef = useRef<Set<string>>(new Set());

    // --- Collaboration State ---
    const urlParams = new URLSearchParams(window.location.search);
    const urlRoomId = urlParams.get('room');
    const isGuest = !!urlRoomId;
    const [roomId, setRoomId] = useState<string | null>(urlRoomId);
    
    // --- Cloud Workspace State ---
    const isCloud = urlParams.get('cloud') === '1';
    const workspaceId = urlParams.get('workspaceId');
    const [isSavingCloud, setIsSavingCloud] = useState(false);
    const cloudSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // --- File Permission State ---
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
    const [permissionFilePath, setPermissionFilePath] = useState('');

    // Nếu là Host Local, tạo room ngẫu nhiên khi chưa có.
    // Nếu là Cloud, dùng workspaceId làm roomId luôn để tất cả cùng join chung phòng.
    useEffect(() => {
        if (isCloud && workspaceId) {
            setRoomId(workspaceId);
        } else if (!isGuest && !roomId) {
            setRoomId(Math.random().toString(36).substring(2, 10));
        }
    }, [isGuest, roomId, isCloud, workspaceId]);

    const { ydoc, awareness, connected, collaborators } = useIDECollaboration({ roomId, isHost: !isGuest });
    const fileSystemMapRef = useRef<Y.Map<Y.Text> | null>(null);

    // Lắng nghe thay đổi của fileSystemMap từ Guest
    useEffect(() => {
        if (!ydoc) return;
        
        fileSystemMapRef.current = ydoc.getMap('fileSystemMap');
        
        if (isGuest) {
            const handleSync = () => {
                if (!fileSystemMapRef.current) return;
                // Xây dựng lại fileSystem tree từ Y.Map cho Guest
                const keys = Array.from(fileSystemMapRef.current.keys());
                if (keys.length === 0) return;

                // Hàm Helper để build tree từ list paths
                const buildTree = (paths: string[]): FileNode[] => {
                    const root: any = { children: [] };
                    paths.forEach(path => {
                        const parts = path.split('/');
                        let current = root;
                        for (let i = 0; i < parts.length; i++) {
                            const part = parts[i];
                            const isFile = i === parts.length - 1;
                            let existing = current.children.find((c: any) => c.name === part);
                            if (!existing) {
                                existing = {
                                    name: part,
                                    type: isFile ? 'file' : 'directory',
                                    path: isFile ? path : '',
                                    children: isFile ? undefined : []
                                };
                                current.children.push(existing);
                            }
                            current = existing;
                        }
                    });
                    
                    const sortTree = (nodes: any[]): FileNode[] => {
                        nodes.sort((a, b) => {
                            if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
                            return a.name.localeCompare(b.name);
                        });
                        nodes.forEach(n => {
                            if (n.children) n.children = sortTree(n.children);
                        });
                        return nodes;
                    };
                    return sortTree(root.children);
                };

                setFileSystem(buildTree(keys));
                setProjectLoaded(true);
            };

            fileSystemMapRef.current.observe(handleSync);
            // Lần chạy đầu tiên nếu đã có data
            handleSync();

            return () => {
                fileSystemMapRef.current?.unobserve(handleSync);
            };
        }
    }, [ydoc, isGuest]);

    // Hàm Helper đồng bộ local root node vào Y.Map
    const syncLocalToYjs = async (rootNode: LocalFileNode, map: Y.Map<Y.Text>, currentPath: string = '') => {
        if (!ydoc) return;
        
        if (rootNode.kind === 'directory') {
            for (const child of rootNode.children || []) {
                const childPath = currentPath ? `${currentPath}/${child.name}` : child.name;
                await syncLocalToYjs(child, map, childPath);
            }
        } else {
            // Đọc file content và đưa vào Y.Text nếu chưa có
            if (!map.has(currentPath)) {
                try {
                    const handle = rootNode.handle as FileSystemFileHandle;
                    const file = await handle.getFile();
                    const content = await file.text();
                    
                    const ytext = new Y.Text();
                    ytext.insert(0, content);
                    
                    // Transaction để tránh trigger quá nhiều events
                    ydoc.transact(() => {
                        map.set(currentPath, ytext);
                    });
                } catch (e) {
                    console.error("Lỗi đọc file local:", e);
                }
            }
        }
    };

    useEffect(() => {
        openFilesRef.current = openFiles;
    }, [openFiles]);
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key.toLowerCase() === 'p') {
                    e.preventDefault();
                    if (projectLoaded) {
                        setIsQuickOpenModalOpen(true);
                        setQuickOpenQuery('');
                    }
                } else if (e.key.toLowerCase() === 's') {
                    e.preventDefault(); // Ngăn trình duyệt save trang web
                    // Format code bằng format mặc định của Monaco
                    if (monaco && currentFile) {
                        const uri = monaco.Uri.parse(`file:///${currentFile}`);
                        const model = monaco.editor.getModel(uri);
                        if (model) {
                            // Cố gắng format document
                            // Do chúng ta chỉ có instance của editor trong CodeEditor.tsx, ta nên
                            // lưu editor instance hoặc trigger qua event.
                            // Cách đơn giản nhất là emit 1 custom event:
                            window.dispatchEvent(new CustomEvent('monaco-format'));
                            toast.success('Đã định dạng và lưu file!');
                        }
                    }
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [projectLoaded, monaco, currentFile]);

    // Cấu hình Monaco trên toàn hệ thống (Global) ngay khi load
    useEffect(() => {
        if (monaco) {
            const m = monaco as any;
            // Khởi tạo ATA (Automatic Type Acquisition)
            ataRef.current = setupATA((code, path) => {
                m.languages.typescript.typescriptDefaults.addExtraLib(code, path);
                m.languages.typescript.javascriptDefaults.addExtraLib(code, path);
            });
            
            // BẬT LẠI Semantic Validation vì chúng ta đã có ATA tải types tự động!
            m.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false,
                diagnosticCodesToIgnore: [] // KHÔNG bỏ qua lỗi nào nữa để bộ lọc thông minh tự xử lý
            });
            m.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
                noSemanticValidation: false,
                noSyntaxValidation: false,
                diagnosticCodesToIgnore: []
            });

            // Cấu hình Compiler
            const compilerOptions = {
                jsx: 4, // 4 = ReactJSX (Hỗ trợ React 17+ không cần import React)
                allowNonTsExtensions: true,
                allowJs: true,
                target: 99, // ESNext
                moduleResolution: 2, // NodeJs
                module: 99, // ESNext
                allowSyntheticDefaultImports: true,
                esModuleInterop: true,
                strict: true,
                noImplicitAny: false, // TẮT luật khắt khe bắt buộc khai báo Type để không bị lỗi 7006 (implicit any)
                strictNullChecks: true,
                lib: ["dom", "dom.iterable", "esnext"], // Quan trọng: Thêm thư viện DOM để nhận diện window, document, HTMLCanvasElement...
                baseUrl: "file:///",
                paths: {
                    "@/*": ["src/*", "frontend/src/*", "backend/src/*"],
                    "@shared/*": ["shared/*", "frontend/src/shared/*", "../shared/*"]
                }
            };
            m.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
            m.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);

            // Bỏ qua lỗi comment trong file JSON (đặc biệt là tsconfig.json)
            const configureJSON = () => {
                try {
                    if (m.languages.json && m.languages.json.jsonDefaults) {
                        m.languages.json.jsonDefaults.setDiagnosticsOptions({
                            validate: true,
                            allowComments: true
                        });
                    } else {
                        setTimeout(configureJSON, 500);
                    }
                } catch (e) {
                    console.error("Lỗi cấu hình JSON defaults:", e);
                }
            };
            configureJSON();
        }
    }, [monaco]);

    // Nạp trước toàn bộ file vào bộ nhớ của Monaco để báo lỗi toàn Project
    useEffect(() => {
        if (!monaco || !wc || !localRootNode) return;

        const loadAllModels = async () => {
            const filesToLoad: string[] = [];
            validLocalFilesRef.current.clear();
            
            const traverse = (node: LocalFileNode, currentPath: string) => {
                if (node.kind === 'directory') {
                    for (const child of node.children || []) {
                        traverse(child, currentPath ? `${currentPath}/${child.name}` : child.name);
                    }
                } else if (node.name.match(/\.(js|jsx|ts|tsx|json)$/)) {
                    filesToLoad.push(currentPath);
                    validLocalFilesRef.current.add(currentPath);
                }
            };
            
            traverse(localRootNode, '');
            
            // Bơm sẵn danh sách thư viện chuẩn để phòng hờ đọc file package.json bị lỗi
            const coreDeps = ["react", "react-dom", "react-router-dom", "framer-motion", "lucide-react", "axios", "zustand", "zod", "react-hook-form", "react-hot-toast", "recharts", "yjs", "y-websocket", "y-monaco", "date-fns", "react-dropzone", "html2pdf.js", "file-saver", "@hello-pangea/dnd", "@tanstack/react-query", "@monaco-editor/react", "@uiw/react-md-editor", "@webcontainer/api", "@xterm/xterm", "@xterm/addon-fit", "@tiptap/react", "@tiptap/starter-kit", "@tiptap/extension-collaboration", "@tiptap/extension-collaboration-cursor", "@tiptap/extension-color", "@tiptap/extension-image", "@tiptap/extension-table", "@tiptap/extension-table-cell", "@tiptap/extension-table-header", "@tiptap/extension-table-row", "@tiptap/extension-text-align", "@tiptap/extension-text-style", "@tiptap/extension-underline", "tailwindcss"];
            coreDeps.forEach(d => validDepsRef.current.add(d));
            
            // Bước 1: Nạp Type từ tất cả package.json TRƯỚC để populate validDepsRef
            // Điều này cực kỳ quan trọng để chống Race Condition khi Monaco quét lỗi ở Bước 2
            const packageJsonPaths = filesToLoad.filter(p => p.endsWith('package.json') && !p.includes('node_modules'));
            for (const p of packageJsonPaths) {
                if (ataRef.current) {
                    try {
                        const pkgContent = await wc.fs.readFile(p, 'utf-8');
                        const pkg = JSON.parse(pkgContent);
                        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
                        // Lưu danh sách thư viện hợp lệ để filter báo lỗi 2307
                        Object.keys(deps).forEach(dep => validDepsRef.current.add(dep));
                        const fakeImports = Object.keys(deps).map(d => `import '${d}';`).join('\n');
                        ataRef.current(fakeImports);
                    } catch(e) {
                        // ignore
                    }
                }
            }

            // Bước 2: Đọc file song song và tạo Monaco Models (tối đa 50 file cùng lúc để không nghẽn)
            const batchSize = 50;
            for (let i = 0; i < filesToLoad.length; i += batchSize) {
                const batch = filesToLoad.slice(i, i + batchSize);
                await Promise.all(batch.map(async (path) => {
                    try {
                        const content = await wc.fs.readFile(path, 'utf-8');
                        const uri = monaco.Uri.parse(`file:///${path}`);
                        const model = monaco.editor.getModel(uri);
                        if (!model) {
                            const lang = path.endsWith('.json') ? 'json' : (path.endsWith('.ts') || path.endsWith('.tsx') ? 'typescript' : 'javascript');
                            monaco.editor.createModel(content, lang, uri);
                        } else if (model.getValue() !== content) {
                            model.setValue(content);
                        }
                    } catch (e) {
                        // ignore
                    }
                }));
            }


        };

        loadAllModels();

        // Lắng nghe lỗi trên TOÀN BỘ file
        let markerTimeout: any;
        const disposable = monaco.editor.onDidChangeMarkers(() => {
            clearTimeout(markerTimeout);
            markerTimeout = setTimeout(() => {
                // Lấy toàn bộ lỗi hiện tại từ Monaco
                const allMarkers = monaco.editor.getModelMarkers({});
                
                // MẸO SIÊU TỐI ƯU LỌC LỖI THÔNG MINH
                setMarkers(allMarkers.filter((m: any) => {
                    // Bỏ qua rác trong node_modules
                    if (m.resource.path.includes('/node_modules/')) return false;
                    
                    // Xử lý m.code vì Monaco bản mới dùng Object cho code
                    const errorCode = m.code ? (typeof m.code === 'object' ? String(m.code.value) : String(m.code)) : '';
                    
                    // Xử lý thông minh lỗi "Cannot find module" (Mã 2307, 2792, 6053)
                    if (['2307', '2792', '6053'].includes(errorCode) || m.message.includes('Cannot find module') || m.message.includes('File ') || m.message.includes('not a module')) {
                        const match = m.message.match(/(?:Cannot find module|File) ['"`]([^'"`]+)['"`]/);
                        if (match) {
                            const moduleName = match[1];
                            // Nếu KHÔNG PHẢI là import file local (tức là import package NPM)
                            // Các alias local của dự án: @/ và @shared/
                            if (!moduleName.startsWith('.') && !moduleName.startsWith('/') && !moduleName.startsWith('@/') && !moduleName.startsWith('@shared/')) {
                                // Lấy tên gốc của package (xử lý cả trường hợp import sâu như 'framer-motion/dist/xyz')
                                const rootPkg = moduleName.startsWith('@') ? moduleName.split('/').slice(0, 2).join('/') : moduleName.split('/')[0];
                                
                                // Nếu validDepsRef trống (có thể do lỗi đọc package.json) thì mặc định bỏ qua lỗi NPM
                                // Hoặc nếu package có trong package.json thì cũng bỏ qua (lỗi ảo do ATA)
                                if (validDepsRef.current.size === 0 || validDepsRef.current.has(rootPkg)) {
                                    return false;
                                }
                                // Nếu không có trong package.json -> Gõ sai tên -> CHẮC CHẮN LÀ LỖI -> Hiển thị!
                            } else {
                                // Nếu là import local file (ví dụ: '../constants/pricingData' hoặc '@/shared/...' hoặc '@shared/...')
                                if (moduleName.startsWith('@/') || moduleName.startsWith('@shared/')) {
                                    const restPath = moduleName.startsWith('@/') ? moduleName.replace('@/', '') : moduleName.replace('@shared/', 'shared/');
                                    // Kiểm tra xem có file nào trong dự án chứa đường dẫn tương tự không
                                    const possibleMatches = Array.from(validLocalFilesRef.current).filter(p => 
                                        p.includes(`/src/${restPath}.`) || p.includes(`/src/${restPath}/index.`) || p.endsWith(`/src/${restPath}`) ||
                                        p.includes(`/${restPath}.`) || p.includes(`/${restPath}/index.`) || p.endsWith(`/${restPath}`)
                                    );
                                    if (possibleMatches.length > 0) return false; // Ẩn lỗi ảo nếu file tồn tại
                                } else if (moduleName.startsWith('.') || moduleName.startsWith('/')) {
                                    // Phân giải đường dẫn tương đối (Relative Path) hoặc tuyệt đối
                                    let absoluteBase = '';
                                    if (moduleName.startsWith('/')) {
                                        absoluteBase = moduleName.substring(1); // Bỏ dấu slash ở đầu
                                    } else {
                                        // Xử lý cẩn thận dấu slash đầu tiên để không bị lỗi cắt nhầm chữ (vd: /frontend -> frontend)
                                        const rawPath = m.resource.path || '';
                                        const markerPath = rawPath.startsWith('/') ? rawPath.substring(1) : rawPath; 
                                        const parts = markerPath.split('/');
                                        parts.pop(); // Bỏ tên file hiện tại
                                        for (const p of moduleName.split('/')) {
                                            if (p === '.') continue;
                                            if (p === '..') parts.pop();
                                            else parts.push(p);
                                        }
                                        absoluteBase = parts.join('/');
                                    }
                                    
                                    // Kiểm tra xem file có tồn tại trong hệ thống không
                                    const possibleMatches = Array.from(validLocalFilesRef.current).filter(p => 
                                        p === `${absoluteBase}.ts` ||
                                        p === `${absoluteBase}.tsx` ||
                                        p === `${absoluteBase}.js` ||
                                        p === `${absoluteBase}.jsx` ||
                                        p === `${absoluteBase}/index.ts` ||
                                        p === `${absoluteBase}/index.tsx` ||
                                        p === `${absoluteBase}/index.js` ||
                                        p === `${absoluteBase}/index.jsx` ||
                                        p === absoluteBase
                                    );
                                    
                                    if (possibleMatches.length > 0) return false; // Ẩn lỗi ảo nếu file tồn tại
                                }
                                // Nếu không tìm thấy file nào khớp -> Gõ sai đường dẫn -> CHẮC CHẮN LÀ LỖI -> Hiển thị!
                            }
                        }
                    }
                    return true;
                }));
            }, 200);
        });

        return () => {
            disposable.dispose();
            clearTimeout(markerTimeout);
        };
    }, [monaco, wc, localRootNode]);

    const getLanguageFromPath = (path: string) => {
        const ext = path.split('.').pop()?.toLowerCase();
        if (ext === 'js' || ext === 'jsx') return 'javascript';
        if (ext === 'ts' || ext === 'tsx') return 'typescript';
        if (ext === 'json') return 'json';
        if (ext === 'css') return 'css';
        if (ext === 'html') return 'html';
        if (ext === 'py') return 'python';
        if (ext === 'java') return 'java';
        return 'plaintext';
    };

    const closeTab = (fileToClose: string) => {
        const newOpenFiles = openFiles.filter(f => f !== fileToClose);
        setOpenFiles(newOpenFiles);
        if (currentFile === fileToClose) {
            if (newOpenFiles.length > 0) {
                const nextFile = newOpenFiles[newOpenFiles.length - 1];
                setCurrentFile(nextFile);
                setCurrentLanguage(getLanguageFromPath(nextFile));
                if (wc) {
                    wc.fs.readFile(nextFile, 'utf-8').then(content => {
                        if (content.includes('\uFFFD') || nextFile.match(/\.(png|jpe?g|gif|svg|jar|class|exe|bin)$/)) {
                            setCodeContent('// Hệ thống không thể hiển thị nội dung vì đây là file nhị phân (Binary).');
                        } else {
                            setCodeContent(content);
                        }
                    }).catch(() => setCodeContent(''));
                }
            } else {
                setCurrentFile('');
                setCodeContent('');
            }
        }
    };

    const clearWebContainer = async (container: WebContainer) => {
        const entries = await container.fs.readdir('.');
        for (const entry of entries) {
            await container.fs.rm(entry, { recursive: true, force: true });
        }
    };

    const handleCreateNewProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim()) {
            toast.error("Vui lòng nhập tên dự án");
            return;
        }
        if (!saveLocation) {
            toast.error("Vui lòng chọn thư mục lưu (Save location)");
            return;
        }

        setIsBooting(true);
        setIsCreateProjectModalOpen(false);
        try {
            const parentHandle = saveLocation.handle as FileSystemDirectoryHandle;
            const projectHandle = await parentHandle.getDirectoryHandle(newProjectName.trim(), { create: true });
            
            await generateBoilerplate(projectHandle, projectLanguage);
            
            const projectRoot: LocalFileNode = {
                name: newProjectName.trim(),
                kind: 'directory',
                handle: projectHandle,
                children: []
            };

            await new Promise(r => setTimeout(r, 500));
            await readDirectoryRecursive(projectHandle, projectRoot);

            if (!webcontainerInstance) {
                webcontainerInstance = await WebContainer.boot();
            } else {
                await clearWebContainer(webcontainerInstance);
            }

            const wcFs = await convertLocalToWebContainerFileSystem(projectRoot);
            await webcontainerInstance.mount(wcFs);
            
            // FIX MẠNH TAY BẰNG WEBCONTAINER API
            try {
                if (projectLanguage.includes('Fullstack')) {
                    await webcontainerInstance.fs.writeFile('package.json', `{\n  "name": "fullstack-project",\n  "version": "1.0.0",\n  "scripts": {\n    "install-all": "cd frontend && npm install && cd ../backend && npm install",\n    "dev:frontend": "cd frontend && npm run dev",\n    "dev:backend": "cd backend && npm start"\n  }\n}`);
                    await webcontainerInstance.fs.writeFile('frontend/package.json', `{\n  "name": "frontend",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "vite": "^5.0.0",\n    "@vitejs/plugin-react": "^4.2.0"\n  }\n}`);
                    await webcontainerInstance.fs.writeFile('backend/package.json', `{\n  "name": "backend",\n  "version": "1.0.0",\n  "main": "index.js",\n  "dependencies": {\n    "express": "^4.18.2"\n  },\n  "scripts": {\n    "start": "node index.js"\n  }\n}`);
                } else if (projectLanguage === 'Backend (Node.js + Express)') {
                    await webcontainerInstance.fs.writeFile('package.json', `{\n  "name": "backend",\n  "version": "1.0.0",\n  "main": "index.js",\n  "dependencies": {\n    "express": "^4.18.2"\n  },\n  "scripts": {\n    "start": "node index.js",\n    "dev": "node --watch index.js"\n  }\n}`);
                } else if (projectLanguage === 'Frontend Web (React + Vite + JS)') {
                    await webcontainerInstance.fs.writeFile('package.json', `{\n  "name": "frontend-js",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "vite": "^5.0.0",\n    "@vitejs/plugin-react": "^4.2.0"\n  }\n}`);
                } else if (projectLanguage === 'Frontend Web (React + Vite + TS)') {
                    await webcontainerInstance.fs.writeFile('package.json', `{\n  "name": "frontend-ts",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "vite": "^5.0.0",\n    "@vitejs/plugin-react": "^4.2.0",\n    "typescript": "^5.2.2",\n    "@types/react": "^18.2.15",\n    "@types/react-dom": "^18.2.7"\n  }\n}`);
                }
            } catch (err) {
                console.error("Lỗi fix package.json:", err);
            }

            // Đồng bộ Host FileSystem vào Y.Map
            if (fileSystemMapRef.current) {
                await syncLocalToYjs(projectRoot, fileSystemMapRef.current);
            }

            setLocalRootNode(projectRoot);
            setWc(webcontainerInstance);
            await refreshFileSystem(webcontainerInstance);
            setProjectLoaded(true);
            setMarkers([]); 
            
            setCurrentFile('');
            setCodeContent('');
            setOpenFiles([]);
        } catch (error) {
            console.error("Lỗi khởi tạo Dự án mới:", error);
            toast.error("Không thể tạo thư mục dự án trên ổ cứng.");
        } finally {
            setIsBooting(false);
        }
    };

    const openLocalProject = async () => {
        if (!('showDirectoryPicker' in window)) {
            toast.error("Trình duyệt của bạn không hỗ trợ tính năng này.");
            return;
        }

        const root = await openLocalDirectory();
        if (!root) return;

        setIsBooting(true);
        try {
            if (!webcontainerInstance) {
                webcontainerInstance = await WebContainer.boot();
            } else {
                await clearWebContainer(webcontainerInstance);
            }
            const wcFs = await convertLocalToWebContainerFileSystem(root);
            await webcontainerInstance.mount(wcFs);
            
            try {
                const fixEmptyPackageJson = async (path: string, defaultContent: string) => {
                    try {
                        const content = await webcontainerInstance!.fs.readFile(path, 'utf-8');
                        if (!content || content.trim() === '') {
                            await webcontainerInstance!.fs.writeFile(path, defaultContent);
                        }
                    } catch (e) {}
                };
                
                await fixEmptyPackageJson('package.json', `{\n  "name": "project",\n  "version": "1.0.0",\n  "scripts": {\n    "install-all": "cd frontend && npm install && cd ../backend && npm install"\n  }\n}`);
                await fixEmptyPackageJson('frontend/package.json', `{\n  "name": "frontend",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "vite": "^5.0.0",\n    "@vitejs/plugin-react": "^4.2.0"\n  }\n}`);
                await fixEmptyPackageJson('backend/package.json', `{\n  "name": "backend",\n  "version": "1.0.0",\n  "main": "index.js",\n  "dependencies": {\n    "express": "^4.18.2"\n  },\n  "scripts": {\n    "start": "node index.js"\n  }\n}`);
            } catch (err) {
                console.error("Lỗi tự động vá package.json:", err);
            }

            // Đồng bộ Host FileSystem vào Y.Map
            if (fileSystemMapRef.current) {
                await syncLocalToYjs(root, fileSystemMapRef.current);
            }
            
            setLocalRootNode(root);
            setWc(webcontainerInstance);
            await refreshFileSystem(webcontainerInstance);
            setProjectLoaded(true);
            
            setCurrentFile('');
            setCodeContent('');
            setOpenFiles([]);
        } catch (error) {
            console.error("Lỗi khởi tạo Local Project", error);
            toast.error("Không thể nạp thư mục vào WebContainer");
        } finally {
            setIsBooting(false);
        }
    };

    useEffect(() => {
        if (!projectLoaded) return;
        
        if (ideMode === 'script') {
            if (currentLanguage === 'python') {
                setCurrentFile('main.py');
                if (!openFiles.includes('main.py')) setOpenFiles(['main.py']);
            } else if (currentLanguage === 'java') {
                setCurrentFile('Main.java');
                if (!openFiles.includes('Main.java')) setOpenFiles(['Main.java']);
            }
        }
    }, [ideMode, currentLanguage, projectLoaded]);

    const handleRunScript = async () => {
        if (!wc) return;

        setIsExecuting(true);
        setScriptOutput({ text: "Đang khởi tạo Container và thựcới mã...", isError: false });

        try {
            const dirEntries = await wc.fs.readdir('.', { withFileTypes: true });
            const files: { [filename: string]: string } = {};
            
            const ext = currentLanguage === 'python' ? '.py' : currentLanguage === 'java' ? '.java' : '';
            if (!ext) throw new Error("Ngôn ngữ không được hỗ trợ để chạy bằng Docker");

            for (const entry of dirEntries) {
                if (entry.isFile() && entry.name.endsWith(ext)) {
                    const content = await wc.fs.readFile(entry.name, 'utf-8');
                    files[entry.name] = content;
                }
            }

            if (Object.keys(files).length === 0) {
                toast.error(`Không tìm thấy file ${ext} nào để chạy!`);
                setIsExecuting(false);
                return;
            }

            const res = await ideApi.executeCode({
                files,
                entrypoint: currentFile.endsWith(ext) ? currentFile : undefined,
                language: currentLanguage
            });
            
            setScriptOutput({ text: res.data.output || "Tiến trình chạy thành công (Không có output).", isError: res.data.isError });
        } catch (error: any) {
            setScriptOutput({ text: error.response?.data?.message || error.message || "Lỗi hệ thống khi chạy code.", isError: true });
        } finally {
            setIsExecuting(false);
        }
    };

    const getLocalFileHandle = async (root: LocalFileNode, filepath: string): Promise<FileSystemFileHandle | null> => {
        const parts = filepath.split('/');
        let currentHandle = root.handle as FileSystemDirectoryHandle;
        
        try {
            for (let i = 0; i < parts.length - 1; i++) {
                currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
            }
            return await currentHandle.getFileHandle(parts[parts.length - 1]);
        } catch (e) {
            return null;
        }
    };

    const ataTimeoutRef = useRef<any>(null);
    const triggerATA = (code: string) => {
        if (!ataRef.current) return;
        clearTimeout(ataTimeoutRef.current);
        ataTimeoutRef.current = setTimeout(() => {
            if (ataRef.current) ataRef.current(code);
        }, 1500);
    };

    const handleCodeChange = async (newCode: string) => {
        setCodeContent(newCode);
        triggerATA(newCode); // Chỉ chạy ATA cho file đang gõ với debounce
        
        // Monaco Binding sẽ tự lo việc hiển thị lên editor, không cần setValue thủ công
        // nếu đang dùng Yjs. Chỉ giữ fallback cho script mode hoặc non-Yjs.
        if (monaco && (!fileSystemMapRef.current?.has(currentFile))) {
            const uri = monaco.Uri.parse(`file:///${currentFile}`);
            const model = monaco.editor.getModel(uri);
            if (model && model.getValue() !== newCode) {
                model.setValue(newCode);
            }
        }

        // Nếu là Cloud Project, tự động lưu lên Server (Debounce)
        if (isCloud && workspaceId) {
            if (cloudSaveTimeoutRef.current) clearTimeout(cloudSaveTimeoutRef.current);
            setIsSavingCloud(true);
            cloudSaveTimeoutRef.current = setTimeout(async () => {
                try {
                    await ideApi.saveFile(workspaceId, currentFile, newCode);
                } catch (error) {
                    console.error("Lỗi lưu Cloud:", error);
                } finally {
                    setIsSavingCloud(false);
                }
            }, 1000);
        }

        // Chỉ Host Local mới được phép write file vào Local File System
        if (!isGuest && !isCloud && wc) {
            await wc.fs.writeFile(currentFile, newCode);
            
            if (localRootNode) {
                if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
                saveTimeoutRef.current = setTimeout(async () => {
                    const fileHandle = await getLocalFileHandle(localRootNode, currentFile);
                    if (fileHandle) {
                        saveLocalFile(fileHandle, newCode).catch(e => console.error("Lỗi lưu file local", e));
                    }
                }, 500);
            }
        }
    };

    const handleFileSelect = async (path: string, forceLanguage?: string) => {
        if (!isGuest && !wc) return;
        
        setCurrentFile(path);
        const language = forceLanguage || getLanguageFromPath(path);
        setCurrentLanguage(language);
        setCodeContent(''); 

        // Đảm bảo file được thêm vào openFiles để CodeEditor có thể render
        setOpenFiles(prev => {
            if (!prev.includes(path)) return [...prev, path];
            return prev;
        });

        if (isGuest) {
            // Guest lấy code từ Y.Text
            if (fileSystemMapRef.current && fileSystemMapRef.current.has(path)) {
                setCodeContent(fileSystemMapRef.current.get(path)?.toString() || '');
            }
        } else if (wc) {
            try {
                let content = await wc.fs.readFile(path, 'utf-8');
                
                if (!content && localRootNode) {
                    const localHandle = getLocalFileHandleByPath(localRootNode, path);
                    if (localHandle) {
                        const file = await localHandle.getFile();
                        content = await file.text();
                    }
                }

                if (content.includes('\uFFFD') || path.match(/\.(png|jpe?g|gif|svg|jar|class|exe|bin)$/)) {
                    content = '// Hệ thống không thể hiển thị nội dung vì đây là file nhị phân (Binary) hoặc chứa ký tự đặc biệt.';
                }
                
                setCodeContent(content);
                
                // Đồng bộ hóa trực tiếp vào Monaco Model
                if (monaco) {
                    const uri = monaco.Uri.parse(`file:///${path}`);
                    let model = monaco.editor.getModel(uri);
                    if (!model) {
                        monaco.editor.createModel(content, language, uri);
                    } else if (model.getValue() !== content) {
                        model.setValue(content);
                    }
                }
            } catch (error) {
                const errorMsg = '// Lỗi đọc file. Có thể file bị rỗng hoặc đã bị xóa.';
                setCodeContent(errorMsg);
                if (monaco) {
                    const uri = monaco.Uri.parse(`file:///${path}`);
                    let model = monaco.editor.getModel(uri);
                    if (!model) monaco.editor.createModel(errorMsg, language, uri);
                    else model.setValue(errorMsg);
                }
            }
        }
    };

    const handleDragStart = (e: React.DragEvent, file: string) => {
        e.dataTransfer.setData('text/plain', file);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetFile: string) => {
        e.preventDefault();
        const draggedFile = e.dataTransfer.getData('text/plain');
        if (!draggedFile || draggedFile === targetFile) return;

        const newFiles = [...openFiles];
        const draggedIndex = newFiles.indexOf(draggedFile);
        const targetIndex = newFiles.indexOf(targetFile);
        
        if (draggedIndex > -1 && targetIndex > -1) {
            newFiles.splice(draggedIndex, 1);
            newFiles.splice(targetIndex, 0, draggedFile);
            setOpenFiles(newFiles);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const buildFileSystemTree = async (container: WebContainer, currentPath: string): Promise<FileNode[]> => {
        const entries = await container.fs.readdir(currentPath, { withFileTypes: true });
        const nodes: FileNode[] = [];
        for (const entry of entries) {
            if (entry.name === '.git') continue; 
            
            const nodePath = currentPath === '.' ? entry.name : `${currentPath}/${entry.name}`;
            const node: FileNode = {
                name: entry.name,
                path: nodePath,
                type: entry.isDirectory() ? 'dir' : 'file',
            };
            if (entry.isDirectory()) {
                if (entry.name === 'node_modules') {
                    node.children = [{ name: '(Quá nhiều file, đã ẩn bớt)', type: 'file', path: '' }];
                } else {
                    node.children = await buildFileSystemTree(container, nodePath);
                }
            }
            nodes.push(node);
        }
        
        nodes.sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === 'dir' ? -1 : 1;
        });
        
        return nodes;
    };

    // Cloud Mode: Fetch data từ Backend và Mount
    const mountCloudProject = async () => {
        if (!isCloud || !workspaceId) return;
        try {
            setIsBooting(true);
            const data = await ideApi.getWorkspaceFiles(workspaceId);

            if (!webcontainerInstance) {
                webcontainerInstance = await WebContainer.boot();
            } else {
                await clearWebContainer(webcontainerInstance);
            }
            
            await webcontainerInstance.mount(data);
            setWc(webcontainerInstance);
            await refreshFileSystem(webcontainerInstance);
            setProjectLoaded(true);
            setLocalRootNode(null); // Không có local root

            setCurrentFile('');
            setCodeContent('');
            setOpenFiles([]);
        } catch (error: any) {
            console.error("Lỗi tải dự án Cloud:", error);
            if (error.response?.status === 403) {
                toast.error(error.response?.data?.message || "Bạn không có quyền truy cập IDE này.");
                setTimeout(() => window.location.href = '/dashboard', 1500);
            } else {
                toast.error("Không thể tải dự án từ máy chủ.");
            }
        } finally {
            setIsBooting(false);
        }
    };

    // Auto-load project nếu là Cloud
    useEffect(() => {
        if (isCloud && workspaceId) {
            mountCloudProject();
        }
    }, [isCloud, workspaceId]);

    const refreshFileSystem = async (container: WebContainer) => {
        const tree = await buildFileSystemTree(container, '.');
        setFileSystem(tree);
    };

    const handleCreateFile = async (path: string) => {
        if (wc) {
            const parts = path.split('/');
            if (parts.length > 1) {
                const dirPath = parts.slice(0, -1).join('/');
                await wc.fs.mkdir(dirPath, { recursive: true });
            }
            await wc.fs.writeFile(path, '');
            
            if (localRootNode) {
                try {
                    let currentHandle = localRootNode.handle as FileSystemDirectoryHandle;
                    for (let i = 0; i < parts.length - 1; i++) {
                        currentHandle = await currentHandle.getDirectoryHandle(parts[i], { create: true });
                    }
                    await currentHandle.getFileHandle(parts[parts.length - 1], { create: true });
                } catch (e) {
                    console.error("Lỗi tạo file cục bộ:", e);
                }
            }

            await refreshFileSystem(wc);
            handleFileSelect(path);
            if (!openFiles.includes(path)) {
                setOpenFiles([...openFiles, path]);
            }
        }
    };

    const handleCreateFolder = async (path: string) => {
        if (wc) {
            await wc.fs.mkdir(path, { recursive: true });
            
            if (localRootNode) {
                try {
                    const parts = path.split('/');
                    let currentHandle = localRootNode.handle as FileSystemDirectoryHandle;
                    for (let i = 0; i < parts.length; i++) {
                        currentHandle = await currentHandle.getDirectoryHandle(parts[i], { create: true });
                    }
                } catch (e) {
                    console.error("Lỗi tạo folder cục bộ:", e);
                }
            }
            
            await refreshFileSystem(wc);
        }
    };

    const handleRenameFile = async (oldPath: string, newPath: string) => {
        if (!wc) return;
        try {
            // WebContainer API không có hàm rename, nên ta đọc nội dung cũ, viết nội dung mới rồi xóa cũ
            const content = await wc.fs.readFile(oldPath, 'utf-8').catch(() => null);
            if (content !== null) {
                await wc.fs.writeFile(newPath, content);
                await wc.fs.rm(oldPath, { force: true });
            } else {
                // Đây có thể là Folder, cần code rename folder (nhưng hiện tại ta chỉ support rename ở UI)
                // WebContainer ko có API di chuyển folder dễ dàng ngoài việc rm và copy
                toast.error("Chưa hỗ trợ đổi tên Thư mục, chỉ hỗ trợ đổi tên File.");
                return;
            }
            
            // Xử lý Local Filesystem
            if (localRootNode) {
                try {
                    const oldParts = oldPath.split('/');
                    const newParts = newPath.split('/');
                    
                    let oldDirHandle = localRootNode.handle as FileSystemDirectoryHandle;
                    for (let i = 0; i < oldParts.length - 1; i++) {
                        oldDirHandle = await oldDirHandle.getDirectoryHandle(oldParts[i]);
                    }
                    
                    let newDirHandle = localRootNode.handle as FileSystemDirectoryHandle;
                    for (let i = 0; i < newParts.length - 1; i++) {
                        newDirHandle = await newDirHandle.getDirectoryHandle(newParts[i], { create: true });
                    }
                    
                    const oldFileHandle = await oldDirHandle.getFileHandle(oldParts[oldParts.length - 1]);
                    const oldFile = await oldFileHandle.getFile();
                    const fileContent = await oldFile.text();
                    
                    const newFileHandle = await newDirHandle.getFileHandle(newParts[newParts.length - 1], { create: true });
                    const writable = await (newFileHandle as any).createWritable();
                    await writable.write(fileContent);
                    await writable.close();
                    
                    await oldDirHandle.removeEntry(oldParts[oldParts.length - 1]);
                } catch (e) {
                    console.error("Lỗi rename file local:", e);
                }
            }

            await refreshFileSystem(wc);
            
            // Cập nhật Monaco Model
            if (monaco) {
                const oldUri = monaco.Uri.parse(`file:///${oldPath}`);
                const oldModel = monaco.editor.getModel(oldUri);
                if (oldModel) {
                    const modelValue = oldModel.getValue();
                    oldModel.dispose();
                    const newUri = monaco.Uri.parse(`file:///${newPath}`);
                    monaco.editor.createModel(modelValue, getLanguageFromPath(newPath), newUri);
                }
            }

            // Update openFiles and currentFile tabs
            const newOpenFiles = openFiles.map(f => f === oldPath ? newPath : f);
            setOpenFiles(newOpenFiles);
            if (currentFile === oldPath) {
                setCurrentFile(newPath);
                setCurrentLanguage(getLanguageFromPath(newPath));
            }
        } catch (e) {
            console.error("Rename error:", e);
        }
    };

    const handleDeleteFile = async (path: string) => {
        if (wc) {
            await wc.fs.rm(path, { recursive: true, force: true });
            
            if (localRootNode) {
                try {
                    const parts = path.split('/');
                    let currentHandle = localRootNode.handle as FileSystemDirectoryHandle;
                    if (parts.length > 1) {
                        for (let i = 0; i < parts.length - 1; i++) {
                            currentHandle = await currentHandle.getDirectoryHandle(parts[i]);
                        }
                    }
                    await currentHandle.removeEntry(parts[parts.length - 1], { recursive: true });
                } catch (e) {
                    console.error("Lỗi xóa file cục bộ:", e);
                }
            }
            
            // Xóa Monaco Model
            if (monaco) {
                // Xóa file cụ thể hoặc tất cả file trong folder
                const models = monaco.editor.getModels();
                models.forEach(model => {
                    const modelPath = model.uri.path.substring(1); // bỏ dấu '/' đầu tiên
                    if (modelPath === path || modelPath.startsWith(`${path}/`)) {
                        model.dispose();
                    }
                });
            }

            await refreshFileSystem(wc);
            
            const newOpenFiles = openFiles.filter(f => !(f === path || f.startsWith(`${path}/`)));
            setOpenFiles(newOpenFiles);
            
            if (currentFile === path || currentFile.startsWith(`${path}/`)) {
                if (newOpenFiles.length > 0) {
                    handleFileSelect(newOpenFiles[0]);
                } else {
                    setCurrentFile('');
                    setCodeContent('');
                }
            }
        }
    };

    const handleManagePermissions = (path: string) => {
        setPermissionFilePath(path);
        setIsPermissionModalOpen(true);
    };

    if (!projectLoaded) {
        return (
            <div className="flex flex-col h-screen w-screen bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-white transition-colors">
                <IDEHeader 
                    projectLoaded={false}
                    isBooting={isBooting}
                    ideMode={ideMode}
                    setIdeMode={setIdeMode}
                    currentLanguage={currentLanguage}
                    setCurrentLanguage={setCurrentLanguage}
                    isExecuting={isExecuting}
                    handleRunScript={handleRunScript}
                />
                
                <div className="flex-1 flex flex-col items-center justify-center">
                    {isBooting ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                            <h2 className="text-xl font-bold">Đang khởi tạo Môi trường Lập trình...</h2>
                            <p className="text-slate-500 dark:text-slate-400 mt-2">Đang thiết lập WebContainers cục bộ trên trình duyệt của bạn</p>
                        </div>
                    ) : (
                        <div className="max-w-md w-full text-center">
                            <Code2 size={64} className="mx-auto text-blue-500 mb-6 opacity-80" />
                            <h1 className="text-3xl font-bold mb-2">DevSpaceZ Local-First IDE</h1>
                            <p className="text-slate-500 dark:text-slate-400 mb-8">Một môi trường lập trình sức mạnh thực thụ với tốc độ ánh sáng, lưu trữ thẳng vào máy tính của bạn.</p>
                            
                            <div className="flex flex-col gap-4">
                                <button onClick={openLocalProject} className="flex items-center justify-center gap-3 w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl font-medium transition-colors shadow-sm">
                                    <FolderOpen size={20} />
                                    Mở Dự Án Máy Tính (Open Local Project)
                                </button>
                                
                                <button onClick={() => setIsCreateProjectModalOpen(true)} className="flex items-center justify-center gap-3 w-full bg-slate-100 dark:bg-[#2d2d2d] hover:bg-slate-200 dark:hover:bg-[#383838] text-slate-700 dark:text-slate-300 p-4 rounded-xl font-medium transition-colors">
                                    <FilePlus size={20} />
                                    Tạo Dự Án Mới (Create New Project)
                                </button>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-6 mt-4">Lưu ý: Tính năng này yêu cầu trình duyệt cấp quyền File System Access.</p>
                        </div>
                    )}
                </div>

                {isCreateProjectModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-[#1e1e1e] rounded p-6 w-full max-w-2xl shadow-2xl border border-slate-700">
                            <h3 className="text-xl font-medium text-white mb-6">New Project</h3>
                            <form onSubmit={handleCreateNewProject}>
                                <div className="flex items-center gap-4 mb-4">
                                    <label className="w-32 text-sm text-slate-300">Name</label>
                                    <input 
                                        type="text" 
                                        value={newProjectName}
                                        onChange={(e) => setNewProjectName(e.target.value)}
                                        className="flex-1 bg-[#2b2b2b] border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <label className="w-32 text-sm text-slate-300">Save location</label>
                                    <div className="flex-1 flex bg-[#2b2b2b] border border-slate-600 rounded overflow-hidden focus-within:border-blue-500">
                                        <div className="flex-1 px-3 py-1.5 text-sm text-white/70 overflow-hidden text-ellipsis whitespace-nowrap">
                                            {saveLocation ? `.../${saveLocation.name}/${newProjectName}` : 'Chưa chọn thư mục (Select folder...)'}
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={async () => {
                                                const root = await openLocalDirectory();
                                                if (root) setSaveLocation(root);
                                            }}
                                            className="px-3 hover:bg-white/10 text-slate-300 transition-colors flex items-center justify-center border-l border-slate-600"
                                            title="Browse"
                                        >
                                            <FolderOpen size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 mb-8">
                                    <label className="w-32 text-sm text-slate-300">Language</label>
                                    <div className="flex-1 relative">
                                        <select 
                                            value={projectLanguage}
                                            onChange={(e) => setProjectLanguage(e.target.value)}
                                            className="w-full bg-[#2b2b2b] border border-slate-600 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 appearance-none"
                                        >
                                            <option value="Frontend Web (React + Vite + JS)">Frontend Web (React + Vite + JS)</option>
                                            <option value="Frontend Web (React + Vite + TS)">Frontend Web (React + Vite + TS)</option>
                                            <option value="Backend (Node.js + Express)">Backend (Node.js + Express)</option>
                                            <option value="Fullstack Web (React + Express)">Fullstack Web (React + Express)</option>
                                            <option value="Java (Console App)">Java (Console App)</option>
                                            <option value="Python (Console App)">Python (Console App)</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-700">
                                    <button 
                                        type="button" 
                                        onClick={() => setIsCreateProjectModalOpen(false)}
                                        className="px-5 py-1.5 hover:bg-white/5 text-slate-300 rounded text-sm transition-colors border border-transparent"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="px-5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm transition-colors shadow-sm"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Hàm đệ quy lấy danh sách tất cả file path cho Quick Open
    const getAllFilePaths = (nodes: FileNode[], paths: string[] = []) => {
        for (const node of nodes) {
            if (node.type === 'file') {
                paths.push(node.path);
            } else if (node.children) {
                getAllFilePaths(node.children, paths);
            }
        }
        return paths;
    };

    const allPaths = fileSystem.length > 0 ? getAllFilePaths(fileSystem) : [];
    const filteredPaths = allPaths.filter(p => p.toLowerCase().includes(quickOpenQuery.toLowerCase()));

    return (
        <div className="flex flex-col h-screen w-screen bg-white dark:bg-[#1e1e1e] text-slate-900 dark:text-white overflow-hidden transition-colors relative">
            <IDEHeader 
                projectLoaded={projectLoaded}
                isBooting={isBooting}
                ideMode={ideMode}
                setIdeMode={setIdeMode}
                currentLanguage={currentLanguage}
                setCurrentLanguage={setCurrentLanguage}
                isExecuting={isExecuting}
                handleRunScript={handleRunScript}
                roomId={roomId}
                isHost={!isGuest || isCloud}
                collaborators={collaborators}
                isCloud={isCloud}
                isSavingCloud={isSavingCloud}
            />

            <div className="flex-1 flex overflow-hidden">
                <div className="w-64 border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#252526] shrink-0">
                    <FileExplorer 
                        files={fileSystem} 
                        onFileSelect={(path, lang) => {
                            handleFileSelect(path, lang);
                            if (!openFiles.includes(path)) setOpenFiles([...openFiles, path]);
                        }} 
                        onCreateFile={handleCreateFile}
                        onDeleteFile={handleDeleteFile}
                        onCreateFolder={handleCreateFolder}
                        onRenameFile={handleRenameFile}
                        onRefresh={() => wc && refreshFileSystem(wc)}
                        onManagePermissions={isCloud ? handleManagePermissions : undefined}
                    />
                </div>

                <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-[#1e1e1e]">
                    <IDEEditorTabs 
                        openFiles={openFiles}
                        currentFile={currentFile}
                        handleFileSelect={handleFileSelect}
                        closeTab={closeTab}
                        handleDragStart={handleDragStart}
                        handleDrop={handleDrop}
                        handleDragOver={handleDragOver}
                    />

                    <div className="flex-[3] border-b border-slate-200 dark:border-white/10 bg-white dark:bg-[#1e1e1e] min-h-0 relative">
                        {openFiles.length > 0 ? (
                            openFiles.map(file => (
                                <div key={file} className={`w-full h-full ${currentFile === file ? 'block' : 'hidden'}`}>
                                    <CodeEditor 
                                        path={file} 
                                        language={getLanguageFromPath(file)} 
                                        theme={theme === 'dark' ? 'vs-dark' : 'light'}
                                        initialValue={undefined} // Model content is managed by Monaco directly
                                        yText={fileSystemMapRef.current?.get(file) as Y.Text | undefined}
                                        awareness={awareness}
                                        workspaceId={workspaceId || undefined}
                                        onChange={(newCode) => {
                                            if (currentFile === file) {
                                                handleCodeChange(newCode);
                                            }
                                        }}
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                                <Code2 size={48} className="opacity-20 mb-4" />
                                <span>Select or create a file to start coding</span>
                            </div>
                        )}
                    </div>

                    <IDEBottomPanel 
                        bottomTab={bottomTab}
                        setBottomTab={setBottomTab}
                        ideMode={ideMode}
                        markers={markers}
                        theme={theme === 'dark' ? 'dark' : 'light'}
                        handleFileSelect={handleFileSelect}
                        wc={wc}
                        localRootNode={localRootNode}
                        scriptOutput={scriptOutput}
                    />
                </div>
            </div>

            {/* Status Bar */}
            <div className="h-6 bg-blue-600 text-white flex items-center justify-between px-3 text-xs shrink-0 select-none">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 cursor-pointer hover:bg-white/20 px-1 rounded transition-colors">
                        <TerminalIcon size={12} />
                        <span>{ideMode === 'web' ? (isGuest ? 'Connected to Host IDE' : (isBooting ? 'WebContainer Booting...' : 'WebContainer Ready')) : 'Stateless Container Ready'}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center cursor-pointer hover:bg-white/20 px-1 rounded transition-colors uppercase">
                        {currentLanguage || 'No Language'}
                    </div>
                    <div className="flex items-center cursor-pointer hover:bg-white/20 px-1 rounded transition-colors">
                        Prettier
                    </div>
                </div>
            </div>

            {isQuickOpenModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center pt-20" onClick={() => setIsQuickOpenModalOpen(false)}>
                    <div className="bg-[#1e1e1e] border border-slate-700 rounded-lg shadow-2xl w-[600px] max-h-[400px] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="p-2 border-b border-slate-700">
                            <input 
                                autoFocus
                                type="text"
                                value={quickOpenQuery}
                                onChange={e => setQuickOpenQuery(e.target.value)}
                                placeholder="Search files by name (Ctrl+P)"
                                className="w-full bg-[#2b2b2b] text-white px-3 py-2 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div className="overflow-y-auto p-1 custom-scrollbar">
                            {filteredPaths.length === 0 ? (
                                <div className="p-4 text-center text-slate-500 text-sm">No matching files</div>
                            ) : (
                                filteredPaths.slice(0, 50).map(path => (
                                    <div 
                                        key={path}
                                        onClick={() => {
                                            handleFileSelect(path);
                                            if (!openFiles.includes(path)) setOpenFiles([...openFiles, path]);
                                            setIsQuickOpenModalOpen(false);
                                        }}
                                        className="px-3 py-1.5 hover:bg-blue-600 hover:text-white text-slate-300 text-sm cursor-pointer rounded flex items-center gap-2 group transition-colors"
                                    >
                                        <FilePlus size={14} className="opacity-50 group-hover:opacity-100" />
                                        <span>{path.split('/').pop()}</span>
                                        <span className="text-xs opacity-40 ml-2 truncate">{path}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
            {isCloud && workspaceId && (
                <FilePermissionModal 
                    isOpen={isPermissionModalOpen}
                    onClose={() => setIsPermissionModalOpen(false)}
                    workspaceId={workspaceId}
                    filePath={permissionFilePath}
                />
            )}
        </div>
    );
};
