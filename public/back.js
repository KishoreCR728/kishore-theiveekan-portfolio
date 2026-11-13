// "Back" links (a[data-back]): if the visitor came from another page of this site, go back in history so the
// page restores its scroll position (only when that page is the link's own target); otherwise follow the link (and skip the home intro for "/#..." links).
document.addEventListener("click", function (e) {
  var a = e.target.closest && e.target.closest("a[data-back]");
  if (!a) return;
  try {
    // Go back only when the previous page is the one this link names (e.g. the home page for "/#work"),
    // so "Back to selected work" never lands on the previous case study.
    var r = document.referrer ? new URL(document.referrer) : null, target = new URL(a.getAttribute("href"), location.href);
    if (r && r.origin === location.origin && r.pathname === target.pathname && history.length > 1) { e.preventDefault(); history.back(); return; }
    if (a.getAttribute("href").indexOf("/#") === 0) sessionStorage.setItem("skipLoader", "1");
  } catch (x) { /* storage blocked: the link still works */ }
});
