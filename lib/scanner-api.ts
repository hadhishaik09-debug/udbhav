import { Platform } from 'react-native';

/**
 * Frontend API helper to call the backend scan-medicine endpoint.
 */
export async function scanMedicineImage(imageUri: string) {
    try {
        const formData = new FormData() as any;

        // In React Native, we need to provide name and type for the file
        if (Platform.OS === 'web') {
            // Handle web base64 or blob
            const response = await fetch(imageUri);
            const blob = await response.blob();
            formData.append('image', blob, 'capture.jpg');
        } else {
            // Handle mobile URI
            const filename = imageUri.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('image', {
                uri: imageUri,
                name: filename,
                type: type,
            });
        }

        // Replace with actual server host if not using localhost (e.g., when testing on mobile)
        // For local dev on Android emulator, use 10.0.2.2. For physical, use IP.
        // Assuming backend is proxying or reachable.
        const baseUrl = Platform.OS === 'web' ? '' : 'http://localhost:5000'; // Adjust as needed

        // Let's use the local URL which we're running in the terminal.
        // If we're on web, "/" works since they're served together.
        // On native, we might need the actual IP.
        const url = `${baseUrl}/api/scan-medicine`;

        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Server error uploading image');
        }

        return await response.json();
    } catch (error) {
        console.error("Scan API error:", error);
        throw error;
    }
}
