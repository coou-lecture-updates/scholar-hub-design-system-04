
import { supabase } from '@/integrations/supabase/client';

export interface FileUploadResult {
  url: string;
  filePath: string;
  fileId: string;
}

export const uploadFileToSupabase = async (
  file: File,
  bucket: string = 'files',
  folder: string = 'uploads'
): Promise<FileUploadResult> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Upload file to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    // Record file in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('file_uploads')
      .insert([
        {
          filename: fileName,
          original_filename: file.name,
          file_path: filePath,
          mime_type: file.type,
          file_size: file.size,
          is_public: true,
          upload_context: folder
        }
      ])
      .select()
      .single();

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Don't throw here, file is uploaded successfully
    }

    return {
      url: publicUrl,
      filePath,
      fileId: fileRecord?.id || ''
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};

export const deleteFileFromSupabase = async (filePath: string, bucket: string = 'files') => {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }

    // Also remove from database
    await supabase
      .from('file_uploads')
      .delete()
      .eq('file_path', filePath);

  } catch (error) {
    console.error('File delete error:', error);
    throw error;
  }
};
