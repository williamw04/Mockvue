import { IpcMain, IpcMainInvokeEvent } from 'electron';

type Handler = (event: IpcMainInvokeEvent, ...args: unknown[]) => Promise<unknown> | unknown;
type SyncHandler = (event: IpcMainInvokeEvent, ...args: unknown[]) => void;

interface IpcHandler {
  channel: string;
  handler: Handler;
}

interface IpcSyncHandler {
  channel: string;
  handler: SyncHandler;
}

export function registerIpcHandlers(ipcMain: IpcMain, handlers: IpcHandler[]): void {
  for (const { channel, handler } of handlers) {
    ipcMain.handle(channel, async (event, ...args) => {
      try {
        return await handler(event, ...args);
      } catch (error) {
        console.error(`Error in ${channel}:`, error);
        throw error;
      }
    });
  }
}

export function registerIpcSyncHandlers(ipcMain: IpcMain, handlers: IpcSyncHandler[]): void {
  for (const { channel, handler } of handlers) {
    ipcMain.on(channel, (event, ...args) => {
      try {
        handler(event, ...args);
      } catch (error) {
        console.error(`Error in ${channel}:`, error);
      }
    });
  }
}

export function createHandler<T extends Handler>(channel: string, handler: T): IpcHandler {
  return { channel, handler };
}

export function createSyncHandler<T extends SyncHandler>(channel: string, handler: T): IpcSyncHandler {
  return { channel, handler };
}