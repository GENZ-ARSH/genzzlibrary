const shortenUrl = async () => {
    const fetch = (await import('node-fetch')).default;
    const apiKey = 'bb22911fe37d3daa0c26c1f50b43a7a8804b80d4'; // Hardcoded LinkCents API key
    const urlToShorten = 'https://genzzlibrary.vercel.app/home.html'; // Hardcoded URL to shorten
    console.log('Using hardcoded LinkCents API key:', apiKey);
    console.log('URL to shorten:', urlToShorten);

    const apiUrl = `https://linkcents.com/api?api=${apiKey}&url=${encodeURIComponent(urlToShorten)}`;
    
    console.log('Linkcents API URL:', apiUrl);

    try {
        const response = await fetch(apiUrl);
        console.log('Linkcents API response status:', response.status);
        const data = await response.json();
        console.log('Linkcents API response data:', data);

        if (data.status === 'success' && data.shortenedUrl) {
            console.log('Successfully shortened URL:', data.shortenedUrl);
            return data.shortenedUrl;
        } else {
            throw new Error(data.message || 'Failed to shorten URL: Invalid response from LinkCents');
        }
    } catch (error) {
        console.error('Error shortening URL:', error.message);
        throw error; // Throw the error so the caller can handle it
    }
};

module.exports = shortenUrl;
