const express = require('express')
//const { todo } = require('node:test')
const jwt = require('jsonwebtoken')
const JWT_SECRET ="this-is-super-secret"


//import db connection and models
const db = require('./dbconnection')
const {TodoModel} = require('./schemas/todos')


const main = async () =>{
    const app = express()
    app.use(express.json())

    const port = 5000

    //initialize db connection
    await db.connectDB()

    //let todos=[] //temporary storage..use mongodb later
    let tokens = []


    //validate token middleware
    const validateToken = (req, res, next) => {
        console.log(req.headers)
        const token = req.headers.authorization
        console.log(token)
        if(!token || !token.startsWith("bearer ")){
            return res.status(403).send({message: "token is not present"})
        }

        const accessToken = token.split(' ')[1]
        if(!accessToken){
            return res.status(403).send({message:"accesstoken is not present"})
        }

        //jwt verification will fail if token is invalid..for that instead of proceeding to next, go to catch
        try{
            const user = jwt.verify(accessToken, JWT_SECRET)//returns decoded token if successfully verified
            //if verified, pass the decoded token/ user to next() 
            req.user = user
            req.token = accessToken
            next() 
        }
        catch (error){
            res.status(401).send("Invalid Token")
        }
    }


    //create
    app.post('/todo', async (req, res) => {
        //console.log(req.body)
        const {name} =  req.body
        if(!name){
            return res.status(403).json({
                message: "name is empty"
            })
        }
        const todo = await TodoModel.create(req.body)
        //todos.push(todo)
        res.status(200).json({
            message:"Todo created successfully",
            todo: todo
        })
    })

    //get all todos
    app.get('/todos', async (req, res) => {
        const todos = await TodoModel.find()
        console.log(todos)
        res.status(200).json({
            message: "All todos",
            todos: todos
        })
    })

    //get todo by id
    app.get('/todo/:id', async (req,res) => {
        const {id} = req.params

        const todos = await TodoModel.find()

        const todo = todos.find(item =>{
            return item.id == id
        })
        if(!todo){
            return res.status(404).json({
                message:`todo with id: ${id} not found`
            })
        }
        res.status(200).json({
            message: "Success",
            todo: todo
        })
    })



    //update 

    app.put('/todo/:id', async (req, res) => {
        const { id } = req.params;
        const { name } = req.body;

        const todo = await TodoModel.findByIdAndUpdate(id, req.body)

        if (!todo) {
            return res.status(404).json({
                message: `todo with ${id} is not found`
            })
        }
        // const temptodos = todos.map(item => {
        //     if (item.id == id) {
        //         item.name = name
        //     }
        //     return item;
        // })
        const todosAfterUpdate = await TodoModel.find()
        res.status(200).json({
            message: `todo with id: ${id} has been updated`,
            todosAfterUpdate:todosAfterUpdate
        })

    })

    //delete

    app.delete('/todo/:id', async (req, res) => {
        const { id } = req.params;

        const todo = await TodoModel.findByIdAndDelete(id)

        if (!todo) {
            return res.status(404).json({
                message: `todo with ${id} is not found`
            })
        }
        const todosAfterDelete = await TodoModel.find()
        
        res.status(200).json({
            message: `todo with id ${id} is deleted`,
            todosAfterDelete: todosAfterDelete
        })


    })


    //login
    app.post('/login',(req,res) => {
        const {username, password} = req.body
        if(!username || !password) return res.status(400).send({message: " username or password is missing"})

        if(username !== "Pemila" && password !=="change this"){
            return res.status(403).send({ message: "Access Denied"})
        }

        //create token
        const token = jwt.sign({username}, JWT_SECRET, {expiresIn:"15m"})
        tokens.push(token)

        return res.status(200).json({
            token,
            message: `successfully logged in as ${username}`
        })
    })


    //logout
    app.delete('/logout', validateToken, (req,res) =>{
        //before executing this function program runs validateToken middleware and after the middleware validates token it passes token to next()/caller function
        //this req.token is passed from the validateToken middleware
        tokens = tokens.filter(token !== req.token) 
        res.status(200).json({message: "logout successful"})
    })

    app.listen(port, () => {console.log(`Server is running at port ${port}`)})
}


main()