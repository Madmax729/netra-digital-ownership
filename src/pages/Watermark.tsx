import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpaceGeometryBackground from '@/components/SpaceGeometryBackground';
import { Upload, Shield, Image, Video, Download, Key, Lock } from 'lucide-react';
import { WatermarkProcessor, type WatermarkKey } from '@/utils/watermarkAlgorithms';
import { toast } from 'sonner';

const Watermark = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkKey, setWatermarkKey] = useState('');
  const [watermarkedImageData, setWatermarkedImageData] = useState<ImageData | null>(null);
  const [watermarkedUrl, setWatermarkedUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    if (!selectedFile || !watermarkKey) {
      toast.error('Please select a file and enter a watermark key');
      return;
    }
    
    if (type === 'video') {
      toast.info('Video watermarking is coming soon!');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Load image to canvas
      const img = new Image();
      img.onload = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        
        // Generate watermark key
        const key: WatermarkKey = WatermarkProcessor.generateKey(watermarkKey);
        
        // Embed watermark using DCT+QIM+DWT+SVD
        const watermarkedData = await WatermarkProcessor.embedWatermark(imageData, key);
        
        // Draw watermarked image
        ctx.putImageData(watermarkedData, 0, 0);
        
        // Convert to blob for download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            setWatermarkedUrl(url);
            setWatermarkedImageData(watermarkedData);
            toast.success('Watermark embedded successfully using DCT+QIM+DWT+SVD algorithms!');
          }
          setIsProcessing(false);
        }, 'image/png');
      };
      
      img.src = previewUrl;
    } catch (error) {
      console.error('Watermarking failed:', error);
      toast.error('Watermarking failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const downloadWatermarkedImage = () => {
    if (!watermarkedUrl) return;
    
    const link = document.createElement('a');
    link.href = watermarkedUrl;
    link.download = `watermarked_${selectedFile?.name || 'image.png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Watermarked image downloaded!');
  };

  return (
    <div className="min-h-screen blockchain-bg relative">
      <SpaceGeometryBackground />
      
      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Blind Watermarking
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Embed invisible watermarks using DCT+QIM+DWT+SVD algorithms with key-based binary watermarks
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
                      className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center transition-colors hover:border-primary/50 cursor-pointer"
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
                          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Upload className="w-6 h-6 text-primary" />
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
                      <Label htmlFor="watermark-key" className="flex items-center space-x-2">
                        <Key className="w-4 h-4" />
                        <span>Watermark Key</span>
                      </Label>
                      <Input
                        id="watermark-key"
                        type="password"
                        placeholder="Enter your secret key"
                        value={watermarkKey}
                        onChange={(e) => setWatermarkKey(e.target.value)}
                        className="glass"
                      />
                      <p className="text-xs text-muted-foreground">
                        This key will generate a unique binary watermark pattern
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-2 p-3 bg-muted/10 rounded-lg">
                        <Lock className="w-4 h-4 text-primary" />
                        <div className="text-sm">
                          <p className="font-medium">Algorithm: DCT+QIM+DWT+SVD</p>
                          <p className="text-muted-foreground text-xs">
                            Military-grade invisible watermarking
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => processWatermark('image')}
                      disabled={!selectedFile || !watermarkKey || isProcessing}
                      className="w-full btn-primary"
                    >
                      {isProcessing ? 'Processing...' : 'Embed Watermark'}
                    </Button>

                    {watermarkedUrl && (
                      <Button
                        onClick={downloadWatermarkedImage}
                        variant="outline"
                        className="w-full btn-glass flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Watermarked Image</span>
                      </Button>
                    )}
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
                      className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center transition-colors hover:border-primary/50 cursor-pointer"
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
                          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Video className="w-6 h-6 text-primary" />
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
                      <Label htmlFor="video-watermark-key" className="flex items-center space-x-2">
                        <Key className="w-4 h-4" />
                        <span>Watermark Key</span>
                      </Label>
                      <Input
                        id="video-watermark-key"
                        type="password"
                        placeholder="Enter your secret key"
                        value={watermarkKey}
                        onChange={(e) => setWatermarkKey(e.target.value)}
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
                      disabled={!selectedFile || !watermarkKey || isProcessing}
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
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-foreground font-medium">Processing watermark using DCT+QIM+DWT+SVD...</p>
                  <p className="text-sm text-muted-foreground">
                    Embedding binary watermark derived from your key
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default Watermark;