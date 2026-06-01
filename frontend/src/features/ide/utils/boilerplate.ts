export const generateBoilerplate = async (handle: FileSystemDirectoryHandle, lang: string) => {
    try {
        if (lang === 'Java (Console App)') {
            const srcDir = await handle.getDirectoryHandle('src', { create: true });
            const mainFile = await srcDir.getFileHandle('Main.java', { create: true });
            const writable = await mainFile.createWritable();
            await writable.write(`public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello from DevSpaceZ!");\n    }\n}`);
            await writable.close();
        } else if (lang === 'Python (Console App)') {
            const mainFile = await handle.getFileHandle('main.py', { create: true });
            const writable = await mainFile.createWritable();
            await writable.write(`def main():\n    print("Hello from DevSpaceZ!")\n\nif __name__ == "__main__":\n    main()`);
            await writable.close();
        } else if (lang === 'Frontend Web (React + Vite + JS)') {
            const srcDir = await handle.getDirectoryHandle('src', { create: true });
            const feApp = await srcDir.getFileHandle('App.jsx', { create: true });
            let w = await feApp.createWritable();
            await w.write(`export default function App() {\n  return <h1>Hello Vite + React JS!</h1>;\n}`);
            await w.close();
            
            const feMain = await srcDir.getFileHandle('main.jsx', { create: true });
            w = await feMain.createWritable();
            await w.write(`import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root')).render(<App />);`);
            await w.close();

            const feCss = await srcDir.getFileHandle('index.css', { create: true });
            w = await feCss.createWritable();
            await w.write(`body { margin: 0; font-family: sans-serif; padding: 2rem; text-align: center; }`);
            await w.close();

            const feHtml = await handle.getFileHandle('index.html', { create: true });
            w = await feHtml.createWritable();
            await w.write(`<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Vite App</title>\n</head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.jsx"></script>\n</body>\n</html>`);
            await w.close();

            const fePkg = await handle.getFileHandle('package.json', { create: true });
            w = await fePkg.createWritable();
            await w.write(`{\n  "name": "frontend",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "vite": "^5.0.0",\n    "@vitejs/plugin-react": "^4.2.0"\n  }\n}`);
            await w.close();

            const feVite = await handle.getFileHandle('vite.config.js', { create: true });
            w = await feVite.createWritable();
            await w.write(`import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n});`);
            await w.close();

        } else if (lang === 'Frontend Web (React + Vite + TS)') {
            const srcDir = await handle.getDirectoryHandle('src', { create: true });
            const feApp = await srcDir.getFileHandle('App.tsx', { create: true });
            let w = await feApp.createWritable();
            await w.write(`import React from 'react';\n\nexport default function App(): JSX.Element {\n  return <h1>Hello Vite + React TS!</h1>;\n}`);
            await w.close();
            
            const feMain = await srcDir.getFileHandle('main.tsx', { create: true });
            w = await feMain.createWritable();
            await w.write(`import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<App />);`);
            await w.close();

            const feCss = await srcDir.getFileHandle('index.css', { create: true });
            w = await feCss.createWritable();
            await w.write(`body { margin: 0; font-family: sans-serif; padding: 2rem; text-align: center; }`);
            await w.close();

            const feHtml = await handle.getFileHandle('index.html', { create: true });
            w = await feHtml.createWritable();
            await w.write(`<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <title>Vite App</title>\n</head>\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.tsx"></script>\n</body>\n</html>`);
            await w.close();

            const fePkg = await handle.getFileHandle('package.json', { create: true });
            w = await fePkg.createWritable();
            await w.write(`{\n  "name": "frontend-ts",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "vite": "^5.0.0",\n    "@vitejs/plugin-react": "^4.2.0",\n    "typescript": "^5.2.2",\n    "@types/react": "^18.2.15",\n    "@types/react-dom": "^18.2.7"\n  }\n}`);
            await w.close();

            const feVite = await handle.getFileHandle('vite.config.ts', { create: true });
            w = await feVite.createWritable();
            await w.write(`import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n});`);
            await w.close();

        } else if (lang === 'Fullstack Web (MERN)') {
            // Frontend
            const frontendDir = await handle.getDirectoryHandle('frontend', { create: true });
            const srcDir = await frontendDir.getDirectoryHandle('src', { create: true });
            const feApp = await srcDir.getFileHandle('App.jsx', { create: true });
            let w = await feApp.createWritable();
            await w.write(`import { useEffect, useState } from 'react';\n\nexport default function App() {\n  const [msg, setMsg] = useState('');\n  useEffect(() => {\n    fetch('http://localhost:5000').then(r => r.text()).then(setMsg);\n  }, []);\n  return <h1>MERN Stack: {msg}</h1>;\n}`);
            await w.close();

            const feMain = await srcDir.getFileHandle('main.jsx', { create: true });
            let w2 = await feMain.createWritable();
            await w2.write(`import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')).render(<App />);`);
            await w2.close();

            const feHtml = await frontendDir.getFileHandle('index.html', { create: true });
            let w3 = await feHtml.createWritable();
            await w3.write(`<!DOCTYPE html>\n<html lang="en">\n<body>\n  <div id="root"></div>\n  <script type="module" src="/src/main.jsx"></script>\n</body>\n</html>`);
            await w3.close();

            const fePkg = await frontendDir.getFileHandle('package.json', { create: true });
            let w4 = await fePkg.createWritable();
            await w4.write(`{\n  "name": "frontend",\n  "version": "1.0.0",\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build"\n  },\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  },\n  "devDependencies": {\n    "vite": "^5.0.0",\n    "@vitejs/plugin-react": "^4.2.0"\n  }\n}`);
            await w4.close();

            const feVite = await frontendDir.getFileHandle('vite.config.js', { create: true });
            let w7 = await feVite.createWritable();
            await w7.write(`import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n});`);
            await w7.close();

            // Root package.json
            const rootPkg = await handle.getFileHandle('package.json', { create: true });
            let w8 = await rootPkg.createWritable();
            await w8.write(`{\n  "name": "fullstack-project",\n  "version": "1.0.0",\n  "scripts": {\n    "install-all": "cd frontend && npm install && cd ../backend && npm install",\n    "dev:frontend": "cd frontend && npm run dev",\n    "dev:backend": "cd backend && npm start"\n  }\n}`);
            await w8.close();
        }
    } catch (e) {
        console.error("Lỗi sinh boilerplate:", e);
    }
};
