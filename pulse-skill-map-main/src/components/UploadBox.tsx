import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { GitHubImporter } from "@/components/GitHubImporter";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { use3DTilt } from "@/hooks/use3DTilt";
import { supabase } from "@/integrations/supabase/client";

export const UploadBox = () => {
  const navigate = useNavigate();
  const [cvText, setCvText] = useState("");
  const [jdText, setJdText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  // Scroll animations
  const cvCard = useScrollAnimation({ threshold: 0.2 });
  const jdCard = useScrollAnimation({ threshold: 0.2 });
  const githubCard = useScrollAnimation({ threshold: 0.2 });

  // 3D tilt effects
  const cvTilt = use3DTilt({ maxTilt: 8, scale: 1.02 });
  const jdTilt = use3DTilt({ maxTilt: 8, scale: 1.02 });
  const githubTilt = use3DTilt({ maxTilt: 8, scale: 1.02 });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File size must be less than 20MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    toast({
      title: "File uploaded",
      description: `${selectedFile.name} is ready for analysis`,
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setIsAnalyzing(false);
  };

  const handleAnalyze = async () => {
    if (!cvText.trim() && !file) {
      toast({
        title: "Input required",
        description: "Please paste your CV or upload a file",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to extract your skills",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      let textToAnalyze = cvText;

      // If file is uploaded, handle based on file type
      if (file) {
        const fileName = file.name.toLowerCase();
        
        // Check if it's a PDF
        if (fileName.endsWith('.pdf')) {
          toast({
            title: "Processing PDF...",
            description: "Extracting text from your PDF file",
          });

          // For PDFs, read as text for now (in production, you'd use a PDF parser)
          // Simple validation: if file starts with %PDF, it's binary PDF data
          const fileText = await file.text();
          
          if (fileText.startsWith('%PDF')) {
            toast({
              title: "PDF detected",
              description: "Please copy and paste the text from your PDF instead, or use a .txt file",
              variant: "destructive",
            });
            setIsAnalyzing(false);
            return;
          }
          
          textToAnalyze = fileText;
        } else {
          // For text files, just read as text
          textToAnalyze = await file.text();
        }
      }

      // Validate we have actual text content
      if (!textToAnalyze || textToAnalyze.trim().length < 50) {
        toast({
          title: "Invalid content",
          description: "Please provide at least 50 characters of CV text",
          variant: "destructive",
        });
        setIsAnalyzing(false);
        return;
      }

      // Call parse-cv backend function
      const { data, error } = await supabase.functions.invoke('parse-cv', {
        body: {
          cv_text: textToAnalyze.trim(),
          user_id: session.user.id
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Skill extraction failed');
      }

      toast({
        title: "Analysis complete!",
        description: `Extracted ${data.skills_count} skills from your CV`,
      });

      // Save job description to localStorage if provided
      if (jdText.trim()) {
        localStorage.setItem('pendingJobDescription', jdText.trim());
      }

      // Navigate to profile page after analysis, pass job description if provided
      navigate("/profile", { 
        state: { jobDescription: jdText.trim() || null } 
      });
    } catch (error: any) {
      console.error("Error analyzing CV:", error);
      toast({
        title: "Analysis failed",
        description: error.message || "Could not analyze your CV. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 space-y-6">
      {/* Primary Input: CV/Resume */}
      <div
        ref={cvCard.ref}
        className={`transition-all duration-700 ${
          cvCard.isVisible
            ? "opacity-100 translate-x-0"
            : "opacity-0 -translate-x-12"
        }`}
      >
        <div 
          ref={cvTilt.ref}
          style={{
            ...cvTilt.style,
            transformStyle: "preserve-3d"
          }}
          className="border-2 border-border rounded-2xl p-8 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-glow transition-shadow duration-300"
        >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <Upload className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">CV / Resume</h3>
            <p className="text-sm text-muted-foreground">Paste your CV text or upload a document</p>
          </div>
        </div>

        <Textarea
          placeholder="Paste your CV or resume here...&#10;&#10;Include your work experience, skills, education, projects, and achievements."
          value={cvText}
          onChange={(e) => setCvText(e.target.value)}
          className="min-h-[200px] resize-y mb-4"
        />

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-300 ${
            isDragging
              ? "border-primary bg-primary/5 scale-[1.02]"
              : "border-border/50 bg-background/50"
          }`}
        >
          {!file ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium text-foreground">Or upload a .txt file</p>
                  <p className="text-xs text-muted-foreground">Text files only (max 20MB) - PDFs not supported</p>
                </div>
              </div>
              <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".txt"
                onChange={handleFileInput}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => document.getElementById("file-upload")?.click()}
              >
                Browse
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={removeFile}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Analyze Button */}
      {!isAnalyzing && (
        <div className="flex justify-center">
          <Button 
            onClick={handleAnalyze}
            size="lg"
            className="px-8 py-6 text-lg font-semibold"
          >
            <Upload className="w-5 h-5 mr-2" />
            Extract My Skills
          </Button>
        </div>
      )}

      {/* Secondary Input: Job Description */}
      <div
        ref={jdCard.ref}
        className={`transition-all duration-700 delay-100 ${
          jdCard.isVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-12"
        }`}
      >
        <div 
          ref={jdTilt.ref}
          style={{
            ...jdTilt.style,
            transformStyle: "preserve-3d"
          }}
          className="border-2 border-border rounded-2xl p-8 bg-card/50 backdrop-blur-sm shadow-lg hover:shadow-glow transition-shadow duration-300"
        >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Job Description (Optional)</h3>
            <p className="text-sm text-muted-foreground">Add a target job for instant gap analysis</p>
          </div>
        </div>

        <Textarea
          placeholder="Paste the job description here to see how your skills match...&#10;&#10;Include required skills, qualifications, and responsibilities."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          className="min-h-[150px] resize-y"
        />
        </div>
      </div>

      {/* GitHub Import */}
      <div
        ref={githubCard.ref}
        className={`transition-all duration-700 delay-200 ${
          githubCard.isVisible
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-12"
        }`}
      >
        <div
          ref={githubTilt.ref}
          style={{
            ...githubTilt.style,
            transformStyle: "preserve-3d"
          }}
        >
          <GitHubImporter />
        </div>
      </div>

      {/* Loading State */}
      {isAnalyzing && (
        <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse">
            <Upload className="w-8 h-8 text-primary-foreground" />
          </div>
          <p className="text-lg font-medium text-foreground">
            Analyzing your skills with AI...
          </p>
          <p className="text-sm text-muted-foreground">
            Extracting evidence from your experience
          </p>
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      )}
    </div>
  );
};
