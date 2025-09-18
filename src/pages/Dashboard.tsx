import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BlockchainBackground from '@/components/BlockchainBackground';
import { 
  Wallet, 
  Shield, 
  Upload, 
  CheckCircle as Verify, 
  Search, 
  Wand2, 
  TrendingUp,
  FileImage,
  Video,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

const Dashboard = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setWalletAddress(accounts[0]);
        setIsConnected(true);
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('Please install MetaMask to connect your wallet');
    }
  };

  const stats = [
    {
      title: 'Protected Content',
      value: isConnected ? '127' : '0',
      icon: Shield,
      change: '+12%',
      color: 'text-green-500',
    },
    {
      title: 'IPFS Uploads',
      value: isConnected ? '89' : '0',
      icon: Upload,
      change: '+8%',
      color: 'text-blue-500',
    },
    {
      title: 'Verifications',
      value: isConnected ? '45' : '0',
      icon: Verify,
      change: '+23%',
      color: 'text-purple-500',
    },
    {
      title: 'AI Generated',
      value: isConnected ? '32' : '0',
      icon: Wand2,
      change: '+15%',
      color: 'text-orange-500',
    },
  ];

  const recentActivity = [
    {
      type: 'watermark',
      title: 'Image watermarked',
      description: 'landscape-photo-001.jpg',
      status: 'completed',
      timestamp: '2 hours ago',
      icon: FileImage,
    },
    {
      type: 'ipfs',
      title: 'Uploaded to IPFS',
      description: 'QmX7YzKvZjW...9Hf2k',
      status: 'completed',
      timestamp: '4 hours ago',
      icon: Upload,
    },
    {
      type: 'verify',
      title: 'Content verified',
      description: 'Ownership confirmed',
      status: 'success',
      timestamp: '1 day ago',
      icon: CheckCircle,
    },
    {
      type: 'generate',
      title: 'AI content generated',
      description: 'digital-art-abstract.png',
      status: 'processing',
      timestamp: '2 days ago',
      icon: Wand2,
    },
  ];

  const quickActions = [
    {
      title: 'Watermark Content',
      description: 'Add invisible watermarks to images or videos',
      icon: Shield,
      href: '/watermark',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Verify Content',
      description: 'Check if content contains your watermark',
      icon: Verify,
      href: '/verify',
      gradient: 'from-green-500 to-green-600',
    },
    {
      title: 'Upload to IPFS',
      description: 'Store content on decentralized network',
      icon: Upload,
      href: '/ipfs',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Generate AI Content',
      description: 'Create AI content with built-in protection',
      icon: Wand2,
      href: '/generate',
      gradient: 'from-orange-500 to-orange-600',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'success':
        return CheckCircle;
      case 'processing':
        return Clock;
      case 'failed':
        return AlertTriangle;
      default:
        return Clock;
    }
  };

  return (
    <div className="min-h-screen blockchain-bg relative">
      <BlockchainBackground />
      
      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Manage your decentralized content ownership registry
            </p>
          </div>

          {/* Wallet Connection */}
          <Card className="glass-card mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-xl bg-blockchain-primary/10">
                    <Wallet className="w-6 h-6 text-blockchain-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {isConnected 
                        ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                        : 'Connect MetaMask to access all features'
                      }
                    </p>
                  </div>
                </div>
                {!isConnected && (
                  <Button onClick={connectWallet} className="btn-primary">
                    Connect MetaMask
                  </Button>
                )}
                {isConnected && (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    Connected
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => (
              <Card key={stat.title} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold text-foreground">
                        {stat.value}
                      </p>
                      <p className={`text-sm ${stat.color} flex items-center mt-1`}>
                        <TrendingUp className="w-3 h-3 mr-1" />
                        {stat.change}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-blockchain-primary/10">
                      <stat.icon className="w-6 h-6 text-blockchain-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {quickActions.map((action) => (
                  <div
                    key={action.title}
                    className="flex items-center space-x-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group"
                  >
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${action.gradient}`}>
                      <action.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground group-hover:text-blockchain-primary transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.map((activity, index) => {
                  const StatusIcon = getStatusIcon(activity.status);
                  return (
                    <div key={index} className="flex items-center space-x-4 p-4 rounded-xl bg-white/5">
                      <div className="p-2 rounded-lg bg-blockchain-primary/10">
                        <activity.icon className="w-4 h-4 text-blockchain-primary" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-foreground">
                          {activity.title}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {activity.timestamp}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(activity.status)}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;