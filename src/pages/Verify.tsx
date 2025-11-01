import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SpaceGeometryBackground from '@/components/SpaceGeometryBackground';
import { Upload, Search, Key, CheckCircle, XCircle, FileImage, Music } from 'lucide-react';
import { WatermarkProcessor, type WatermarkKey } from '@/utils/watermarkAlgorithms';
import { AudioWatermarkProcessor, type AudioWatermarkKey, type AudioVerificationResult } from '@/utils/audioWatermarkAlgorithms';
import { toast } from 'sonner';

const Verify = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isWatermarked: boolean;
    confidence: number;
  } | null>(null);
  const [audioVerificationResult, setAudioVerificationResult] = useState<AudioVerificationResult | null>(null);
  const [verificationKey, setVerificationKey] = useState('');
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
      setVerificationResult(null);
      setAudioVerificationResult(null);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setVerificationResult(null);
      setAudioVerificationResult(null);
    }
  };

  const verifyWatermark = async () => {
    if (!selectedFile || !verificationKey) {
      toast.error('Please select a file and enter the verification key');
      return;
    }
    
    if (activeTab === 'audio') {
      await verifyAudioWatermark();
      return;
    }
    
    setIsVerifying(true);
    
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
        
        // Generate verification key
        const key: WatermarkKey = WatermarkProcessor.generateKey(verificationKey);
        
        // Extract and verify watermark using DCT+QIM+DWT+SVD
        const result = await WatermarkProcessor.extractWatermark(imageData, key);
        
        setVerificationResult(result);
        setIsVerifying(false);
        
        if (result.isWatermarked) {
          toast.success(`Watermark detected! Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        } else {
          toast.error(`No watermark found. Confidence: ${(result.confidence * 100).toFixed(1)}%`);
        }
      };
      
      img.src = previewUrl;
    } catch (error) {
      console.error('Verification failed:', error);
      toast.error('Verification failed. Please try again.');
      setIsVerifying(false);
    }
  };

  const verifyAudioWatermark = async () => {
    if (!selectedFile) return;
    
    setIsVerifying(true);
    
    try {
      // Create audio context if not exists
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }
      
      // Read audio file
      const arrayBuffer = await selectedFile.arrayBuffer();
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      
      // Generate key
      const key: AudioWatermarkKey = AudioWatermarkProcessor.generateKey(verificationKey);
      
      // Extract and verify watermark using all 4 algorithms
      const result = await AudioWatermarkProcessor.extractAndVerifyWatermark(audioBuffer, key);
      
      setAudioVerificationResult(result);
      setIsVerifying(false);
      
      if (result.isWatermarked) {
        toast.success(`Audio watermark verified! Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      } else {
        toast.error(`No watermark found. Confidence: ${(result.confidence * 100).toFixed(1)}%`);
      }
    } catch (error) {
      console.error('Audio verification failed:', error);
      toast.error('Audio verification failed. Please try again.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen blockchain-bg relative">
      <SpaceGeometryBackground />
      
      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Watermark Verification
            </h1>
            <div className="animate-fade-in">
              {activeTab === 'image' && (
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Verify if content contains embedded watermarks using <strong>DCT+QIM+DWT+SVD</strong> algorithms
                </p>
              )}
              {activeTab === 'audio' && (
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                  Extract and verify audio watermarks using <strong>LSB</strong>, <strong>AM</strong>, <strong>Echo</strong>, and <strong>Spread Spectrum</strong> with blockchain comparison
                </p>
              )}
            </div>
          </div>

          <Tabs defaultValue="image" className="space-y-8" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 glass max-w-md mx-auto">
              <TabsTrigger value="image" className="flex items-center space-x-2">
                <FileImage className="w-4 h-4" />
                <span>Image</span>
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
                  <span>Upload Content</span>
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
                        <FileImage className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-foreground font-medium">
                          Drop image here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PNG, JPG, WEBP supported
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

            {/* Verification Settings */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Verification Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="verification-key" className="flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span>Verification Key</span>
                  </Label>
                  <Input
                    id="verification-key"
                    type="password"
                    placeholder="Enter the watermark key"
                    value={verificationKey}
                    onChange={(e) => setVerificationKey(e.target.value)}
                    className="glass"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must match the key used during watermarking
                  </p>
                </div>

                <Button
                  onClick={verifyWatermark}
                  disabled={!selectedFile || !verificationKey || isVerifying}
                  className="w-full btn-primary"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Watermark'}
                </Button>

                {/* Verification Result */}
                {verificationResult && (
                  <Card className="glass">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        {verificationResult.isWatermarked ? (
                          <>
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <div>
                              <p className="font-medium text-green-800">Watermark Detected</p>
                              <p className="text-sm text-muted-foreground">
                                Confidence: {(verificationResult.confidence * 100).toFixed(1)}%
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-6 h-6 text-red-600" />
                            <div>
                              <p className="font-medium text-red-800">No Watermark Found</p>
                              <p className="text-sm text-muted-foreground">
                                Confidence: {(verificationResult.confidence * 100).toFixed(1)}%
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
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
                          WAV, MP3, OGG supported
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Verification Settings */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="w-5 h-5" />
                  <span>Audio Verification</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="audio-verification-key" className="flex items-center space-x-2">
                    <Key className="w-4 h-4" />
                    <span>Verification Key</span>
                  </Label>
                  <Input
                    id="audio-verification-key"
                    type="password"
                    placeholder="Enter the watermark key"
                    value={verificationKey}
                    onChange={(e) => setVerificationKey(e.target.value)}
                    className="glass"
                  />
                  <p className="text-xs text-muted-foreground">
                    Must match the key used during watermarking
                  </p>
                </div>

                <Button
                  onClick={verifyWatermark}
                  disabled={!selectedFile || !verificationKey || isVerifying}
                  className="w-full btn-primary"
                >
                  {isVerifying ? 'Verifying...' : 'Verify Audio Watermark'}
                </Button>

                {/* Audio Verification Result */}
                {audioVerificationResult && (
                  <Card className="glass">
                    <CardContent className="p-4 space-y-4">
                      <div className="flex items-center space-x-3">
                        {audioVerificationResult.isWatermarked ? (
                          <>
                            <CheckCircle className="w-6 h-6 text-green-600" />
                            <div>
                              <p className="font-medium text-green-800">Watermark Verified</p>
                              <p className="text-sm text-muted-foreground">
                                Confidence: {(audioVerificationResult.confidence * 100).toFixed(1)}%
                              </p>
                            </div>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-6 h-6 text-red-600" />
                            <div>
                              <p className="font-medium text-red-800">No Watermark Found</p>
                              <p className="text-sm text-muted-foreground">
                                Confidence: {(audioVerificationResult.confidence * 100).toFixed(1)}%
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-muted">
                        <p className="text-sm font-medium">Algorithm Scores:</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">LSB:</span>
                            <span className="font-medium">{(audioVerificationResult.algorithmScores.lsb * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">AM:</span>
                            <span className="font-medium">{(audioVerificationResult.algorithmScores.am * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Echo:</span>
                            <span className="font-medium">{(audioVerificationResult.algorithmScores.echo * 100).toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Spread Spectrum:</span>
                            <span className="font-medium">{(audioVerificationResult.algorithmScores.spreadSpectrum * 100).toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1 pt-2 border-t border-muted text-xs">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">BER (Bit Error Rate):</span>
                          <span className="font-medium">{(audioVerificationResult.ber * 100).toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Correlation:</span>
                          <span className="font-medium">{audioVerificationResult.correlation.toFixed(3)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">SNR:</span>
                          <span className="font-medium">{audioVerificationResult.snr.toFixed(1)} dB</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>
          </TabsContent>
          </Tabs>

          {/* Processing Status */}
          {isVerifying && (
            <Card className="glass-card mt-8">
              <CardContent className="p-6">
                <div className="text-center space-y-4">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-foreground font-medium">Analyzing image with DCT+QIM+DWT+SVD...</p>
                  <p className="text-sm text-muted-foreground">
                    Extracting binary watermark pattern from frequency domain
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

export default Verify;