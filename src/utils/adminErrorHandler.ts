
import { toast } from '@/hooks/use-toast';

export interface AdminError {
  code?: string;
  message: string;
  details?: any;
}

export const handleAdminError = (error: any, context: string = 'Operation') => {
  console.error(`Admin Error in ${context}:`, error);
  
  let errorMessage = 'An unexpected error occurred';
  
  if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  // Handle specific Supabase error codes
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        errorMessage = 'No data found';
        break;
      case '23505':
        errorMessage = 'This record already exists';
        break;
      case '23503':
        errorMessage = 'Cannot delete record - it is referenced by other data';
        break;
      case '42501':
        errorMessage = 'You do not have permission to perform this action';
        break;
      default:
        if (error.message) {
          errorMessage = error.message;
        }
    }
  }
  
  toast({
    title: `${context} Failed`,
    description: errorMessage,
    variant: "destructive",
  });
  
  return errorMessage;
};

export const handleAdminSuccess = (message: string, context: string = 'Operation') => {
  toast({
    title: `${context} Successful`,
    description: message,
  });
};
