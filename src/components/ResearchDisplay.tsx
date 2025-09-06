import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Globe, Calculator, Code, Shield } from 'lucide-react';

interface ResearchResult {
  query: string;
  sources: Array<{
    title: string;
    url: string;
    snippet: string;
    relevance?: number;
  }>;
  synthesis: string;
  timestamp: Date;
  calculations?: Array<{
    formula: string;
    result: string;
    explanation: string;
  }>;
  codeExamples?: Array<{
    language: string;
    code: string;
    explanation: string;
  }>;
}

interface ResearchDisplayProps {
  result: ResearchResult;
}

const ResearchDisplay: React.FC<ResearchDisplayProps> = ({ result }) => {
  const openLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="space-y-4">
      {/* Main Response */}
      <Card className="glass border-border/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">AI Research & Analysis</span>
            <Badge variant="secondary" className="text-xs">
              {result.timestamp.toLocaleTimeString()}
            </Badge>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-foreground leading-relaxed">{result.synthesis}</p>
          </div>
        </CardContent>
      </Card>

      {/* Mathematical Calculations */}
      {result.calculations && result.calculations.length > 0 && (
        <Card className="glass border-border/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Mathematical Analysis</span>
            </div>
            <div className="space-y-3">
              {result.calculations.map((calc, index) => (
                <div key={index} className="bg-muted/30 rounded-lg p-3">
                  <div className="font-mono text-sm bg-background/50 rounded p-2 mb-2">
                    {calc.formula}
                  </div>
                  <div className="text-lg font-semibold text-primary mb-1">
                    Result: {calc.result}
                  </div>
                  <p className="text-sm text-muted-foreground">{calc.explanation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Code Examples */}
      {result.codeExamples && result.codeExamples.length > 0 && (
        <Card className="glass border-border/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Code className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Code Implementation</span>
            </div>
            <div className="space-y-3">
              {result.codeExamples.map((example, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {example.language}
                    </Badge>
                  </div>
                  <pre className="bg-background/50 rounded-lg p-3 text-sm overflow-x-auto">
                    <code>{example.code}</code>
                  </pre>
                  <p className="text-sm text-muted-foreground">{example.explanation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Research Sources */}
      {result.sources && result.sources.length > 0 && (
        <Card className="glass border-border/20">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Research Sources</span>
              <Badge variant="secondary" className="text-xs">
                {result.sources.length} sources
              </Badge>
            </div>
            <div className="space-y-3">
              {result.sources.map((source, index) => (
                <div key={index} className="border border-border/20 rounded-lg p-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1 line-clamp-2">
                        {source.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {source.snippet}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary truncate">
                          {new URL(source.url).hostname}
                        </span>
                        {source.relevance && (
                          <Badge variant="secondary" className="text-xs">
                            {Math.round(source.relevance * 100)}% relevant
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openLink(source.url)}
                      className="shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResearchDisplay;