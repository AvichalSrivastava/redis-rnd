const axios = require('axios');
const express = require('express');
const redis = require('redis');
const {promisifyAll} = require('bluebird');
let PORT = process.env.PORT || 3000;
let REDIS_PORT = process.env.PORT || 6379;
const responseTime = require('response-time');
const app = express();

promisifyAll(redis);
 let client = redis.createClient(REDIS_PORT);
client.on('ready',()=>
{
    console.log("redis connected");
});
client.on('error',(e)=>
{
    console.log("redis connection failed",e);
});
client.ping('connecetd',()=>
{
    console.log("PONG");
});
app.get('/search', (req,res)=>
{
    try 
    {
        let query = (req.query.find).trim();
        const searchUrl = `https://api.github.com/users/${query}`;
        
        client.get(query,(err,result)=>
        {
            console.log("err",err);
            console.log("result",result);
            if(result)
            {
                console.log(result);
                res.status(200).json({data:result});
            }
            else
            {
                axios.get(searchUrl).then(response=>{
                    const responseJSON = response.data;
                    client.setex(query,3600,JSON.stringify(responseJSON));
                    res.status(200).json({ source: responseJSON, });
                }).catch(e=>
                    {
                        console.log("e",e.message);
                        res.status(400).json({message:e.message});
                    })
            }
           
        })

    } catch (error) {
        console.log("error:",error);
        res.status(500).json({"error":error.message});
    }

});

app.listen(PORT,()=>console.log(`App is runnibg on port no: ${PORT}`));