---
title: mockvue-demo
date: September 26, 2025
tags: [homework, source]
---

## Initalization

```zsh
npm init -y
npm install --save-dev electron
```

## Core Files

main.js: it's the backend, it's the full nodejs runtime

responsible 
- for initalizing and window.
- communication between the window and backend


index.html: is the rendered website.

## How do we add a database? 
We're going to use sqllite

### What is SQLite?
SQLite is an embedded database engine, which means it's a database that's directly integrated into an application instead of a seperate process meaning it requires less setup and overhead than a traditional database.

### Installation process

```zsh
npm install sqlite3
```

### Integration SQLite into our applicaiton
Goal: Create a persistant storage system and a way to query information. Then allow the front end to get certain information from the database.

**database.js**
Initalize a sqlite3 object and then using that object open a database using a ./database file opening it for read and write. After the database has been initalized then we want to populate it with information. Wrap the code around a serialize function that ensures sql operations are excuted in order and takes the high level instructions to add users into the database and executes the operations on a low level.

```js
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )`);

  const stmt = db.prepare("INSERT INTO users (name) VALUES (?)");
  stmt.run("Alice");
  stmt.run("Bob");
  stmt.run("Charlie");
  stmt.finalize();

  db.each("SELECT id, name FROM users", (err, row) => {
    console.log(`${row.id}: ${row.name}`);
  });
});
``` 

> [!NOTE]
> The code above uses the initalize database client to interact with the db. It creates a table, but interestingly it creates a prepared statement which is a precompiled sql statement that can be ran multiple times. In our case it can be ran multiple times with different arguements. The ? enables this through parameter binding which ? is a placeholder for an input. When stmt.run("Alice") is ran the value alice is bounded to the placeholder value and the sql statement executes with Alice in place of the placeholder (i.e the ?"")

**preload.js**
Important for exposing an interface for the UI to interact with the backend. It securly exposes a set of backend functinos to our ui by using contextbridge.

**updating main.js**
Now that we've exposed a way for the front end to interact with the backend we have to update our backend it expect/accept/handle these request and to link the preload.js to our main window.

In more detail we have to enable support for inter process communication between our main browser process and our backend. We have to also expose functions 

main.js snippets
```js
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { getUsers } = require('./database.js')
```


