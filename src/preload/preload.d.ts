declare interface contextAPI {
  ipcRenderer: {
    closeApp: () => void;
  };
  on: (channel: string, func: (...args: unknown[]) => void) => any;
  once: (channel: string, func: (...args: unknown[]) => void) => void;
}
