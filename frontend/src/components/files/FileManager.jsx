import { useState } from "react";
import { useNavigate } from "react-router-dom";
import FileUpload from "./FileUpload";
import FileList from "./FileList";
import FileFilters from "./FileFilters";

function FileManager() {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [filters, setFilters] = useState({
    search: "",
    mimeType: "",
    sizeMin: "",
    sizeMax: "",
    dateFrom: null,
    dateTo: null,
    tags: [],
    page: 1,
    pageSize: 20,
  });

  const handleUploadComplete = (results) => {
    // Refresh the file list when uploads complete
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="space-y-8">
      {/* File Filters */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight">File Manager</h2>
          <p className="text-muted-foreground">
            Filter, search, and manage your uploaded files.
          </p>
        </div>
        <FileFilters onChange={handleFiltersChange} />
      </section>

      {/* File List Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold">Your Files</h3>
            <p className="text-muted-foreground">
              View and manage all your uploaded files
            </p>
          </div>
          <button
            onClick={() => navigate('/files/upload')}
            className="btn-primary px-4 py-2 rounded-lg font-medium"
          >
            Upload Files
          </button>
        </div>
        <FileList
          refreshTrigger={refreshTrigger}
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />
      </section>
    </div>
  );
}

export default FileManager;
