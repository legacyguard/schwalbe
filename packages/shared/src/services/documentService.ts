
import { supabase } from '../supabase/client';

export interface Document {
  category: string;
  createdAt: string;
  filePath?: string;
  fileSize?: number;
  id: string;
  isEncrypted?: boolean;
  metadata?: Record<string, any>;
  mimeType?: string;
  name: string;
  notes?: string;
  tags?: string[];
  updatedAt: string;
  userId: string;
}

export class DocumentService {
  /**
   * Fetch all documents for the current user
   */
  static async getDocuments(userId: string): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single document by ID
   */
  static async getDocument(documentId: string): Promise<Document | null> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error) {
      console.error('Error fetching document:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create a new document
   */
  static async createDocument(document: Partial<Document>): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .insert([document])
      .select()
      .single();

    if (error) {
      console.error('Error creating document:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update an existing document
   */
  static async updateDocument(
    documentId: string,
    updates: Partial<Document>
  ): Promise<Document> {
    const { data, error } = await supabase
      .from('documents')
      .update(updates)
      .eq('id', documentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating document:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a document
   */
  static async deleteDocument(documentId: string): Promise<void> {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }

  /**
   * Upload a document file
   */
  static async uploadFile(
    file: Blob | File,
    path: string
  ): Promise<{ path: string; url: string }> {
    const { data, error } = await supabase.storage
      .from('documents')
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Error uploading file:', error);
      throw error;
    }

    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(data.path);

    return {
      path: data.path,
      url: urlData.publicUrl,
    };
  }

  /**
   * Get documents by category
   */
  static async getDocumentsByCategory(
    userId: string,
    category: string
  ): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('userId', userId)
      .eq('category', category)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error fetching documents by category:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Search documents
   */
  static async searchDocuments(
    userId: string,
    query: string
  ): Promise<Document[]> {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('userId', userId)
      .or(`name.ilike.%${query}%,notes.ilike.%${query}%`)
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Error searching documents:', error);
      throw error;
    }

    return data || [];
  }
}
