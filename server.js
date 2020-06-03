let express = require('express');
let bodyParser = require('body-parser');
let app = express();
let http = require('http').Server(app);
let io = require('socket.io')(http);
let mongoose = require('mongoose');


app.use(express.static(__dirname))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}))

mongoose.Promise = Promise

let dbUrl = 'mongodb+srv://user:user@cluster0-7mobk.mongodb.net/learning-node?retryWrites=true&w=majority';

let Message = mongoose.model('Message', {
    name: String,
    message: String
})

// let messages = [
//     {name: 'Tim', message: 'Hi'},
//     {name: 'Jane', message: 'Hello'}
// ]
app.get('/messages', (req, res)=>{
    Message.find({}, (err, messages)=>{
        res.send(messages)
    })
    
})

app.get('/messages/:user', (req, res)=>{
    let user = req.params.user;
    Message.find({name: user}, (err, messages)=>{
        res.send(messages)
    })
    
})

app.post('/messages', async (req, res)=>{
    try {
        // throw 'some error'
        let message = new Message(req.body);
        let savedMessage = await message.save()
        
        console.log('saved')

        let censored = await Message.findOne({message: 'badword'})
        
        
        if(censored)
            await Message.remove({_id: censored.id})
        else 
            io.emit('message', req.body);
        
        res.sendStatus(200)
    } catch (error){
        res.sendStatus(500);
        return console.error(error)
    } finally {
        //logger.log('message post called')
    }
})

io.on('connection', (socket)=>{
    console.log('user connected')
})

mongoose.connect(dbUrl, {useNewUrlParser: true, useUnifiedTopology: true}, (err)=>{
    console.log('mongo db connection', err)
})

let server = http.listen(5000, ()=>{
    console.log('server is listening on port', server.address().port)
})

