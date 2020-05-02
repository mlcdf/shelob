// client-side js, loaded by index.html
// run by the browser each time the page is loaded

// define variables that reference elements on our page
const output = document.getElementById("output-js");
const form = document.getElementById("main-form");

// a helper function that creates a list item for a given dream
function appendNewDream(json) {
  console.log(document.getElementById("result").style);
  document.getElementById("result").style.display = "block";
  output.innerText = JSON.stringify(json, null, 4);
}

// listen for the form to be submitted and add a new dream when it is
form.addEventListener("submit", event => {
  console.log("aaaaa");
  // stop our form submission from refreshing the page
  event.preventDefault();
  const btn = document.querySelector("form button");
  const btnText = btn.innerText;
  btn.innerText = "Extraction en cours";
  btn.disabled = true;
  document.getElementById("result").style.display = "none";

  fetch("/url", {
    method: "POST",
    body: JSON.stringify({ url: form.elements.url.value }),
    headers: {
      "Content-type": "application/json"
    }
  })
    .then(resp => resp.json())
    .then(data => {
      appendNewDream(data);
      form.reset();
      btn.innerText = btnText;
      btn.disabled = false;
    })
    .catch(err => {
      console.error(err);
    });
});

var urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("url") && urlParams.get("url") !== "") {
  form.url.value = urlParams.get("url");

  if (urlParams.has("autorun") && urlParams.get("autorun") !== "") {
    form.requestSubmit();
  }
}

function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;

  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand("copy");
    var msg = successful ? "successful" : "unsuccessful";
    console.log("Fallback: Copying text command was " + msg);
  } catch (err) {
    console.error("Fallback: Oops, unable to copy", err);
  }

  document.body.removeChild(textArea);
}

function copyTextToClipboard(text) {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard.writeText(text).then(
    function() {
      console.log("Async: Copying to clipboard was successful!");
    },
    function(err) {
      console.error("Async: Could not copy text: ", err);
    }
  );
}

const copyBtn = document.getElementById("copy");

copyBtn.addEventListener("click", function(event) {
  copyTextToClipboard(output.innerText);
});
