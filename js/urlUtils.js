function getParameterFromUrl(paramName) {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedString = urlParams.get(paramName);
    if (encodedString === null) return null;
    // Decode the URL-encoded string
    const tabDelimitedString = decodeURIComponent(encodedString);
	console.log(tabDelimitedString);
    return tabDelimitedString;
}
function tabDelimitedStringToUrlParameter(tabDelimitedString, paramName) {
    // Encode the tab-delimited string
    const encodedString = encodeURIComponent(tabDelimitedString);
    // Create the URL parameter
    const urlParameter = `${paramName}=${encodedString}`;
    return urlParameter;
}

