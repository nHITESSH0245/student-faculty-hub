
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface NewProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectCreated: () => void;
}

export function NewProjectDialog({ open, onOpenChange, onProjectCreated }: NewProjectDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const handleCreate = async () => {
    if (!title.trim() || !description.trim()) {
      toast({ title: "Missing info", description: "Please enter title and description", variant: "destructive" });
      return;
    }
    
    if (!user?.id) {
      toast({ title: "Authentication error", description: "You must be logged in to create a project", variant: "destructive" });
      return;
    }
    
    setIsLoading(true);
    console.log("Creating project with student_id:", user.id);
    
    const { data, error } = await supabase.from("projects").insert({
      title,
      description,
      status: "pending",
      student_id: user.id
    });
    
    setIsLoading(false);
    
    if (error) {
      console.error("Project creation error:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      console.log("Project created successfully");
      toast({ title: "Project created!", description: "Your project has been created successfully", variant: "default" });
      setTitle("");
      setDescription("");
      onOpenChange(false);
      // Ensure we call onProjectCreated to refresh the project list
      onProjectCreated();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Project</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
          <Input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <DialogFooter>
          <Button onClick={handleCreate} disabled={isLoading}>{isLoading ? "Creating..." : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
