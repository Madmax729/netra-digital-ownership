import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpaceGeometryBackground from '@/components/SpaceGeometryBackground';
import { Upload, Shield, Image as ImageIcon, Video, Download, Key, Lock, Music } from 'lucide-react';
import { WatermarkProcessor, type WatermarkKey } from '@/utils/watermarkAlgorithms';
import { AudioWatermarkProcessor, type AudioWatermarkKey } from '@/utils/audioWatermarkAlgorithms';
import { toast } from 'sonner';

const Watermark = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [watermarkKey, setWatermarkKey] = useState('');
  const [watermarkedImageData, setWatermarkedImageData] = useState<ImageData | null>(null);
  const [watermarkedUrl, setWatermarkedUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState('image');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setWatermarkedUrl(''); // Clear previous watermark
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setWatermarkedUrl(''); // Clear previous watermark
    }
  };

  const processWatermark = async (type: 'image' | 'video' | 'audio') => {
    if (!selectedFile || !watermarkKey) {
      toast.error('Please select a file and enter a watermark key');
      return;
    }
    
    if (type === 'video') {
      toast.info('Video watermarking is coming soon!');
      return;
    }
    
    if (type === 'audio') {
      await processAudioWatermark();
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

  const processAudioWatermark = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    
    try {
      // Create audio context if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      // Read audio file
      const arrayBuffer = await selectedFile.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Generate key
      const key: AudioWatermarkKey = AudioWatermarkProcessor.generateKey(watermarkKey);
      
      // Embed watermark using all 4 algorithms
      const watermarkedBuffer = await AudioWatermarkProcessor.embedWatermark(audioBuffer, key);
      
      // Convert to WAV blob
      const wavBlob = await AudioWatermarkProcessor.audioBufferToWav(watermarkedBuffer);
      const url = URL.createObjectURL(wavBlob);
      setWatermarkedUrl(url);
      
      toast.success('Audio watermark embedded using LSB, AM, Echo Hiding, and Spread Spectrum!');
      setIsProcessing(false);
    } catch (error) {
      console.error('Audio watermarking failed:', error);
      toast.error('Audio watermarking failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const downloadWatermarkedImage = () => {
    if (!watermarkedUrl) return;
    
    const link = document.createElement('a');
    link.href = watermarkedUrl;
    if (activeTab === 'audio') {
      link.download = `watermarked_${selectedFile?.name || 'audio.wav'}`;
    } else {
      link.download = `watermarked_${selectedFile?.name || 'image.png'}`;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success(`Watermarked ${activeTab} downloaded!`);
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
            <div className="animate-fade-in">
              {activeTab === 'image' && (
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Embed invisible watermarks using <strong>DCT+QIM+DWT+SVD</strong> algorithms with key-based binary watermarks
                </p>
              )}
              {activeTab === 'video' && (
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Video watermarking coming soon - Advanced frame-by-frame watermark embedding
                </p>
              )}
              {activeTab === 'audio' && (
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Robust audio watermarking using <strong>LSB Substitution</strong>, <strong>Amplitude Modulation</strong>, <strong>Echo Hiding</strong>, and <strong>Spread Spectrum</strong> algorithms
                </p>
              )}
            </div>
          </div>

          <Tabs defaultValue="image" className="space-y-8" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3 glass">
              <TabsTrigger value="image" className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4" />
                <span>Image</span>
              </TabsTrigger>
              <TabsTrigger value="video" className="flex items-center space-x-2">
                <Video className="w-4 h-4" />
                <span>Video</span>
              </TabsTrigger>
              <TabsTrigger value="audio" className="flex items-center space-x-2">
                <Music className="w-4 h-4" />
                <span>Audio</span>
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

            <TabsContent value="audio" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Upload Area */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Upload className="w-5 h-5" />
                      <span>Upload Audio</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div
                      className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center transition-colors hover:border-primary/50 cursor-pointer"
                      onDrop={handleDrop}
                      onDragOver={(e) => e.preventDefault()}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {previewUrl && selectedFile?.type.startsWith('audio') ? (
                        <div className="space-y-4">
                          <div className="mx-auto w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                            <Music className="w-8 h-8 text-primary" />
                          </div>
                          <audio
                            src={previewUrl}
                            controls
                            className="w-full mx-auto rounded-lg"
                          />
                          <p className="text-sm text-muted-foreground">
                            {selectedFile?.name}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Music className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="text-foreground font-medium">
                              Drop audio file here or click to browse
                            </p>
                            <p className="text-sm text-muted-foreground">
                              WAV, MP3, OGG up to 50MB
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    <Input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileSelect}
                      className="glass"
                    />
                  </CardContent>
                </Card>

                {/* Audio Watermark Settings */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="w-5 h-5" />
                      <span>Audio Watermark Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="audio-watermark-key" className="flex items-center space-x-2">
                        <Key className="w-4 h-4" />
                        <span>Watermark Key</span>
                      </Label>
                      <Input
                        id="audio-watermark-key"
                        type="password"
                        placeholder="Enter your secret key"
                        value={watermarkKey}
                        onChange={(e) => setWatermarkKey(e.target.value)}
                        className="glass"
                      />
                      <p className="text-xs text-muted-foreground">
                        This key generates watermarks for all 4 algorithms
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start space-x-2 p-3 bg-muted/10 rounded-lg">
                        <Lock className="w-4 h-4 text-primary mt-0.5" />
                        <div className="text-sm space-y-1">
                          <p className="font-medium">Multi-Algorithm Protection</p>
                          <p className="text-muted-foreground text-xs">
                            <strong>LSB:</strong> Embeds bits in least significant positions
                          </p>
                          <p className="text-muted-foreground text-xs">
                            <strong>AM:</strong> Modulates amplitude in frequency blocks
                          </p>
                          <p className="text-muted-foreground text-xs">
                            <strong>Echo:</strong> Adds imperceptible delayed echoes
                          </p>
                          <p className="text-muted-foreground text-xs">
                            <strong>Spread Spectrum:</strong> Spreads watermark across frequency
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => processWatermark('audio')}
                      disabled={!selectedFile || !watermarkKey || isProcessing}
                      className="w-full btn-primary"
                    >
                      {isProcessing ? 'Processing...' : 'Embed Audio Watermark'}
                    </Button>

                    {watermarkedUrl && activeTab === 'audio' && (
                      <Button
                        onClick={downloadWatermarkedImage}
                        variant="outline"
                        className="w-full btn-glass flex items-center space-x-2"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download Watermarked Audio</span>
                      </Button>
                    )}
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