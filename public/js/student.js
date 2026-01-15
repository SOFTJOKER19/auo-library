
const bookList = document.getElementById("bookList");
const myRequests = document.getElementById("myRequests");
let requests = JSON.parse(localStorage.getItem("borrowRequests") || "[]");
let currentStudent = JSON.parse(localStorage.getItem("currentStudent") || "null");

function renderBooks(){
  // student inputs were removed from the page; the borrow modal collects student details now
  bookList.innerHTML = books.map(b => `
    <div class='book-card'>
      <h4>${b.title}</h4>
      <button class="toggle-btn" onclick="toggleDetails(${b.id})">Details</button>
      <div id="details-${b.id}" class="book-details">
        <p><strong>Author:</strong> ${b.author}</p>
        <p><strong>Available:</strong> ${b.copies}</p>
        <button ${b.copies===0?'disabled':''} onclick='openConfirm(${b.id})'>Borrow</button>
      </div>
    </div>`).join("");
}

function borrow(id){
  if(!currentStudent) return alert("Set your matric, department and faculty first");
  const book = books.find(x=>x.id===id);
  if(!book || book.copies===0) return alert("Book not available");
  const existing = requests.find(r=>r.bookId===id && r.student===currentStudent.matric && (r.status==="Pending" || r.status==="Approved"));
  if(existing) return alert("You already have a pending/approved request for this book");
  const displayName = `${book.title} — ${currentStudent.department || 'General'} — ${currentStudent.faculty || '—'} — ${currentStudent.matric}`;
  requests.push({id:Date.now(), bookId:id, student:currentStudent.matric, department:currentStudent.department, faculty:currentStudent.faculty, displayName, status:"Pending", requestedAt:new Date().toISOString(), dueDate:null});
  localStorage.setItem("borrowRequests", JSON.stringify(requests));
  renderRequests();
  alert("Borrow request submitted");
}

function renderRequests(){
  if(!currentStudent){ myRequests.innerHTML = '<p class="muted">Set your student details to see requests.</p>'; return }
  myRequests.innerHTML = requests.filter(r=>r.student===currentStudent.matric).map(r=>{
    let extra = '';
    if(r.status==="Approved" && r.dueDate) extra = ` — Due: ${new Date(r.dueDate).toLocaleDateString()}`;
    const title = books.find(x=>x.id===r.bookId)?.title || 'Unknown';
    return `
      <div class='request'>
        <div style="font-weight:700">${title}</div>
        <div class="muted">Matric: ${r.student} &nbsp;|&nbsp; Department: ${r.department||'—'} &nbsp;|&nbsp; Faculty: ${r.faculty||'—'}</div>
        <div style="margin-top:6px">Status: <strong>${r.status}</strong>${extra}</div>
        <div style="margin-top:8px"><button onclick="deleteMyRequest(${r.id})" style="background:#e85a4f">Delete</button></div>
      </div>`;
  }).join("");
}

function deleteMyRequest(id){
  if(!confirm('Delete this borrow request?')) return;
  requests = JSON.parse(localStorage.getItem("borrowRequests") || "[]");
  const req = requests.find(r=>r.id===id);
  if(!req) return renderRequests();
  // if approved, return a copy to the book
  if(req.status==="Approved"){
    books = JSON.parse(localStorage.getItem("physicalBooks") || "[]");
    const b = books.find(x=>x.id===req.bookId);
    if(b){ b.copies = (b.copies||0) + 1; saveBooks(); }
  }
  requests = requests.filter(r=>r.id!==id);
  localStorage.setItem("borrowRequests", JSON.stringify(requests));
  renderRequests(); renderBooks();
}

renderBooks(); renderRequests();

function toggleDetails(id){
  const el = document.getElementById(`details-${id}`);
  if(!el) return;
  el.classList.toggle('open');
}

/* Confirmation modal workflow */
function openConfirm(id){
  const book = books.find(x=>x.id===id);
  if(!book) return alert('Book not found');
  // show book & student info
  document.getElementById('confirmBookTitle').textContent = book.title;
  // prefill modal inputs from any existing student data
  document.getElementById('confirmMatric').value = currentStudent?.matric || '';
  document.getElementById('confirmDepartment').value = currentStudent?.department || '';
  document.getElementById('confirmFaculty').value = currentStudent?.faculty || '';
  // store pending id
  window.pendingBorrowId = id;
  const modal = document.getElementById('confirmModal');
  if(modal){ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); }
}

function closeConfirm(){
  const modal = document.getElementById('confirmModal');
  if(modal){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
  window.pendingBorrowId = null;
}

function confirmBorrow(){
  const id = window.pendingBorrowId;
  if(!id) return closeConfirm();
  // read inputs
  const matric = (document.getElementById('confirmMatric')?.value || '').trim();
  const department = (document.getElementById('confirmDepartment')?.value || '').trim();
  const faculty = (document.getElementById('confirmFaculty')?.value || '').trim();
  if(!matric || !department || !faculty){ return alert('Please fill Matric, Department and Faculty'); }
  // persist current student
  currentStudent = { matric, department, faculty };
  localStorage.setItem('currentStudent', JSON.stringify(currentStudent));
  // now call borrow which expects currentStudent to be set
  borrow(id);
  closeConfirm();
}
