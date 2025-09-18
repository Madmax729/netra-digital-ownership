import { useEffect, useRef } from 'react';

const BlockchainBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Blockchain nodes
    const nodes: Array<{
      x: number;
      y: number;
      radius: number;
      opacity: number;
      pulse: number;
    }> = [];

    // Create nodes
    for (let i = 0; i < 50; i++) {
      nodes.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      nodes.forEach((node, i) => {
        nodes.slice(i + 1).forEach((otherNode) => {
          const distance = Math.sqrt(
            Math.pow(node.x - otherNode.x, 2) + Math.pow(node.y - otherNode.y, 2)
          );

          if (distance < 150) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(96, 165, 250, ${(1 - distance / 150) * 0.2})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(otherNode.x, otherNode.y);
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodes.forEach((node) => {
        const pulseSize = Math.sin(node.pulse) * 0.5 + 1;
        
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${node.opacity})`;
        ctx.fill();

        // Glow effect
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * pulseSize * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${node.opacity * 0.1})`;
        ctx.fill();

        node.pulse += 0.02;
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
      {/* Additional floating geometric shapes */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-20 w-4 h-4 border border-blockchain-primary/30 rotate-45 animate-float" />
        <div className="absolute top-40 right-32 w-6 h-6 border border-blockchain-secondary/40 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-32 left-40 w-3 h-3 bg-blockchain-accent/20 rounded-full animate-blockchain-pulse" />
        <div className="absolute bottom-20 right-20 w-5 h-5 border border-blockchain-primary/25 rotate-12 animate-float" style={{ animationDelay: '4s' }} />
        <div className="absolute top-1/2 left-10 w-2 h-8 bg-gradient-to-b from-blockchain-primary/20 to-transparent animate-glow" />
        <div className="absolute top-1/3 right-16 w-2 h-8 bg-gradient-to-b from-blockchain-secondary/20 to-transparent animate-glow" style={{ animationDelay: '1s' }} />
      </div>
    </>
  );
};

export default BlockchainBackground;