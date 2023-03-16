const fs = require('fs');
const axios = require('axios');
const jssoup = require('jssoup').default;
const prompt = require('prompt-sync')({ sigint: true });

async function main() {
  const isFileExists = await fileExists('urls.txt');
  if (!isFileExists) {
    console.log('Нет файла url.txt');
    console.log('В файл url.txt нужно вставить ссылки');
  }

  const text = await readFileAsync('urls.txt');
  const array = text.split(/\s/);

  let arr = [];

  array.forEach((element) => {
    if (element.length === 0) return;
    arr.push(element);
  });

  if (arr.length === 0) {
    console.log('В файле urls.txt нет ссылок');
    pressAnyKey();
    return;
  }

  let resultArray = [];
  for (let i = 0; i < arr.length; i++) {
    try {
      const url = arr[i];
      const response = await axios.get(url);
      const html = response.data;
      const soup = new jssoup(html);

      const phones = getPhones(soup);
      const emails = getEmails(soup);

      console.log(' * * * * * * * * * * * * * * * *');
      printUrl(url);
      printPhones(phones);
      printEmails(emails);

      resultArray.push({
        url,
        phones,
        emails,
      });
    } catch (err) {
      console.log(' < < < < < < < < err');
      console.log(err);
      console.log(' > > > > > > > >');
    }
    console.log(' * * * * * * * * * * * * * * * *');
  }

  const fileName = `_${getTime()}_СсылкаТелефонПочта.csv`;
  const csv = getMyTsv(resultArray);
  await writeFile(fileName, csv);

  pressAnyKey();
}

main();

/**
 * Функция, читает файл по пути filepath и возвращает содержимое
 * @param {string} filepath
 * @returns string
 */
async function readFileAsync(filepath) {
  try {
    const data = await fs.promises.readFile(filepath, 'utf-8');
    return data;
  } catch (err) {
    console.error(err);
    return '';
  }
}

/**
 * Функция проверяет существование файла по пути path.
 * Если файл существует то возвращает true, иначе false.
 * @param {*} path
 * @returns boolean
 */
async function fileExists(path) {
  try {
    await fs.promises.access(path);
    return true;
  } catch (error) {
    if (error.code === 'ENOENT') return false;
    throw error;
  }
}

/**
 * Функция записывает в файл по пути filename содержимое строки data
 * @param {string} filename 
 * @param {string} data 
 */
async function writeFile(filename, data) {
  try {
    await fs.promises.writeFile(filename, data);
    console.log(`Data has been written to ${filename}`);
  } catch (error) {
    console.error(`Failed to write data to ${filename}: ${error.message}`);
  }
}

/**
 * Функция, которая просит нажать пробел.
 * Эта функция нужна для того, чтобы не закрывалась консоль,
 * когда у нас есть готовый *.exe файл.
 */
function pressAnyKey() {
  console.log(' ');
  prompt('Для завершения программы нажмите Enter... ');
}

/**
 * Функция получает телефоны c html с тега
 * 
 * < a href="tel:+112223334455" > < /a >
 * @param {*} soup 
 * @returns 
 */
function getPhones(soup = new jssoup('')) {
  const aArray = soup.findAll('a');

  let arr = [];

  aArray.forEach((element) => {
    const href = element?.attrs?.href || '';
    if (href.length === 0) return;
    if (!href.startsWith('tel:')) return;

    const tel = href.split(/tel:\/\/|tel:+/)[1];
    arr.push(tel);
  });

  return arr;
}

/**
 * Функция получает электронные почты c html с тега
 * 
 * < a href="mailto:user@example.com" >< /a >
 * @param {*} soup 
 * @returns 
 */
function getEmails(soup = new jssoup('')) {
  const aArray = soup.findAll('a');

  let arr = [];

  aArray.forEach((element) => {
    const href = element?.attrs?.href || '';
    if (href.length === 0) return;
    if (!href.startsWith('mailto:')) return;

    const email = href.split('mailto:')[1];
    arr.push(email);
  });

  return arr;
}

/**
 * Функция печатает в консоль url
 * @param {*} url 
 */
function printUrl(url = '') {
  console.log('\tСсылка:\n');
  console.log(`\t${url}`);
  console.log(' ');
}

/**
 * Функция печатает в консоль телефоны
 * @param {*} arr 
 */
function printPhones(arr = []) {
  console.log('\tТелефоны:\n');
  arr.forEach((element) => {
    console.log(`\t${element}`);
  });
  console.log(' ');
}

/**
 * Функция печатает в консоль электронные почты
 * @param {*} arr 
 */
function printEmails(arr = []) {
  console.log('\tЭлектронные почты:\n');
  arr.forEach((element) => {
    console.log(`\t${element}`);
  });
  console.log(' ');
}

/**
 * Функция ненерирует текст файла csv
 * @param {*} arr 
 * @returns string
 */
function getMyTsv(arr = []) {
  let csv = '';

  csv += ['№', 'Ссылка', 'Телефон', 'Email'].join('\t');
  csv += '\n';

  csv += ['x', 'x', 'x', 'x'].join('\t');
  csv += '\n';

  arr.forEach((element, index) => {
    const { url, phones, emails } = element;

    const length = Math.max(phones.length, emails.length);

    if (length === 0) {
      const col1 = `${index}`;
      const col2 = `${url}`;
      const col3 = ' ';
      const col4 = ' ';
      csv += [col1, col2, col3, col4].join('\t');
      csv += '\n';
    }

    for (let i = 0; i < length; i++) {
      const col1 = `${index}`;
      const col2 = `${url}`;
      const col3 = phones[i] ? `${phones[i]}` : ' ';
      const col4 = emails[i] ? `${emails[i]}` : ' ';
      csv += [col1, col2, col3, col4].join('\t');
      csv += '\n';
    }

    csv += ['x', 'x', 'x', 'x'].join('\t');
    csv += '\n';
  });

  return csv;
}

/**
 * Функция получает дату в формета 'YY-MM-DD_hh-mm-ss'
 * @param {*} d 
 * @returns 'YY-MM-DD_hh-mm-ss'
 */
function getTime(d = new Date()) {
  const ye = d.getFullYear();

  let mo = d.getMonth() + 1;
  mo = mo < 10 ? `0${mo}` : `${mo}`;

  let da = d.getDate();
  da = da < 10 ? `0${da}` : `${da}`;

  let ho = d.getHours();
  ho = ho < 10 ? `0${ho}` : `${ho}`;

  let mi = d.getMinutes();
  mi = mi < 10 ? `0${mi}` : `${mi}`;

  let ms = d.getMilliseconds();
  ms = ms < 10 ? `0${ms}` : `${ms}`;

  return `${ye}-${mo}-${da}_${ho}-${mi}-${ms}`;
}
