// Project-wide convention for transient user feedback — see PRD NFR-4.1.
// Feature code should import from here, not from `sonner` directly.
import { toast as sonnerToast } from 'sonner';

type ToastApi = {
	success: (message: string) => void;
	error: (message: string) => void;
	info: (message: string) => void;
};

export const toast: ToastApi = {
	success: (message) => {
		sonnerToast.success(message);
	},
	error: (message) => {
		sonnerToast.error(message);
	},
	info: (message) => {
		sonnerToast.info(message);
	},
};
