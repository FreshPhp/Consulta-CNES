const https = require('https');

function reqs(url) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:94.0) Gecko/94.0 Firefox/94.0',
        'Referer': 'http://cnes.datasus.gov.br/pages/profissionais/consulta.jsp'
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          let msg = '';

          for (const i of response) {
            for (const [k, v] of Object.entries(i)) {
              try {
                msg += k.toUpperCase() + ' ' + v + '\n';
              } catch (e) {}
            }
            msg += '--------------------\n';
          }

          resolve(msg.slice(0, -24));
        } catch (e) {
          reject(new Error('NENHUMA INFORMAÇÃO ENCONTRADA!'));
        }
      });
    }).on('error', (e) => {
      reject(e);
    });
  });
}

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function getInput(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

(async function() {
  while (true) {
    console.clear();
    console.log('1 - Nome\n2 - CPF\n3 - Sair');

    const option = await getInput('>> ');

    console.clear();
    let msg;

    switch (option) {
      case '1':
        const nome = await getInput('DIGITE O NOME COMPLETO >> ');
        msg = await reqs(`https://cnes.datasus.gov.br/services/profissionais?nome=${nome.replace(' ', '%20').toUpperCase()}`);
        break;
      case '2':
        const cpf = await getInput('DIGITE O CPF >> ');
        msg = await reqs(`https://cnes.datasus.gov.br/services/profissionais?cpf=${cpf.replace(' ', '')}`);
        break;
      case '3':
        rl.close();
        return;
      default:
        msg = 'Opção inválida!';
    }

    console.clear();
    console.log(`${msg}\n\n< Aperte Enter >`);
    await getInput('');
  }
})();
