import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Save } from "lucide-react";
import { useState } from "react";

interface FileNameDialogProps {
  currentFileName: string;
  onSave: (fileName: string) => void;
  hasUnsavedChanges?: boolean;
}

export function FileNameDialog({
  currentFileName,
  onSave,
  hasUnsavedChanges = false,
}: FileNameDialogProps) {
  const [open, setOpen] = useState(false);
  const [fileName, setFileName] = useState(currentFileName);
  const [error, setError] = useState("");

  const handleSave = () => {
    // Basic validation
    if (!fileName.trim()) {
      setError("File name cannot be empty");
      return;
    }

    // Check for invalid characters (basic validation)
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(fileName)) {
      setError("File name contains invalid characters");
      return;
    }

    // Ensure .isi extension
    let finalFileName = fileName.trim();
    if (!finalFileName.endsWith(".isi")) {
      finalFileName += ".isi";
    }

    onSave(finalFileName);
    setOpen(false);
    setError("");
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setFileName(currentFileName);
      setError("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all duration-200"
          title="Save File"
        >
          <Save className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white/95 backdrop-blur-xl border-gray-200/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-md">
              <FileText className="w-4 h-4 text-white" />
            </div>
            Save File
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Enter a name for your IsiPython file. The .isi extension will be
            added automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="filename"
              className="text-right text-gray-700 font-medium"
            >
              File Name
            </Label>
            <div className="col-span-3 space-y-2">
              <Input
                id="filename"
                value={fileName}
                onChange={(e) => {
                  setFileName(e.target.value);
                  setError(""); // Clear error when user types
                }}
                onKeyPress={handleKeyPress}
                placeholder="my-awesome-code"
                className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300/50 text-gray-900 focus:ring-2 focus:ring-green-400/30"
                autoFocus
              />
              {error && (
                <p className="text-xs text-red-600 bg-red-50/50 p-2 rounded border border-red-200/50">
                  ⚠️ {error}
                </p>
              )}
              <p className="text-xs text-gray-500">
                💡 Tip: Use descriptive names like "calculator" or "game"
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            className="border-gray-300/50 text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-md"
          >
            <Save className="w-4 h-4 mr-2" />
            Save File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
