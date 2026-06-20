import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { 
  FolderOpen, 
  Plus, 
  Loader2, 
  Heart, 
  Trash2, 
  FileText,
  Pin,
  Search,
  Archive,
  CheckCircle2,
  Edit2,
  Lightbulb,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ProjectsView() {
  const projects = useQuery((api as any).projects.getUserProjects);
  const notes = useQuery((api as any).notes.getUserNotes);
  const ideas = useQuery((api as any).ideas.getUserIdeas);
  
  const createProject = useMutation((api as any).projects.createProject);
  const updateProject = useMutation((api as any).projects.updateProject);
  const deleteProject = useMutation((api as any).projects.deleteProject);
  const toggleProjectFavorite = useMutation((api as any).projects.toggleFavorite);
  
  const createNote = useMutation((api as any).notes.createNote);
  const updateNote = useMutation((api as any).notes.updateNote);
  const deleteNote = useMutation((api as any).notes.deleteNote);
  const toggleNoteFavorite = useMutation((api as any).notes.toggleFavorite);
  const toggleNotePin = useMutation((api as any).notes.togglePin);

  const createIdea = useMutation((api as any).ideas.createIdea);
  const updateIdea = useMutation((api as any).ideas.updateIdea);
  const deleteIdea = useMutation((api as any).ideas.deleteIdea);

  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isCreatingIdea, setIsCreatingIdea] = useState(false);
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [editNoteData, setEditNoteData] = useState({ title: "", content: "" });
  const [editingIdea, setEditingIdea] = useState<any>(null);
  const [editIdeaData, setEditIdeaData] = useState({ content: "", color: "", projectId: null as string | null });
  const [searchQuery, setSearchQuery] = useState("");
  const [showFavoriteNotesOnly, setShowFavoriteNotesOnly] = useState(false);
  const [showFavoriteProjectsOnly, setShowFavoriteProjectsOnly] = useState(false);
  
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    color: "from-blue-500 to-cyan-500",
    icon: "📁",
  });

  const [newNote, setNewNote] = useState({
    title: "",
    content: "",
  });

  const [newIdea, setNewIdea] = useState({
    content: "",
    projectId: null as string | null,
    color: "from-yellow-200 to-yellow-300",
  });

  const projectColors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-yellow-500 to-amber-500",
    "from-indigo-500 to-purple-500",
  ];

  const ideaColors = [
    "from-yellow-200 to-yellow-300",
    "from-pink-200 to-pink-300",
    "from-blue-200 to-blue-300",
    "from-green-200 to-green-300",
    "from-purple-200 to-purple-300",
    "from-orange-200 to-orange-300",
  ];

  const handleCreateProject = async () => {
    const trimmedName = newProject.name.trim();
    
    if (!trimmedName) {
      toast.error("Please enter a project name");
      return;
    }

    if (trimmedName.length > 100) {
      toast.error("Project name must be less than 100 characters");
      return;
    }

    const toastId = toast.loading("Creating project...");
    try {
      await createProject({
        ...newProject,
        name: trimmedName,
        description: newProject.description?.trim(),
      });
      setNewProject({ name: "", description: "", color: "from-blue-500 to-cyan-500", icon: "📁" });
      setIsCreatingProject(false);
      toast.success("Project created!", { id: toastId });
    } catch (error) {
      console.error("Project creation error:", error);
      toast.error("Failed to create project", { id: toastId });
    }
  };

  const handleCreateNote = async () => {
    const trimmedTitle = newNote.title.trim();
    
    if (!trimmedTitle) {
      toast.error("Please enter a note title");
      return;
    }

    if (trimmedTitle.length > 200) {
      toast.error("Note title must be less than 200 characters");
      return;
    }

    const toastId = toast.loading("Creating note...");
    try {
      await createNote({
        projectId: selectedProject ? (selectedProject as any) : undefined,
        title: trimmedTitle,
        content: newNote.content.trim(),
      });
      setNewNote({ title: "", content: "" });
      setIsCreatingNote(false);
      toast.success("Note created!", { id: toastId });
    } catch (error) {
      console.error("Note creation error:", error);
      toast.error("Failed to create note", { id: toastId });
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Delete this project and all its notes and ideas?")) return;
    
    const toastId = toast.loading("Deleting project...");
    try {
      await deleteProject({ projectId: projectId as any });
      if (selectedProject === projectId) setSelectedProject(null);
      toast.success("Project deleted", { id: toastId });
    } catch (error) {
      console.error("Project deletion error:", error);
      toast.error("Failed to delete project", { id: toastId });
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Delete this note?")) return;
    
    const toastId = toast.loading("Deleting note...");
    try {
      await deleteNote({ noteId: noteId as any });
      if (selectedNote?._id === noteId) setSelectedNote(null);
      if (editingNote?._id === noteId) setEditingNote(null);
      toast.success("Note deleted", { id: toastId });
    } catch (error) {
      console.error("Note deletion error:", error);
      toast.error("Failed to delete note", { id: toastId });
    }
  };

  const handleEditNote = (note: any) => {
    setEditingNote(note);
    setEditNoteData({ title: note.title, content: note.content });
  };

  const handleSaveNote = async () => {
    const trimmedTitle = editNoteData.title.trim();
    
    if (!editingNote || !trimmedTitle) {
      toast.error("Please enter a note title");
      return;
    }

    if (trimmedTitle.length > 200) {
      toast.error("Note title must be less than 200 characters");
      return;
    }

    const toastId = toast.loading("Saving changes...");
    try {
      await updateNote({
        noteId: editingNote._id,
        title: trimmedTitle,
        content: editNoteData.content.trim(),
      });
      setEditingNote(null);
      setEditNoteData({ title: "", content: "" });
      toast.success("Note updated!", { id: toastId });
    } catch (error) {
      console.error("Note update error:", error);
      toast.error("Failed to update note", { id: toastId });
    }
  };

  const handleEditIdea = (idea: any) => {
    setEditingIdea(idea);
    setEditIdeaData({ 
      content: idea.content, 
      color: idea.color,
      projectId: idea.projectId || null 
    });
  };

  const handleSaveIdea = async () => {
    const trimmedContent = editIdeaData.content.trim();
    
    if (!editingIdea || !trimmedContent) {
      toast.error("Please enter idea content");
      return;
    }

    if (trimmedContent.length > 500) {
      toast.error("Idea must be less than 500 characters");
      return;
    }

    const toastId = toast.loading("Saving changes...");
    try {
      await updateIdea({
        ideaId: editingIdea._id,
        content: trimmedContent,
        color: editIdeaData.color,
      });
      setEditingIdea(null);
      setEditIdeaData({ content: "", color: "", projectId: null });
      toast.success("Idea updated!", { id: toastId });
    } catch (error) {
      console.error("Idea update error:", error);
      toast.error("Failed to update idea", { id: toastId });
    }
  };

  const handleCreateIdea = async () => {
    const trimmedContent = newIdea.content.trim();
    
    if (!trimmedContent) {
      toast.error("Please enter an idea");
      return;
    }

    if (trimmedContent.length > 500) {
      toast.error("Idea must be less than 500 characters");
      return;
    }

    const toastId = toast.loading("Saving idea...");
    try {
      await createIdea({
        projectId: newIdea.projectId ? (newIdea.projectId as any) : undefined,
        content: trimmedContent,
        color: newIdea.color,
      });
      setNewIdea({ content: "", projectId: null, color: "from-yellow-200 to-yellow-300" });
      setIsCreatingIdea(false);
      toast.success("Idea captured! 💡", { id: toastId });
    } catch (error) {
      console.error("Idea creation error:", error);
      toast.error("Failed to save idea", { id: toastId });
    }
  };

  const handleDeleteIdea = async (ideaId: string) => {
    try {
      await deleteIdea({ ideaId: ideaId as any });
      toast.success("Idea deleted");
    } catch (error) {
      toast.error("Failed to delete idea");
    }
  };

  const handleToggleIdeaComplete = async (ideaId: string, completed: boolean) => {
    try {
      await updateIdea({ ideaId: ideaId as any, completed: !completed });
    } catch (error) {
      toast.error("Failed to update idea");
    }
  };

  if (!projects || !notes || !ideas) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredNotes = selectedProject
    ? notes.filter((n: any) => n.projectId === selectedProject)
    : notes;

  const searchedNotes = searchQuery
    ? filteredNotes.filter((n: any) => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredNotes;

  // Sort notes: pinned first, then by update time
  const sortedNotes = [...searchedNotes].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return b.updatedAt - a.updatedAt;
  });

  const filteredIdeas = selectedProject
    ? ideas.filter((i: any) => i.projectId === selectedProject)
    : ideas;

  // Apply favorite filters
  const displayedNotes = showFavoriteNotesOnly
    ? sortedNotes.filter((n) => n.isFavorite)
    : sortedNotes;

  const displayedProjects = showFavoriteProjectsOnly
    ? projects.filter((p: any) => p.isFavorite)
    : projects;

  return (
    <div className="space-y-6">
      {/* Header Card - Enhanced with glow */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card className="border-2 border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 shadow-lg shadow-blue-200/50 dark:shadow-blue-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-xl shadow-lg shadow-blue-500/50">
                <FolderOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Projects & Notes
                </h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Organize your work with projects, notes, and quick ideas
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setIsCreatingProject(!isCreatingProject)}
                className="cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
              <Button
                onClick={() => setIsCreatingNote(!isCreatingNote)}
                variant="outline"
                className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300"
              >
                <FileText className="h-4 w-4 mr-2" />
                New Note
              </Button>
              <Button
                onClick={() => setIsCreatingIdea(!isCreatingIdea)}
                variant="outline"
                className="cursor-pointer bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white border-yellow-600 shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 transition-all duration-300"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                New Idea
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Project Form - Enhanced */}
      {isCreatingProject && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-blue-200 dark:border-blue-800 shadow-xl shadow-blue-200/50 dark:shadow-blue-900/50">
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Project Name</Label>
                <Input
                  placeholder="Enter project name..."
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Description (Optional)</Label>
                <Textarea
                  placeholder="What is this project about?"
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Icon</Label>
                <Input
                  placeholder="📁"
                  value={newProject.icon}
                  onChange={(e) => setNewProject({ ...newProject, icon: e.target.value })}
                  className="mt-1"
                  maxLength={2}
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {projectColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewProject({ ...newProject, color })}
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} ${
                        newProject.color === color ? "ring-2 ring-offset-2 ring-blue-600" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateProject} className="cursor-pointer flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 shadow-lg shadow-blue-500/30 transition-all duration-300">
                  Create Project
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingProject(false)}
                  className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Create Note Form - Enhanced */}
      {isCreatingNote && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-purple-200 dark:border-purple-800 shadow-xl shadow-purple-200/50 dark:shadow-purple-900/50">
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Note Title</Label>
                <Input
                  placeholder="Enter note title..."
                  value={newNote.title}
                  onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  placeholder="Start writing... (Markdown supported)"
                  value={newNote.content}
                  onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                  className="mt-1 min-h-[200px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateNote} className="cursor-pointer flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-500/30 transition-all duration-300">
                  Create Note
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreatingNote(false)}
                  className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Create Idea Form - Enhanced with yellow glow */}
      {isCreatingIdea && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 shadow-xl shadow-yellow-200/50 dark:shadow-yellow-900/50">
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Quick Idea</Label>
                <Textarea
                  placeholder="Write your idea here... (anything that comes to mind)"
                  value={newIdea.content}
                  onChange={(e) => setNewIdea({ ...newIdea, content: e.target.value })}
                  className="mt-1 min-h-[100px]"
                />
              </div>
              <div>
                <Label>Link to Project (Optional)</Label>
                <select
                  value={newIdea.projectId || ""}
                  onChange={(e) => setNewIdea({ ...newIdea, projectId: e.target.value || null })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm"
                >
                  <option value="">💡 No Project (General Idea)</option>
                  {projects.map((project: any) => (
                    <option key={project._id} value={project._id}>
                      {project.icon} {project.name.length > 30 ? project.name.substring(0, 30) + '...' : project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Sticky Note Color</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {ideaColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewIdea({ ...newIdea, color })}
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} ${
                        newIdea.color === color ? "ring-2 ring-offset-2 ring-yellow-600" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateIdea} className="cursor-pointer flex-1 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 shadow-lg shadow-yellow-500/40 hover:shadow-yellow-500/60 transition-all duration-300">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Save Idea
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsCreatingIdea(false);
                    setNewIdea({ content: "", projectId: null, color: "from-yellow-200 to-yellow-300" });
                  }}
                  className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Search and Filter Bar - Enhanced */}
      <div className="space-y-3">
        {selectedProject && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
            <span className="text-sm font-medium">
              Viewing: {projects.find((p: any) => p._id === selectedProject)?.name}
            </span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedProject(null)}
              className="cursor-pointer ml-auto hover:bg-blue-100 dark:hover:bg-blue-900"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filter
            </Button>
          </div>
        )}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-600 transition-colors" />
          <Input
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-2 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 transition-all duration-300"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={showFavoriteProjectsOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavoriteProjectsOnly(!showFavoriteProjectsOnly)}
            className={`cursor-pointer transition-all duration-300 ${
              showFavoriteProjectsOnly 
                ? "bg-gradient-to-r from-pink-600 to-rose-600 shadow-lg shadow-pink-500/30" 
                : "hover:bg-pink-50 dark:hover:bg-pink-950 hover:border-pink-300"
            }`}
          >
            <Heart className={`h-4 w-4 mr-2 ${showFavoriteProjectsOnly ? "fill-current" : ""}`} />
            Favorite Projects Only
          </Button>
          <Button
            variant={showFavoriteNotesOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFavoriteNotesOnly(!showFavoriteNotesOnly)}
            className={`cursor-pointer transition-all duration-300 ${
              showFavoriteNotesOnly 
                ? "bg-gradient-to-r from-pink-600 to-rose-600 shadow-lg shadow-pink-500/30" 
                : "hover:bg-pink-50 dark:hover:bg-pink-950 hover:border-pink-300"
            }`}
          >
            <Heart className={`h-4 w-4 mr-2 ${showFavoriteNotesOnly ? "fill-current" : ""}`} />
            Favorite Notes Only
          </Button>
        </div>
      </div>

      {/* Projects Grid - Enhanced with better shadows and hover effects */}
      <div>
        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Projects ({displayedProjects.length}{showFavoriteProjectsOnly ? " favorites" : ""})
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          {displayedProjects.map((project: any, index: number) => (
            <motion.div
              key={project._id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, y: -4 }}
            >
              <Card 
                className={`cursor-pointer hover:shadow-2xl transition-all duration-300 border-2 ${
                  selectedProject === project._id 
                    ? "ring-4 ring-blue-400 ring-offset-2 shadow-xl shadow-blue-300/50" 
                    : "hover:border-blue-300 dark:hover:border-blue-700"
                }`}
                onClick={() => setSelectedProject(project._id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${project.color} flex items-center justify-center text-2xl shadow-lg`}>
                      {project.icon}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleProjectFavorite({ projectId: project._id as any });
                        }}
                        className="cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-950 transition-all duration-300"
                      >
                        <Heart
                          className={`h-4 w-4 transition-all duration-300 ${
                            project.isFavorite ? "fill-red-500 text-red-500 scale-110" : "hover:scale-110"
                          }`}
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          handleDeleteProject(project._id);
                        }}
                        className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h4 className="font-semibold text-lg mb-1 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]">
                    {project.name}
                  </h4>
                  {project.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {project.description}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="shadow-lg shadow-purple-400/40 hover:shadow-purple-400/60 transition-shadow duration-300">
                      {notes.filter((n: any) => n.projectId === project._id).length} notes
                    </Badge>
                    <Badge variant="outline" className="shadow-lg shadow-yellow-400/40 hover:shadow-yellow-400/60 transition-shadow duration-300 border-yellow-400/50">
                      {ideas.filter((i: any) => i.projectId === project._id).length} ideas
                    </Badge>
                    <Badge variant="outline" className="shadow-lg shadow-green-400/40 hover:shadow-green-400/60 transition-shadow duration-300 border-green-400/50">
                      {project.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Edit Note Modal - Enhanced */}
      {editingNote && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-indigo-200 dark:border-indigo-800 mb-6 shadow-xl shadow-indigo-200/50 dark:shadow-indigo-900/50">
            <CardHeader>
              <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Edit Note
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Note Title</Label>
                <Input
                  placeholder="Enter note title..."
                  value={editNoteData.title}
                  onChange={(e) => setEditNoteData({ ...editNoteData, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Content</Label>
                <Textarea
                  placeholder="Start writing... (Markdown supported)"
                  value={editNoteData.content}
                  onChange={(e) => setEditNoteData({ ...editNoteData, content: e.target.value })}
                  className="mt-1 min-h-[300px]"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveNote} className="cursor-pointer flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/30 transition-all duration-300">
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingNote(null);
                    setEditNoteData({ title: "", content: "" });
                  }}
                  className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Edit Idea Modal - Enhanced */}
      {editingIdea && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-yellow-200 dark:border-yellow-800 mb-6 shadow-xl shadow-yellow-200/50 dark:shadow-yellow-900/50 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Edit Idea
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Idea Content</Label>
                <Textarea
                  placeholder="Write your idea here..."
                  value={editIdeaData.content}
                  onChange={(e) => setEditIdeaData({ ...editIdeaData, content: e.target.value })}
                  className="mt-1 min-h-[150px]"
                />
              </div>
              <div>
                <Label>Sticky Note Color</Label>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {ideaColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setEditIdeaData({ ...editIdeaData, color })}
                      className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} ${
                        editIdeaData.color === color ? "ring-2 ring-offset-2 ring-yellow-600" : ""
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSaveIdea} className="cursor-pointer flex-1 bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 shadow-lg shadow-yellow-500/30 transition-all duration-300">
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditingIdea(null);
                    setEditIdeaData({ content: "", color: "", projectId: null });
                  }}
                  className="cursor-pointer hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-300 transition-all duration-300"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Ideas Section - List format like notes */}
      {filteredIdeas.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600 drop-shadow-lg" />
            <span className="bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
              Quick Ideas ({filteredIdeas.length})
            </span>
          </h3>
          <div className="grid gap-4 mb-8">
            {filteredIdeas.map((idea: any, index: number) => (
              <motion.div
                key={idea._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
              >
                <Card 
                  className="hover:shadow-xl hover:shadow-yellow-200/50 dark:hover:shadow-yellow-900/50 transition-all duration-300 border-2 hover:border-yellow-300 dark:hover:border-yellow-700 cursor-pointer"
                  onClick={() => handleEditIdea(idea)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Lightbulb className="h-4 w-4 text-yellow-600 drop-shadow-lg" />
                          <p className={`text-base break-words ${idea.completed ? "line-through opacity-60" : ""}`}>
                            {idea.content}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                          <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
                          {idea.projectId && (
                            <Badge 
                              variant="secondary" 
                              className="text-xs shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border border-blue-300 dark:border-blue-700 font-medium"
                              style={{
                                textShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
                              }}
                            >
                              <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]">
                                {projects.find((p: any) => p._id === idea.projectId)?.name}
                              </span>
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleIdeaComplete(idea._id, idea.completed);
                          }}
                          className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-950 transition-all duration-300"
                        >
                          <CheckCircle2 className={`h-4 w-4 transition-all duration-300 ${idea.completed ? "text-green-600 fill-green-600 scale-110" : "hover:scale-110"}`} />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteIdea(idea._id);
                          }}
                          className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Notes List - Clickable cards that open for editing */}
      <div>
        <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          {selectedProject ? "Project Notes" : "All Notes"} ({displayedNotes.length}{showFavoriteNotesOnly ? " favorites" : ""})
        </h3>
        <div className="grid gap-4">
          {displayedNotes.map((note, index) => (
            <motion.div
              key={note._id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ x: 4 }}
            >
              <Card 
                className="hover:shadow-xl hover:shadow-purple-200/50 dark:hover:shadow-purple-900/50 transition-all duration-300 border-2 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer"
                onClick={() => handleEditNote(note)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {note.isPinned && <Pin className="h-4 w-4 text-blue-600 drop-shadow-lg" />}
                        <h4 className="font-semibold text-lg bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-[0_0_6px_rgba(147,51,234,0.4)] break-words" title={note.title}>
                          {note.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                        <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                        {note.projectId && (
                          <Badge 
                            variant="secondary" 
                            className="text-xs shadow-lg shadow-blue-500/50 hover:shadow-blue-500/70 transition-all duration-300 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border border-blue-300 dark:border-blue-700 font-medium"
                            style={{
                              textShadow: '0 0 8px rgba(59, 130, 246, 0.6)',
                            }}
                          >
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(59,130,246,0.7)]">
                              {projects.find((p: any) => p._id === note.projectId)?.name}
                            </span>
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNotePin({ noteId: note._id as any });
                        }}
                        className="cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950 transition-all duration-300"
                      >
                        <Pin className={`h-4 w-4 transition-all duration-300 ${note.isPinned ? "text-blue-600 scale-110" : "hover:scale-110"}`} />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleNoteFavorite({ noteId: note._id as any });
                        }}
                        className="cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-950 transition-all duration-300"
                      >
                        <Heart
                          className={`h-4 w-4 transition-all duration-300 ${
                            note.isFavorite ? "fill-red-500 text-red-500 scale-110" : "hover:scale-110"
                          }`}
                        />
                      </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            handleDeleteNote(note._id);
                          }}
                          className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {displayedNotes.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>
                {showFavoriteNotesOnly
                  ? "No favorite notes yet. Mark notes as favorites to see them here!"
                  : selectedProject
                  ? "No notes in this project yet. Create your first note!"
                  : searchQuery
                  ? "No notes match your search. Try a different query!"
                  : "No notes yet. Create your first note to get started!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}