const input = document.querySelector('#cmd');
const cmdHistoryElement = document.querySelector('#cmd-history');
const today = new Date();
const currentYear = today.getFullYear();
const inputHistory = localStorage.getItem('inputHistory')
  ? localStorage.getItem('inputHistory').split(',')
  : [];
let cmdIndex = 0;

document.querySelector('#current-year').textContent = currentYear;
input.focus();

window.addEventListener('keypress', (evt) => {
  const inputText = input.value.trim();
  const split = inputText.split(/ +/);
  const command = split[0];

  if (evt.key === 'Enter' && command.length > 0) {
    const args = split.slice(1);

    const cmdToSave = document.createElement('p');
    const output = document.createElement('p');
    cmdToSave.textContent = `> ${inputText}`;
    cmdHistoryElement.append(cmdToSave);

    switch (command.toLowerCase()) {
      default:
        output.textContent = `ERROR: Unknown command '${command}'`;
        break;
      case 'about':
        const timeDiff = today.getTime() - new Date('2005-05-08').getTime();
        const age = Math.floor(timeDiff / (3600 * 24 * 365 * 1000));

        output.textContent = `Maciej Pedzich is a ${age}-year-old high school student from Kielce, Poland.
        He makes web applications using Vue.js, Node.js, Express and MongoDB/PostgreSQL, but he likes experimenting with other solutions too.
        He believes that by being creative and cooperating with others, you can achieve success.
        When not coding, he is probably watching an F1 race, or playing retro video games.`;
        break;
      case 'bgcolor':
        const bgcolor = args[0];
        document.body.style.backgroundColor = bgcolor;
        break;
      case 'cls':
        cmdHistoryElement.textContent = '';
        break;
      case 'color':
        const color = args[0];
        document.body.style.color = color;
        input.style.color = color;
        break;
      case 'contact':
        output.innerHTML = `Email address:
        <a href="mailto:contact@maciejpedzi.ch">contact@maciejpedzi.ch</a>`;
        break;
      case 'github':
        output.innerHTML = `If new tab didn't show up, go <a href="https://github.com/maciejpedzich">here</a>`;
        window.open('https://github.com/maciejpedzich');
        break;
      case "'help'":
        output.textContent = 'Without the quotes, dummy.';
        break;
      case 'help':
        output.innerHTML = `<p>about - shows everything you need to know about Maciej</p>
				<p>bgcolor [color] - sets background color to given [color]</p>
        <p>cls - clears screen</p>
        <p>color [color] - sets text color to given [color]</p>
				<p>contact - displays contact information</p>
        <p>github - opens Maciej's Github profile page</p>
        <p>help - displays a list of available commands</p>
        <p>skills - presents a set of current skills</p>
        <p>If on desktop/laptop, use up and down arrows to retype commands</p>`;
        break;
      case 'skills':
        output.innerHTML = `<p>Frontend: HTML, CSS, JavaScript, TypeScript, Vue.js</p>
        <p>Backend: JavaScript, TypeScript, Node.js, Express</p>
        <p>Database: MongoDB, PostgreSQL</p>
        <p>Tooling: Git, Visual Studio Code, Bash, Windows PowerShell, Postman</p>
        <p>Hosting/Deployment: Netlify, Heroku, Amazon Web Services, MongoDB Atlas</p>
        <p>Looking to learn: Nuxt.js, GraphQL, Vim</p>`;
        break;
    }

    inputHistory.unshift(inputText);
    localStorage.setItem('inputHistory', inputHistory.slice(0, 10).join());

    cmdHistoryElement.append(output);
    input.value = '';
    input.scrollIntoView();
  }
});

window.addEventListener('keydown', (evt) => {
  if (inputHistory.length > 0) {
    if (evt.key === 'ArrowUp') {
      cmdIndex - 1 >= 0 ? cmdIndex-- : (cmdIndex = inputHistory.length - 1);
      input.value = inputHistory[cmdIndex];
    } else if (evt.key === 'ArrowDown') {
      cmdIndex + 1 < inputHistory.length ? cmdIndex++ : (cmdIndex = 0);
      input.value = inputHistory[cmdIndex];
    }
  }
});

input.addEventListener('blur', (evt) => input.focus());
