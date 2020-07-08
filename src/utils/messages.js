const generateMessage = (text, name) => {
    return {
        text,
        name,
        createAt: new Date().getTime()
    }
}

const generateGeolocationMessage = (url, name) => {
    return {
        url,
        name,
        createAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateGeolocationMessage
}