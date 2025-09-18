import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import BlockchainBackground from '@/components/BlockchainBackground';
import { Upload, CheckCircle, X, Search, FileText, Calendar, User } from 'lucide-react';

const Verify = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setVerificationResult(null);
    }
  };

  const verifyContent = async () => {
    if (!selectedFile) return;
    
    setIsVerifying(true);
    // Simulate verification process
    setTimeout(() => {
      setVerificationResult({
        hasWatermark: Math.random() > 0.3,
        owner: '0x742d35Cc6A5326C94E94C3D2bd4B56E4E90b132A',
        createdAt: new Date().toISOString(),
        watermarkText: 'Protected by Netra',
        confidence: 0.95,
        blockchainRecord: 'QmX7YzKvZjW9Hf2k...',
      });
      setIsVerifying(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen blockchain-bg relative">
      <BlockchainBackground />
      
      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Content Verification
            </h1>
            <p className="text-xl text-muted-foreground">
              Verify watermark ownership and authenticity of digital content
            </p>
          </div>

          <div className="space-y-8">
            {/* Upload Section */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-5 h-5" />
                  <span>Upload Content to Verify</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div
                  className="border-2 border-dashed border-glass-border rounded-xl p-8 text-center transition-colors hover:border-blockchain-primary/50 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {previewUrl ? (
                    <div className="space-y-4">
                      {selectedFile?.type.startsWith('image') ? (
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-w-full max-h-48 mx-auto rounded-lg"
                        />
                      ) : selectedFile?.type.startsWith('video') ? (
                        <video
                          src={previewUrl}
                          controls
                          className="max-w-full max-h-48 mx-auto rounded-lg"
                        />
                      ) : null}
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
                          Drop content here or click to browse
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Images, videos, or documents
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <Button
                  onClick={verifyContent}
                  disabled={!selectedFile || isVerifying}
                  className="w-full btn-primary"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {isVerifying ? 'Verifying...' : 'Verify Content'}
                </Button>
              </CardContent>
            </Card>

            {/* Verification Result */}
            {verificationResult && (
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    {verificationResult.hasWatermark ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span>Watermark Detected</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-red-500" />
                        <span>No Watermark Found</span>
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                    <span className="text-sm font-medium">Verification Status</span>
                    <Badge className={
                      verificationResult.hasWatermark 
                        ? "bg-green-100 text-green-800 border-green-200"
                        : "bg-red-100 text-red-800 border-red-200"
                    }>
                      {verificationResult.hasWatermark ? 'VERIFIED' : 'NOT VERIFIED'}
                    </Badge>
                  </div>

                  {verificationResult.hasWatermark && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start space-x-3">
                          <User className="w-5 h-5 text-blockchain-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Owner</p>
                            <p className="text-sm text-muted-foreground font-mono">
                              {verificationResult.owner}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Calendar className="w-5 h-5 text-blockchain-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Created</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(verificationResult.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <FileText className="w-5 h-5 text-blockchain-primary mt-0.5" />
                          <div>
                            <p className="font-medium text-foreground">Watermark Text</p>
                            <p className="text-sm text-muted-foreground">
                              {verificationResult.watermarkText}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                          <p className="font-medium text-green-800 mb-2">Confidence Score</p>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-green-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${verificationResult.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-green-800 text-sm font-medium">
                              {Math.round(verificationResult.confidence * 100)}%
                            </span>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                          <p className="font-medium text-blue-800 mb-2">Blockchain Record</p>
                          <p className="text-sm text-blue-600 font-mono break-all">
                            {verificationResult.blockchainRecord}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {!verificationResult.hasWatermark && (
                    <div className="text-center p-8 space-y-4">
                      <X className="w-16 h-16 text-red-500 mx-auto" />
                      <p className="text-foreground font-medium">
                        No watermark detected in this content
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This content may not be protected or may use a different watermarking system
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {isVerifying && (
              <Card className="glass-card">
                <CardContent className="p-8">
                  <div className="text-center space-y-4">
                    <div className="w-8 h-8 border-4 border-blockchain-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-foreground font-medium">Analyzing content...</p>
                    <p className="text-sm text-muted-foreground">
                      Checking for watermarks and blockchain records
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Verify;