## Установка

**Установка NodeJS**

```bash
sudo apt update && sudo apt install curl

curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash

sudo apt install -y nodejs
```

**Установка yarn**

```bash
sudo npm i -g yarn
```

**Установка git**

```bash
sudo apt update && sudo apt install git
```

**Клонирование репозитория**

```bash
ssh-keygen # Enter, Enter, Enter
cat ~/.ssh/id_rsa.pub # copy and paste key to https://github.com/settings/ssh/new
git clone git@github.com:Pavel-Innokentevich-Galanin/nodejs-site-parser.git

cd nodejs-site-parser
```

**Установка пакетов**

```bash
yarn
```

## Стартуем для разработки

```bash
yarn start
```

## Сборка приложения

```bash
yarn build
```

```
.
`-- build
    |-- _YYYY-MM-DD_hh-mm-ss_СсылкаТелефонПочта.csv
    |-- app-linux       # приложения для Linux
    |-- app-macos       # приложение для MaxOS
    |-- app-win.exe     # приложения для Windows
    `-- urls.txt
```
