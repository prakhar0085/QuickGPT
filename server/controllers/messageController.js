import axios from "axios"
import Chat from "../models/Chat.js"
import User from "../models/User.js"
import imagekit from "../configs/imageKit.js"
import openai from '../configs/openai.js'


// Text-based AI Chat Message Controller
export const textMessageController = async (req, res) => {
    try {
        const userId = req.user._id

        // Check credits
        if (req.user.credits < 1) {
            return res.status(400).json({ success: false, message: "You don't have enough credits to use this feature" })
        }

        const { chatId, prompt } = req.body

        const chat = await Chat.findOne({ userId, _id: chatId })
        if (!chat) {
            return res.status(404).json({ success: false, message: "Chat session not found" })
        }

        // Build prompt conversation history
        const apiMessages = [
            {
                role: "system",
                content: "You are QuickGPT, a premium, modern, and helpful AI assistant. Provide highly professional, precise, and beautifully formatted markdown responses. Maintain the flow of conversation based on the context provided."
            }
        ]

        if (chat.messages && chat.messages.length > 0) {
            chat.messages.forEach(msg => {
                if (!msg.isImage) {
                    apiMessages.push({
                        role: msg.role === 'user' ? 'user' : 'assistant',
                        content: msg.content
                    })
                }
            })
        }

        // Push current prompt
        apiMessages.push({
            role: "user",
            content: prompt
        })

        chat.messages.push({ role: "user", content: prompt, timestamp: Date.now(), isImage: false })

        // Initialize streaming completion
        const stream = await openai.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: apiMessages,
            stream: true,
        });

        // Set response headers for Server-Sent Events (SSE)
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        let fullReplyContent = "";
        let isClosed = false;

        req.on('close', () => {
            isClosed = true;
        });

        for await (const chunk of stream) {
            if (isClosed) break;
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
                fullReplyContent += content;
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
                // Introduce a small delay to create a smooth, slow typing streaming effect
                await new Promise(resolve => setTimeout(resolve, 30));
            }
        }

        // Save data and decrement credits if stream succeeded or partially succeeded
        if (fullReplyContent) {
            const reply = { role: "assistant", content: fullReplyContent, timestamp: Date.now(), isImage: false };
            chat.messages.push(reply);
            await chat.save();
            await User.updateOne({ _id: userId }, { $inc: { credits: -1 } });
        }

        if (!isClosed) {
            res.write(`data: [DONE]\n\n`);
        }
        res.end();

    } catch (error) {
        // If headers are already sent, we cannot send JSON error, just end the stream
        if (res.headersSent) {
            res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
            res.end();
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

// Image Generation Message Controller
export const imageMessageController = async (req, res) => {
    try {
        const userId = req.user._id;
        // Check credits
        if(req.user.credits < 2){
            return res.json({success: false, message: "You don't have enough credits to use this feature"})
        }
        const {prompt, chatId, isPublished} = req.body
        // Find chat
        const chat = await Chat.findOne({userId, _id: chatId})

         // Push user message
         chat.messages.push({
            role: "user", 
            content: prompt, 
            timestamp: Date.now(), 
            isImage: false});

        // Encode the prompt
        const encodedPrompt = encodeURIComponent(prompt)

        // Construct ImageKit AI generation URL
        const generatedImageUrl = `${process.env.IMAGEKIT_URL_ENDPOINT}/ik-genimg-prompt-${encodedPrompt}/quickgpt/${Date.now()}.png?tr=w-800,h-800`;

        // Trigger generation by fetching from ImageKit
        const aiImageResponse = await axios.get(generatedImageUrl, {responseType: "arraybuffer"})

        // Convert to Base64
        const base64Image = `data:image/png;base64,${Buffer.from(aiImageResponse.data,"binary").toString('base64')}`;

        // Upload to ImageKit Media Library
        const uploadResponse = await imagekit.upload({
            file: base64Image,
            fileName: `${Date.now()}.png`,
            folder: "quickgpt"
        })

        const reply = {
                role: 'assistant',
                content: uploadResponse.url,
                timestamp: Date.now(), 
                isImage: true,
                isPublished
        }

         res.json({success: true, reply})

         chat.messages.push(reply)
         await chat.save()

          await User.updateOne({_id: userId}, {$inc: {credits: -2}})

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}