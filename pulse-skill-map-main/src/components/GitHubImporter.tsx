import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Github, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export const GitHubImporter = () => {
  const [username, setUsername] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [user, setUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleImport = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to import your GitHub skills",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if (!username.trim()) return;
    
    setIsImporting(true);
    
    try {
      toast({
        title: "Importing from GitHub",
        description: "Analyzing your GitHub profile...",
      });

      const { data, error } = await supabase.functions.invoke('import-github-skills', {
        body: { 
          github_username: username,
          user_id: user.id
        }
      });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Skills extracted and saved to your profile",
      });
      
      // Navigate to profile
      navigate('/profile');
      
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import failed",
        description: error instanceof Error ? error.message : "Failed to import from GitHub",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card className="border-border/50">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Github className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Import from GitHub</h3>
          </div>
          
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="github-url">GitHub URL</Label>
              <Input
                id="github-url"
                type="text"
                placeholder="Enter GitHub profile URL"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleImport()}
              />
            </div>
            <div className="self-end">
              <Button onClick={handleImport} disabled={!username.trim() || isImporting}>
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Importing...
                  </>
                ) : (
                  'Import Skills'
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
