const fs = require('fs');
const xlsx = require('xlsx');
const https = require('https');
const jssoup = require('jssoup').default;
const prompt = require('prompt-sync')({ sigint: true });

async function main() {
  const isFileExists = await fileExists('urls.txt');
  if (!isFileExists) {
    console.log('Создайте файл url.txt');
    pressAnyKey();
    return;
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
      const html = await makeRequest(url);
      const soup = new jssoup(html);

      const title = getTitle(soup);
      const phones = getPhones(soup);
      const emails = getEmails(soup);
      const address = getAddress(html);

      console.log(' * * * * * * * * * * * * * * * *');
      printUrl(url);
      printTitle(title);
      printPhones(phones);
      printEmails(emails);
      printAddress(address);

      resultArray.push({
        url,
        title,
        phones,
        emails,
        address,
      });
    } catch (err) {
      console.log(' < < < < < < < < err');
      console.log(err);
      console.log(' > > > > > > > >');
    }
    console.log(' * * * * * * * * * * * * * * * *');
  }

  /*
  const fileName = `_${getTime()}_СсылкаТелефонПочта.csv`;
  const csv = getMyTsv(resultArray);
  await writeFile(fileName, csv);
  */

  let allDataArray = [];
  resultArray.forEach((element, index) => {
    const { url, title, phones, emails, address } = element;
    const length = Math.max(phones.length, emails.length, address.length);

    allDataArray.push({});

    if (length === 0) {
      allDataArray.push({
        '№': index + 1,
        'Название сайта': title,
        Телефон: '',
        'E-mail': '',
        Адрес: '',
        'Ссылка на сайт': url,
      });
    }

    for (let i = 0; i < length; i++) {
      allDataArray.push({
        '№': index + 1,
        'Название сайта': title,
        Телефон: phones[i],
        'E-mail': emails[i],
        Адрес: address[i],
        'Ссылка на сайт': url,
      });
    }

    allDataArray.push({});
  });

  let emailsArray = [];
  resultArray.forEach((element, index) => {
    const { title, emails } = element;
    emailsArray.push({
      '№': index + 1,
      'Название сайт': title,
      'Электронные почты': emails.join(),
    });
  });

  const workbook = xlsx.utils.book_new();
  const worksheet1 = xlsx.utils.json_to_sheet(allDataArray);
  const worksheet2 = xlsx.utils.json_to_sheet(emailsArray);
  xlsx.utils.book_append_sheet(workbook, worksheet1, 'ВсеДанные');
  xlsx.utils.book_append_sheet(workbook, worksheet2, 'Почты');
  xlsx.writeFile(workbook, `_${getTime()}_ДанныеСайтов.xlsx`);

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
    console.log(`Данные записаны в файл ${filename}`);
  } catch (error) {
    console.error(`Данные не записались в файл ${filename}: ${error.message}`);
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
 * Функция получает заголовок сайта c html с тега <title></title>
 * @param {*} soup
 * @returns string
 */
function getTitle(soup = new jssoup('')) {
  const titleTag = soup.find('title');
  const titleText = titleTag?.text?.trim();
  return titleText;
}

/**
 * Функция получает телефон c html с тега
 *
 * < a href="tel:+112223334455" > < /a >
 * @param {*} soup
 * @returns string
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
 * Функция получает электронную почту c html с тега
 *
 * < a href="mailto:user@example.com" >< /a >
 * @param {*} soup
 * @returns string
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
 * Функция получает адрес
 * @param {*} html
 * @returns
 */
function getAddress(html = '') {
  let arr = [];

  const addressRegex = /<.*.?ул\..?.*>/g;

  const match = html.match(addressRegex);

  if (match) {
    match.forEach((element) => {
      const soup = new jssoup(element);
      const address = soup?.text?.trim();
      if (address.length > 1000) return;
      arr.push(address);
    });
  }

  const soup = new jssoup(html);

  const adderessTags = soup.findAll('address');
  adderessTags.forEach((element) => {
    arr.push(element?.text?.trim());
  });

  if (arr.length === 0) {
    return ['Адрес не найден'];
  }

  return arr;
}

/**
 * Функция печатает в консоль название сайта
 * @param {*} title
 */
function printTitle(title = '') {
  console.log('Название сайта:\n');
  console.log(`\t${title}`);
  console.log(' ');
}

/**
 * Функция печатает в консоль url
 * @param {*} url
 */
function printUrl(url = '') {
  console.log('Ссылка:\n');
  console.log(`\t${url}`);
  console.log(' ');
}

/**
 * Функция печатает в консоль телефоны
 * @param {*} arr
 */
function printPhones(arr = []) {
  console.log('Телефоны:\n');
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
  console.log('Электронные почты:\n');
  arr.forEach((element) => {
    console.log(`\t${element}`);
  });
  console.log(' ');
}

/**
 * Функция печатает в консоль адрес
 * @param {*} address
 */
function printAddress(arr) {
  console.log('Адреса:\n');
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

  csv += '"';
  csv += [
    '№',
    'Название сайта',
    'Телефон',
    'E-mail',
    'Адрес',
    'Ссылка на сайт',
  ].join('";"');
  csv += '"\n';

  csv += '"';
  csv += Array.from({ length: 6 }, () => ' ').join('";"');
  csv += '"\n';

  arr.forEach((element, index) => {
    const { url, title, address, phones, emails } = element;

    const length = Math.max(phones.length, emails.length, address.length);

    if (length === 0) {
      const col1 = `${index}`;
      const col2 = `${title}`;
      const col3 = ' ';
      const col4 = ' ';
      const col5 = ' ';
      const col6 = `${url}`;

      csv += '"';
      csv += [col1, col2, col3, col4, col5, col6].join('";"');
      csv += '"\n';
    }

    for (let i = 0; i < length; i++) {
      const col1 = `${index + 1}`;
      const col2 = `${title}`;
      const col3 = phones[i] ? `${phones[i]}` : ' ';
      const col4 = emails[i] ? `${emails[i]}` : ' ';
      const col5 = address[i] ? `${address[i]}` : ' ';
      const col6 = `${url}`;

      csv += '"';
      csv += [col1, col2, col3, col4, col5, col6].join('";"');
      csv += '"\n';
    }

    csv += '"';
    csv += Array.from({ length: 6 }, () => ' ').join('";"');
    csv += '"\n';
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

  let ms = d.getSeconds();
  ms = ms < 10 ? `0${ms}` : `${ms}`;

  return `${ye}-${mo}-${da}_${ho}-${mi}-${ms}`;
}

const makeRequest = async (url) => {
  return new Promise((resolve, reject) => {
    https
      .get(url, (response) => {
        let data = '';

        response.on('data', (chunk) => {
          data += chunk;
        });

        response.on('end', () => {
          resolve(data);
        });
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};
