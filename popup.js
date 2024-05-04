if (chrome.storage.local) {
  document.addEventListener("DOMContentLoaded", () => {
    const inputField = document.getElementById("inputField");
    const saveBtn = document.getElementById("saveBtn");
    const list = document.getElementById("list");

    let count = 0;
    const data_key = "notes";

    const updateBadge = () => {
      chrome.action.setBadgeText({ text: String(count) })
    }

    const removeNote = (id) => {
      chrome.storage.local.get(data_key, ({ notes }) => {
        const existingNotes = JSON.parse(notes);
        const updatedNotes = existingNotes.filter((note) => note.id !== id);
        chrome.storage.local.set({ notes: JSON.stringify(updatedNotes) });
      });
    }

    const appendNoteToList = ({ text, id, type }) => {
      const div = document.createElement('div');
      div.classList.add('note')
      div.innerHTML = `<p>${text}</p>`;

      const delBtn = document.createElement('button');
      delBtn.classList.add("button", "is-danger")
      delBtn.innerHTML = '<img src="delete.svg" alt="delete" width="20" height="20">';
      delBtn.onclick = () => {
        list.removeChild(div);
        removeNote(id);
        count--;
        updateBadge();
      }
      div.appendChild(delBtn);
      if (type === 'old') {
        list.appendChild(div)
      } else {
        list.insertBefore(div, list.children[0])
      }
    }

    const addNote = () => {
      const id = Date.now();
      const text = inputField.value.trim();
      if (!text) {
        return;
      }
      // 1. clear input field
      inputField.value = "";
      // 2. append new note to HTML
      appendNoteToList({ text, id, type: 'new' })
      // 4. update badge
      count++
      updateBadge()
      // 5. save new note to storage
      chrome.storage.local.get(data_key, ({ notes }) => {
        const formattedNotes = notes ? JSON.parse(notes) : [];
        console.log('formattedNotes', formattedNotes);
        formattedNotes.unshift({ text: text, id });
        chrome.storage.local.set({ notes: JSON.stringify(formattedNotes) });
      });
    }

    // STARTUP:
    chrome.storage.local.get(data_key, ({ notes }) => {
      if (notes) {
        // 1. show notes
        const formattedNotes = JSON.parse(notes);
        formattedNotes.forEach(({ text, id }) => appendNoteToList({ text, id, type: 'old' }));
        // 2. update badge
        count = formattedNotes.length;
        updateBadge();
      }
    });

    // ADD NOTES:
    saveBtn.addEventListener("click", addNote);
    inputField.addEventListener("keydown", ({ key }) => {
      if (key === 'Enter') addNote();
    });
  });
}