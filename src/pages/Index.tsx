import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, Play, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Board {
  id: string;
  title: string;
  characters: { id: string; name: string; imageUrl: string }[];
  createdAt: string;
}

const Index = () => {
  const navigate = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = () => {
    const savedBoards = JSON.parse(localStorage.getItem("guessWhoBoards") || "[]");
    setBoards(savedBoards);
  };

  const deleteBoard = (id: string) => {
    const updatedBoards = boards.filter((board) => board.id !== id);
    localStorage.setItem("guessWhoBoards", JSON.stringify(updatedBoards));
    setBoards(updatedBoards);
    setDeleteId(null);
    toast.success("Board deleted");
  };

  return (
    <div className="min-h-screen py-12 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-scale-in">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 gradient-text tracking-tight">
            Guess Who?
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Create custom game boards with your own characters and challenge your friends
            in this classic guessing game
          </p>
          <Button
            onClick={() => navigate("/create")}
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground neon-glow-blue text-lg h-14 px-8 animate-glow-pulse"
          >
            <Plus className="mr-2 h-5 w-5" />
            Create New Board
          </Button>
        </div>

        {/* Saved Boards Section */}
        <div className="glass-panel rounded-2xl p-8 animate-scale-in" style={{ animationDelay: "0.2s" }}>
          <h2 className="text-3xl font-bold text-foreground mb-6">
            {boards.length > 0 ? "Your Boards" : "No Boards Yet"}
          </h2>

          {boards.length === 0 ? (
            <div className="text-center py-12">
              <div className="glass-card rounded-xl p-12 max-w-md mx-auto">
                <p className="text-muted-foreground text-lg mb-6">
                  You haven't created any boards yet. Start by creating your first custom
                  Guess Who board!
                </p>
                <Button
                  onClick={() => navigate("/create")}
                  variant="outline"
                  className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Board
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boards.map((board, index) => (
                <div
                  key={board.id}
                  className="glass-card rounded-xl overflow-hidden group hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-blue-400/10 animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Board Preview Grid */}
                  <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/50">
                    {board.characters.slice(0, 6).map((char) => (
                      <div
                        key={char.id}
                        className="aspect-square bg-slate-800 rounded overflow-hidden"
                      >
                        <img
                          src={char.imageUrl}
                          alt={char.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Board Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-foreground mb-2 truncate">
                      {board.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      {board.characters.length} characters
                    </p>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => navigate(`/play/${board.id}`)}
                        className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Play className="mr-2 h-4 w-4" />
                        Play
                      </Button>
                      <Button
                        onClick={() => setDeleteId(board.id)}
                        variant="outline"
                        size="icon"
                        className="border-red-400/30 text-red-400 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="glass-panel border-red-400/30">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Board?</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              This action cannot be undone. This will permanently delete the board
              and all its characters.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteBoard(deleteId)}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
