# Инструмент визуализации вагонопотоков

Данный проект представляет собой веб-приложение для создания, редактирования и сохранения схем вагонопотоков. Фронтенд построен на React с использованием библиотеки React Flow, а бэкенд — на ASP.NET Core Web API с сохранением данных в PostgreSQL.

## Основные возможности

- Интерактивный редактор: создание, перемещение и соединение станций на холсте.
- Кастомные элементы: станции, вагонопотоки, однопутные и двухпутные линии автоматической блокировки.
- Сохранение в базу данных: возможность сохранять и загружать схемы из базы данных PostgreSQL.
- Экспорт: выгрузка готовых схем в SVG/PDF/PNG.
- RESTful API: бэкенд на C# для управления данными.

## Предварительные требования

Перед запуском убедитесь, что у вас установлены:

- Node.js (версия 18.x или выше)
- .NET 8 SDK
- Docker и Docker Compose
- dotnet-ef tool:

```bash
dotnet tool install --global dotnet-ef
```

## Установка и запуск

1. Склонируйте репозиторий

2. Запустите бэкенд

- Запустите базу данных PostgreSQL: в директории FlowchartApi находится файл docker-compose.yml. Выполните команду для запуска контейнера:

```bash
cd FlowchartApi
docker-compose up -d
```

- Настройте строку подключения: добавьте в файл `FlowchartApi/appsettings.json` строку подключения. Со стандартым `docker-compose.yml` конфиг будет следующим:

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*",
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=flowchart_db;Username=flowchart_user;Password=mysecretpassword"
  }
}
```

- Примените миграции базы данных: эта команда создаст таблицы в вашей базе данных.

```bash
dotnet ef database update
```

- Запустите сервер:

```bash
dotnet run
```

3. Запустите фронтенд

- Перейдите в корневую директорию проекта
- Установите зависимости:

```bash
npm install
```

- Запустите приложение:

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`.
