# Folders - иерархическое файловое хранилище

REST API для управления иерархическим деревом папок и файлов. Построено на **Node.js + Express + Prisma + PostgreSQL**, разворачивается через **Docker Compose**.

## Архитектура

Проект разделён на слои:

```
Роуты (routes) → Контроллеры (controllers) → Сервисы (services) → Репозиторий (repository) → БД (Prisma)
```

- **routes** — описание эндпоинтов и подключение middleware-валидаторов
- **controllers** — обработка HTTP-запросов/ответов, статус-коды
- **services** — бизнес-логика
- **repository** — доступ к данным, построение дерева, поиск
- **utils/validators** — валидация входных данных
- **middlewares/errorHandler** — централизованная обработка ошибок

## Старт

```bash
# 1. Клонировать репозиторий
git clone <repo-url>
cd folders

# 2. Настроить .env
cp .env.example .env

# 3. Запустить всё (PostgreSQL + приложение)
npm run dev
```

>Посмотреть на базу через Prisma Studio, сначала выполните `npm install`, затем `npm run studio`.

После запуска:

- API: **http://localhost:3001**

## Конфигурация

Все параметры подключения к БД вынесены в `.env`. Пароль, логин и имя БД задаются один раз — и используются и в Docker, и при локальном запуске.

### Переменные `.env`

| Переменная | Описание |
|------------|----------|
| `POSTGRES_USER` | Пользователь PostgreSQL |
| `POSTGRES_PASSWORD` | Пароль PostgreSQL |
| `POSTGRES_DB` | Имя базы данных |
| `DATABASE_URL` | Строка подключения для локального запуска (`localhost`) |

### `.env.example`

```
POSTGRES_USER=user
POSTGRES_PASSWORD=password
POSTGRES_DB=mydb

DATABASE_URL="postgresql://user:password@localhost:5432/mydb"
```

## Модель данных

| Поле | Тип | Описание |
|------|-----|----------|
| `id` | UUID | Уникальный идентификатор |
| `name` | String | Имя папки/файла |
| `type` | String | `folder` или `file` |
| `parentId` | UUID? | `null` для корня, иначе id родительской папки |
| `createdAt` | DateTime | Дата создания |

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

Возвращает полное дерево, начиная с `root`.

Пример ответа:

```json
{
    "id": "root-id",
    "name": "root",
    "type": "folder",
    "children": [
        {
            "id": "folder-id",
            "name": "folder1",
            "type": "folder",
            "children": [
                {
                    "id": "file-id",
                    "name": "file1.txt",
                    "type": "file"
                }
            ]
        }
    ]
}
```

У файлов поле `children` отсутствует.  
У пустых папок `children` равно `[]`.

---

### 2. Поиск по дереву

```http
GET /api/tree/search?query={строка}
```

Поиск выполняется по имени элемента:

- без учёта регистра;
- по частичному совпадению.

Результат — объект с массивом путей от `root` до каждого найденного элемента, без соседних веток.

Пример: при поиске `file1`:

```json
{
    "results": [
        {
            "id": "root-id",
            "name": "root",
            "type": "folder",
            "children": [
                {
                    "id": "folder-id",
                    "name": "folder1",
                    "type": "folder",
                    "children": [
                        {
                            "id": "file-id",
                            "name": "file1.txt",
                            "type": "file"
                        }
                    ]
                }
            ]
        }
    ]
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
    "message": "Item deleted successfully"
}
```

---


## Скрипты npm

| Команда | Действие |
|---------|----------|
| `npm run dev` | Собрать и запустить всё в Docker|
| `npm run studio` | Открыть Prisma Studio|
