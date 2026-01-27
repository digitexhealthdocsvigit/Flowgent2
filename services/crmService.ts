import { insforge } from '../lib/insforge';
import { Deal, DealNote, DealTask } from '../types';

// Types for our CRM data
interface CrmDeal {
  id: string;
  business_name: string;
  value: number;
  stage: string;
  service_tier?: string;
  pitch_type?: string;
  created_at: string;
  updated_at: string;
}

interface CrmNote {
  id: string;
  deal_id: string;
  text: string;
  author: string;
  created_at: string;
}

interface CrmTask {
  id: string;
  deal_id: string;
  title: string;
  due_date: string;
  is_completed: boolean;
  created_at: string;
}

// Deal operations
export const dealOperations = {
  getAll: async (): Promise<Deal[]> => {
    try {
      const { data, error } = await insforge.database
        .from('deals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database records to our Deal type
      return (data || []).map(deal => ({
        id: deal.id,
        businessName: deal.business_name,
        value: deal.value,
        stage: deal.stage,
        service_tier: deal.service_tier,
        pitch_type: deal.pitch_type,
        created_at: deal.created_at,
        updated_at: deal.updated_at,
        notes: [], // Will be populated separately
        tasks: []  // Will be populated separately
      }));
    } catch (error) {
      console.error('Error fetching deals:', error);
      return [];
    }
  },

  getById: async (id: string): Promise<Deal | null> => {
    try {
      const { data, error } = await insforge.database
        .from('deals')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      // Also fetch related notes and tasks
      const [notes, tasks] = await Promise.all([
        noteOperations.getByDealId(id),
        taskOperations.getByDealId(id)
      ]);

      return {
        id: data.id,
        businessName: data.business_name,
        value: data.value,
        stage: data.stage,
        service_tier: data.service_tier,
        pitch_type: data.pitch_type,
        created_at: data.created_at,
        updated_at: data.updated_at,
        notes,
        tasks
      };
    } catch (error) {
      console.error('Error fetching deal:', error);
      return null;
    }
  },

  create: async (deal: Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'notes' | 'tasks'>): Promise<Deal | null> => {
    try {
      const { data, error } = await insforge.database
        .from('deals')
        .insert([{
          business_name: deal.businessName,
          value: deal.value,
          stage: deal.stage,
          service_tier: deal.service_tier,
          pitch_type: deal.pitch_type
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        businessName: data.business_name,
        value: data.value,
        stage: data.stage,
        service_tier: data.service_tier,
        pitch_type: data.pitch_type,
        created_at: data.created_at,
        updated_at: data.updated_at,
        notes: [],
        tasks: []
      };
    } catch (error) {
      console.error('Error creating deal:', error);
      return null;
    }
  },

  update: async (id: string, updates: Partial<Deal>): Promise<boolean> => {
    try {
      const { error } = await insforge.database
        .from('deals')
        .update({
          business_name: updates.businessName,
          value: updates.value,
          stage: updates.stage,
          service_tier: updates.service_tier,
          pitch_type: updates.pitch_type,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating deal:', error);
      return false;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await insforge.database
        .from('deals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting deal:', error);
      return false;
    }
  },

  moveStage: async (id: string, direction: 'forward' | 'backward'): Promise<boolean> => {
    try {
      // First get the current deal to determine its stage
      const deal = await dealOperations.getById(id);
      if (!deal) return false;

      const stages: Deal['stage'][] = ['Discovered', 'Contacted', 'Engaged', 'Qualified', 'Converted'];
      const currentIndex = stages.indexOf(deal.stage as Deal['stage']);
      
      if (currentIndex === -1) return false;

      let newIndex = currentIndex;
      if (direction === 'forward' && currentIndex < stages.length - 1) {
        newIndex = currentIndex + 1;
      } else if (direction === 'backward' && currentIndex > 0) {
        newIndex = currentIndex - 1;
      }

      if (newIndex !== currentIndex) {
        return await dealOperations.update(id, { stage: stages[newIndex] });
      }
      
      return true;
    } catch (error) {
      console.error('Error moving deal stage:', error);
      return false;
    }
  }
};

// Note operations
export const noteOperations = {
  getByDealId: async (dealId: string): Promise<DealNote[]> => {
    try {
      const { data, error } = await insforge.database
        .from('deal_notes')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(note => ({
        id: note.id,
        text: note.text,
        author: note.author,
        created_at: note.created_at
      }));
    } catch (error) {
      console.error('Error fetching notes:', error);
      return [];
    }
  },

  create: async (dealId: string, text: string, author: string = 'User'): Promise<DealNote | null> => {
    try {
      const { data, error } = await insforge.database
        .from('deal_notes')
        .insert([{
          deal_id: dealId,
          text,
          author,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        text: data.text,
        author: data.author,
        created_at: data.created_at
      };
    } catch (error) {
      console.error('Error creating note:', error);
      return null;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await insforge.database
        .from('deal_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  }
};

// Task operations
export const taskOperations = {
  getByDealId: async (dealId: string): Promise<DealTask[]> => {
    try {
      const { data, error } = await insforge.database
        .from('deal_tasks')
        .select('*')
        .eq('deal_id', dealId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(task => ({
        id: task.id,
        title: task.title,
        due_date: task.due_date,
        is_completed: task.is_completed,
        created_at: task.created_at
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  },

  create: async (dealId: string, title: string, dueDate?: string): Promise<DealTask | null> => {
    try {
      const { data, error } = await insforge.database
        .from('deal_tasks')
        .insert([{
          deal_id: dealId,
          title,
          due_date: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Default to 1 week from now
          is_completed: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        title: data.title,
        due_date: data.due_date,
        is_completed: data.is_completed,
        created_at: data.created_at
      };
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  },

  update: async (id: string, updates: Partial<DealTask>): Promise<boolean> => {
    try {
      const { error } = await insforge.database
        .from('deal_tasks')
        .update({
          title: updates.title,
          due_date: updates.due_date,
          is_completed: updates.is_completed,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  },

  delete: async (id: string): Promise<boolean> => {
    try {
      const { error } = await insforge.database
        .from('deal_tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }
};