var page = 0;

function next() {
  page++;
  document.location.href = "/audit?page=" + page;
}
function prev() {
  if (page - 1 >= 0) {
    page--;
    document.location.href = "/audit?page=" + page;
  }
}
