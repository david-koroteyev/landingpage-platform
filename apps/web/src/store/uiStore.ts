import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  propertiesPanelOpen: boolean;
  versionHistoryOpen: boolean;
  publishDialogOpen: boolean;
  importDialogOpen: boolean;
  aiPanelExpanded: boolean;
  setSidebar: (open: boolean) => void;
  setPropertiesPanel: (open: boolean) => void;
  setVersionHistory: (open: boolean) => void;
  setPublishDialog: (open: boolean) => void;
  setImportDialog: (open: boolean) => void;
  setAiPanelExpanded: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  propertiesPanelOpen: true,
  versionHistoryOpen: false,
  publishDialogOpen: false,
  importDialogOpen: false,
  aiPanelExpanded: false,
  setSidebar: (open) => set({ sidebarOpen: open }),
  setPropertiesPanel: (open) => set({ propertiesPanelOpen: open }),
  setVersionHistory: (open) => set({ versionHistoryOpen: open }),
  setPublishDialog: (open) => set({ publishDialogOpen: open }),
  setImportDialog: (open) => set({ importDialogOpen: open }),
  setAiPanelExpanded: (open) => set({ aiPanelExpanded: open }),
}));
