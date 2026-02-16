/**
 * Electron Notification Service Implementation
 * Uses Electron's native notification system
 */

import type { NotificationOptions } from '../../types';
import type { INotificationService } from '../interfaces';

export class ElectronNotificationService implements INotificationService {
  isSupported(): boolean {
    // Electron always supports notifications
    return true;
  }

  async requestPermission(): Promise<boolean> {
    // Electron doesn't require permission
    return true;
  }

  async show(options: NotificationOptions): Promise<void> {
    try {
      // In Electron, we can use the web Notification API
      // or send an IPC message to use Electron's native Notification
      
      if ('Notification' in window) {
        new Notification(options.title, {
          body: options.body,
          icon: options.icon,
          tag: options.tag,
          silent: options.silent,
        });
      }
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  async showSuccess(message: string): Promise<void> {
    await this.show({
      title: 'Success',
      body: message,
      icon: '✅',
    });
  }

  async showError(message: string): Promise<void> {
    await this.show({
      title: 'Error',
      body: message,
      icon: '❌',
    });
  }

  async showInfo(message: string): Promise<void> {
    await this.show({
      title: 'Info',
      body: message,
      icon: 'ℹ️',
    });
  }
}

