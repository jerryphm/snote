if (!chrome.storage.local) {
  // TODO: show error
  console.log('storage API is not available');
} else {
  document.addEventListener("DOMContentLoaded", () => {
    const noteInput = document.getElementById("noteInput");
    const saveButton = document.getElementById("saveButton");
    const notesList = document.getElementById("notesList");

    let count = 0;

    // STARTUP:
    chrome.storage.local.get("notes", ({notes}) => {
      if (notes) {
        const formattedNotes = JSON.parse(notes);
        // 1. show notes
        formattedNotes.forEach(({ text, id }) => {
          const div = document.createElement('div');
          div.innerHTML = `<span>${text}</span>`
          const delBtn = document.createElement('button')
          delBtn.innerHTML = '<img src="delete.svg" alt="delete" width="20" height="20">'
          div.appendChild(delBtn)
          notesList.appendChild(div);

          delBtn.onclick = () => {
            notesList.removeChild(div)
            removeNoteFromStorage(id)
            count--
            chrome.action.setBadgeText({ text: String(count) });
          }
        });
        // 2. udpate badge
        count = formattedNotes.length;
        chrome.action.setBadgeText({ text: String(count) });
      }
    });

    const removeNoteFromStorage = (id) => {
      chrome.storage.local.get("notes", (result) => {
        const existingNotes = result.notes ? JSON.parse(result.notes) : [];
        const updatedNotes = existingNotes.filter((note) => note.id !== id);
        chrome.storage.local.set({ notes: JSON.stringify(updatedNotes) });
      });
    }

    // ADD NOTES:
    const addNote = () => {
      const noteText = noteInput.value.trim();
      if (!noteText) {
        return;
      }
      const id = Date.now()
      // 1. clear input field
      noteInput.value = "";

      // 2. append new note to HTML
      const newNote = document.createElement('div');
      newNote.appendChild(document.createTextNode(noteText))
      notesList.insertBefore(newNote, notesList.children[0])

      newNote.innerHTML = `<span>${noteText}</span>`
      const delBtn = document.createElement('button')
      delBtn.innerHTML = '<img src="delete.svg" alt="delete" width="20" height="20">'
      newNote.appendChild(delBtn)
      delBtn.onclick = () => {
        notesList.removeChild(newNote)
        removeNoteFromStorage(id)
        count--
        chrome.action.setBadgeText({ text: String(count) });
      }


      // 4. update badge
      count++
      chrome.action.setBadgeText({ text: String(count) });

      // 5. save new note to storage
      chrome.storage.local.get("notes", (result) => {
        const existingNotes = result.notes ? JSON.parse(result.notes) : [];
        const newNote = { text: noteText, id };
        existingNotes.unshift(newNote);
        chrome.storage.local.set({ notes: JSON.stringify(existingNotes) });
      });
    }
    saveButton.addEventListener("click", addNote);
    noteInput.addEventListener("keydown", ({ key }) => {
      if (key === 'Enter') addNote();
    });

  });
}