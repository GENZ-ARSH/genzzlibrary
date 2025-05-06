const shortenUrl = async (url) => {
    const fetch = (await import('node-fetch')).default; // Dynamic import for ESM
    const apiKey = process.env.LINKCENTS_API_KEY;
    console.log('LINKCENTS_API_KEY:', apiKey);

    // Use a publicly accessible URL instead of localhost
    const publicUrl = 'https://example.com/home'; // Replace with actual public URL after deployment
    const apiUrl = `https://linkcents.com/api?api=${apiKey}&url=${encodeURIComponent(publicUrl)}`;
    
    console.log('Linkcents API URL:', apiUrl);

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log('Linkcents response:', data);

        if (data.status === 'success' && data.shortenedUrl) {
            return data.shortenedUrl;
        } else {
            throw new Error(data.message || 'Failed to shorten URL');
        }
    } catch (error) {
        console.error('Error shortening URL:', error.message);
        return publicUrl; // Fallback to original URL if shortening fails
    }
};

module.exports = shortenUrl;
