import bot from './assets/bot.svg';
import user from './assets/user.svg';

const form = document.querySelector('form');
const chatContainer = document.querySelector('#chat_container');

let loadInterval;

// generate loading indicator
function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += '.';

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

// Outputs a message as if it was being typed
function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// generate unique ID for each message from the ai
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

// generates chat message/stripe
function chatMessage(isAi, value, uniqueId) {
  return `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? bot : user} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `;
}

const handleSubmit = async e => {
  e.preventDefault();

  const data = new FormData(form);

  // user's chat message
  chatContainer.innerHTML += chatMessage(false, data.get('prompt'));

  form.reset();

  // bot's chat message
  const uniqueId = generateUniqueId();
  chatContainer.innerHTML += chatMessage(true, ' ', uniqueId);

  // focus at the bottom
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // div identified by id
  const messageDiv = document.getElementById(uniqueId);

  // show loading indicator
  loader(messageDiv);

  const response = await fetch('https://codex-sjhn.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = ' ';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim(); // trims trailing whitespace

    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = 'Something went wrong';
    alert(err);
  }
};

form.addEventListener('submit', handleSubmit);
form.addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    handleSubmit(e);
  }
});
