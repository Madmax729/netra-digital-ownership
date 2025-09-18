import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlockchainBackground from '@/components/BlockchainBackground';
import { Upload, Shield, Image, Video, Download, Eye, EyeOff } from 'lucide-react';

const Watermark = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [showWatermark, setShowWatermark] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const processWatermark = async (type: 'image' | 'video') => {
    if (!selectedFile || !watermarkText) return;
    
    setIsProcessing(true);
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false);
      alert(`${type} watermarked successfully!`);
    }, 3000);
  };

  return (
    <div className="min-h-screen blockchain-bg relative">
      <BlockchainBackground />
      
      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Blind Watermarking
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Embed invisible watermarks into your images and videos for copyright protection
            </p>
          </div>

          <Tabs defaultValue="image" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 glass">
              <TabsTrigger value="image" className="flex items-center space-x-2">
                <Image className="w-4 h-4" />
                <span>Image Watermarking</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center space-x-2">
                <Video className="w-4 h-4" />
                <span>Video Watermarking</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Area */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>Upload Image</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div
                      className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center transition-colors hover:border-blockchain-primary/50 cursor-pointer"
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previewUrl ? (
                        <div className="space-y-4">
                          <img
                            src={previewUrl}
                            alt="Preview"
                            className="max-w-full max-h-48 mx-auto rounded-lg"
                          />
                          <p className="text-sm text-muted-foreground">
                            {selectedFile?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="mx-auto w-12 h-12 rounded-full bg-blockchain-primary/10 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-blockchain-primary" />
                          </div>
                          <div>
                            <p className="text-foreground font-medium">
                              Drop image here or click to browse
                            </p>
                            <p className="text-sm text-muted-foreground">
                              PNG, JPG, WEBP up to 10MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </CardContent>
                </Card>

                {/* Watermark Settings */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Watermark Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="watermark-text">Watermark Text</Label>
                      <Input
                        id="watermark-text"
                        placeholder="Enter your watermark text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="glass"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label>Preview Watermark</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="btn-glass"
                          onClick={() => setShowWatermark(!showWatermark)}
                        >
                          {showWatermark ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        The actual watermark will be invisible and embedded at the pixel level
                      </p>
                    </div>

                    <Button
                      onClick={() => processWatermark('image')}
                      disabled={!selectedFile || !watermarkText || isProcessing}
                      className="w-full btn-primary"
                    >
                      {isProcessing ? 'Processing...' : 'Add Watermark'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="video" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Area */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>Upload Video</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div
                      className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center transition-colors hover:border-blockchain-primary/50 cursor-pointer"
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previewUrl && selectedFile?.type.startsWith('video') ? (
                        <div className="space-y-4">
                          <video
                            src={previewUrl}
                            controls
                            className="max-w-full max-h-48 mx-auto rounded-lg"
                          />
                          <p className="text-sm text-muted-foreground">
                            {selectedFile?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="mx-auto w-12 h-12 rounded-full bg-blockchain-primary/10 flex items-center justify-center">
                            <Video className="w-6 h-6 text-blockchain-primary" />
                          </div>
                          <div>
                            <p className="text-foreground font-medium">
                              Drop video here or click to browse
                            </p>
                            <p className="text-sm text-muted-foreground">
                              MP4, AVI, MOV up to 100MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="glass"
                    />
                  </CardContent>
                </Card>

                {/* Video Watermark Settings */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Video Watermark Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="video-watermark-text">Watermark Text</Label>
                      <Input
                        id="video-watermark-text"
                        placeholder="Enter your watermark text"
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value)}
                        className="glass"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Watermark Strength</Label>
                      <div className="grid grid-cols-3 gap-2">
                        {['Low', 'Medium', 'High'].map((strength) => (
                          <Button
                            key={strength}
                            variant="outline"
                            size="sm"
                            className="btn-glass"
                          >
                            {strength}
                          </Button>
                        ))}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Higher strength provides better protection but may affect video quality
                      </p>
                    </div>

                    <Button
                      onClick={() => processWatermark('video')}
                      disabled={!selectedFile || !watermarkText || isProcessing}
                      className="w-full btn-primary"
                    >
                      {isProcessing ? 'Processing Video...' : 'Add Video Watermark'}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Processing Status */}
          {isProcessing && (
            <Card className="glass-card mt-8">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-8 h-8 border-4 border-blockchain-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-foreground font-medium">Processing watermark...</p>
                  <p className="text-sm text-muted-foreground">
                    This may take a few minutes depending on file size
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Watermark;