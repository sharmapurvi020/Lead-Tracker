const express = require('express');
const router = express.Router();
const { validationResult } = require('express-validator');
const authenticate = require('../middlewares/authenticate');
const Comm = require('../models/communicationHistory');
const Lead = require('../models/leadData');

router.post('/register', authenticate, async (request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(400).json({errors : errors.array()});
    }
    try {
        let user = await Lead.findById(request.user.id);
        let newPost = {
            user : request.user.id,
            date : request.body.date,
            type : request.body.type,
            content : user.content
        };
        let post = new Comm(newPost);
        post = await Lead.populate(post);
        post = await post.save();
        response.status(200).json({post : post});
        
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});