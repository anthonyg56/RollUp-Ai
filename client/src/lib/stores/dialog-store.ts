import { createStore } from 'zustand/vanilla';

export type DashboardDialogs = 'Submit Feedback' | 'Upload New Video' | 'User Settings'; // Not Ready: 'Playback Video' | 'Create Organization' | 'Manage Organization';

export interface DashboardDialogOptions {
  uploadNewVideoOptions?: {
    file: File;
  } | null;
  userSettingsOptions?: {
    tab: 'Account' | 'Notifications' | 'Billing' | 'Team';
  } | null;
}

export type DashboardDialogState = {
  currentDialog: DashboardDialogs | null;
} & DashboardDialogOptions;

export type DashboardDialogActions = {
  setUploadNewVideoOptions: (options: DashboardDialogOptions['uploadNewVideoOptions']) => void;
  setUserSettingsOptions: (options: DashboardDialogOptions['userSettingsOptions']) => void;
  open: (dialog: DashboardDialogs, options?: DashboardDialogOptions) => void;
  close: () => void;
}

export type DashboardDialogStore = DashboardDialogState & DashboardDialogActions;

export const defaultInitialOptions: DashboardDialogState = {
  currentDialog: null,
  uploadNewVideoOptions: null,
  userSettingsOptions: null,
}

export const createDashboardDialogStore = (
  initalOptions: DashboardDialogState = defaultInitialOptions
) => createStore<DashboardDialogStore>()((set) => ({
  ...initalOptions,
  setUploadNewVideoOptions: (options) => set({
    uploadNewVideoOptions: options,
  }),
  setUserSettingsOptions: (options) => set({
    userSettingsOptions: options,
  }),
  open: (dialog, options) => set({ ...options, currentDialog: dialog }),
  close: () => set({ ...defaultInitialOptions, currentDialog: null }),
}))