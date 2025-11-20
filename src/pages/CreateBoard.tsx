import { useState, ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface Character {
  id: string;
  name: string;
  imageUrl: string;
}

const CreateBoard = () => {
  const navigate = useNavigate();
  const [boardTitle, setBoardTitle] = useState("");
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentName, setCurrentName] = useState("");
  const [currentImage, setCurrentImage] = useState("");

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addCharacter = () => {
    if (!currentName.trim() || !currentImage.trim()) {
      toast.error("Please provide both name and image");
      return;
    }

    const newCharacter: Character = {
      id: Date.now().toString(),
      name: currentName,
      imageUrl: currentImage,
    };

    setCharacters([...characters, newCharacter]);
    setCurrentName("");
    setCurrentImage("");
    toast.success("Character added!");
  };

  const removeCharacter = (id: string) => {
    setCharacters(characters.filter((char) => char.id !== id));
    toast.success("Character removed");
  };

  const saveBoard = () => {
    if (!boardTitle.trim()) {
      toast.error("Please enter a board title");
      return;
    }

    if (characters.length < 4) {
      toast.error("Please add at least 4 characters");
      return;
    }

    const board = {
      id: Date.now().toString(),
      title: boardTitle,
      characters,
      createdAt: new Date().toISOString(),
    };

    const savedBoards = JSON.parse(
      localStorage.getItem("guessWhoBoards") || "[]"
    );
    savedBoards.push(board);
    localStorage.setItem("guessWhoBoards", JSON.stringify(savedBoards));

    toast.success("Board saved successfully!");
    navigate("/");
  };

  return (
    <div className="min-h-screen py-8 px-4 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-4xl font-bold gradient-text">Create New Board</h1>
        </div>

        {/* Board Title */}
        <div className="glass-panel rounded-2xl p-8 mb-6 animate-scale-in">
          <Label
            htmlFor="boardTitle"
            className="text-lg font-semibold text-foreground mb-2 block"
          >
            Board Title
          </Label>
          <Input
            id="boardTitle"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            placeholder="e.g., Classic Characters"
            className="bg-slate-900/50 border-slate-700 text-foreground text-lg h-12"
          />
        </div>

        {/* Add Character Form */}
        <div
          className="glass-panel rounded-2xl p-8 mb-6 animate-scale-in"
          style={{ animationDelay: "0.1s" }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Add Characters
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label
                htmlFor="characterName"
                className="text-foreground mb-2 block"
              >
                Character Name
              </Label>
              <Input
                id="characterName"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                placeholder="e.g., Sarah"
                className="bg-slate-900/50 border-slate-700 text-foreground"
              />
            </div>

            <div>
              <Label
                htmlFor="imageUpload"
                className="text-foreground mb-2 block"
              >
                Character Image
              </Label>
              <div className="space-y-2">
                <Input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="bg-slate-900/50 border-slate-700 text-foreground file:text-foreground file:bg-secondary file:border-0 file:rounded-md file:px-2 file:py-1 file:mr-2 file:hover:bg-secondary/80"
                />
                {currentImage && (
                  <div className="w-20 h-20 rounded-md overflow-hidden border border-slate-700">
                    <img
                      src={currentImage}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button
            onClick={addCharacter}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground neon-glow-blue"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Character
          </Button>
        </div>

        {/* Characters Grid */}
        {characters.length > 0 && (
          <div
            className="glass-panel rounded-2xl p-8 mb-6 animate-scale-in"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Characters ({characters.length})
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {characters.map((character) => (
                <div
                  key={character.id}
                  className="glass-card rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300"
                >
                  <div className="aspect-square bg-slate-900/50 relative">
                    <img
                      src={character.imageUrl}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => removeCharacter(character.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="p-3">
                    <p className="text-foreground font-medium text-center truncate">
                      {character.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <Button
          onClick={saveBoard}
          size="lg"
          className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground neon-glow-purple text-lg h-14"
        >
          <Save className="mr-2 h-5 w-5" />
          Save Board
        </Button>
      </div>
    </div>
  );
};

export default CreateBoard;
