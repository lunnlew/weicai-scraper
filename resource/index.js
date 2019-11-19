'use strict'

var end = document.createElement("p");
document.body.appendChild(end);
(function scrollDown() {
  end.scrollIntoView();
  setTimeout(scrollDown, Math.floor(Math.random() * 5000 + 5000));
})();
