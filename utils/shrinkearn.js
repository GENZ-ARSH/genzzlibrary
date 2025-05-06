const shortenUrl = async () => {
    const fetch = (await import('node-fetch')).default;
    const apiKey = '75b57c4de11b3e75c8dc6483d76c7822d8a54dc7'; // ShrinkEarn API key
    const urlToShorten = 'https://genzzlibrary.vercel.app/home.html'; // Hardcoded URL to shorten
    console.log('Using ShrinkEarn API key:', apiKey);
    console.log('URL to shorten:', urlToShorten);

    const apiUrl = `https://shrinkearn.com/api?api=${apiKey}&url=${encodeURIComponent(urlToShorten)}`;
    
    console.log('Calling ShrinkEarn API:', apiUrl);

    try {
        const response = await fetch(apiUrl);
        console.log('ShrinkEarn API response status:', response.status);
        if (!response.ok) {
            throw new Error(`ShrinkEarn API responded with status: ${response.status}`);
        }
        const data = await response.json();
        console.log('ShrinkEarn API response data:', data);

        if (data.status === 'success' && data.shortenedUrl) {
            console.log('Successfully shortened URL:', data.shortenedUrl);
            return data.shortenedUrl;
        } else {
            throw new Error(data.message || 'Failed to shorten URL: Invalid response from ShrinkEarn');
        }
    } catch (error) {
        console.error('Error shortening URL:', error.message);
        throw error; // Throw the error so the caller can handle it
    }
};

module.exports = shortenUrl;
