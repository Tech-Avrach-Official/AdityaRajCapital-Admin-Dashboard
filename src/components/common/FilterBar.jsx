import React from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

const FilterBar = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Search...",
  filters = [],
  onFilterChange,
  onClearFilters,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg border border-border mb-6",
        className
      )}
    >
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={filter.value}
          onValueChange={(value) => onFilterChange(filter.key, value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={filter.placeholder || "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {filter.options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}

      {onClearFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={onClearFilters}
          className="gap-2"
        >
          <X className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  )
}

export default FilterBar
