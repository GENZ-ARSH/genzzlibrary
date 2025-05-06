const shortenUrl = async () => {
    const fetch = (await import('node-fetch')).default;
    const apiKey = '4244bdce026165107ecd9303ca7346f99aaf6e6d'; // Updated LinkCents API key
    const urlToShorten = 'https://genzzlibrary.vercel.app/home.html'; // Hardcoded URL to shorten
    console.log('Using LinkCents API key:', apiKey);
    console.log('URL to shorten:', urlToShorten);

    const apiUrl = `https://linkcents.com/api?api=${apiKey}&url=${encodeURIComponent(urlToShorten)}`;
    
    console.log('Calling LinkCents API:', apiUrl);

    try {
        const response = await fetch(apiUrl);
        console.log('LinkCents API response status:', response.status);
        if (!response.ok) {
            throw new Error(`LinkCents API responded with status: ${response.status}`);
        }
        const data = await response.json();
        console.log('LinkCents API response data:', data);

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
