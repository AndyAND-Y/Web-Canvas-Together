import express from "express";
import http from 'http';
import { Server } from "socket.io";

const port = 3000;
const app = express();
const server = http.createServer(app);
const io = new Server(server);

let lista_drawingEvents = [];

let cnt_connected = 0;

function getRandom255()
{
    return Math.floor( Math.random() * 255 );
}

function getColor()
{
    let color = [getRandom255(),getRandom255(),getRandom255()];
    while(color[0] == 0 )
    {
        color[0] = getRandom255();
    }
    return color;
}

function howManyConnected()
{
    console.log(`There are ${cnt_connected} active connections.`);
}

app.use(express.static('public'));

io.on('connection' , (socket) => {
    
    const socketTmp = socket;
    cnt_connected ++;
    howManyConnected();
    console.log("Someone entered:" + socket.id);
    socket.emit('connected',{color:getColor()});
    for(let i=0;i<lista_drawingEvents.length;++i)
    {
        socket.emit('drawingEvent',lista_drawingEvents[i]);
    };
    socket.on('reset' , ()=>{
        socket.broadcast.emit('reset');
        socket.emit('reset');
        lista_drawingEvents = [];
    });

    socket.on('disconnect' , () =>{
        const data = {
            id:socketTmp.id,
        };
        socketTmp.broadcast.emit('leave' , data);
        console.log("Someone left:" +socketTmp.id);
        cnt_connected--;
        howManyConnected();
    });

    socket.on('drawingEvent' , (data) =>{
        socket.broadcast.emit('drawingEvent',data);
        lista_drawingEvents.push(data);
    });

    socket.on('resize', ()=>{
        
        for(let i=0;i<lista_drawingEvents.length;++i)
        {
            socket.emit('drawingEvent',lista_drawingEvents[i]);
        };
    })

})


server.listen(port , ()=>{
    console.log("Everything is going well on the port:" + port);
})

setInterval(howManyConnected,30000);