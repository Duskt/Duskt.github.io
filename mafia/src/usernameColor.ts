import { MD5 } from './MD5'

type ID = any;

export class BattleLog {
    static colorCache: {[userid: string]: string} = {};
    static usernameColor(name: ID) {
        if (this.colorCache[name]) return this.colorCache[name];
        let hash;
        /* For mafia-viewer: ignore custom colours.
        if (Config.customcolors[name]) {
            hash = MD5(Config.customcolors[name]);
        } else {
            hash = MD5(name);
        }
        */
       hash = MD5(name);
        let H = parseInt(hash.substr(4, 4), 16) % 360; // 0 to 360
        let S = parseInt(hash.substr(0, 4), 16) % 50 + 40; // 40 to 89
        let L = Math.floor(parseInt(hash.substr(8, 4), 16) % 20 + 30); // 30 to 49

        let {R, G, B} = this.HSLToRGB(H, S, L);
        let lum = R * R * R * 0.2126 + G * G * G * 0.7152 + B * B * B * 0.0722; // 0.013 (dark blue) to 0.737 (yellow)

        let HLmod = (lum - 0.2) * -150; // -80 (yellow) to 28 (dark blue)
        if (HLmod > 18) HLmod = (HLmod - 18) * 2.5;
        else if (HLmod < 0) HLmod = (HLmod - 0) / 3;
        else HLmod = 0;
        // let mod = ';border-right: ' + Math.abs(HLmod) + 'px solid ' + (HLmod > 0 ? 'red' : '#0088FF');
        let Hdist = Math.min(Math.abs(180 - H), Math.abs(240 - H));
        if (Hdist < 15) {
            HLmod += (15 - Hdist) / 3;
        }

        L += HLmod;

        let {R: r, G: g, B: b} = this.HSLToRGB(H, S, L);
        const toHex = (x: number) => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        this.colorCache[name] = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
        return this.colorCache[name];
    }
    static HSLToRGB(H: number, S: number, L: number) {
		let C = (100 - Math.abs(2 * L - 100)) * S / 100 / 100;
		let X = C * (1 - Math.abs((H / 60) % 2 - 1));
		let m = L / 100 - C / 2;

		let R1;
		let G1;
		let B1;
		switch (Math.floor(H / 60)) {
		case 1: R1 = X; G1 = C; B1 = 0; break;
		case 2: R1 = 0; G1 = C; B1 = X; break;
		case 3: R1 = 0; G1 = X; B1 = C; break;
		case 4: R1 = X; G1 = 0; B1 = C; break;
		case 5: R1 = C; G1 = 0; B1 = X; break;
		case 0: default: R1 = C; G1 = X; B1 = 0; break;
		}
		let R = R1 + m;
		let G = G1 + m;
		let B = B1 + m;
		return {R, G, B};
	}
}