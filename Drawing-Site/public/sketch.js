let width = 0,height = 0;
const socket = io();
let color = [0,0,255],brushSize = 20,nameConnection="";
let canvas;

let sketch = function(p)
{   
    p.setup = async function ()
    {   
        socket.on('connected',(arg) => {
            
            color = arg.color;
            const label = document.getElementById('socketIdLabel');
            let x = prompt("What is your name?","");
            label.innerText = (x==null || x == "") ? socket.id : x;
        });
        socket.on('drawingEvent' , (data)=>{
            drawAtPoint(data.x,data.y,data.color,data.brSize,p);
        });
        socket.on('reset',()=>{
            p.background(255);
        });
        socket.on('disconnect', ()=>{
            socket.emit('leave');
        });
        socket.on('leave' , (data)=>{
            alert(`Socket ${data.id} disconnected. 😭😭😭` );
        });

        width = p.windowWidth * .9;
        height = p.windowHeight * .9;
        canvas = p.createCanvas( width ,height );
        p.background(255);

        const downloadBtn = document.getElementById("downloadBtn");
        downloadBtn.onclick = () => {
            p.saveCanvas(canvas , 'myCanvasSaved' , 'png');

        };

    }
    p.draw = async function ()
    {
        if(p.mouseIsPressed)
        {
            drawAtPoint(p.mouseX,p.mouseY,color,brushSize,p);

            const data = {
                x : p.mouseX,
                y : p.mouseY,
                color : color,
                brSize : brushSize
            }
            socket.emit('drawingEvent',data);
        }
    }

    p.refactorScreen = async () =>{
        
        if(width != p.windowWidth * .9 || height != p.windowHeight* .9)
        {
            width = p.windowWidth * .9;
            height = p.windowHeight* .9;
            canvas = p.createCanvas(width,height);
            p.background(255);
            socket.emit('resize');
        }
    }
    setInterval(p.refactorScreen,90);
};
new p5(sketch,'drawingContainer');

async function drawAtPoint(x,y,color,brSize,p)
{
    p.fill(color[0],color[1],color[2]);
    p.noStroke();
    p.ellipse(x,y,brSize,brSize);
}


const btnReset = document.getElementById("resetBtn");
btnReset.onclick = async () =>{
    socket.emit('reset');
};

const btnBrushSize = document.getElementById("brushSizeBtn");
btnBrushSize.onchange = async () =>{
    let value = Number(btnBrushSize.value);
    
    if(!isNaN(value))
    {   
        if(value)
        {   
            brushSize = value;
        }
        else
        {
            brushSize = 20;
        }
        //console.log(brushSize);
    }
    else
    {
        alert("This is not an number");
        return ;
    }
}

const btnColor = document.getElementById("colorBtn");
btnColor.onchange = async () =>{
    let inputValue = btnColor.value;

    if(inputValue == "") return

    let newColor = [0,0,255];
    if(inputValue.value >= 15)
    {
        alert("This is too big");
    }
    inputValue = inputValue.split(" ");
    //console.log(inputValue);

    for(let i=0;i<3;++i)
    {
        let value = Number(inputValue[i]);
    
        if(!isNaN(value))
        {   
            if(0<=value && value<=255)
            {   
                newColor[i] = value;
            }
            else
            {
                alert("Input Not Valid");
                return;
            }
        }
        else
        {
            alert("Input Not Valid");
            return ;
        }
    }
    color = newColor;
    //console.log(color);
}