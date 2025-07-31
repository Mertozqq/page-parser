// @todo: напишите здесь код парсера

function parseMeta() {
    const meta = {};
    let title;
    let description; // done
    const keywords = []; // done
    const language = document.querySelector('html').getAttribute('lang').trim(); // done
    const opengraph = {}; // done
    let encoding; // done

    document.querySelectorAll('meta').forEach((element) => {
        if (element.hasAttribute('charset')) {
            encoding = element.getAttribute('charset').trim();
        }
        else if (element.hasAttribute('name')) {
            if (element.getAttribute('name') == 'keywords') {
               element.getAttribute('content').trim().split(', ').forEach((element) => keywords.push(element.trim()));
            }
            else if (element.getAttribute('name') == 'description') {
                description = element.getAttribute('content').trim();
            }
        }
        else if (element.hasAttribute('property')) {
            if (element.getAttribute('property') == 'og:title') {
                opengraph.title = element.getAttribute('content').trim().split('—')[0].trim();
            }
            else if (element.getAttribute('property') == 'og:image') {
                opengraph.image = element.getAttribute('content').trim();
            }
            else if (element.getAttribute('property') == 'og:type') {
                opengraph.type = element.getAttribute('content').trim();
            }
            // Общий случай
            else {
                opengraph[`${element.getAttribute('property').trim().split(':')[1]}`] = element.getAttribute('content').trim();
            }
        }
    })

    title = document.querySelector('title').textContent.trim().split('—')[0].trim();

    meta['title'] = title;
    meta['description'] = description;
    meta['keywords'] = keywords;
    meta['language'] = language;
    meta['opengraph'] = opengraph;
    // meta['encoding'] = encoding;
    return meta;
}

function parseProduct() {
    const product = {};
    const id = document.querySelector('main .product').dataset.id.trim();
    const images = [];
    const tags = {'category': [],
        'discount': [],
        'label': [],
    };
    const properties = {};
    let isLiked = false;
    let name;
    let price;
    let oldPrice;
    let discount;
    let discountPercent;
    let currency;

    let description;

    document.querySelector('main .preview').children[1].querySelectorAll('button').forEach((element) => {
        const image = {};
        image['preview'] = element.children[0].getAttribute('src').trim();
        image['full'] = element.children[0].dataset.src.trim();
        image['alt'] = element.children[0].getAttribute('alt').trim();
        images.push(image);
    });

    isLiked = document.querySelector('main .preview').children[0].querySelector('button').classList.contains('active');
    
    for (element of document.querySelector('.about').children) {
        if (element.classList.contains('title')) {
            name = element.textContent.trim();
        }
        // 
        if (element.classList.contains('tags')) {
            for (tag of element.children) {
                if (tag.classList.contains('green')) {
                    tags['category'].push(tag.textContent.trim());
                }
                else if (tag.classList.contains('blue')) {
                    tags['label'].push(tag.textContent.trim());
                }
                else if (tag.classList.contains('red')) {
                    tags['discount'].push(tag.textContent.trim());
                }
            }
        }
        if (element.classList.contains('price')) {
            const prices = [];
            element.textContent.trim().split('\n').forEach((str, index) => {
                str = str.split(/(\d+)/)
                if (index != 0) {
                    prices.push(parseInt(str[1].trim()));
                }
                else {
                    prices.push(str[0]);
                    prices.push(parseInt(str[1].trim()));
                }
            });
            price = prices[1];
            oldPrice = prices[2];
            discount = oldPrice - price;
            discountPercent = `${((1 - (price / oldPrice)) * 100).toFixed(2)}%`;
            if (prices[0] == '₽') {
                currency = 'RUB';
            }
            if (prices[0] == '$') {
                currency = 'USD';
            }
            if (prices[0] == '€') {
                currency = 'EUR';
            }
        }
        if (element.classList.contains('properties')) {
            for (child of element.children) {
                const contentList = child.textContent.trim().split('\n');
                (contentList.forEach((val, index) => {
                    contentList[index] = val.trim();
                }))
                properties[`${contentList[0]}`] = contentList[1];
            }
        }
        if (element.classList.contains('description')) {
            description = element.innerHTML.replace(/\s*class\s*=\s*"[^"]*"\s*/g, '').trim();
        }
    }
    product['id'] = id;
    product['name'] = name;
    product['isLiked'] = isLiked;
    product['tags'] = tags;
    product['price'] = price;
    product['oldPrice'] = oldPrice;
    product['discount'] = discount;
    product['discountPercent'] = discountPercent;
    product['currency'] = currency;
    product['properties'] = properties;
    product['description'] = description;
    product['images'] = images;

    return product;
}

function parseSuggested() {
    const suggested = [];
    const extraProducts = document.querySelectorAll('main .suggested article');
    for (element of extraProducts) {
        const extraProduct = {};
        extraProduct['image'] = element.querySelector("img").getAttribute('src');
        extraProduct['name'] = element.querySelector('h3').textContent.trim();
        extraProduct['description'] = element.querySelector('p').textContent.trim();
        const priceList = element.querySelector('b').textContent.split(/(\d+)/);
        extraProduct['price'] = priceList[1];
        if (priceList[0] == '₽') {
            extraProduct['currency'] = 'RUB';
        }
        if (priceList[0] == '$') {
            extraProduct['currency'] = 'USD';
        }
        if (priceList[0] == '€') {
            extraProduct['currency'] = 'EUR';
        }
        suggested.push(extraProduct);
    }
    return suggested;
}

function parseReviews() {
    const reviews = [];
    const feedbacks = document.querySelectorAll('main .reviews article');
    for (element of feedbacks) {
        const feedback = {};
        const author = {};
        feedback['rating'] = element.querySelectorAll('.rating .filled').length;

        author['avatar'] = element.querySelector('.author img').getAttribute('src');
        author['name'] = element.querySelector('.author span').textContent.trim();
        feedback['author'] = author;
        feedback['title'] = element.querySelector('.title').textContent.trim();
        feedback['description'] = element.querySelector('div p').textContent.trim();

        feedback['date'] = element.querySelector('i').textContent.trim().replace(/\//g, '.');

        reviews.push(feedback);
        
    }
    return reviews
}

function parsePage() {    
    
    const meta = parseMeta();
    const product = parseProduct();
    const suggested = parseSuggested();
    const reviews = parseReviews();
    return {
        meta,
        product,
        suggested,
        reviews
    };
}

window.parsePage = parsePage;