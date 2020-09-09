const loadFile = (event) => {
  const image = document.getElementById('img');
  image.src = URL.createObjectURL(event.target.files[0]);
};
