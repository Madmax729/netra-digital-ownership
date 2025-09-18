import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import SpaceGeometryBackground from '@/components/SpaceGeometryBackground';
import { Upload, Search, Key, CheckCircle, XCircle, FileImage } from 'lucide-react';
import { WatermarkProcessor, type WatermarkKey } from '@/utils/watermarkAlgorithms';
import { toast } from 'sonner';

const Verify = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    isWatermarked: boolean;
    confidence: number;
  } | null>(null);
  const [verificationKey, setVerificationKey] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setVerificationResult(null);
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
    }
  };

  const verifyWatermark = async () => {
    if (!selectedFile || !verificationKey) {
      toast.error('Please select an image and enter the verification key');
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
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Verify if content contains embedded watermarks using DCT+QIM+DWT+SVD algorithms
            </p>
          </div>

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