
// NOTE: You must replace these values with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_API_KEY",
  authDomain: "REPLACE_WITH_YOUR_PROJECT.firebaseapp.com",
  projectId: "REPLACE_WITH_YOUR_PROJECT_ID",
  storageBucket: "REPLACE_WITH_YOUR_PROJECT.appspot.com",
  messagingSenderId: "REPLACE_WITH_YOUR_SENDER_ID",
  appId: "REPLACE_WITH_YOUR_APP_ID"
};

// Replace with your VAPID key from Project Settings > Cloud Messaging > Web Push certificates
const VAPID_KEY = "REPLACE_WITH_YOUR_VAPID_KEY";

export const initNotifications = async (): Promise<string | null> => {
  /* Use any to access global firebase object loaded from external script */
  const win = window as any;
  if (typeof win !== 'undefined' && win.firebase) {
    try {
      if (!win.firebase.apps.length) {
        win.firebase.initializeApp(firebaseConfig);
        console.log("Firebase initialized");
      }

      const messaging = win.firebase.messaging();
      
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        try {
            const token = await messaging.getToken({ vapidKey: VAPID_KEY });
            if (token) {
                console.log("FCM Token:", token);
                return token;
            } else {
                console.warn("No registration token available. Request permission to generate one.");
            }
        } catch (e) {
            // Likely VAPID key is missing or invalid config in this demo
            console.warn("FCM getToken failed. Ensure VAPID key is set in services/notificationService.ts");
        }
      } else {
        console.log("Notification permission denied");
      }
    } catch (error) {
      console.error("Firebase Initialization Error:", error);
    }
  }
  return null;
};

export const sendLocalNotification = (title: string, body: string) => {
  if (!("Notification" in window)) {
    return;
  }

  if (Notification.permission === 'granted') {
    try {
        new Notification(title, { 
            body, 
            icon: 'https://cdn-icons-png.flaticon.com/512/2933/2933116.png' // Generic invoice icon
        });
    } catch (e) {
        console.error("Error sending notification:", e);
    }
  }
};

export const checkOverdueInvoices = (invoices: any[]) => {
    const today = new Date();
    const overdue = invoices.filter(inv => {
        if (inv.status === 'Paid') return false;
        const dueDate = new Date(inv.dueDate);
        return dueDate < today && inv.status !== 'Overdue';
    });

    if (overdue.length > 0) {
        const count = overdue.length;
        sendLocalNotification(
            "Overdue Invoices Alert", 
            `You have ${count} invoice${count > 1 ? 's' : ''} that need attention.`
        );
        return true;
    }
    return false;
}
