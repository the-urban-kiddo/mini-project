// frontend.js
async function login() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ username, password })
  });
  const data = await response.json();
  if (response.ok) {
  //   fetchItems()
    localStorage.setItem("token",data.token);
    window.location.href = 'list.html';
  } else {
    alert(data.message);
  }
}

async function fetchItems() {
    const response = await fetch('http://localhost:3000/list', {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    }).then(async (resp)=>{
      const data = await response.json();
      console.log("!!!!!data",data)
      const itemList = document.getElementById('itemList');
      itemList.innerHTML = '';
      data.forEach(item => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = `details.html?id=${item.itemId}`;
        link.textContent = `${item.itemId} - ${item.description}`;
        li.appendChild(link);
        itemList.appendChild(li);
      });
    }).catch((err)=>{
      console.error(err.message);
    });
}




async function fetchItemDetails(itemId) {
  try {
    const response = await fetch(`http://localhost:3000/list/${itemId}`, {
      headers: {
        'Authorization': localStorage.getItem('token')
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch item details');
    }
    const data = await response.json();
    document.getElementById('description').value = data.description;
  } catch (error) {
    console.error(error.message);
  }
}

async function modifyItem() {
  const urlParams = new URLSearchParams(window.location.search);
  const itemId = urlParams.get('id');
  const description = document.getElementById('description').value;
  try {
      const response = await fetch(`http://localhost:3000/update/${itemId}`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': localStorage.getItem('token')
          },
          body: JSON.stringify({ description })
      });
      if (!response.ok) {
          throw new Error('Failed to update item');
      }
      alert('Item updated successfully');
      // Redirect to the list page after successful update
      window.location.href = 'list.html';
  } catch (error) {
      console.error(error.message);
  }
}