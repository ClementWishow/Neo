let bouton = document.querySelector("#delete");

bouton.addEventListener("click", function() {
    console.log("Suppression du test local");
    fetch('/deleteTest', {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        }
    }).then((response) => response.json())
      .then(() => console.log('suppression ok'))
});