document.addEventListener("DOMContentLoaded", function () {
  const postContainer = document.getElementById("postContainer");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  let page = 1;
  const postsPerPage = 10;

  // async function fetchPosts() {
  //   const apiUrl = `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${postsPerPage}`;
  //   try {
  //     const response = await fetch(apiUrl);
  //     const data = await response.json();
  //     data.forEach(createPostCard);
  //     loadMoreBtn.style.display = data.length < postsPerPage ? "none" : "block";
  //   } catch (error) {
  //     console.error("Error fetching posts:", error);
  //   }
  // }

  function fetchPosts() {
    const apiUrl = `https://jsonplaceholder.typicode.com/posts?_page=${page}&_limit=${postsPerPage}`;
  
    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        data.forEach(createPostCard);
        loadMoreBtn.style.display = data.length < postsPerPage ? "none" : "block";
      })
      .catch(error => {
        console.error("Error fetching posts:", error);
      });
  }  

  function createPostCard(post) {
    const postCard = document.createElement("div");
    postCard.className = "col-md-4 mb-3";
    postCard.dataset.postid = post.id;

    const card = createCardElement("img", post.title, post.body);
    postCard.appendChild(card);

    postCard.addEventListener("click", function () {
      openModal(post.id);
    });

    postContainer.appendChild(postCard);
  }

  function createCardElement(tagName, title, body) {
    const card = document.createElement("div");
    card.className = "card d-flex flex-column";

    const image = document.createElement(tagName);
    image.src = "https://www.telemadrid.es/2022/06/05/htmls/_2457064303_34317423_1300x731.png";
    image.className = "card-img-top";
    image.alt = "Post Image";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const cardTitle = document.createElement("h5");
    cardTitle.className = "card-title";
    cardTitle.textContent = title;

    const cardText = document.createElement("p");
    cardText.className = "card-text";
    cardText.textContent = body;

    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);

    card.appendChild(image);
    card.appendChild(cardBody);

    return card;
  }

  function openModal(postId) {
    const modalContent = document.getElementById("commentsModalBody");
    const modalTitle = document.getElementById("commentsModalTitle");
    const modalFooter = document.getElementById("commentsModalFooter");
    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = "btn btn-dark me-2";
    toggleBtn.textContent = "Toggle Comments";
    let commentsVisible = false;
  
    function toggleCommentsVisibility() {
      commentsVisible = !commentsVisible;
      if (commentsVisible) {
        fetchComments(postId)
          .then((comments) => {
            modalContent.innerHTML = "";
            comments.forEach((comment) => {
              const commentDiv = document.createElement("div");
              commentDiv.className = "comment";
              const name = document.createElement("p");
              name.className = "comment-name";
              name.textContent = `${comment.name}`;
              const email = document.createElement("p");
              email.className = "comment-email";
              email.textContent = `${comment.email}`;
              const body = document.createElement("p");
              body.className = "comment-body";
              body.textContent = comment.body;
              commentDiv.appendChild(name);
              commentDiv.appendChild(email);
              commentDiv.appendChild(body);
              modalContent.appendChild(commentDiv);
            });
          })
          .catch((error) => console.error("Error fetching comments:", error));
      } else {
        modalContent.innerHTML = "";
      }
    }
  
    toggleBtn.addEventListener("click", toggleCommentsVisibility);
  
    fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`)
      .then((response) => response.json())
      .then((post) => {
        modalTitle.textContent = post.title;
  
        const titleInput = document.createElement("input");
        titleInput.type = "text";
        titleInput.className = "form-control mb-3";
        titleInput.value = post.title;
        const descriptionInput = document.createElement("textarea");
        descriptionInput.className = "form-control";
        descriptionInput.rows = "4";
        descriptionInput.value = post.body;
  
        function enableSaveButton() {
          saveButton.disabled = false;
        }
  
        titleInput.addEventListener("input", enableSaveButton);
        descriptionInput.addEventListener("input", enableSaveButton);
  
        modalContent.innerHTML = "";
        modalContent.appendChild(titleInput);
        modalContent.appendChild(descriptionInput);
  
        const saveButton = document.createElement("button");
        saveButton.type = "button";
        saveButton.className = "btn btn-success";
        saveButton.textContent = "Save";
        saveButton.disabled = true;
        saveButton.addEventListener("click", function () {
        post.title = titleInput.value;
        post.body = descriptionInput.value;

        const postCard = document.querySelector(`[data-postid="${postId}"]`);
        const postTitle = postCard.querySelector(".card-title");
        const postBody = postCard.querySelector(".card-text");
        postTitle.textContent = post.title;
        postBody.textContent = post.body;

        const commentsModal = bootstrap.Modal.getInstance(document.getElementById("commentsModal"));
        commentsModal.hide();
    });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-danger me-auto";
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
        deletePost(postId);
        const commentsModal = bootstrap.Modal.getInstance(document.getElementById("commentsModal"));
        commentsModal.hide();

        function closeModalHandler() {
        commentsModal.dispose();
        commentsModal._element.removeEventListener("hidden.bs.modal", closeModalHandler);
        }

        commentsModal._element.addEventListener("hidden.bs.modal", closeModalHandler);

        const postCard = document.querySelector(`[data-postid="${postId}"]`).closest(".col-md-4");
        postCard.remove();
    });
  
        modalFooter.innerHTML = ""; 
        modalFooter.appendChild(toggleBtn);
        modalFooter.appendChild(saveButton);
        modalFooter.appendChild(deleteButton);
  
        const commentsModal = new bootstrap.Modal(document.getElementById("commentsModal"), {
            backdrop: true
          });
        commentsModal.show();
        
        commentsModal._element.addEventListener("hidden.bs.modal", function () {
        commentsModal.dispose();
        });
      })
      .catch((error) => console.error("Error fetching post details:", error));
  } 

  function fetchComments(postId) {
    const apiUrl = `https://jsonplaceholder.typicode.com/posts/${postId}/comments`;
    return fetch(apiUrl)
      .then((response) => response.json())
      .catch((error) => {
        console.error("Error fetching comments:", error);
        return []; 
      });
  }

  function deletePost(postId) {
    fetch(`https://jsonplaceholder.typicode.com/posts/${postId}`, {
      method: "DELETE",
    })
      .then(() => {
        const postCard = document.querySelector(`[data-postid="${postId}"]`).closest(".col-md-4");
        postCard.remove();
        const commentsModal = bootstrap.Modal.getInstance(document.getElementById("commentsModal"));
        if (commentsModal) {
          commentsModal.hide();
        }
      })
      .catch((error) => console.error("Error deleting post:", error));
  }

  loadMoreBtn.addEventListener("click", function () {
    page++;
    fetchPosts();
  });

  fetchPosts();
});    