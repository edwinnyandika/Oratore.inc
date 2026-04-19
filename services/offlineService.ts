
type OfflineAction = {
  id: string;
  type: 'SEND_EMAIL' | 'SEND_WHATSAPP' | 'SYNC_DATABASE';
  payload: any;
  timestamp: number;
};

class OfflineManager {
  private queue: OfflineAction[] = [];

  constructor() {
    const saved = localStorage.getItem('invoicely_offline_queue');
    if (saved) this.queue = JSON.parse(saved);

    window.addEventListener('online', () => this.processQueue());
  }

  enqueue(type: OfflineAction['type'], payload: any) {
    if (navigator.onLine) {
      this.execute(type, payload);
      return;
    }

    const action: OfflineAction = {
      id: crypto.randomUUID(),
      type,
      payload,
      timestamp: Date.now()
    };

    this.queue.push(action);
    this.save();
    console.log(`Action ${type} queued for sync.`);
  }

  private async processQueue() {
    if (this.queue.length === 0) return;
    
    console.log(`Processing ${this.queue.length} offline actions...`);
    for (const action of [...this.queue]) {
      try {
        await this.execute(action.type, action.payload);
        this.queue = this.queue.filter(a => a.id !== action.id);
        this.save();
      } catch (e) {
        console.error("Failed to sync action", action.id, e);
      }
    }
  }

  private async execute(type: OfflineAction['type'], payload: any) {
    // Logic for external triggers
    if (type === 'SEND_WHATSAPP') {
      const url = `https://wa.me/${payload.phone}?text=${encodeURIComponent(payload.message)}`;
      window.open(url, '_blank');
    }
    // Simulate API calls
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  private save() {
    localStorage.setItem('invoicely_offline_queue', JSON.stringify(this.queue));
  }
}

export const offlineManager = new OfflineManager();
