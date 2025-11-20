import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Shuffle, Trophy } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Character {
  id: string;
  name: string;
  imageUrl: string;
  isEliminated: boolean;
}

interface Board {
  id: string;
  title: string;
  characters: Character[];
}

const PlayGame = () => {
  const navigate = useNavigate();
  const { boardId } = useParams();
  const [board, setBoard] = useState<Board | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [showWinModal, setShowWinModal] = useState(false);
  const [remainingCount, setRemainingCount] = useState(0);

  useEffect(() => {
    if (!boardId) {
      navigate("/");
      return;
    }

    const savedBoards = JSON.parse(localStorage.getItem("guessWhoBoards") || "[]");
    const foundBoard = savedBoards.find((b: Board) => b.id === boardId);

    if (!foundBoard) {
      toast.error("Board not found");
      navigate("/");
      return;
    }

    const boardWithStatus = {
      ...foundBoard,
      characters: foundBoard.characters.map((char: Character) => ({
        ...char,
        isEliminated: false,
      })),
    };

    setBoard(boardWithStatus);
    setCharacters(boardWithStatus.characters);
    setRemainingCount(boardWithStatus.characters.length);
  }, [boardId, navigate]);

  const toggleEliminate = (id: string) => {
    const updatedCharacters = characters.map((char) => {
      if (char.id === id) {
        return { ...char, isEliminated: !char.isEliminated };
      }
      return char;
    });

    setCharacters(updatedCharacters);
    const remaining = updatedCharacters.filter((c) => !c.isEliminated).length;
    setRemainingCount(remaining);

    if (remaining === 1) {
      setTimeout(() => setShowWinModal(true), 500);
    }
  };

  const restartGame = () => {
    const resetCharacters = characters.map((char) => ({
      ...char,
      isEliminated: false,
    }));
    setCharacters(resetCharacters);
    setRemainingCount(resetCharacters.length);
    setShowWinModal(false);
    toast.success("Game restarted!");
  };

  const shuffleCharacters = () => {
    const shuffled = [...characters].sort(() => Math.random() - 0.5);
    setCharacters(shuffled);
    toast.success("Characters shuffled!");
  };

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 rounded-2xl">
          <p className="text-foreground text-lg">Loading board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold gradient-text">{board.title}</h1>
              <p className="text-muted-foreground mt-1">
                Remaining: <span className="text-blue-400 font-semibold">{remainingCount}</span> / {characters.length}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={shuffleCharacters}
              variant="outline"
              className="border-blue-400/30 text-blue-400 hover:bg-blue-400/10"
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Shuffle
            </Button>
            <Button
              onClick={restartGame}
              variant="outline"
              className="border-purple-400/30 text-purple-400 hover:bg-purple-400/10"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Restart
            </Button>
          </div>
        </div>

        {/* Characters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {characters.map((character, index) => (
            <div
              key={character.id}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <button
                onClick={() => toggleEliminate(character.id)}
                className={`
                  relative w-full group perspective-1000
                  ${character.isEliminated ? "opacity-50" : ""}
                `}
              >
                <div
                  className={`
                    glass-card rounded-xl overflow-hidden
                    transition-all duration-500
                    ${character.isEliminated ? "rotate-y-180" : ""}
                    ${!character.isEliminated && "hover:scale-105 hover:shadow-lg hover:shadow-blue-400/20"}
                  `}
                  style={{
                    transformStyle: "preserve-3d",
                    transform: character.isEliminated ? "rotateY(180deg)" : "rotateY(0deg)",
                  }}
                >
                  <div className="aspect-square bg-slate-900/50 relative">
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                    {character.isEliminated && (
                      <div className="absolute inset-0 bg-red-500/40 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-6xl">❌</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-slate-900/70">
                    <p className={`
                      font-semibold text-center truncate
                      ${character.isEliminated ? "line-through text-muted-foreground" : "text-foreground"}
                    `}>
                      {character.name}
                    </p>
                  </div>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Win Modal */}
      <Dialog open={showWinModal} onOpenChange={setShowWinModal}>
        <DialogContent className="glass-panel border-blue-400/30 text-foreground">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-3 text-3xl">
              <Trophy className="h-8 w-8 text-yellow-400 animate-pulse" />
              <span className="gradient-text">You Won!</span>
            </DialogTitle>
            <DialogDescription className="text-center text-lg text-muted-foreground pt-4">
              You've found the mystery character!
              <br />
              The last remaining character is the answer.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-6">
            <Button
              onClick={restartGame}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Play Again
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="outline"
              className="flex-1 border-purple-400/30 text-purple-400"
            >
              Back Home
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayGame;
