import { config } from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";
import { dbConnection } from "./database/dbConnection.js";
import messageRouter from "./router/messageRouter.js";
import { errorMiddleware } from "./middleware/errorMiddleware.js";
import userRouter from "./router/userRouter.js";
import appoinmentRouter from "./router/appoinmentRouter.js";

const app = express();
config({path : "./config/config.env"});




app.use(
    cors({
        origin : [process.env.FRONTEND_URL, process.env.DASHOARD_URL],
        methods : ["GET","POST","PUT","DELETE"],
        credentials : true,
    })
);




app.use(cookieParser());


app.use(fileUpload({
    
    useTempFiles: true,
    tempFileDir: "C:/Users/USER/AppData/Local/Temp",
}));


app.use(express.json());
app.use(express.urlencoded({extended:true}))



app.use("/api/v1/message",messageRouter);
app.use("/api/v1/user",userRouter);
app.use("/api/v1/appoinment",appoinmentRouter);




dbConnection();

app.use(errorMiddleware);

export default app;