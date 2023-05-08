window.ENCODE = function(string) {
    return btoa(string)
};
console.log("ENCODE('Salut ça va ?') = ", ENCODE("Salut ça va ?"));
console.log("ENCODE('Java et toi ?') = ", ENCODE("Java et toi ?"));
