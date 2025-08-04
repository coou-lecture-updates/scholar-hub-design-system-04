
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog";
import { Button } from "./button";

interface ImagePickerDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}
interface FileUpload {
  id: string;
  url: string;
  filename: string;
}
import { supabase } from "@/integrations/supabase/client";

export const ImagePickerDialog: React.FC<ImagePickerDialogProps> = ({ open, onClose, onSelect }) => {
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      // Fetch "image" files from file_uploads table (limit: 30)
      loadImages();
    }
  }, [open]);

  const loadImages = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("file_uploads")
      .select("id,file_path,filename,mime_type")
      .order("created_at", { ascending: false })
      .limit(30);
    if (!data) {
      setFiles([]);
      setLoading(false);
      return;
    }
    // Only show images based on mime_type
    const list = data
      .filter(f => f.mime_type && f.mime_type.startsWith("image/"))
      .map(f => ({
        id: f.id,
        url: supabase.storage.from("files").getPublicUrl(f.file_path).data.publicUrl,
        filename: f.filename
      }));
    setFiles(list);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Pick an Existing Image</DialogTitle>
          <DialogDescription>
            Select an image you've previously uploaded to use in this item.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-3 mt-2 max-h-72 overflow-y-auto">
          {loading ? (
            <div className="col-span-3 text-center text-gray-500 py-6">Loading images…</div>
          ) : files.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500 py-6">No images found.</div>
          ) : (
            files.map(file => (
              <button
                key={file.id}
                className="border rounded overflow-hidden hover:ring-2 hover:ring-blue-400 focus:outline-none"
                title={file.filename}
                type="button"
                onClick={() => {
                  onSelect(file.url);
                  onClose();
                }}
              >
                <img src={file.url} alt={file.filename} className="object-cover w-28 h-24" />
              </button>
            ))
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
