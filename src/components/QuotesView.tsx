import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { BookOpen, Heart, Loader2, Plus, Quote, Trash2, Link2, User, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function QuotesView() {
  const quotes = useQuery((api as any).quotes.getUserQuotes);
  const authors = useQuery((api as any).quotes.getAuthors);
  const chains = useQuery((api as any).quoteChains.getUserChains);
  const profiles = useQuery((api as any).legendProfiles.getUserProfiles);
  
  const addQuote = useMutation((api as any).quotes.addQuote);
  const toggleFavorite = useMutation((api as any).quotes.toggleFavorite);
  const deleteQuote = useMutation((api as any).quotes.deleteQuote);
  const createChain = useMutation((api as any).quoteChains.createChain);
  const upsertProfile = useMutation((api as any).legendProfiles.upsertProfile);

  const [isAdding, setIsAdding] = useState(false);
  const [newQuote, setNewQuote] = useState({
    text: "",
    author: "",
    category: "",
  });
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "authors" | "chains">("all");

  // New chain state
  const [isCreatingChain, setIsCreatingChain] = useState(false);
  const [newChain, setNewChain] = useState({
    name: "",
    description: "",
    theme: "",
  });

  // New profile state
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [newProfile, setNewProfile] = useState({
    name: "",
    bio: "",
    story: "",
  });

  const handleAddQuote = async () => {
    if (!newQuote.text.trim()) {
      toast.error("Please enter a quote");
      return;
    }

    try {
      await addQuote({
        text: newQuote.text.trim(),
        author: newQuote.author.trim() || "Unknown",
        category: newQuote.category.trim() || undefined,
      });
      setNewQuote({ text: "", author: "", category: "" });
      setIsAdding(false);
      toast.success("Quote saved with auto-categorization!");
    } catch (error) {
      toast.error("Failed to save quote");
    }
  };

  const handleToggleFavorite = async (quoteId: string) => {
    try {
      await toggleFavorite({ quoteId: quoteId as any });
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  const handleDeleteQuote = async (quoteId: string) => {
    try {
      await deleteQuote({ quoteId: quoteId as any });
      toast.success("Quote deleted");
    } catch (error) {
      toast.error("Failed to delete quote");
    }
  };

  const handleCreateChain = async () => {
    if (!newChain.name.trim() || !newChain.description.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await createChain(newChain);
      setNewChain({ name: "", description: "", theme: "" });
      setIsCreatingChain(false);
      toast.success("Wisdom path created!");
    } catch (error) {
      toast.error("Failed to create chain");
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfile.name.trim() || !newProfile.bio.trim() || !newProfile.story.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await upsertProfile(newProfile);
      setNewProfile({ name: "", bio: "", story: "" });
      setIsCreatingProfile(false);
      toast.success("Legend profile created!");
    } catch (error) {
      toast.error("Failed to create profile");
    }
  };

  if (!quotes || !authors) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayedQuotes = showFavoritesOnly
    ? quotes.filter((q: any) => q.isFavorite)
    : selectedAuthor
    ? quotes.filter((q: any) => q.author === selectedAuthor)
    : quotes;

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-amber-600 to-orange-600 p-3 rounded-xl">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Quotes Saver</h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Save wisdom from legends with smart collections & discovery
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setIsAdding(!isAdding)}
                className="cursor-pointer bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Quote
              </Button>
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="cursor-pointer"
              >
                <Heart className={`h-4 w-4 mr-2 ${showFavoritesOnly ? "fill-current" : ""}`} />
                Favorites Only
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Quote Form */}
      {isAdding && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
        >
          <Card className="border-2 border-amber-200 dark:border-amber-800">
            <CardContent className="pt-6 space-y-4">
              <div>
                <Label>Quote Text</Label>
                <Textarea
                  placeholder="Enter the quote..."
                  value={newQuote.text}
                  onChange={(e) => setNewQuote({ ...newQuote, text: e.target.value })}
                  className="mt-1 min-h-[100px]"
                />
              </div>
              <div>
                <Label>Author (Optional)</Label>
                <Input
                  placeholder="Who said this? (Leave blank if unknown)"
                  value={newQuote.author}
                  onChange={(e) => setNewQuote({ ...newQuote, author: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Category (Optional - Auto-detected)</Label>
                <Input
                  placeholder="Leave blank for auto-categorization"
                  value={newQuote.category}
                  onChange={(e) => setNewQuote({ ...newQuote, category: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddQuote} className="cursor-pointer flex-1">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Save Quote (Auto-Categorize)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewQuote({ text: "", author: "", category: "" });
                  }}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Quotes</TabsTrigger>
          <TabsTrigger value="authors">
            <User className="h-4 w-4 mr-2" />
            Legends ({authors.length})
          </TabsTrigger>
          <TabsTrigger value="chains">
            <Link2 className="h-4 w-4 mr-2" />
            Wisdom Paths ({chains?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-6">
          {/* Quotes List */}
          <div className="grid gap-4">
            {displayedQuotes.map((quote: any, index: number) => (
              <motion.div
                key={quote._id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <Quote className="h-8 w-8 text-amber-600 dark:text-amber-400 shrink-0 mt-1" />
                      <div className="flex-1">
                        <p className="text-lg italic mb-3 leading-relaxed">
                          "{quote.text}"
                        </p>
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div>
                            <p className="font-semibold text-amber-900 dark:text-amber-100">
                              — {quote.author}
                            </p>
                            <div className="flex gap-2 mt-1 flex-wrap">
                              {quote.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {quote.category}
                                </Badge>
                              )}
                              {quote.tags?.map((tag: any) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  #{tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleToggleFavorite(quote._id)}
                              className="cursor-pointer"
                            >
                              <Heart
                                className={`h-5 w-5 ${
                                  quote.isFavorite
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-400"
                                }`}
                              />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteQuote(quote._id)}
                              className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {displayedQuotes.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>
                  {showFavoritesOnly
                    ? "No favorite quotes yet. Mark quotes as favorites to see them here!"
                    : "No quotes saved yet. Add your first inspirational quote!"}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="authors" className="space-y-4 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Legend Profiles</h3>
            <Button
              size="sm"
              onClick={() => setIsCreatingProfile(!isCreatingProfile)}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Legend
            </Button>
          </div>

          {isCreatingProfile && (
            <Card className="border-2 border-amber-200 dark:border-amber-800 mb-4">
              <CardContent className="pt-6 space-y-4">
                <Input
                  placeholder="Legend Name"
                  value={newProfile.name}
                  onChange={(e) => setNewProfile({ ...newProfile, name: e.target.value })}
                />
                <Textarea
                  placeholder="Short bio..."
                  value={newProfile.bio}
                  onChange={(e) => setNewProfile({ ...newProfile, bio: e.target.value })}
                />
                <Textarea
                  placeholder="Why this legend inspires you..."
                  value={newProfile.story}
                  onChange={(e) => setNewProfile({ ...newProfile, story: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreateProfile} className="cursor-pointer flex-1">
                    Create Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingProfile(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            {authors.map((author: any) => (
              <Card
                key={author.name}
                className="cursor-pointer hover:shadow-lg transition-all"
                onClick={() => {
                  setSelectedAuthor(author.name);
                  setActiveTab("all");
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{author.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {author.count} quote{author.count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chains" className="space-y-4 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Wisdom Paths</h3>
            <Button
              size="sm"
              onClick={() => setIsCreatingChain(!isCreatingChain)}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Path
            </Button>
          </div>

          {isCreatingChain && (
            <Card className="border-2 border-amber-200 dark:border-amber-800 mb-4">
              <CardContent className="pt-6 space-y-4">
                <Input
                  placeholder="Path Name (e.g., 'Discipline Journey')"
                  value={newChain.name}
                  onChange={(e) => setNewChain({ ...newChain, name: e.target.value })}
                />
                <Textarea
                  placeholder="Description..."
                  value={newChain.description}
                  onChange={(e) => setNewChain({ ...newChain, description: e.target.value })}
                />
                <Input
                  placeholder="Theme (e.g., 'success mindset')"
                  value={newChain.theme}
                  onChange={(e) => setNewChain({ ...newChain, theme: e.target.value })}
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreateChain} className="cursor-pointer flex-1">
                    Create Wisdom Path
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreatingChain(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {chains?.map((chain: any) => (
              <Card key={chain._id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${chain.color} flex items-center justify-center shrink-0`}>
                      <Link2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg mb-1">{chain.name}</h4>
                      <p className="text-sm text-muted-foreground mb-2">{chain.description}</p>
                      <Badge variant="secondary">{chain.theme}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {(!chains || chains.length === 0) && (
              <div className="text-center py-12 text-muted-foreground">
                <Link2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No wisdom paths yet. Create chains to link related quotes together!</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}