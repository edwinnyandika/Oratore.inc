
// This service handles client-side integrations for Payment Gateways.
// NOTE: For production, authorization and transaction verification must happen on a secure backend.

export const loadScript = (src: string, id: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
            resolve();
            return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.id = id;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
    });
};

export const initializePayPal = async (clientId: string, currency: string): Promise<void> => {
    try {
        /* Use any to access global window object for paypal SDK */
        const win = window as any;
        // Unload previous PayPal scripts if currency or client ID changes
        const existingScript = document.getElementById('paypal-sdk');
        if (existingScript) {
            existingScript.remove();
            if (win.paypal) delete win.paypal;
        }
        
        await loadScript(
            `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}`, 
            'paypal-sdk'
        );
    } catch (error) {
        console.error("PayPal SDK Load Error", error);
        throw error;
    }
};

export const initializePaystack = async (): Promise<void> => {
    try {
        await loadScript('https://js.paystack.co/v1/inline.js', 'paystack-sdk');
    } catch (error) {
        console.error("Paystack SDK Load Error", error);
        throw error;
    }
};

export interface PaymentResponse {
    success: boolean;
    reference?: string;
    message?: string;
}

// Handler for Paystack Popup
export const openPaystackPayment = (
    publicKey: string,
    email: string,
    amount: number, // In base currency units (e.g. Dollars, Cedis)
    currency: string,
    onSuccess: (reference: string) => void,
    onClose: () => void
) => {
    /* Use any to access global PaystackPop object loaded from external script */
    const win = window as any;
    if (!win.PaystackPop) {
        console.error("Paystack SDK not loaded");
        return;
    }

    // Paystack expects amount in kobo/cents (lowest currency unit)
    // Exception: ZAR is usually managed carefully, but standard is * 100
    const amountInSubunits = Math.ceil(amount * 100);

    const handler = win.PaystackPop.setup({
        key: publicKey,
        email: email,
        amount: amountInSubunits,
        currency: currency,
        callback: function(response: any) {
            onSuccess(response.reference);
        },
        onClose: function() {
            onClose();
        }
    });

    handler.openIframe();
};
