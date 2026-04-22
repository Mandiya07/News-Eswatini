import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export const storageService = {
  /**
   * Uploads a file to Firebase Storage
   * @param file The file to upload
   * @param path The path in storage (e.g., 'articles/images' or 'profiles/videos')
   * @param onProgress Callback for upload progress
   * @returns The download URL of the uploaded file
   */
  uploadFile(
    file: File, 
    path: string, 
    onProgress?: (progress: number) => void
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      // Create a unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExtension}`;
      const storageRef = ref(storage, `${path}/${fileName}`);
      
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  },

  /**
   * Specifically upload a video
   */
  async uploadVideo(file: File, onProgress?: (progress: number) => void): Promise<string> {
    if (!file.type.startsWith('video/')) {
      throw new Error('File is not a video');
    }
    // Limit video size? Let's say 50MB for now
    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('Video file size exceeds 50MB limit');
    }
    return this.uploadFile(file, 'videos', onProgress);
  },

  /**
   * Specifically upload an image
   */
  async uploadImage(file: File, onProgress?: (progress: number) => void): Promise<string> {
    if (!file.type.startsWith('image/')) {
      throw new Error('File is not an image');
    }
    return this.uploadFile(file, 'images', onProgress);
  }
};
