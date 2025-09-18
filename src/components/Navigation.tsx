import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Menu, X, Home, Upload, CheckCircle, Search, Wand2, LayoutDashboard } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Watermark', href: '/watermark', icon: Shield },
    { name: 'Verify', href: '/verify', icon: CheckCircle },
    { name: 'IPFS Upload', href: '/ipfs', icon: Upload },
    { name: 'AI Generate', href: '/generate', icon: Wand2 },
    { name: 'Plagiarism Check', href: '/plagiarism', icon: Search },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-glass-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blockchain-primary to-blockchain-secondary rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">Netra</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(item.href)
                    ? 'bg-white/10 text-blockchain-primary'
                    : 'hover:bg-white/5 text-foreground/80 hover:text-foreground'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Connect Wallet Button */}
          <div className="hidden md:flex items-center space-x-4">
            <Button className="btn-glass">
              Connect Wallet
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="glass p-2 rounded-lg"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(item.href)
                    ? 'bg-white/10 text-blockchain-primary'
                    : 'hover:bg-white/5 text-foreground/80'
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
            <div className="pt-2 border-t border-glass-border">
              <Button className="btn-glass w-full">
                Connect Wallet
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;