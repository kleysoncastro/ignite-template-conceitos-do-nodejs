const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');


const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const {username} = request.headers;
  const ifExistUsername = users.find(user => user.username === username);
  if(!ifExistUsername) {
    return response.status(404).json({error: 'Mensagem do erro'});
  }
  request.user = ifExistUsername;
  return next();

}

app.post('/users', (request, response) => {

  const {name, username} = request.body;

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  const existUser = users.find((user) => user.username === username)
  if(existUser) {
    return response.status(400).json({error: "User already existis"})
  }
  users.push(newUser);
  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
    const {user} = request;

    return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const {user} = request;

  const {title, deadline} = request.body;
  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }
  
  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {title, deadline} = request.body;
  const {id} = request.params;
  const todo = user.todos.find(todo => todo.id === id)

  if(!todo) return response.status(404).json({error: 'Todo not fund'})
  todo.title = title;
  todo.deadline = new Date(deadline);
  return response.json(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const todo = user.todos.find(todo => todo.id === id)

  if(!todo) return response.status(404).json({error: 'Todo not fund'});

  todo.done = true;

  return response.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const {user} = request;
  const {id} = request.params;

  const indexTodo = user.todos.findIndex(todo => todo.id === id);

  if(indexTodo === -1) return response.status(404).json({error: 'Todo not fund'});

  user.todos.splice(indexTodo, 1);

  return response.status(204).json();

});

module.exports = app;