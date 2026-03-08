import { Platform } from 'react-native';

/**
 * Robust API helper to call the backend scan-medicine endpoint.
 * Robustly handles both Blob (Web) and URI (Native) image data formats.
 */
export async function scanMedicineImage(imageUri: string) {
    try {
        console.log(`[API Helper] Preparing image upload for: ${imageUri}`);

        const formData = new FormData() as any;

        // Step 1: Handle image format conversion based on platform context
        if (Platform.OS === 'web') {
            // Check if it is a base64 encoded string or a URL
            const response = await fetch(imageUri);
            const blob = await response.blob();
            formData.append('image', blob, `${Date.now()}-captured.jpg`);
        } else {
            // Handle native URI formatting
            const filename = imageUri.split('/').pop() || 'mobile-capture.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('image', {
                uri: imageUri,
                name: filename,
                type: type,
            });
        }

        // Use the IP Address if testing on a physical mobile device, 
        // Or localhost if testing on browser/emulator
        const baseUrl = 'http://127.0.0.1:5200'; // Standard dev server port
        const url = `${baseUrl}/api/scan-medicine`;

        console.log(`[API Helper] Sending POST request to: ${url}`);

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
            },
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`[API Helper Error] Server responded with code ${response.status}:`, data.message);
            throw new Error(data.message || 'The server encountered an error processing the image.');
        }

        console.log(`[API Helper] Scan success for: ${data.medicine?.medicine_name || 'unknown'}`);
        return data;

    } catch (error: any) {
        console.error("[API Helper Error] Failed to complete scan API call:", error.message || error);
        throw error;
    }
}
