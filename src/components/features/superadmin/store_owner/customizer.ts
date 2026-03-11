import type { ActionMenuConfig } from '@/types/types';
// import CreateAction from './CreateAction';
import { UsersRound } from 'lucide-react';

const actionMenuItems: ActionMenuConfig = {
  tableTitle: 'All Owners',
  titleIcon: UsersRound,
  willCellWrap: true,
  isVisibilityTogglable: false,
  isSearchable: true,
  searchPlaceholder: 'Search Store Owners ...',
  searchColumns: ['name', 'email', 'phone'],
  showFilter: false,
  showCreateButton: true,
  creationOptions: {
    title: 'Create Store Owner',
    description: '',
    // component: CreateAction,
  },
  showDeleteButton: true,
  deleteConfirmationOptions: {
    title: 'Are you sure you want to delete this Store Owner?',
    description: 'This action cannot be undone.',
    confirmLabel: 'Yes, delete',
  },
  showEditButton: true,
  updateOptions: {
    title: 'Edit Store Owner',
    description: '',
  },
  showViewButton: true,
  viewOptions: {
    title: 'Store Owner details',
    description: '',
  },
};

export default actionMenuItems;
