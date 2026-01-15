
const adminRequests = document.getElementById("adminRequests");
let requests = JSON.parse(localStorage.getItem("borrowRequests") || "[]");
const adminBooks = document.getElementById("adminBooks");

function addBook(){
  const title=document.getElementById("title").value;
  const author=document.getElementById("author").value;
  const copies=parseInt(document.getElementById("copies").value);
  const department = (document.getElementById("department")?.value || "").trim();
  const faculty = (document.getElementById("faculty")?.value || "").trim();
  if(!title||!author||!copies) return alert("Fill Title, Author and Copies");
  books.push({id:Date.now(), title, author, copies, department, faculty});
  saveBooks();
  alert("Book added");
  location.reload();
}

function renderAdmin(){
  // refresh requests from storage in case other pages changed them
  requests = JSON.parse(localStorage.getItem("borrowRequests") || "[]");
  adminRequests.innerHTML = requests.map(r=>{
    const b = books.find(x=>x.id===r.bookId);
    const title = r.displayName || (b?b.title:"Unknown");
    let actions = '';
    if(r.status==="Pending"){
      actions = `
        <button onclick="update(${r.id},'Approved',${r.bookId})">Approve</button>
        <button onclick="update(${r.id},'Declined',${r.bookId})">Decline</button>`;
    } else if(r.status==="Approved"){
      actions = `<button onclick="update(${r.id},'Returned',${r.bookId})">Mark Returned</button>`;
    }
    let extra = '';
    if(r.status==="Approved" && r.dueDate) extra = `<p>Due: ${new Date(r.dueDate).toLocaleDateString()}</p>`;
    return `<div class='admin-card'>
      <h4>${title}</h4>
      <p class="muted">Matric: ${r.student} &nbsp;|&nbsp; Department: ${r.department||'—'} &nbsp;|&nbsp; Faculty: ${r.faculty||'—'}</p>
      <p>Status: <strong>${r.status}</strong></p>
      ${extra}
      ${actions}
      <div style="margin-top:8px"><button onclick="deleteRequest(${r.id})" style="background:#e85a4f">Delete</button></div>
    </div>`;
  }).join("");
}

function renderBooksAdmin(){
  // refresh books from storage
  books = JSON.parse(localStorage.getItem("physicalBooks") || "[]");
  if(!adminBooks) return;
  adminBooks.innerHTML = books.map(b=>{
    return `<div class='admin-card'>
      <h4>${b.title}</h4>
      <p class='muted'>${b.author}</p>
      <p class='muted'>Department: ${b.department || '—'} | Faculty: ${b.faculty || '—'}</p>
      <p>Copies: ${b.copies}</p>
      <div style="margin-top:8px">
        <button onclick="deleteBook(${b.id})" style="background:#e85a4f">Delete Book</button>
      </div>
    </div>`;
  }).join("");
}

function update(id,status,bookId){
  // ensure we have latest books and requests
  requests = JSON.parse(localStorage.getItem("borrowRequests") || "[]");
  books = JSON.parse(localStorage.getItem("physicalBooks") || "[]");

  requests = requests.map(r=>{
    if(r.id===id){
      if(status==="Approved"){
        const b=books.find(x=>x.id===bookId);
        if(b && b.copies>0){
          b.copies--;
          r.status = "Approved";
          const due = new Date(Date.now() + 14*24*60*60*1000); // 14 days
          r.dueDate = due.toISOString();
        } else {
          alert('No copies available to approve');
        }
      } else if(status==="Declined"){
        r.status = "Declined";
      } else if(status==="Returned"){
        const b=books.find(x=>x.id===bookId);
        if(b){ b.copies++; }
        r.status = "Returned";
        r.dueDate = null;
      }
    }
    return r;
  });

  saveBooks();
  localStorage.setItem("borrowRequests",JSON.stringify(requests));
  renderAdmin();
  renderBooksAdmin();
}

renderAdmin();
renderBooksAdmin();

function deleteBook(bookId){
  if(!confirm('Delete this book?')) return;
  books = JSON.parse(localStorage.getItem("physicalBooks") || "[]");
  books = books.filter(b=>b.id!==bookId);
  saveBooks();
  // remove any requests for this book
  requests = JSON.parse(localStorage.getItem("borrowRequests") || "[]");
  requests = requests.filter(r=>r.bookId!==bookId);
  localStorage.setItem("borrowRequests", JSON.stringify(requests));
  renderBooksAdmin(); renderAdmin();
}

function deleteRequest(id){
  if(!confirm('Delete this request?')) return;
  requests = JSON.parse(localStorage.getItem("borrowRequests") || "[]");
  requests = requests.filter(r=>r.id!==id);
  localStorage.setItem("borrowRequests", JSON.stringify(requests));
  renderAdmin();
}

function deleteAll(){
  if(!confirm('Delete ALL books and requests? This cannot be undone.')) return;
  books = [];
  saveBooks();
  localStorage.removeItem('borrowRequests');
  requests = [];
  renderBooksAdmin();
  renderAdmin();
  alert('All books and requests deleted.');
}
