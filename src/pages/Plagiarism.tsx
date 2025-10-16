import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BlockchainBackground from '@/components/BlockchainBackground';
import { Search, Upload, AlertTriangle, CheckCircle, X, ExternalLink, Eye, FileText, Download } from 'lucide-react';
import { extractTextFromPDF, analyzePlagiarism, generatePlagiarismReportPDF, type PlagiarismReport } from '@/utils/pdfUtils';
import { toast } from 'sonner';

const Plagiarism = () => {
  // Image comparison state
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [comparisonFile, setComparisonFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string>('');
  const [comparisonPreview, setComparisonPreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const originalFileRef = useRef<HTMLInputElement>(null);
  const comparisonFileRef = useRef<HTMLInputElement>(null);
  
  // Research paper state
  const [researchPaper, setResearchPaper] = useState<File | null>(null);
  const [isPdfAnalyzing, setIsPdfAnalyzing] = useState(false);
  const [pdfReport, setPdfReport] = useState<PlagiarismReport | null>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, type: 'original' | 'comparison') => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      
      if (type === 'original') {
        setOriginalFile(file);
        setOriginalPreview(url);
      } else {
        setComparisonFile(file);
        setComparisonPreview(url);
      }
      
      setAnalysisResult(null);
    }
  };

  const analyzeContent = async () => {
    if (!originalFile || !comparisonFile) return;
    
    setIsAnalyzing(true);
    // Simulate analysis
    setTimeout(() => {
      const similarity = Math.random() * 100;
      setAnalysisResult({
        similarity: similarity,
        status: similarity > 80 ? 'high' : similarity > 50 ? 'medium' : 'low',
        matches: [
          {
            region: 'Top-left corner',
            confidence: 0.95,
            coordinates: { x: 10, y: 10, width: 100, height: 100 }
          },
          {
            region: 'Center area',
            confidence: 0.87,
            coordinates: { x: 200, y: 150, width: 150, height: 120 }
          }
        ],
        analysis: {
          pixelSimilarity: similarity,
          structuralSimilarity: similarity * 0.9,
          featureMatches: Math.floor(similarity / 10),
          suspiciousRegions: similarity > 50 ? Math.floor(similarity / 25) : 0
        },
        recommendation: similarity > 80 
          ? 'High plagiarism detected - Content appears to be copied or heavily modified'
          : similarity > 50 
          ? 'Moderate similarity - Further investigation recommended'
          : 'Low similarity - Content appears to be original'
      });
      setIsAnalyzing(false);
    }, 4000);
  };

  const getSeverityColor = (status: string) => {
    switch (status) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityIcon = (status: string) => {
    switch (status) {
      case 'high': return AlertTriangle;
      case 'medium': return Eye;
      case 'low': return CheckCircle;
      default: return Search;
    }
  };
  
  const handlePdfSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setResearchPaper(file);
      setPdfReport(null);
      toast.success('PDF uploaded successfully');
    } else {
      toast.error('Please select a valid PDF file');
    }
  };
  
  const analyzePdfPlagiarism = async () => {
    if (!researchPaper) {
      toast.error('Please upload a research paper first');
      return;
    }
    
    setIsPdfAnalyzing(true);
    try {
      const text = await extractTextFromPDF(researchPaper);
      const report = await analyzePlagiarism(text);
      setPdfReport(report);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('PDF analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setIsPdfAnalyzing(false);
    }
  };
  
  const downloadPdfReport = () => {
    if (!pdfReport || !researchPaper) return;
    
    const blob = generatePlagiarismReportPDF(pdfReport, researchPaper.name);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plagiarism-report-${researchPaper.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success('Report downloaded successfully!');
  };

  return (
    <div className="min-h-screen blockchain-bg relative">
      <BlockchainBackground />
      
      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              Plagiarism Detection
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Compare content to detect unauthorized usage and protect your intellectual property
            </p>
          </div>

          <Tabs defaultValue="images" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 glass">
              <TabsTrigger value="images">
                <Eye className="w-4 h-4 mr-2" />
                Image Comparison
              </TabsTrigger>
              <TabsTrigger value="research">
                <FileText className="w-4 h-4 mr-2" />
                Research Papers
              </TabsTrigger>
            </TabsList>

            <TabsContent value="images" className="space-y-8">
              {/* Upload Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Original Content */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Upload className="w-5 h-5" />
                    <span>Original Content</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-glass-border rounded-xl p-6 text-center transition-colors hover:border-blockchain-primary/50 cursor-pointer"
                    onClick={() => originalFileRef.current?.click()}
                  >
                    {originalPreview ? (
                      <div className="space-y-4">
                        <img
                          src={originalPreview}
                          alt="Original content"
                          className="max-w-full max-h-32 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-muted-foreground">
                          {originalFile?.name}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Upload className="w-8 h-8 text-blockchain-primary mx-auto" />
                        <p className="text-foreground font-medium">Upload original content</p>
                        <p className="text-sm text-muted-foreground">
                          Images, videos, or documents
                        </p>
                      </div>
                    )}
                  </div>
                  <Input
                    ref={originalFileRef}
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={(e) => handleFileSelect(e, 'original')}
                    className="hidden"
                  />
                </CardContent>
              </Card>

              {/* Comparison Content */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="w-5 h-5" />
                    <span>Content to Compare</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-glass-border rounded-xl p-6 text-center transition-colors hover:border-blockchain-primary/50 cursor-pointer"
                    onClick={() => comparisonFileRef.current?.click()}
                  >
                    {comparisonPreview ? (
                      <div className="space-y-4">
                        <img
                          src={comparisonPreview}
                          alt="Comparison content"
                          className="max-w-full max-h-32 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-muted-foreground">
                          {comparisonFile?.name}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Search className="w-8 h-8 text-blockchain-primary mx-auto" />
                        <p className="text-foreground font-medium">Upload content to compare</p>
                        <p className="text-sm text-muted-foreground">
                          Suspected plagiarized content
                        </p>
                      </div>
                    )}
                  </div>
                  <Input
                    ref={comparisonFileRef}
                    type="file"
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={(e) => handleFileSelect(e, 'comparison')}
                    className="hidden"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Analysis Button */}
            <div className="text-center">
              <Button
                onClick={analyzeContent}
                disabled={!originalFile || !comparisonFile || isAnalyzing}
                size="lg"
                className="btn-primary px-8"
              >
                <Search className="w-5 h-5 mr-2" />
                {isAnalyzing ? 'Analyzing Content...' : 'Analyze for Plagiarism'}
              </Button>
            </div>

            {/* Analysis Progress */}
            {isAnalyzing && (
              <Card className="glass-card">
                <CardContent className="p-8">
                  <div className="text-center space-y-6">
                    <div className="w-12 h-12 border-4 border-blockchain-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <div className="space-y-2">
                      <p className="text-foreground font-medium">Analyzing content similarity...</p>
                      <p className="text-sm text-muted-foreground">
                        Comparing pixels, structure, and features
                      </p>
                    </div>
                    <Progress value={65} className="w-full max-w-md mx-auto" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analysis Results */}
            {analysisResult && (
              <div className="space-y-6">
                {/* Overall Result */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Analysis Results</span>
                      <Badge className={getSeverityColor(analysisResult.status)}>
                        {(() => {
                          const Icon = getSeverityIcon(analysisResult.status);
                          return <Icon className="w-4 h-4 mr-1" />;
                        })()}
                        {analysisResult.status.toUpperCase()} SIMILARITY
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center p-6 rounded-xl bg-white/5">
                      <div className="text-4xl font-bold text-foreground mb-2">
                        {analysisResult.similarity.toFixed(1)}%
                      </div>
                      <p className="text-muted-foreground">Overall Similarity Score</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-blockchain-primary">
                          {analysisResult.analysis.pixelSimilarity.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Pixel Similarity</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-blockchain-secondary">
                          {analysisResult.analysis.structuralSimilarity.toFixed(1)}%
                        </p>
                        <p className="text-sm text-muted-foreground">Structural Match</p>
                      </div>
                      <div className="text-center p-4 rounded-lg bg-white/5">
                        <p className="text-2xl font-bold text-blockchain-accent">
                          {analysisResult.analysis.featureMatches}
                        </p>
                        <p className="text-sm text-muted-foreground">Feature Matches</p>
                      </div>
                    </div>

                    <div className={`p-4 rounded-lg border ${getSeverityColor(analysisResult.status)}`}>
                      <h4 className="font-medium mb-2">Recommendation</h4>
                      <p className="text-sm">
                        {analysisResult.recommendation}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Detailed Matches */}
                {analysisResult.matches && analysisResult.matches.length > 0 && (
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle>Detected Matches</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analysisResult.matches.map((match: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/5">
                            <div>
                              <p className="font-medium text-foreground">{match.region}</p>
                              <p className="text-sm text-muted-foreground">
                                Confidence: {(match.confidence * 100).toFixed(1)}%
                              </p>
                            </div>
                            <Button size="sm" variant="outline" className="btn-glass">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Actions */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Next Steps</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button className="btn-primary">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Generate Report
                      </Button>
                      <Button variant="outline" className="btn-glass">
                        <Upload className="w-4 h-4 mr-2" />
                        Save Evidence
                      </Button>
                      <Button variant="outline" className="btn-glass">
                        <Search className="w-4 h-4 mr-2" />
                        Search Web
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            </TabsContent>

            <TabsContent value="research" className="space-y-8">
              {/* PDF Upload */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="w-5 h-5" />
                    <span>Upload Research Paper</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-glass-border rounded-xl p-12 text-center transition-colors hover:border-blockchain-primary/50 cursor-pointer"
                    onClick={() => pdfFileRef.current?.click()}
                  >
                    {researchPaper ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-blockchain-primary/10 flex items-center justify-center">
                          <FileText className="w-8 h-8 text-blockchain-primary" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">{researchPaper.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(researchPaper.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setResearchPaper(null);
                            setPdfReport(null);
                          }}
                          className="btn-glass"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto rounded-full bg-blockchain-primary/10 flex items-center justify-center">
                          <Upload className="w-8 h-8 text-blockchain-primary" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">Upload Research Paper</p>
                          <p className="text-sm text-muted-foreground">
                            PDF format, up to 50MB
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  <Input
                    ref={pdfFileRef}
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfSelect}
                    className="hidden"
                  />
                </CardContent>
              </Card>

              {/* Analysis Button */}
              <div className="text-center">
                <Button
                  onClick={analyzePdfPlagiarism}
                  disabled={!researchPaper || isPdfAnalyzing}
                  size="lg"
                  className="btn-primary px-8"
                >
                  <Search className="w-5 h-5 mr-2" />
                  {isPdfAnalyzing ? 'Analyzing Document...' : 'Check for Plagiarism'}
                </Button>
              </div>

              {/* Analysis Progress */}
              {isPdfAnalyzing && (
                <Card className="glass-card">
                  <CardContent className="p-8">
                    <div className="text-center space-y-6">
                      <div className="w-12 h-12 border-4 border-blockchain-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <div className="space-y-2">
                        <p className="text-foreground font-medium">Analyzing research paper...</p>
                        <p className="text-sm text-muted-foreground">
                          Comparing against millions of academic sources
                        </p>
                      </div>
                      <Progress value={45} className="w-full max-w-md mx-auto" />
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* PDF Report Results */}
              {pdfReport && (
                <div className="space-y-6">
                  {/* Overall Result */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Plagiarism Report</span>
                        <Badge className={
                          pdfReport.plagiarismPercentage > 50 
                            ? 'text-red-600 bg-red-50 border-red-200'
                            : pdfReport.plagiarismPercentage > 20
                            ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                            : 'text-green-600 bg-green-50 border-green-200'
                        }>
                          {pdfReport.plagiarismPercentage > 50 ? (
                            <AlertTriangle className="w-4 h-4 mr-1" />
                          ) : pdfReport.plagiarismPercentage > 20 ? (
                            <Eye className="w-4 h-4 mr-1" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-1" />
                          )}
                          {pdfReport.plagiarismPercentage.toFixed(1)}% PLAGIARISM
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="text-center p-6 rounded-xl bg-white/5">
                        <div className="text-5xl font-bold text-foreground mb-2">
                          {pdfReport.plagiarismPercentage.toFixed(1)}%
                        </div>
                        <p className="text-muted-foreground">Plagiarism Detected</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="text-center p-4 rounded-lg bg-white/5">
                          <p className="text-2xl font-bold text-blockchain-primary">
                            {pdfReport.matches.length}
                          </p>
                          <p className="text-sm text-muted-foreground">Matches Found</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-white/5">
                          <p className="text-2xl font-bold text-blockchain-secondary">
                            {pdfReport.totalPages}
                          </p>
                          <p className="text-sm text-muted-foreground">Pages Analyzed</p>
                        </div>
                      </div>

                      <Button
                        onClick={downloadPdfReport}
                        className="w-full btn-primary"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Download Detailed Report (PDF)
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Matches Preview */}
                  {pdfReport.matches.length > 0 && (
                    <Card className="glass-card">
                      <CardHeader>
                        <CardTitle>Detected Matches (Preview)</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {pdfReport.matches.slice(0, 5).map((match, index) => (
                            <div key={index} className="p-4 rounded-lg bg-red-50/10 border border-red-200/20">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center space-x-2">
                                  <AlertTriangle className="w-4 h-4 text-red-500" />
                                  <span className="font-medium text-foreground">
                                    Match {index + 1}
                                  </span>
                                </div>
                                <Badge className="text-red-600 bg-red-50 border-red-200">
                                  {(match.confidence * 100).toFixed(0)}% Match
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {match.text}
                              </p>
                              {match.source && (
                                <p className="text-xs text-muted-foreground italic">
                                  Source: {match.source}
                                </p>
                              )}
                            </div>
                          ))}
                          {pdfReport.matches.length > 5 && (
                            <p className="text-center text-sm text-muted-foreground">
                              +{pdfReport.matches.length - 5} more matches in full report
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Plagiarism;