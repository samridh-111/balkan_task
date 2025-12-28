import FileUpload from "@/components/files/FileUpload";

function FileUploadPage() {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Upload Files</h1>
        <p className="text-muted-foreground">
          Drag and drop files or click to browse. Multiple files supported with automatic deduplication.
        </p>
      </div>
      <FileUpload />
    </div>
  );
}

export default FileUploadPage;
