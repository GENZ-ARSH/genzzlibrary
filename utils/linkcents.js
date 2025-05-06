const shortenUrl = async (url) => {
    const fetch = (await import('node-fetch')).default;
    const apiKey = 'bb22911fe37d3daa0c26c1f50b43a7a8804b80d4'; // Replace with your actual LinkCents API key
    console.log('Using hardcoded LinkCents API key:', apiKey);

    const apiUrl = `https://linkcents.com/api?api=${apiKey}&url=${encodeURIComponent(url)}`;
    
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
        return url; // Fallback to original URL if shortening fails
    }
};

module.exports = shortenUrl;
