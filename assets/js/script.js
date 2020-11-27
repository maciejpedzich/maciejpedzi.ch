const input = document.querySelector('#cmd');
const cmdHistoryElement = document.querySelector('#cmd-history');
const today = new Date();
const cmdHistory = [];

let cmdIndex = 0;
document.querySelector('#currentYear').textContent = today.getFullYear();
input.focus();

input.addEventListener('blur', (evt) => input.focus());

window.addEventListener('keypress', (evt) => {
  const command = input.value.trim();

  if (evt.key === 'Enter' && command.length > 0) {
    const cmdToSave = document.createElement('p');
    const output = document.createElement('p');
    cmdToSave.textContent = `> ${command}`;
    cmdHistoryElement.append(cmdToSave);

    switch (command) {
      default:
        output.style.color = 'red';
        output.textContent = `ERROR: Unknown command '${command}'`;
      break;
      case 'about':
        const age = today.getFullYear() - new Date('2005-05-08').getFullYear()
        output.textContent = `Maciej Pedzich is a ${age}-year-old high school student from Kielce, Poland.
        He makes web applications using Vue.js, Node.js, Express and MongoDB/PostgreSQL, but he likes experimenting with other solutions too.
        He believes that by being creative and cooperating with others, you can achieve success.
        When not coding he is probably watching an F1 race or playing retro video games.`;
      break;
      case 'contact':
        output.innerHTML = `Email address:
        <a href="mailto:contact@maciejpedzi.ch">contact@maciejpedzi.ch</a>`;
      break;
      case 'exit':
        window.close();
      break;
      case 'github':
        window.open('https://github.com/maciejpedzich');
      break;
      case 'help':
        output.innerHTML = `<p>about - shows everything you need to know about Maciej</p>
        <p>contact - displays contact information</p>
        <p>exit - closes this page</p>
        <p>github - shows Maciej's Github profile</p>
        <p>help - displays a list of available commands</p>
        <p>skills - presents a set of current skills</p>`;
      break;
      case 'skills':
        output.innerHTML = `<p>Frontend: HTML, CSS, JavaScript, TypeScript, Vue.js</p>
        <p>Backend: JavaScript, TypeScript, Node.js, Express</p>
        <p>Database: MongoDB, PostgreSQL</p>
        <p>Tooling: Git, Visual Studio Code, Linux Bash, Windows PowerShell</p>
        <p>Hosting/Deployment: Netlify, Amazon Web Services, MongoDB Atlas</p>`;
      break;
    }

    cmdHistory.push(command);
    cmdHistoryElement.append(output);
    input.value = '';
    input.scrollIntoView();
  }
});
