import { DataTableColumnHeader } from '@/components/reusables/datatable/data-table-column-header';
import { capitalize } from '@/utils/strings';
import type { ColumnDef } from '@tanstack/react-table';
import ViewAction from './ViewAction';

import { Chip } from '@/components/reusables/dashboard/Chip';
import { format } from 'date-fns';

const columns: ColumnDef<any>[] = [
  {
    accessorKey: 'unique_id',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Unique ID" />,
    cell: ({ row }) => (
      <ViewAction
        row={row.original}
        text={row.getValue('unique_id') ? row.getValue('unique_id') : '----'}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Name" />,
    cell: ({ row }) => <div>{row.getValue('name') ? row.getValue('name') : '----'}</div>,

    enableSorting: true,
  },
  {
    accessorKey: 'email',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Email" />,
    cell: ({ row }) => <div>{row.getValue('email') ? row.getValue('email') : '----'}</div>,
    enableSorting: false,
  },
  {
    id: 'Phone Number',
    accessorKey: 'phone',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Phone Number" />,
    cell: ({ row }) => (
      <div>{row.getValue('Phone Number') ? row.getValue('Phone Number') : '----'}</div>
    ),
    enableSorting: false,
  },
  {
    id: 'Address',
    accessorKey: 'address',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Address" />,
    cell: ({ row }) => <div>{row.getValue('Address') ? row.getValue('Address') : '----'}</div>,
    enableSorting: false,
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Status" />,
    cell: ({ row }) => {
      const variant = row.getValue('status') === 'active' ? 'active' : 'danger';
      return (
        <div>
          {row.getValue('status') ? (
            <Chip label={capitalize(row.getValue('status'))} variant={variant} />
          ) : (
            '----'
          )}
        </div>
      );
    },
    enableSorting: false,
  },
  {
    id: 'Last Logged In At',
    accessorKey: 'last_sign_in_at',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Last Logged In At" />,
    cell: ({ row }) => {
      const value = row.getValue('Last Logged In At');
      const dateValue =
        typeof value === 'string' || typeof value === 'number' || value instanceof Date
          ? new Date(value)
          : null;
      return (
        <div>
          {dateValue && !isNaN(dateValue.getTime())
            ? format(dateValue, 'dd/MM/yyyy hh:mm a')
            : '----'}
        </div>
      );
    },
    enableSorting: false,
  },
  // {
  //   id: 'actions',
  //   header: () => <div>Action</div>,
  //   cell: ({ row }) => {
  //     return (
  //       <div className="flex items-center gap-2">
  //         {showViewButton && <ViewAction row={row.original} />}
  //         {showEditButton && <UpdateAction row={row.original} />}
  //         {showDeleteButton && <DeleteAction row={row.original} />}
  //       </div>
  //     );
  //   },
  //   enableSorting: false,
  // },
];

export default columns;
