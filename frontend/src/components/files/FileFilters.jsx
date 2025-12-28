import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, X, Filter, RotateCcw } from "lucide-react";
import { format } from "date-fns";

function FileFilters({ onChange }) {
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize state from URL params
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    mimeType: searchParams.get("mime_type") || "",
    sizeMin: searchParams.get("size_min") || "",
    sizeMax: searchParams.get("size_max") || "",
    dateFrom: searchParams.get("date_from") ? new Date(searchParams.get("date_from")) : null,
    dateTo: searchParams.get("date_to") ? new Date(searchParams.get("date_to")) : null,
    tags: searchParams.get("tags") ? searchParams.get("tags").split(",") : [],
  });

  const [tagInput, setTagInput] = useState("");

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.mimeType) params.set("mime_type", filters.mimeType);
    if (filters.sizeMin) params.set("size_min", filters.sizeMin);
    if (filters.sizeMax) params.set("size_max", filters.sizeMax);
    if (filters.dateFrom) params.set("date_from", filters.dateFrom.toISOString().split('T')[0]);
    if (filters.dateTo) params.set("date_to", filters.dateTo.toISOString().split('T')[0]);
    if (filters.tags.length > 0) params.set("tags", filters.tags.join(","));

    setSearchParams(params, { replace: true });
  }, [filters, setSearchParams]);

  // Notify parent of filter changes
  useEffect(() => {
    onChange?.(filters);
  }, [filters, onChange]);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const addTag = () => {
    if (tagInput.trim() && !filters.tags.includes(tagInput.trim())) {
      updateFilter("tags", [...filters.tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    updateFilter("tags", filters.tags.filter(tag => tag !== tagToRemove));
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      search: "",
      mimeType: "",
      sizeMin: "",
      sizeMax: "",
      dateFrom: null,
      dateTo: null,
      tags: [],
    };
    setFilters(clearedFilters);
    setTagInput("");
  };

  const hasActiveFilters = Object.values(filters).some(value =>
    Array.isArray(value) ? value.length > 0 : value !== "" && value !== null
  );

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Filters</h3>
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2">
              Active
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Filename Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Filename Search</Label>
          <Input
            id="search"
            placeholder="Search files..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            aria-label="Search files by name"
          />
        </div>

        {/* File Type Select */}
        <div className="space-y-2">
          <Label>File Type</Label>
          <Select value={filters.mimeType||"all"} onValueChange={(value) => updateFilter("mimeType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="image/png">Images</SelectItem>
              <SelectItem value="video/">Videos</SelectItem>
              <SelectItem value="audio/">Audio</SelectItem>
              <SelectItem value="application/pdf">PDF</SelectItem>
              <SelectItem value="text/">Text files</SelectItem>
              <SelectItem value="application/">Documents</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Size Range */}
        <div className="space-y-2">
          <Label>File Size (MB)</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.sizeMin}
              onChange={(e) => updateFilter("sizeMin", e.target.value)}
              min="0"
              step="0.1"
              aria-label="Minimum file size in MB"
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.sizeMax}
              onChange={(e) => updateFilter("sizeMax", e.target.value)}
              min="0"
              step="0.1"
              aria-label="Maximum file size in MB"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Label>Date From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateFrom ? format(filters.dateFrom, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateFrom}
                onSelect={(date) => updateFilter("dateFrom", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label>Date To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.dateTo ? format(filters.dateTo, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={filters.dateTo}
                onSelect={(date) => updateFilter("dateTo", date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              placeholder="Add tag..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addTag()}
            />
            <Button onClick={addTag} size="sm">Add</Button>
          </div>
          {filters.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:bg-secondary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <Badge variant="outline">
                Search: "{filters.search}"
                <button onClick={() => updateFilter("search", "")} className="ml-2">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.mimeType && (
              <Badge variant="outline">
                Type: {filters.mimeType}
                <button onClick={() => updateFilter("mimeType", "")} className="ml-2">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {(filters.sizeMin || filters.sizeMax) && (
              <Badge variant="outline">
                Size: {filters.sizeMin || "0"} - {filters.sizeMax || "∞"} MB
                <button onClick={() => updateFilter("sizeMin", "") || updateFilter("sizeMax", "")} className="ml-2">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.dateFrom && (
              <Badge variant="outline">
                From: {format(filters.dateFrom, "PP")}
                <button onClick={() => updateFilter("dateFrom", null)} className="ml-2">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {filters.dateTo && (
              <Badge variant="outline">
                To: {format(filters.dateTo, "PP")}
                <button onClick={() => updateFilter("dateTo", null)} className="ml-2">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default FileFilters;
