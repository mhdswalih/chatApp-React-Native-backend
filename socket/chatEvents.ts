import { Socket, Server as SocketIOServer } from "socket.io";
import Conversation from "../models/Conversation";
import { create } from "domain";
import Message from "../models/Message";

export function registerChatEvents(io: SocketIOServer, socket: Socket) {
  socket.on("getConversations", async () => {
    try {
      const userId = socket.data.userId;
      if (!userId) {
        socket.emit("getConversations", {
          success: false,
          msg: "Unauthorized",
        });
        return;
      }
      const conversation = await Conversation.find({
        participants: userId,
      })
        .sort({ updatedAt: -1 })
        .populate({
          path: "lastMessage",
          select: "content senderId attachment createdAt",
        })
        .populate({
          path: "participants",
          select: "name avatar email",
        })
        .lean();

      socket.emit("getConversations", {
        success: true,
        data: conversation,
      });
    } catch (error) {
      console.log("getConversations error", error);
      socket.emit("getConversations", {
        success: false,
        msg: "Failed to create getConversations",
      });
    }
  });
  socket.on("newConversation", async (data) => {
    try {
      if (data.type == "direct") {
        const existingConversation = await Conversation.findOne({
          type: "direct",
          participants: { $all: data.participants, $size: 2 },
        })
          .populate({
            path: "participants",
            select: "name avatar email",
          })
          .lean();
        if (existingConversation) {
          socket.emit("newConversation", {
            success: true,
            data: { ...existingConversation, isNew: false },
          });
          return;
        }
      }

      const conversation = await Conversation.create({
        type: data.type,
        participants: data.participants,
        name: data.name || "",
        avatar: data.avatar || "",
        createdBy: data.userId,
      });

      const connectedSocket = Array.from(io.sockets.sockets.values()).filter(
        (s) => data.participants.includes(s.data.userId)
      );

      connectedSocket.forEach((participentSocket) => {
        participentSocket.join(conversation._id.toString());
      });

      const populatedConversation = await Conversation.findById(
        conversation._id
      )
        .populate({
          path: "participants",
          select: "name avatar email",
        })
        .lean();

      if (!populatedConversation) {
        throw new Error("Failed to populate conversation");
      }

      io.to(conversation._id.toString()).emit("newConversation", {
        success: true,
        data: { ...populatedConversation, isNew: true },
      });
    } catch (error: any) {
      console.log("newConversation error", error);
      socket.emit("newConversation", {
        success: false,
        msg: "Failed to create conversation",
      });
    }
  });
  socket.on("newMessage", async (data) => {
    console.log("this is newMessage event :", data);

    try {
      const message = await Message.create({
        conversationId: data.conversationId,
        senderId: data.senderId,
        content: data.content,
        attachment: data.attachment,
      });
      io.to(data.conversationId).emit("newMessage", {
        success: true,
        data: {
          id: message._id,
          content: data.content,
          sender: {
            id: data.sender.id,
            name: data.sender.name,
            avatar: data.sender.avatar,
          },
          attachment: data.attachment,
          createdAt: new Date().toISOString(),
          conversationId: data.conversationId,
        },
      });

      await Conversation.findByIdAndUpdate(data.conversationId, {
        lastMessage: message._id,
      });
    } catch (error) {
      console.log("newMessage error", error);
      socket.emit("newMessage", {
        success: false,
        msg: "Failed to create message",
      });
    }
  });
  socket.on("getMessage", async (data: { conversationId: string }) => {
    console.log("this is getMessage event :", data);

    try {
      const message = await Message.find({
        conversationId: data.conversationId,
      })
        .sort({ createdAt: -1 })
        .populate<{ senderId: { _id: string; name: string; avatar: string } }>({
          path: "senderId",
          select: "name avatar",
        })
        .lean()
      const messageWithSender = message.map((message) => ({
        ...message,
        id: message._id,
        sender: {
          id: message.senderId._id,
          name: message.senderId.name,
          avatar: message.senderId.avatar,
        },
      }));
      socket.emit("getMessage", {
        success: true,
        data: messageWithSender,
      });
    } catch (error) {
      console.log("getMessage error", error);
      socket.emit("getMessage", {
        success: false,
        msg: "Failed to get message",
      });
    }
  });
}
