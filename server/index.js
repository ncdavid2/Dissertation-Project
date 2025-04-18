import express from 'express';

const app = express();

app.use("/", (req, res) => {
    res.send("Server is running.");
});

app.listen(5000, () => console.log("Server started at port 5000"));
