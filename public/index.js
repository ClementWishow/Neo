//initialisation de la console
import typeWriter from "./typeWriter.js";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const writer = new typeWriter("#typeWriter", initialData.noTyping);

// function envoyant une réponse à la question au back
async function ping(data) {
  await fetch(initialData.baseURL + "ping/" + initialData.step.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then(async (result) => {
      if (result.message) {
        console.log("message: "+result.message)
        writer.appendTypeWriterItem();
        await writer.typeIt(result.message);
      }
      if (result.redirect) {
        console.log("redirect: "+result.redirect)
        await sleep(2000);
        window.location = result.redirect;
      } else if (result.message) {
        writer.appendTypeWriterItem();
        writer.canPrompt = true;
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// evenement : l'utilisateur appuie sur une touche
$(window).on("keydown", function (e) {
  if (initialData.name === "facebook" && e.originalEvent.key === "b") {
    writer.prompt(" ");
    return;
  }
  const prompt = writer.prompt(e.originalEvent.key);
  if (prompt) {
    writer.canPrompt = false;
    ping(prompt);
  }
});

// evenement: l'utilisateur modifie le html de la page
const observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    if (
      mutation.target &&
      (mutation.target.className.includes("typewriter-item") ||
        mutation.target.id === "typeWriter")
    ) {
      return;
    }
    const target = mutation.target
      ? {
          class: mutation.target.className,
          id: mutation.target.id,
          name: mutation.target.nodeName,
        }
      : null;
    const added = Array.from(mutation.addedNodes).map((x) => ({
      class: x.className,
      id: x.id,
      name: x.nodeName,
    }));
    const deleted = Array.from(mutation.removedNodes).map((x) => ({
      class: x.className,
      id: x.id,
      name: x.nodeName,
    }));
    ping({ mutation: { modified: target, added: added, deleted: deleted } });
  });
});

const config = {
  subtree: true,
  childList: true,
};

await writer.typeLines(initialData.linesToDisplay);
observer.observe(document.body, config);
