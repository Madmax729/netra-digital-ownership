import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import BlockchainBackground from '@/components/BlockchainBackground';
import { Wand2, Image, FileText, Download, Shield, Sparkles } from 'lucide-react';

const Generate = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('dall-e-3');
  const [style, setStyle] = useState('realistic');
  const [dimensions, setDimensions] = useState('1024x1024');

  const generateContent = async (type: 'image' | 'text') => {
    if (!prompt) return;
    
    setIsGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGeneratedContent({
        type,
        prompt,
        url: type === 'image' ? 'https://picsum.photos/512/512' : null,
        content: type === 'text' ? 'This is AI generated content based on your prompt. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.' : null,
        watermarkId: 'WM-' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        protected: true,
      });
      setIsGenerating(false);
    }, 3000);
  };

  const imageModels = [
    { value: 'dall-e-3', label: 'DALL-E 3' },
    { value: 'midjourney', label: 'Midjourney' },
    { value: 'stable-diffusion', label: 'Stable Diffusion' },
  ];

  const textModels = [
    { value: 'gpt-4', label: 'GPT-4' },
    { value: 'claude', label: 'Claude' },
    { value: 'gemini', label: 'Gemini' },
  ];

  const imageStyles = [
    { value: 'realistic', label: 'Realistic' },
    { value: 'artistic', label: 'Artistic' },
    { value: 'cartoon', label: 'Cartoon' },
    { value: 'abstract', label: 'Abstract' },
  ];

  const imageDimensions = [
    { value: '512x512', label: '512 × 512' },
    { value: '1024x1024', label: '1024 × 1024' },
    { value: '1920x1080', label: '1920 × 1080' },
  ];

  return (
    <div className="min-h-screen blockchain-bg relative">
      <BlockchainBackground />
      
      <div className="relative pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              AI Content Generation
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Generate AI-powered content with built-in watermarking and ownership protection
            </p>
          </div>

          <Tabs defaultValue="image" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 glass">
              <TabsTrigger value="image" className="flex items-center space-x-2">
                <Image className="w-4 h-4" />
                <span>Image Generation</span>
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Text Generation</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="image" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Generation Controls */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Wand2 className="w-5 h-5" />
                      <span>Image Generation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="image-prompt">Prompt</Label>
                      <Textarea
                        id="image-prompt"
                        placeholder="Describe the image you want to generate..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="glass min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Model</Label>
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                          <SelectTrigger className="glass">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {imageModels.map((model) => (
                              <SelectItem key={model.value} value={model.value}>
                                {model.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Style</Label>
                        <Select value={style} onValueChange={setStyle}>
                          <SelectTrigger className="glass">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {imageStyles.map((styleOption) => (
                              <SelectItem key={styleOption.value} value={styleOption.value}>
                                {styleOption.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Dimensions</Label>
                      <Select value={dimensions} onValueChange={setDimensions}>
                        <SelectTrigger className="glass">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {imageDimensions.map((dim) => (
                            <SelectItem key={dim.value} value={dim.value}>
                              {dim.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <Button
                      onClick={() => generateContent('image')}
                      disabled={!prompt || isGenerating}
                      className="w-full btn-primary"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Generate Image'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Preview Area */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Image className="w-5 h-5" />
                      <span>Generated Content</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isGenerating ? (
                      <div className="aspect-square rounded-lg bg-white/5 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="w-8 h-8 border-4 border-blockchain-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-muted-foreground">Generating your image...</p>
                        </div>
                      </div>
                    ) : generatedContent && generatedContent.type === 'image' ? (
                      <div className="space-y-4">
                        <img
                          src={generatedContent.url}
                          alt="Generated content"
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              Protected with watermark
                            </span>
                          </div>
                          <Button size="sm" className="btn-glass">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="aspect-square rounded-lg bg-white/5 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <Image className="w-12 h-12 text-muted-foreground mx-auto" />
                          <p className="text-muted-foreground">Your generated image will appear here</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Text Generation Controls */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Text Generation</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="text-prompt">Prompt</Label>
                      <Textarea
                        id="text-prompt"
                        placeholder="Describe what you want to write about..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className="glass min-h-[120px]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Model</Label>
                      <Select value={selectedModel} onValueChange={setSelectedModel}>
                        <SelectTrigger className="glass">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {textModels.map((model) => (
                            <SelectItem key={model.value} value={model.value}>
                              {model.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="max-words">Max Words</Label>
                        <Input
                          id="max-words"
                          type="number"
                          defaultValue={500}
                          className="glass"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tone">Tone</Label>
                        <Select defaultValue="professional">
                          <SelectTrigger className="glass">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="professional">Professional</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="creative">Creative</SelectItem>
                            <SelectItem value="academic">Academic</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      onClick={() => generateContent('text')}
                      disabled={!prompt || isGenerating}
                      className="w-full btn-primary"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {isGenerating ? 'Generating...' : 'Generate Text'}
                    </Button>
                  </CardContent>
                </Card>

                {/* Text Preview */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-5 h-5" />
                      <span>Generated Text</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {isGenerating ? (
                      <div className="min-h-[300px] rounded-lg bg-white/5 flex items-center justify-center">
                        <div className="text-center space-y-4">
                          <div className="w-8 h-8 border-4 border-blockchain-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
                          <p className="text-muted-foreground">Generating your text...</p>
                        </div>
                      </div>
                    ) : generatedContent && generatedContent.type === 'text' ? (
                      <div className="space-y-4">
                        <div className="min-h-[300px] p-4 rounded-lg bg-white/5 border border-glass-border">
                          <p className="text-foreground leading-relaxed">
                            {generatedContent.content}
                          </p>
                        </div>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                          <div className="flex items-center space-x-2">
                            <Shield className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-800">
                              Protected with digital signature
                            </span>
                          </div>
                          <Button size="sm" className="btn-glass">
                            <Download className="w-3 h-3 mr-1" />
                            Export
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="min-h-[300px] rounded-lg bg-white/5 flex items-center justify-center">
                        <div className="text-center space-y-2">
                          <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                          <p className="text-muted-foreground">Your generated text will appear here</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Content Details */}
          {generatedContent && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label className="text-sm font-medium">Watermark ID</Label>
                    <p className="text-sm text-muted-foreground font-mono">
                      {generatedContent.watermarkId}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Generated At</Label>
                    <p className="text-sm text-muted-foreground">
                      {new Date(generatedContent.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Protection Status</Label>
                    <div className="flex items-center space-x-2 mt-1">
                      <Shield className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-green-600">Protected</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Generate;