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
yarn global add pkg
yarn
```

## Стартуем для разработки

```bash
yarn dev
```

```bash
.
`-- src                                         # Папка с кодом, который нужно писать
    `-- app.ts                                  # TS код
```

## Сборка приложения

```bash
yarn build
```

```bash
.
`-- build                                       # Папка с готовой программой
    |-- _YYYY-MM-DD_hh-mm-ss_ДанныеСайтов.xlsx  # Данные, которые получены из готовой программы
    |-- app-linux                               # Программа для Linux
    |-- app-macos                               # Программа для MacOS
    |-- app-win.exe                             # Программа для Windows
    `-- urls.txt                                # Файл с ссылками, которые нужно посетить
```

## Дерево папок и файлов

```bash
sudo apt update && sudo apt install tree
tree --charset ascii -a -I ".git|node_modules"
```

```bash
.
|-- _YYYY-MM-DD_hh-mm-ss_ДанныеСайтов.xlsx      # Данные, которые получены из $ yarn dev
|-- build                                       # Папка с готовой программой
|   |-- _YYYY-MM-DD_hh-mm-ss_ДанныеСайтов.xlsx  # Данные, которые получены из готовой программы
|   |-- app-linux                               # Программа для Linux
|   |-- app-macos                               # Программа для MacOS
|   |-- app-win.exe                             # Программа для Windows
|   `-- urls.txt                                # Файл с ссылками, которые нужно посетить
|-- dist                                        # Папка с *.js, который был создан из *.ts
|   |-- _YYYY-MM-DD_hh-mm-ss_ДанныеСайтов.xlsx  # Данные, которые получены из $ yarn start
|   |-- app.js                                  # JS код, который получен из TS кода
|   `-- urls.txt                                # Файл с ссылками, которые нужно посетить
|-- .gitignore                                  # Какие файлы игнорировать Git'у
|-- LICENSE                                     # Лицензия репозитория
|-- package.json                                # Пакеты которые нужно установить
|-- .prettierignore                             # Какие файлы игнорировать Prettier
|-- .prettierrc.json                            # Настройки Prettier
|-- README_bash_history.md                      # История команд
|-- README.md                                   # Файл обязательный для чтения
|-- src                                         # Папка с кодом, который нужно писать
|   `-- app.ts                                  # TS код
|-- tsconfig.json                               # Настройки TS
|-- urls.txt                                    # Файл с ссылками, которые нужно посетить
`-- yarn.lock                                   # Пакеты которые нужно установить через $ yarn
```
