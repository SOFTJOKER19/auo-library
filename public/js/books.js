
let books = JSON.parse(localStorage.getItem("physicalBooks") || "[]");
function saveBooks(){ localStorage.setItem("physicalBooks", JSON.stringify(books)); }
