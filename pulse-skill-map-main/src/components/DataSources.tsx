import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Globe, Upload, Plus } from "lucide-react";

const sources = [
  { icon: FileText, name: "CV/Resume", connected: true, color: "text-primary" },
  { icon: Globe, name: "Personal Blog", connected: false, color: "text-accent" },
  { icon: Upload, name: "Documents", connected: false, color: "text-primary" },
];

export const DataSources = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Connect Your <span className="bg-gradient-primary bg-clip-text text-transparent">Data Sources</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            The more sources you connect, the more comprehensive your skill analysis
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {sources.map((source, index) => {
              const Icon = source.icon;
              return (
                <Card
                  key={index}
                  className={`border-border/50 transition-all duration-300 hover:shadow-lg ${
                    source.connected ? 'bg-gradient-hero border-primary/50' : 'bg-card'
                  }`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        source.connected ? 'bg-card' : 'bg-gradient-hero'
                      }`}>
                        <Icon className={`w-6 h-6 ${source.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{source.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {source.connected ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                      {source.connected && (
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Add More Card */}
            <Card className="border-border/50 bg-card border-dashed hover:border-primary/50 transition-all duration-300 cursor-pointer group">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Add Source</h3>
                    <p className="text-xs text-muted-foreground">Connect more data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button variant="hero" size="lg" className="min-w-[250px]">
              <Upload className="w-5 h-5" />
              Start Analyzing
            </Button>
            <p className="text-sm text-muted-foreground mt-4">
              All data is encrypted and stored securely. You control what's shared.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
