import { type Table } from '@tanstack/react-table';
// import { DataTableViewOptions } from './data-table-view-options';
import type { ActionMenuConfig } from '@/types/types';
import IconTitle from '../dashboard/IconTitle';
import SearchAndFilter from '../dashboard/SearchAndFilter';
import { memo, type ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { History, Plus } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'react-toastify';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  actionMenuItems: ActionMenuConfig;
  selectedRows: TData[];
}

const DataTableToolbar = <TData,>({
  table,
  actionMenuItems,
  selectedRows,
}: DataTableToolbarProps<TData>) => {
  const navigate = useNavigate();
  const rows = table.getRowModel().rows;

  const {
    isVisibilityTogglable,
    showCreateButton,
    creationOptions,
    isSearchable,
    showFilter,
    tableTitle,
    titleIcon,
    searchPlaceholder,
    extraOptions,
  } = actionMenuItems;

  const ChipComponent = extraOptions?.chipComponent;
  const MarkUpComponent = extraOptions?.markupComponent;
  const showImportHistoryLink = extraOptions?.showImportHistoryLink;
  const ProductImportComponent = extraOptions?.importProductComponent;
  const UploadFilesComponent = extraOptions?.uploadFilesComponent;
  const ProductFilterComponent = extraOptions?.productFilterComponent;
  const showAddPrintQRQueueButton = extraOptions?.showAddPrintQRQueueButton;
  const addToPrintQRQueueUrl = extraOptions?.addToPrintQRQueueUrl;
  const showExportLeadButton = extraOptions?.showExportLeadButton;
  const ExportLeadComponent = extraOptions?.exportLeadComponent;
  const GenerateAllQRCodeComp = extraOptions?.generateAllQRCodeComp;

  const searchValue = (table.getState().globalFilter as string) ?? '';

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target.value;
    table.setGlobalFilter(input);
  };

  const handleAddToPrintQRQueue = () => {
    // Check if every selected row has a valid QR code URL
    const allHaveQRCodes = selectedRows.every(
      (row: any) => row.qr_code && row.qr_code.qr_code_image_url
    );

    if (!allHaveQRCodes) {
      toast.error('Not all selected items have QR codes. Please generate QR codes first.');
      return;
    }

    navigate(addToPrintQRQueueUrl, {
      state: {
        selectedRows: selectedRows,
      },
    });
  };
  return (
    <>
      <div className={`d-fc-header mb-3 flex justify-between gap-2 overflow-auto pb-1`}>
        <div className="left-col">
          <IconTitle title={tableTitle ?? ''} icon={titleIcon} />
        </div>

        <div className="right-col flex items-center gap-4">
          <div className="search-and-filter">
            <SearchAndFilter
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={handleSearchChange}
              isSearchable={isSearchable}
              showFilter={showFilter}
              FilterComponent={() =>
                ProductFilterComponent && (
                  <ProductFilterComponent
                    // selectedCategories={selectedCategories}
                    // selectedTags={selectedTags}
                    // onChangeCategory={handleCategoryChange}
                    // onChangeTag={handleTagChange}
                    table={table}
                  />
                )
              }
            />
          </div>

          {extraOptions?.showImportHistoryButton && (
            <Link to={showImportHistoryLink}>
              <Button variant="iconButtonMuted">
                <History />
                Import History
              </Button>
            </Link>
          )}

          {showAddPrintQRQueueButton && addToPrintQRQueueUrl && (
            <Button onClick={handleAddToPrintQRQueue}>
              <Plus />
              Add to Print Queue
            </Button>
          )}

          {extraOptions?.showImportProductButton && extraOptions?.importProductComponent && (
            <ProductImportComponent />
          )}

          {extraOptions?.showUploadFilesButton && extraOptions?.uploadFilesComponent && (
            <UploadFilesComponent />
          )}

          {extraOptions?.showAddMarkupButton && <MarkUpComponent selectedRows={selectedRows} />}

          {showExportLeadButton && ExportLeadComponent && <ExportLeadComponent rows={rows} />}
          {/* 
          <div className="flex flex-wrap gap-4 md:flex-nowrap">
            {isVisibilityTogglable && <DataTableViewOptions table={table} />}

            {showCreateButton && creationOptions?.component && <creationOptions.component />}

            {extraOptions?.canGenerateAllQRCode && (
              <GenerateAllQRCodeComp selectedRows={selectedRows} />
            )}
          </div> */}
        </div>
      </div>

      {extraOptions?.showLocationChips && <ChipComponent table={table} />}
    </>
  );
};

export default memo(DataTableToolbar);
