
import React, { useRef, useState } from 'react';
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Upload, Link, X, FileText, Image, Video, Check, AlertCircle, Cloud } from 'lucide-react';
import { uploadFileToSupabase } from '@/utils/fileUpload';
import { useToast } from '@/hooks/use-toast';

interface FileUploadFieldProps {
  label?: string;
  onFileUploaded: (url: string, file?: File) => void;
  accept?: string;
  value?: string;
  placeholder?: string;
  maxFileSize?: number; // in MB
  allowedTypes?: string[];
  bucketName?: string;
  folder?: string;
}

export const FileUploadField: React.FC<FileUploadFieldProps> = ({
  label = "Image",
  onFileUploaded,
  accept = "image/*",
  value = "",
  placeholder = "Enter image URL or upload a file",
  maxFileSize = 5, // 5MB default
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  bucketName = 'files',
  folder = 'uploads'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState(value);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxFileSize}MB`,
        variant: "destructive",
      });
      return false;
    }

    // Check file type
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: `Please select a valid file type: ${allowedTypes.join(', ')}`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (file && validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setUploadProgress(0);
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 100);

    try {
      const result = await uploadFileToSupabase(selectedFile, bucketName, folder);
      setUploadProgress(100);
      onFileUploaded(result.url, selectedFile);
      setUrlInput(result.url);
      
      toast({
        title: "Upload successful",
        description: "File uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload file",
        variant: "destructive",
      });
      setUploadProgress(0);
    } finally {
      clearInterval(progressInterval);
      setUploading(false);
      setSelectedFile(null);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onFileUploaded(urlInput.trim());
    }
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image className="h-5 w-5 text-blue-600" />;
    if (file.type.startsWith('video/')) return <Video className="h-5 w-5 text-purple-600" />;
    return <FileText className="h-5 w-5 text-gray-600" />;
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setUrlInput("");
    onFileUploaded("");
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {label && <Label className="text-sm font-medium text-gray-700">{label}</Label>}
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger value="upload" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Cloud className="h-4 w-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2 data-[state=active]:bg-white">
            <Link className="h-4 w-4" />
            From URL
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <div 
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
              dragActive 
                ? 'border-blue-500 bg-blue-50' 
                : selectedFile 
                  ? 'border-green-300 bg-green-50' 
                  : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleInputChange}
              accept={accept}
              className="hidden"
            />
            
            {!selectedFile ? (
              <div className="space-y-4">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center ${
                  dragActive ? 'bg-blue-100' : 'bg-gray-100'
                }`}>
                  <Upload className={`h-8 w-8 ${dragActive ? 'text-blue-600' : 'text-gray-400'}`} />
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-1">
                    {dragActive ? 'Drop your file here' : 'Drag and drop your file here'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse files
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-white hover:bg-gray-50"
                  >
                    Choose File
                  </Button>
                </div>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Maximum file size: {maxFileSize}MB</p>
                  <p>Supported formats: {allowedTypes.map(type => type.split('/')[1]).join(', ')}</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Preview */}
                <div className="flex items-center justify-center gap-3 p-4 bg-white rounded-lg border">
                  {getFileIcon(selectedFile)}
                  <div className="flex-1 text-left">
                    <p className="font-medium text-gray-900 truncate max-w-[200px]">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Upload Progress */}
                {uploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uploading...</span>
                      <span className="text-gray-600">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {selectedFile && !uploading && (
            <Button
              type="button"
              onClick={handleFileUpload}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
          )}
        </TabsContent>
        
        <TabsContent value="url" className="space-y-4">
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder={placeholder}
                className="flex-1"
              />
              <Button 
                type="button" 
                onClick={handleUrlSubmit}
                variant="outline"
                disabled={!urlInput.trim()}
                className="px-6"
              >
                Add
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Enter a direct URL to an image file (jpg, png, gif, webp)
            </p>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Current Value Display */}
      {value && (
        <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 font-medium">File added successfully</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearSelection}
            className="text-green-600 hover:text-green-700 hover:bg-green-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Preview for images */}
      {value && (value.includes('image') || accept.includes('image')) && (
        <div className="mt-3">
          <img 
            src={value} 
            alt="Preview" 
            className="max-w-full h-32 object-cover rounded-lg border"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};
