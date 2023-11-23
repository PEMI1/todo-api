const mongoose = require('mongoose')

const todoSchema = new mongoose.Schema({
    name : String
})

const TodoModel = mongoose.model('Todo', todoSchema) //Here, you're creating a model named TodoModel based on the todosSchema. This model is associated with the "Todo" collection in the MongoDB database.

module.exports = {TodoModel}

//A schema in Mongoose defines the structure of documents within a collection in MongoDB.
// It specifies the fields or properties each document should have and the data types of those fields. Schemas can also include additional configurations such as default values, validation rules, and methods.

// A model in Mongoose is a constructor function that corresponds to a specific MongoDB collection and defines the behavior for interacting with documents in that collection.
// Models are created based on a schema and provide an interface for querying, creating, updating, and deleting documents in the associated MongoDB collection.