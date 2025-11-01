/**
 * Web Notification Service Implementation
 * Uses the Web Notifications API
 */

import type { NotificationOptions } from '../../types';
import type { INotificationService } from '../interfaces';

export class WebNotificationService implements INotificationService {
  private permissionGranted = false;

  constructor() {
    // Check initial permission state
    if ('Notification' in window) {
      this.permissionGranted = Notification.permission === 'granted';
    }
  }

  isSupported(): boolean {
    return 'Notification' in window;
  }

  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) {
      console.warn('Notifications are not supported in this browser');
      return false;
    }

    if (this.permissionGranted) {
      return true;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionGranted = permission === 'granted';
      return this.permissionGranted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async show(options: NotificationOptions): Promise<void> {
    if (!this.isSupported()) {
      // Fallback to console or toast notification
      console.log(`[Notification] ${options.title}: ${options.body}`);
      this.showToast(options);
      return;
    }

    // Request permission if not already granted
    if (!this.permissionGranted) {
      const granted = await this.requestPermission();
      if (!granted) {
        // Fallback to toast
        this.showToast(options);
        return;
      }
    }

    try {
      new Notification(options.title, {
        body: options.body,
        icon: options.icon,
        tag: options.tag,
        silent: options.silent,
      });
    } catch (error) {
      console.error('Error showing notification:', error);
      this.showToast(options);
    }
  }

  /**
   * Fallback toast notification for when system notifications aren't available
   */
  private showToast(options: NotificationOptions): void {
    const toast = document.createElement('div');
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      color: #1a202c;
      padding: 1rem 1.5rem;
      border-radius: 0.5rem;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      max-width: 300px;
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      font-family: system-ui, -apple-system, sans-serif;
      border-left: 4px solid #3b82f6;
    `;

    toast.innerHTML = `
      <style>
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      </style>
      <div style="font-weight: 600; margin-bottom: 0.25rem;">${options.title}</div>
      <div style="font-size: 0.875rem; color: #4a5568;">${options.body}</div>
    `;

    document.body.appendChild(toast);

    // Auto-dismiss after 4 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 4000);

    // Allow manual dismissal on click
    toast.addEventListener('click', () => {
      toast.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    });
  }

  async showSuccess(message: string): Promise<void> {
    await this.show({
      title: '✅ Success',
      body: message,
    });
  }

  async showError(message: string): Promise<void> {
    await this.show({
      title: '❌ Error',
      body: message,
    });
  }

  async showInfo(message: string): Promise<void> {
    await this.show({
      title: 'ℹ️ Info',
      body: message,
    });
  }
}

