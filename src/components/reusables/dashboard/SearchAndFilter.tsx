import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import IconTitle from './IconTitle';
import { useState, useRef, useEffect, type ChangeEvent, memo } from 'react';
import { cn } from '@/lib/utils';
import { useProductFiltersStore } from '@/store/productFilterStore';

interface SearchAndFilterProps {
  placeholder?: string;
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  isSearchable?: boolean;
  showFilter?: boolean;
  FilterComponent?: any;
  /** 🔹 Add table ref to clear filters */
  table?: any;
  /** 🔹 Optional handler to clear search */
  onClearSearch?: () => void;
}

const SearchAndFilter = ({
  placeholder = 'Search Here',
  value,
  onChange,
  className,
  isSearchable,
  showFilter,
  FilterComponent,
}: SearchAndFilterProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  const filterToggle = () => {
    const body = document.body;

    if (isOpen) {
      body.classList.remove('filter-is-open');
    } else {
      body.classList.add('filter-is-open');
    }

    setIsOpen(!isOpen);

    // 🔹 Notify dropdowns/popovers when closing
    if (isOpen) window.dispatchEvent(new Event('filter-close'));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
      document.body.classList.remove('filter-is-open');
      window.dispatchEvent(new Event('filter-close'));
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Ignore clicks inside the filter panel or popovers
      if (filterRef.current && filterRef.current.contains(target)) return;
      if (target.closest('[data-radix-popper-content-wrapper]')) return;

      // Close filter
      setIsOpen(false);
      document.body.classList.remove('filter-is-open');
      window.dispatchEvent(new Event('filter-close'));
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const resetFilters = useProductFiltersStore((state) => state.resetFilters);

  const handleClearFilters = () => {
    resetFilters();
  };

  return (
    <>
      <div className="search-inp-wrap flex items-center gap-4">
        {isSearchable && (
          <form onSubmit={(e) => e.preventDefault()} className="relative w-90">
            <Input
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={onChange}
              className={cn('icon-title flex items-center gap-4', className)}
            />
            <button type="button" className="absolute top-1 right-1 rounded-full bg-white p-2">
              <Search />
            </button>
          </form>
        )}
        {showFilter && (
          <div className="filter-icon-wrap">
            <Button
              variant="headerIcon"
              size="icon"
              className="icon-btn hover:border-primary size-12 border-1 bg-white"
              onClick={filterToggle}
            >
              <SlidersHorizontal />
            </Button>
          </div>
        )}
      </div>

      {/* Filter Panel */}
      <div
        ref={filterRef}
        className={cn(
          'filter-wrap fixed top-1/2 right-0 z-50 max-h-[calc(100dvh-100px)] w-full max-w-114 -translate-y-1/2 rounded-lg rounded-tr-none rounded-br-none bg-white shadow-2xl transition-all duration-400 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+100px)]'
        )}
      >
        {/* Fixed Header */}
        <div className="filter-header sticky top-0 z-10 flex items-center justify-between border-b bg-white p-4">
          <IconTitle title="Filters" icon={SlidersHorizontal} />
          <Button size="icon" onClick={filterToggle}>
            <X />
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="filter-content max-h-[calc(100dvh-100px-80px)] overflow-auto p-7 pt-4">
          {FilterComponent && <FilterComponent />}
        </div>

        <div className="filter-footer mt-7 flex items-center gap-4 p-5">
          <Button className="w-full" variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        </div>
      </div>
    </>
  );
};

export default memo(SearchAndFilter);
