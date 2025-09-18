import { useEffect, useRef } from 'react';

const SpaceGeometryBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Geometric shapes and nodes
    const nodes: Array<{
      x: number;
      y: number;
      radius: number;
      opacity: number;
      pulse: number;
      vx: number;
      vy: number;
    }> = [];

    const geometricShapes: Array<{
      x: number;
      y: number;
      size: number;
      rotation: number;
      rotationSpeed: number;
      type: 'triangle' | 'square' | 'hexagon' | 'line';
      opacity: number;
    }> = [];

    // Create floating nodes
    for (let i = 0; i < 40; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.1,
        pulse: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    // Create geometric shapes
    for (let i = 0; i < 15; i++) {
      const types = ['triangle', 'square', 'hexagon', 'line'] as const;
      geometricShapes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 30 + 10,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.01,
        type: types[Math.floor(Math.random() * types.length)],
        opacity: Math.random() * 0.15 + 0.05,
      });
    }

    let animationId: number;

    const drawTriangle = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y - size / 2);
      ctx.lineTo(x - size / 2, y + size / 2);
      ctx.lineTo(x + size / 2, y + size / 2);
      ctx.closePath();
    };

    const drawHexagon = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const px = x + Math.cos(angle) * size / 2;
        const py = y + Math.sin(angle) * size / 2;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw nodes
      nodes.forEach((node, i) => {
        // Update position
        node.x += node.vx;
        node.y += node.vy;
        
        // Wrap around screen
        if (node.x < 0) node.x = canvas.width;
        if (node.x > canvas.width) node.x = 0;
        if (node.y < 0) node.y = canvas.height;
        if (node.y > canvas.height) node.y = 0;

        // Draw connections to nearby nodes
        nodes.slice(i + 1).forEach((otherNode) => {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
          );

          if (distance < 120) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 0, 0, ${(1 - distance / 120) * 0.1})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.stroke();
          }
        });

        // Draw node
        const pulseSize = Math.sin(node.pulse) * 0.3 + 1;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 0, 0, ${node.opacity})`;
        ctx.fill();

        node.pulse += 0.02;
      });

      // Draw geometric shapes
      geometricShapes.forEach((shape) => {
        ctx.save();
        ctx.translate(shape.x, shape.y);
        ctx.rotate(shape.rotation);
        ctx.strokeStyle = `rgba(0, 0, 0, ${shape.opacity})`;
        ctx.lineWidth = 1;

        switch (shape.type) {
          case 'triangle':
            drawTriangle(ctx, 0, 0, shape.size);
            ctx.stroke();
            break;
          case 'square':
            ctx.strokeRect(-shape.size / 2, -shape.size / 2, shape.size, shape.size);
            break;
          case 'hexagon':
            drawHexagon(ctx, 0, 0, shape.size);
            ctx.stroke();
            break;
          case 'line':
            ctx.beginPath();
            ctx.moveTo(-shape.size / 2, 0);
            ctx.lineTo(shape.size / 2, 0);
            ctx.stroke();
            break;
        }
        ctx.restore();

        shape.rotation += shape.rotationSpeed;
        
        // Slow drift movement
        shape.x += Math.sin(shape.rotation) * 0.1;
        shape.y += Math.cos(shape.rotation) * 0.1;
        
        // Wrap around
        if (shape.x < -50) shape.x = canvas.width + 50;
        if (shape.x > canvas.width + 50) shape.x = -50;
        if (shape.y < -50) shape.y = canvas.height + 50;
        if (shape.y > canvas.height + 50) shape.y = -50;
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: 'transparent' }}
      />
      {/* Additional floating geometric elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-6 h-6 border border-black/20 rotate-45 animate-float" />
        <div className="absolute top-40 right-32 w-8 h-8 border border-black/15 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-32 left-40 w-4 h-4 bg-black/10 rotate-12 animate-blockchain-pulse" />
        <div className="absolute bottom-20 right-20 w-10 h-1 bg-black/15 rotate-45 animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/2 left-10 w-1 h-12 bg-gradient-to-b from-black/20 to-transparent animate-glow" />
        <div className="absolute top-1/3 right-16 w-1 h-12 bg-gradient-to-b from-black/15 to-transparent animate-glow" style={{ animationDelay: '1s' }} />
        
        {/* Geometric grid overlay */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      </div>
    </>
  );
};

export default SpaceGeometryBackground;