for (let code = 32; code < 127; code++) {
    const chr = String.fromCharCode(code);
    const line = chr + "\t" + code + "\t" + code.toString(16).toUpperCase();
    console.log(line);
}