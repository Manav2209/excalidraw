import { WebSocket, WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket,
  rooms: string[],
  userId: string
}

const users: User[] = [];

function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded == "string") {
      return null;
    }

    if (!decoded || !decoded.userId) {
      return null;
    }

    return decoded.userId;
  } catch(e) {
    return null;
  }
  return null;
}

wss.on("connection", function connection(ws, request){
  const url = request.url

  if(!url){
      return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1])
  const token = queryParams.get("token") || ""
  const userId = checkUser(token)

  if (userId === null){
      ws.close()
      return null;
  }


  users.push({
      userId,
      ws,
      rooms: []
  })




  ws.on('error', console.error)




  ws.on('message', async function message(data){
      let parsedData;

      if(typeof data !== "string"){
          parsedData = JSON.parse(data.toString())
      }else{
          parsedData = JSON.parse(data)
      }

      if(parsedData.type === "join_room"){
          const user = users.find(x => x.ws === ws )
          user?.rooms.push(parsedData.roomId)
      }

      if(parsedData.type === "leave_room"){
          const user = users.find(x => x.ws === ws)
          if(!user){
              return;
          }

          user.rooms = user.rooms.filter(x => x === parsedData.room)
      }

      if(parsedData.type === "draw"){
          const roomId = parsedData.roomId
          const data = parsedData.data

          await prismaClient.shape.create({
              data: {
                  roomId: Number(roomId),
                  data,
                  userId
              }
          })


          users.forEach(user => {
              if(user.rooms.includes(roomId) && user.ws !== ws){
                  user.ws.send(JSON.stringify({
                      type: "draw",
                      data,
                      roomId
                  }))
              }
          })

      }


      if(parsedData.type === "erase"){
          const roomId = parsedData.roomId
          const data = parsedData.data

          await prismaClient.shape.deleteMany({
              where:{
                  data,
                  roomId
              }
          })

          users.forEach(user => {
              if(user.rooms.includes(roomId) && user.ws !== ws){
                  user.ws.send(JSON.stringify({
                      type: "erase",
                      data,
                      roomId
                  }))
              }
          })
      }

  })
})