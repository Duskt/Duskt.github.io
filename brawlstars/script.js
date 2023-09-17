const checkColor = (bool) => bool ? "green" : "red"

const getAssociatedDescription = (node) => {
    // uses custom property 'bsCellSpan', which takes unmerged (accounts for colSpan) cell index
    // cache
    if (node.bsCellSpan == null) {
        node.bsCellSpan = 0;
        for (let i of node.parentElement.children) {
            node.bsCellSpan += (i.colSpan ?? 1);
            if (i === node) { break }
        }
    }
    let cellSpan = 0;
    // note to self - always remember to include let in the for loop!
    for (let i of node.parentElement.previousSibling.children) {
        cellSpan += (i.colSpan ?? 1)
        if (cellSpan >= node.bsCellSpan) { return i.textContent }
    }
}

const idify = (string) => {
    for (let i of " -.,") {
        string = string.replaceAll(i, '');
    }
    return string.replaceAll('ó', 'o').toLowerCase();
}

const getStoreId = (node, page) => {
    // cache
    if (node.bsStoreId != null) {
        return node.bsStoreId
    }
    // get the brawlers name by taking the previous row's first cell
    let name;
    if (page.toLowerCase() == "brawlers") {
        let upperRowChildren = node.parentElement?.previousSibling?.children;
        if (upperRowChildren == undefined) { return null }
        name = upperRowChildren[1].textContent;
    } else {
        // up three rows, take the first cell (not row id)
        let nameMatch = node.parentElement
            .previousSibling.previousSibling.previousSibling
            .children[1].textContent
            .match(/(.+?)-/);
        if (nameMatch == null) { return null }
        name = nameMatch[1]
    }
    // get the first part of the skin description
    let skin = getAssociatedDescription(node).match(/^([\w\d\-\.ó ]+\w)\s?/m);
    if (skin === null) { return null }
    skin = skin[1]
    // make an id
    return node.bsStoreId = `brawlstars-${idify(page)}-${idify(name)}-${idify(skin)}`
}

function checkBox(page, e) {
    // since e.target can be anything inside the element with the event listen
    // we need to get to the parent we set the actual event listener on
    let td = e.target;
    while (td.tagName !== 'TD') { td = td.parentElement; }

    let bsStoreId = getStoreId(td, page);
    if (bsStoreId === null) { return }
    // if unset, then !undefined == true, which works
    let newValue = !localStorage[getStoreId(td, page)];
    td.style['background'] = checkColor(newValue);
    if (newValue) {
        localStorage[getStoreId(td, page)] = newValue;
    } else {
        // worth it?
        delete localStorage[getStoreId(td, page)]
    }
}

const generateCheckBoxFunction = (page) => ((e) => checkBox(page, e));

document.addEventListener('DOMContentLoaded', () => {
    ['Brawlers', 'Icons', 'Pins', 'Sprays'].forEach((page) => {
        $(`#${page.toLowerCase()}`)[0].onclick = () => {
            // this will cause a get error to the css page, but we loaded that separately.
            $('main')[0].replaceWith(document.createElement('main'));
            $('main').load(`bs/${page}.html`, () => {
                for (let i of document.querySelectorAll('td:has(svg)')) {
                    if (getStoreId(i, page) == null) { continue }
                    i.style['background'] = checkColor(localStorage[getStoreId(i, page)] ?? false);
                    i.onclick = generateCheckBoxFunction(page);
                }
            })
        }
    });
});