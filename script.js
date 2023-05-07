const chatPattern = /(.+?]\s+?[+^%@#&]*)(.+?:)(.+)/
const rawMsgPattern = /\|c:\|\d+\|~\|(.+)\n*/

const gameDocIDs = {
    1: "1UyPVHFaW72u-Q0tF4r-gxZwzmn_KuHmf5Tfw0ERWZas",
    2: "1z3uJI2AzU2_I5Hcae7MuVctUJFsIrgGaEo63VeefM78",
    3: "1z9u102edketyy6KOIqvMnYvAzzqLKlqVUxMBPnFaHR0",
    4: "1zbkvojK8XVNu0nKC7udtpgejFEkImzHev1V4AalvzxA",
    5: "1JKPaRP8B5e6igzqbY1hM2KivGDrcy33_B-IENJ_TWEE",
    6: "1mSDhrF7Bg0HKtIlk9tb_v1exCE4s7TaO0LpYRUdJ7MY",
    7: "1UHfDYVPglRTk2Shr7G-RFoP3FQXfXPprTV3xP6KQIAY",
    8: "1ToctzdVU8XbJPjKBWFEuB3AOyIJ84OnSs9Vtal1IAWI",
    // extra weeks
    9: "1MZ3hEXzPUleuGqENf50REf6glH72yDf7CIS5b2QgNVo",
    10: "",
    11: "",
    12: "",
}

// GLOBALS
var colorTheme = "dark" // "dark" | "light"
var selectedChat = undefined;
var loadedGame = undefined;

document.addEventListener("DOMContentLoaded", function(event) {
    // set colorTheme
    chatbox.classList.add(colorTheme);

    // generate game options
    let dropdown = document.getElementById("game-select");
    let button = document.getElementById("load-game");
    button.onclick = () => {
        if (dropdown.value) {getGameLogs(Number(dropdown.value))}
    };
    for (let gameNo in gameDocIDs) {
        let option = document.createElement('option');
        option.value = gameNo.toString();
        option.textContent = "Game " + option.value;
        // disabled if there is no link
        if (gameDocIDs[gameNo] === "") {
            option.disabled = true
        }
        dropdown.appendChild(option);
    }
});

function fetchLogs(url) {
    const xmlHttp = new XMLHttpRequest();
    xmlHttp.open( "GET", url, true );
    xmlHttp.send();
    return xmlHttp.responseText;
}

function changeTheme() {
    // binary alternates - refactor if adding new themes
    let chatbox = document.getElementById("chatbox");
    let button = document.getElementById("theme");
    button.textContent = colorTheme[0].toUpperCase() + colorTheme.slice(1) + " mode";
    chatbox.classList.remove(colorTheme);
    colorTheme = colorTheme === "light" ? "dark" : "light"
    chatbox.classList.add(colorTheme);
}

function selectMessage(chat) {
    // highlight
    if (selectedChat) {
        selectedChat.classList.remove("highlight");
    }
    chat.classList.add("highlight");
    selectedChat = chat;

    // get comment and put in textarea
    let textarea = document.getElementById("comment");
    comment = localStorage[chat.id];
    if (comment !== undefined) {
        textarea.value = comment;
    } else {
        textarea.value = "";
    }
}

function clearCache() {
    if (confirm("Delete your comments for all games? (Clears localStorage)")) {
        localStorage.clear();
    }
    let comment = document.getElementById("comment");
    comment.value = "";
}

function setComment() {
    if (selectedChat === undefined) {
        alert("No message selected.");
        return
    }
    let textarea = document.getElementById("comment");
    localStorage[selectedChat.id] = textarea.value;
}

function displayLogs(logs) {
    let chatbox = document.getElementById("chatbox");
    let notes = document.getElementById("notes");
    notes.hidden = false;

    let index = 0
    for (line of logs.split('\n')) { 
        let chat = document.createElement("div");
        chat.setAttribute('id', loadedGame.toString() + '-' + index.toString());
        index++;
        chat.addEventListener("click", () => {selectMessage(chat)});
        chat.classList.add('chat');

        // is raw message? (|c:|)
        let match = line.match(rawMsgPattern);
        if (match !== null) {
            chat.textContent = match[1];
            chatbox.appendChild(chat);
            continue
        }

        // matches message or plaintext?
        match = line.match(chatPattern);
        if (match === null) {
            // plaintext
            chat.textContent = line;
            chatbox.appendChild(chat);
            continue
        }

        // message
        timestamp = document.createElement("small");
        username = document.createElement("strong");
        msg = document.createElement("em");

        timestamp.textContent = match[1];
        username.textContent = match[2];
        msg.textContent = match[3];
        
        username.style['color'] = BattleLog.usernameColor(toID(username.textContent))

        chat.appendChild(timestamp);
        chat.appendChild(username);
        chat.appendChild(msg);
        chatbox.appendChild(chat);
    }
}

function getGameLogs(gameNo) {
    // Reset state
    let chatbox = document.getElementById("chatbox");
    let notes = document.getElementById("notes");
    let comment = document.getElementById("comment");
    selectedChat = undefined;
    chatbox.hidden = false;
    chatbox.textContent = "Loading...";
    notes.hidden = true;
    comment.value = "";

    let docID = gameDocIDs[gameNo];
    const url = "https://docs.google.com/document/d/" + docID + "/export?format=txt";
    fetch(url)
        .then((resp) => resp.text())
        .then((text) => {
            chatbox.textContent = "";
            loadedGame = gameNo;
            displayLogs(text);
        })
        .catch((reason) => {
            chatbox.textContent = "Failed.";
        })
}

function toID(username) {
    return [...username.toLowerCase()].filter((i) => [..."abcdefghijklmnopqrstuvwxyz0123456789"].includes(i)).join('');
}

var BattleLog = /** @class */ (function () {
    function BattleLog() {
    }
    BattleLog.usernameColor = function (name) {
        if (this.colorCache[name])
            return this.colorCache[name];
        var hash;
        if (name === 'om') {
            return '#cb1020'
        } else {
            hash = MD5(name);
        }
        var H = parseInt(hash.substr(4, 4), 16) % 360; // 0 to 360
        var S = parseInt(hash.substr(0, 4), 16) % 50 + 40; // 40 to 89
        var L = Math.floor(parseInt(hash.substr(8, 4), 16) % 20 + 30); // 30 to 49
        var _a = this.HSLToRGB(H, S, L), R = _a.R, G = _a.G, B = _a.B;
        var lum = R * R * R * 0.2126 + G * G * G * 0.7152 + B * B * B * 0.0722; // 0.013 (dark blue) to 0.737 (yellow)
        var HLmod = (lum - 0.2) * -150; // -80 (yellow) to 28 (dark blue)
        if (HLmod > 18)
            HLmod = (HLmod - 18) * 2.5;
        else if (HLmod < 0)
            HLmod = (HLmod - 0) / 3;
        else
            HLmod = 0;
        // let mod = ';border-right: ' + Math.abs(HLmod) + 'px solid ' + (HLmod > 0 ? 'red' : '#0088FF');
        var Hdist = Math.min(Math.abs(180 - H), Math.abs(240 - H));
        if (Hdist < 15) {
            HLmod += (15 - Hdist) / 3;
        }
        L += HLmod;
        var _b = this.HSLToRGB(H, S, L), r = _b.R, g = _b.G, b = _b.B;
        var toHex = function (x) {
            var hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        this.colorCache[name] = "#".concat(toHex(r)).concat(toHex(g)).concat(toHex(b));
        return this.colorCache[name];
    };
    BattleLog.HSLToRGB = function (H, S, L) {
        var C = (100 - Math.abs(2 * L - 100)) * S / 100 / 100;
        var X = C * (1 - Math.abs((H / 60) % 2 - 1));
        var m = L / 100 - C / 2;
        var R1;
        var G1;
        var B1;
        switch (Math.floor(H / 60)) {
            case 1:
                R1 = X;
                G1 = C;
                B1 = 0;
                break;
            case 2:
                R1 = 0;
                G1 = C;
                B1 = X;
                break;
            case 3:
                R1 = 0;
                G1 = X;
                B1 = C;
                break;
            case 4:
                R1 = X;
                G1 = 0;
                B1 = C;
                break;
            case 5:
                R1 = C;
                G1 = 0;
                B1 = X;
                break;
            case 0:
            default:
                R1 = C;
                G1 = X;
                B1 = 0;
                break;
        }
        var R = R1 + m;
        var G = G1 + m;
        var B = B1 + m;
        return { R: R, G: G, B: B };
    };
    BattleLog.colorCache = {};
    return BattleLog;
}());

function MD5(f){function i(b,c){var d,e,f,g,h;f=b&2147483648;g=c&2147483648;d=b&1073741824;e=c&1073741824;h=(b&1073741823)+(c&1073741823);return d&e?h^2147483648^f^g:d|e?h&1073741824?h^3221225472^f^g:h^1073741824^f^g:h^f^g}function j(b,c,d,e,f,g,h){b=i(b,i(i(c&d|~c&e,f),h));return i(b<<g|b>>>32-g,c)}function k(b,c,d,e,f,g,h){b=i(b,i(i(c&e|d&~e,f),h));return i(b<<g|b>>>32-g,c)}function l(b,c,e,d,f,g,h){b=i(b,i(i(c^e^d,f),h));return i(b<<g|b>>>32-g,c)}function m(b,c,e,d,f,g,h){b=i(b,i(i(e^(c|~d),
    f),h));return i(b<<g|b>>>32-g,c)}function n(b){var c="",e="",d;for(d=0;d<=3;d++)e=b>>>d*8&255,e="0"+e.toString(16),c+=e.substr(e.length-2,2);return c}var g=[],o,p,q,r,b,c,d,e,f=function(b){for(var b=b.replace(/\r\n/g,"\n"),c="",e=0;e<b.length;e++){var d=b.charCodeAt(e);d<128?c+=String.fromCharCode(d):(d>127&&d<2048?c+=String.fromCharCode(d>>6|192):(c+=String.fromCharCode(d>>12|224),c+=String.fromCharCode(d>>6&63|128)),c+=String.fromCharCode(d&63|128))}return c}(f),g=function(b){var c,d=b.length;c=
    d+8;for(var e=((c-c%64)/64+1)*16,f=Array(e-1),g=0,h=0;h<d;)c=(h-h%4)/4,g=h%4*8,f[c]|=b.charCodeAt(h)<<g,h++;f[(h-h%4)/4]|=128<<h%4*8;f[e-2]=d<<3;f[e-1]=d>>>29;return f}(f);b=1732584193;c=4023233417;d=2562383102;e=271733878;for(f=0;f<g.length;f+=16)o=b,p=c,q=d,r=e,b=j(b,c,d,e,g[f+0],7,3614090360),e=j(e,b,c,d,g[f+1],12,3905402710),d=j(d,e,b,c,g[f+2],17,606105819),c=j(c,d,e,b,g[f+3],22,3250441966),b=j(b,c,d,e,g[f+4],7,4118548399),e=j(e,b,c,d,g[f+5],12,1200080426),d=j(d,e,b,c,g[f+6],17,2821735955),c=
    j(c,d,e,b,g[f+7],22,4249261313),b=j(b,c,d,e,g[f+8],7,1770035416),e=j(e,b,c,d,g[f+9],12,2336552879),d=j(d,e,b,c,g[f+10],17,4294925233),c=j(c,d,e,b,g[f+11],22,2304563134),b=j(b,c,d,e,g[f+12],7,1804603682),e=j(e,b,c,d,g[f+13],12,4254626195),d=j(d,e,b,c,g[f+14],17,2792965006),c=j(c,d,e,b,g[f+15],22,1236535329),b=k(b,c,d,e,g[f+1],5,4129170786),e=k(e,b,c,d,g[f+6],9,3225465664),d=k(d,e,b,c,g[f+11],14,643717713),c=k(c,d,e,b,g[f+0],20,3921069994),b=k(b,c,d,e,g[f+5],5,3593408605),e=k(e,b,c,d,g[f+10],9,38016083),
    d=k(d,e,b,c,g[f+15],14,3634488961),c=k(c,d,e,b,g[f+4],20,3889429448),b=k(b,c,d,e,g[f+9],5,568446438),e=k(e,b,c,d,g[f+14],9,3275163606),d=k(d,e,b,c,g[f+3],14,4107603335),c=k(c,d,e,b,g[f+8],20,1163531501),b=k(b,c,d,e,g[f+13],5,2850285829),e=k(e,b,c,d,g[f+2],9,4243563512),d=k(d,e,b,c,g[f+7],14,1735328473),c=k(c,d,e,b,g[f+12],20,2368359562),b=l(b,c,d,e,g[f+5],4,4294588738),e=l(e,b,c,d,g[f+8],11,2272392833),d=l(d,e,b,c,g[f+11],16,1839030562),c=l(c,d,e,b,g[f+14],23,4259657740),b=l(b,c,d,e,g[f+1],4,2763975236),
    e=l(e,b,c,d,g[f+4],11,1272893353),d=l(d,e,b,c,g[f+7],16,4139469664),c=l(c,d,e,b,g[f+10],23,3200236656),b=l(b,c,d,e,g[f+13],4,681279174),e=l(e,b,c,d,g[f+0],11,3936430074),d=l(d,e,b,c,g[f+3],16,3572445317),c=l(c,d,e,b,g[f+6],23,76029189),b=l(b,c,d,e,g[f+9],4,3654602809),e=l(e,b,c,d,g[f+12],11,3873151461),d=l(d,e,b,c,g[f+15],16,530742520),c=l(c,d,e,b,g[f+2],23,3299628645),b=m(b,c,d,e,g[f+0],6,4096336452),e=m(e,b,c,d,g[f+7],10,1126891415),d=m(d,e,b,c,g[f+14],15,2878612391),c=m(c,d,e,b,g[f+5],21,4237533241),
    b=m(b,c,d,e,g[f+12],6,1700485571),e=m(e,b,c,d,g[f+3],10,2399980690),d=m(d,e,b,c,g[f+10],15,4293915773),c=m(c,d,e,b,g[f+1],21,2240044497),b=m(b,c,d,e,g[f+8],6,1873313359),e=m(e,b,c,d,g[f+15],10,4264355552),d=m(d,e,b,c,g[f+6],15,2734768916),c=m(c,d,e,b,g[f+13],21,1309151649),b=m(b,c,d,e,g[f+4],6,4149444226),e=m(e,b,c,d,g[f+11],10,3174756917),d=m(d,e,b,c,g[f+2],15,718787259),c=m(c,d,e,b,g[f+9],21,3951481745),b=i(b,o),c=i(c,p),d=i(d,q),e=i(e,r);return(n(b)+n(c)+n(d)+n(e)).toLowerCase()};
