import { atom } from 'nanostores';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
    id: string;
    message: string;
    type: ToastType;
}

export const $toasts = atom<ToastMessage[]>([]);

export const addToast = (message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    $toasts.set([...$toasts.get(), { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
        removeToast(id);
    }, 3000);
};

export const removeToast = (id: string) => {
    $toasts.set($toasts.get().filter(t => t.id !== id));
};
