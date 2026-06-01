import { setupTypeAcquisition } from '@typescript/ata';
import ts from 'typescript';

export const setupATA = (onTypeDownloaded: (code: string, path: string) => void, onFinished?: () => void) => {
    const ata = setupTypeAcquisition({
        projectName: 'DevSpaceZ',
        typescript: ts,
        logger: console,
        delegate: {
            receivedFile: (code: string, path: string) => {
                onTypeDownloaded(code, `file://${path}`);
            },
            started: () => {
                console.log('ATA: Bắt đầu tải types...');
            },
            progress: (downloaded: number, total: number) => {
                console.log(`ATA Progress: ${downloaded}/${total}`);
            },
            finished: (_files: Map<string, string>) => {
                console.log('ATA: Hoàn tất tải types!');
                if (onFinished) onFinished();
            }
        }
    });

    return ata;
};
