const axios = require('axios');

exports.getMeizituList = async (id) => {
    const contentUrl = `http://adr.meizitu.net/wp-json/wp/v2/i?id=${id}`;
    const contentResponse = await axios({
        method: 'get',
        url: contentUrl,
    });
    console.log(contentResponse);
    const content = contentResponse.data.content.split(',');
    return content.map((url) => {
        url = url.replace(/"/g, '');
        return url;
        // return `<img referrerpolicy="no-referrer" src="${url}"><br />`;
    });
};
