# Folders - иерархическое файловое хранилище

REST API + SPA-интерфейс для управления иерархическим деревом папок и файлов.

- **Бэкенд:** Node.js, Express, Prisma, PostgreSQL (Docker)
- **Фронтенд:** React 19, Vite

## Старт

```bash
# 1. Клонировать репозиторий
git clone https://github.com/placeforyourad/folders
cd folders

# 2. Настроить .env
cp .env.example .env

# 3. Запустить backend (PostgreSQL + API) в Docker
npm run docker

# 4. Запустить frontend (Vite) в dev-режиме
npm run frontend
```

Фронтенд разработки проксирует запросы `/api` на `http://localhost:3001`, поэтому оба процесса должны быть запущены. Обе команды можно выполнить одной: `npm run start`.

> Посмотреть на базу через Prisma Studio выполните `npm run studio`.

После запуска:

- API: **http://localhost:3001**
- Frontend (Vite): **http://localhost:5173**

## Конфигурация

Все параметры подключения к БД вынесены в `.env`. Пароль, логин и имя БД задаются один раз — и используются и в Docker, и при локальном запуске.

### Переменные `.env`

| Переменная          | Описание                                  |
| ------------------- | ----------------------------------------- |
| `POSTGRES_USER`     | Пользователь PostgreSQL                   |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL                         |
| `POSTGRES_DB`       | Имя базы данных                           |
| `DATABASE_URL`      | Строка подключения для локального запуска |

### `.env.example`

```
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=mydb

DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

## Модель данных

| Поле        | Тип      | Описание                                      |
| ----------- | -------- | --------------------------------------------- |
| `id`        | UUID     | Уникальный идентификатор                      |
| `name`      | String   | Имя папки/файла                               |
| `type`      | String   | `folder` или `file`                           |
| `parentId`  | UUID?    | `null` для корня, иначе id родительской папки |
| `createdAt` | DateTime | Дата создания                                 |

Правила:

- Каждый элемент — либо **folder** (может содержать детей), либо **file** (всегда лист).
- Существует ровно один корень `root` (`type = folder`, `parentId = null`). Создаётся автоматически и **не может быть удалён**.
- Нельзя создать элемент внутри файла.
- При удалении папки каскадно удаляется всё её содержимое.

---

## API

### 1. Получить дерево

```http
GET /api/tree
```

Возвращает корень `root` и его прямых детей — **один уровень**. Глубокие уровни фронтенд подгружает лениво через `GET /api/tree/:id/children`, когда пользователь раскрывает папку.

Пример ответа:

```json
{
    "id": "root-id",
    "name": "root",
    "type": "folder",
    "parentId": null,
    "children": [
        {
            "id": "folder-id",
            "name": "folder1",
            "type": "folder"
        },
        {
            "id": "file-id",
            "name": "file1.txt",
            "type": "file"
        }
    ]
}
```

У дочерних элементов поле `children` отсутствует — их содержимое подгружается отдельно по `id`. У пустых папок (и у корня без детей) `children` равно `[]`.

---

### 2. Поиск по дереву

```http
GET /api/tree/search?query={строка}
```

Поиск выполняется по имени элемента:

- без учёта регистра;
- по частичному совпадению.

Результат — пути от `root` до каждого найденного элемента, без соседних веток. Если один найденный элемент является предком другого найденного элемента, в результат попадает только путь до более глубокого совпадения — путь до предка-совпадения в него уже включён.

Пример: при поиске `файл`:

```json
{
    "results": {
        "id": "15431444-3eb1-41de-87c5-d763b81840a1",
        "name": "root",
        "type": "folder",
        "children": [
            {
                "id": "3121bb49-af99-4657-9bcf-2408965da86d",
                "name": "папка1",
                "type": "folder",
                "children": [
                    {
                        "id": "f6e89df9-fd70-4eda-aefe-05c2ded08a1a",
                        "name": "файл",
                        "type": "folder",
                        "children": [
                            {
                                "id": "68f39e22-a5bd-443d-ab8e-4f61cd161344",
                                "name": "новый файл",
                                "type": "folder",
                                "children": []
                            }
                        ]
                    },
                    {
                        "id": "ee868759-f40a-4367-9ebf-108f63955883",
                        "name": "файл",
                        "type": "file",
                        "children": []
                    }
                ]
            }
        ]
    }
}
```

---

### 3. Добавить файл или папку

```http
POST /api/tree/item
```

Тело запроса:

```json
{
    "name": "new-folder",
    "type": "folder",
    "parentId": "folder-id"
}
```

Правила:

- `name` обязательно и не может быть пустым;
- `type` — только `folder` или `file`;
- родитель должен существовать;
- родитель должен быть папкой.

Пример ответа:

```json
{
    "id": "new-id",
    "name": "new-folder",
    "type": "folder",
    "parentId": "folder-id"
}
```

---

## Обработка ошибок

| Ситуация                        |       HTTP-статус |
| ------------------------------- | ----------------: |
| Некорректные данные запроса     | `400 Bad Request` |
| Родитель или элемент не найден  |   `404 Not Found` |
| Попытка добавить элемент в файл | `400 Bad Request` |
| Попытка удалить `root`          |   `403 Forbidden` |

---

### 4. Удалить файл или папку

```http
DELETE /api/tree/item/{id}
```

Правила:

- `root` удалять нельзя;
- при удалении папки удаляется папка и всё её содержимое;
- при удалении файла удаляется только файл.

Пример ответа:

```json
{
    "message": "Элемент удалён"
}
```

---

## Архитектура фронтенда
### Компоненты

| Компонент | Назначение |
| --- | --- |
| `App` | Загружает дерево через `GET /api/tree`, рендерит `SearchForm` и `TreeNode` от корня |
| `SearchForm` | Поиск по имени, вызывает `GET /api/tree/search`, результат передаёт через `onResult` в `App` → `useSearch` |
| `TreeNode` | Рекурсивно рендерит один узел. Для папок — кнопка раскрытия, для всех — действия (добавить/удалить) |
| `TreeNodeActions` | Кнопки "+" и "🗑" |
| `TreeNodeAddForm` | Инпут + селект (папка/файл), вызывает `POST /api/tree/item` |

### Хуки

| Хук | Назначение |
| --- | --- |
| `useNodeChildren` | Ленивая загрузка детей узла (`GET /api/tree/:id/children`), кэширование в `Map`, добавление и удаление дочерних элементов без рефетча дерева |
| `useSearch` | Собирает ID найденных элементов в `Set`, передаёт в `expandIds` — дерево автоматически раскрывается до совпадений |

### Потоки данных

```
Загрузка:   App → GET /api/tree → setTree → TreeNode рекурсивно
Раскрытие:  клик → useNodeChildren.toggle() → GET /api/tree/:id/children → кэш + стейт
Создание:   форма → POST /api/tree/item → addChild() → локальный стейт
Удаление:   кнопка → DELETE /api/tree/item/:id → removeChild() → локальный стейт
Поиск:      SearchForm → GET /api/tree/search → useSearch → expandIds → рекурсивное раскрытие
```

---

## Скрипты npm

| Команда          | Действие                                         |
| ---------------- | ------------------------------------------------ |
| `npm run start`  | Запустить backend в Docker и frontend (Vite) вместе |
| `npm run docker` | Собрать и запустить backend (PostgreSQL + API) в Docker |
| `npm run frontend` | Запустить frontend (Vite) в dev-режиме          |
| `npm run studio` | Открыть Prisma Studio                            |
