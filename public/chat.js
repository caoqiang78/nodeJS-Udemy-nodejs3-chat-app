const socket = io();

// elements
const formEl = document.querySelector('form');
const inputEl = document.getElementById('message');
const submitBtnEl = document.getElementById('submit');
const sendGeoLocationEl = document.getElementById('geolocation');
const messagesEl = document.getElementById('messages');
const sidebarEl = document.getElementById('sidebar-container');

// templates
const messageTemplateEl = document.getElementById('message-template').innerHTML;
const hyperlinkTemplateEl = document.getElementById('hyperlink-template')
  .innerHTML;
const sidebarTemplateEl = document.getElementById('sidebar-template').innerHTML;

// options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () => {
  // new message element
  const newMessageEl = messagesEl.lastElementChild;

  // height of new message
  const newMessageStyles = getComputedStyle(newMessageEl);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = newMessageEl.offsetHeight + newMessageMargin;

  // visible height
  const visibleHeight = messagesEl.offsetHeight;

  // height of message container
  const containerHeight = messagesEl.scrollHeight;

  // how far have I scrolled?
  const scrollOffset = messagesEl.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}


socket.on('message', (message) => {
  console.log(message);
  const html = Mustache.render(messageTemplateEl, {
    message: message.text,
    createAt: moment(message.createAt).format('h:mm a'),
    name: message.name
  });
  messagesEl.insertAdjacentHTML('beforeend', html);

  autoscroll();
});

socket.on('locationMessage', (locationMessage) => {
  console.log(locationMessage);
  const html = Mustache.render(hyperlinkTemplateEl, {
    mapLink: locationMessage.url,
    createAt: moment(locationMessage.createAt).format('h:mm a'),
    name: locationMessage.name
  });
  messagesEl.insertAdjacentHTML('beforeend', html);

  autoscroll();
});

socket.on('roomData', (({ room, users }) => {
  const html = Mustache.render(sidebarTemplateEl, {room, users});
  sidebarEl.innerHTML = html;
}));

formEl.addEventListener('submit', (event) => {
  event.preventDefault();

  submitBtnEl.setAttribute('disabled', 'disabled');

  socket.emit('clientMsg', inputEl.value, (error) => {
    submitBtnEl.removeAttribute('disabled');
    inputEl.value = '';
    inputEl.focus();

    if (error) {
      return console.log(error);
    }

    console.log('Message is delivered!');
  });
});

sendGeoLocationEl.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('You browser not support Geolocation!');
  }

  sendGeoLocationEl.setAttribute('disabled', 'disabled');

  navigator.geolocation.getCurrentPosition((position) => {
    console.log(position);
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      () => {
        sendGeoLocationEl.removeAttribute('disabled');
        console.log('Location is shared!');
      }
    );
  });
});

socket.emit('join', { username, room }, (error) => {
  if (error) {
    alert(error);
    location.href='/';
  }
});
