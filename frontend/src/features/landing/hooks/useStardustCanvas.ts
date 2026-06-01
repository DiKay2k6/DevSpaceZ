import { useEffect, useRef, MutableRefObject } from 'react';
import { useTheme } from '@/shared/contexts/ThemeContext'; // Import Hook Theme

export const useStardustCanvas = (
    canvasRef: MutableRefObject<HTMLCanvasElement | null>,
    isHoveringFeatures: boolean
) => {
    const { theme } = useTheme(); // Lấy theme từ Context
    const hoverFeaturesRef = useRef<boolean>(isHoveringFeatures);
    const themeRef = useRef(theme);

    useEffect(() => { hoverFeaturesRef.current = isHoveringFeatures; }, [isHoveringFeatures]);
    useEffect(() => { themeRef.current = theme; }, [theme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        let w = window.innerWidth;
        let h = window.innerHeight * 1.2;
        canvas.width = w;
        canvas.height = h;

        const targetMouse = { x: -1000, y: -1000 };
        const lastTargetMouse = { x: -1000, y: -1000 };

        const handleMouseMove = (e: MouseEvent) => {
            if (!canvasRef.current) return;
            const rect = canvasRef.current.getBoundingClientRect();
            targetMouse.x = e.clientX - rect.left;
            targetMouse.y = e.clientY - rect.top;
        };

        const handleResize = () => {
            w = window.innerWidth;
            h = window.innerHeight * 1.2;
            if (canvasRef.current) {
                canvasRef.current.width = w;
                canvasRef.current.height = h;
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', handleResize);

        const darkColors = ['#06B6D4', '#3B82F6', '#8B5CF6', '#D946EF', '#EC4899'];
        const lightColors = ['#7DD3FC', '#818CF8', '#C084FC', '#F472B6', '#5EEAD4'];

        let step = 0;
        const particles: Particle[] = [];

        class Particle {
            x: number;
            y: number;
            vx: number;
            vy: number;
            life: number;
            colorIndex: number;
            size: number;

            constructor(x: number, y: number, colorIndex: number, mvx: number, mvy: number) {
                this.x = x + (Math.random() - 0.5) * 20;
                this.y = y + (Math.random() - 0.5) * 20;
                this.vx = (Math.random() - 0.5) * 2.5 + mvx * 0.05;
                this.vy = (Math.random() - 0.5) * 2.5 + mvy * 0.05;
                this.life = 1;
                this.colorIndex = colorIndex;
                this.size = Math.random() * 2 + 1;
            }

            update(limitY: number) {
                this.x += this.vx;
                this.y += this.vy;
                this.life -= 0.015;
                if (this.y > limitY) this.life = 0;
            }

            draw(ctx: CanvasRenderingContext2D, isLight: boolean) {
                const currentColors = isLight ? lightColors : darkColors;
                ctx.save();
                ctx.globalAlpha = Math.max(0, this.life);
                ctx.fillStyle = currentColors[this.colorIndex];
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        const draw = () => {
            ctx.clearRect(0, 0, w, h);
            const isLight = themeRef.current === 'light';
            const currentColors = isLight ? lightColors : darkColors;
            ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
            step += 0.012;

            const baseY = window.innerHeight * 0.85;
            const lowestWaveY = baseY + 105;

            const mouseVx = targetMouse.x - lastTargetMouse.x;
            const mouseVy = targetMouse.y - lastTargetMouse.y;
            const speed = Math.sqrt(mouseVx * mouseVx + mouseVy * mouseVy);

            if (speed > 0.5 && targetMouse.x > 0 && targetMouse.y <= lowestWaveY && !hoverFeaturesRef.current) {
                const numParticles = Math.min(Math.floor(speed / 3) + 1, 5);
                for (let i = 0; i < numParticles; i++) {
                    const colorIndex = Math.floor(Math.random() * 5);
                    particles.push(new Particle(targetMouse.x, targetMouse.y, colorIndex, mouseVx, mouseVy));
                }
            }
            lastTargetMouse.x = targetMouse.x;
            lastTargetMouse.y = targetMouse.y;

            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.lineWidth = 2.5 + (i * 0.2);
                ctx.strokeStyle = currentColors[i];
                let isFirst = true;

                for (let x = -50; x <= w + 50; x += 10) {
                    const naturalY = baseY
                        + Math.sin(x * 0.003 + step + i * 0.8) * 90
                        + Math.cos(x * 0.005 - step + i * 0.5) * 50;

                    if (isFirst) { ctx.moveTo(x, naturalY); isFirst = false; }
                    else { ctx.lineTo(x, naturalY); }
                }

                ctx.save();
                ctx.globalAlpha = isLight ? 0.6 : 1;
                ctx.stroke();
                ctx.restore();
            }

            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.update(lowestWaveY);
                if (p.life <= 0) particles.splice(i, 1);
                else p.draw(ctx, isLight);
            }
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
};