const express = require('express');
const router = express.Router();
const { body , validationResult } = require('express-validator');
const Lead = require('../models/leadData');
const authenticate = require('../middlewares/authenticate');

/*
    @usage : to Register a User
    @url : /api/users/register
    @fields : name , email , password
    @method : POST
    @access : PUBLIC
 */
router.post('/register', [
    body('name').notEmpty().withMessage('Name is Required'),
    body('email').notEmpty().withMessage('Email is Required'),
] , authenticate, async (request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(400).json({errors : errors.array()});
    }
    try {
        let { name , email , password , phone , source, description, dueDate} = request.body;
        // check if the user exits
        let lead = await Lead.findOne({email : email});

        if(lead){
            return response.status(401).json({errors : [{msg : 'Lead Already Exists'}]});
        }
        // insert the user into database
        const [month, day, year] = dueDate.split('-').map(Number);
        dueDate = new Date(year, month - 1, day);
        lead = new Lead({ name , email , password , phone , source, description, dueDate});
        await lead.save();
        response.status(200).json({msg : 'Registration is Success'});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

router.put('/', [
    body('name').notEmpty().withMessage('Name is Required'),
    body('email').notEmpty().withMessage('Email is Required'),
] , authenticate, async (request , response) => {
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(400).json({errors : errors.array()});
    }
    try {
        let { name , email , password , phone , source, description, dueDate} = request.body;
        
        let lead = await Lead.findOne({email : email});

        if(!lead){
            return response.status(401).json({errors : [{msg : 'No Lead Found'}]});
        }
        let leadObj = {
            user: request.user.id, // id gets from Token
            name: name ?? "",
            email: email ?? "",
            password: password ?? "",
            phone: phone ?? "",
            source: source ?? "",
            description: description ?? "",
            dueDate: dueDate ?? "",
        };
          

        // update to db
        lead = await Lead.findOneAndUpdate({user : request.user.id} , {
            $set : leadObj
        } , {new : true})
        
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

router.get('/lead/:id', authenticate , async (request , response) => {
    try {
        let leadId = request.params.id;
        let lead = await Lead.findById(leadId);
        response.status(200).json({
            lead : lead
        });
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
})

router.get('/allLeads' , async (request , response) => {
    try {
        const { name } = request.query; // Get the 'name' query parameter from the request

        let query = {};
        if (name) {
            // If 'name' parameter is provided, add a filter to the query
            query.name = { $regex: new RegExp(name, 'i') };
        }

        let allLeads;
        if (Object.keys(request.query).length === 0) {
            // If no query parameters, return all leads
            allLeads = await Lead.find();
        } else {
            // If there are query parameters, return filtered leads
            allLeads = await Lead.find(query);
        }

        response.status(200).json({
            allLeads: allLeads
        });
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
})

router.delete('/', authenticate , async (request , response) => {
    try {
        let leadId = request.params.id;
        let lead = await Lead.findById(leadId);
        if(!lead){
            return response.status(400).json({errors : [{msg : 'No Lead Found'}]});
        }
        let removableIndex = lead.map(lead => lead._id).indexOf(leadId);
        if(removableIndex !== -1){
            lead.splice(removableIndex , 1);
            response.status(200).json({
                msg : 'Lead Deleted',
            });
        }
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

module.exports = router;
