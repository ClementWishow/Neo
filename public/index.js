//initialisation de la console
import typeWriter from "./typeWriter.js";
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const writer = new typeWriter("#typeWriter");

// function envoyant une réponse à la question au back
async function ping(data) {
  await fetch(baseURL + "ping", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then(async (result) => {
      if(result.successEnigme && result.successEnigme !== 'begin'){
        gtag('event', 'énigme_réussie', {
          'event_category': 'Énigmes',
          'event_label': result.successEnigme
        });
      }
      if (result.message) {
        writer.appendTypeWriterItem();
        await writer.typeIt(result.message);
      }
      if (result.redirect) {
        await sleep(1000);
        if (result.redirect === "next") {
          document.querySelector(".rabbit").style.animationPlayState =
            "running";
          if (result.nextData.additionalHTML) {
            $("body").append(result.nextData.additionalHTML);
          }
          if (result.nextData.additionalJS) {
            eval(result.nextData.additionalJS);
          }
          writer.reload();
          writer.blockedLetter = result.nextData.blockedLetter || null;
          writer.noTyping = result.nextData.noTyping;
          writer.typeLines(result.nextData.initialLines);
          setTimeout(() => {
            document.querySelector(".rabbit").style.animationPlayState =
              "paused";
          }, 1000);
        } else {
          window.location = result.redirect;
        }
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
    const added = Array.from(mutation.addedNodes, (x) => ({
      class: x.className,
      id: x.id,
      name: x.nodeName,
    }));
    const deleted = Array.from(mutation.removedNodes, (x) => ({
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
await writer.typeLines(initialData.initialLines);
observer.observe(document.body, config);
