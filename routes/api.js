/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
const mongoose = require('mongoose')
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;
const dotenv = require('dotenv').config()
const Project = require('../models/Project')

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
mongoose.connect(CONNECTION_STRING,{useNewUrlParser : true, useUnifiedTopology : true,useFindAndModify : false})

const db = mongoose.connection;

db.once('open',()=> {
  console.log("Connected to the database")
})
module.exports = function (app) {

  app.route('/api/issues/:project')
  
    // GET REQUEST
    .get(function (req, res){
      const projectName = req.params.project;
      let issue = {}
      for(let i in req.query) {
        if(req.query[i] !== undefined) {
          issue[i] = req.query[i]
        }
      }
      Project.findOne({project : projectName},(err, docs) => {
        if(err) console.log(err)
        
        if(docs !== null) {
          if(Object.keys(issue).length === 0) {
            res.status(200).json(docs.issues)
          } else {
            let response = docs.issues.filter(item => {
              for(let i in issue) {
                return item[i].toString() === issue[i]
              }
            })

            
            

            res.status(200).json(response)

          }
          
        } else {
          res.status(200).json(`No project named ${projectName}`)
        }
      })
    })
    
    
    // POST REQUEST

    .post(function (req, res){
      var projectName = req.params.project;
      const {issue_title, issue_text, created_by} = req.body;
      const issue = {
        _id : ObjectId().toString(),
        issue_title,
        issue_text,
        created_by,
        assigned_to : req.body.assigned_to  ? req.body.assigned_to: "",
        status_text : req.body.status_text  ? req.body.status_text: "",
        open : req.body.open  ? false: true,
        created_on : new Date(),
        updated_on : new Date()
      }
      
      if(!issue_title || !issue_text|| !created_by) return res.status(200).send("Empty inputs")
      else {
        const newProject = new Project({project : projectName})
      
        Project.findOne({project : projectName},(err,project) => {
          if(err) console.log(err)
          if(project !== null) {
            project.issues.push(issue)
            project.save((err, doc) => {
              if(err) console.log(err)

              res.status(200).json(doc.issues[doc.issues.length-1])
            })
          } else {
            newProject.issues.push(issue)
            newProject.save((err, doc) => {
              if(err) console.log(err)
              res.status(200).json(doc.issues[doc.issues.length-1])
            })
          }
        })
      }
      
    })
    

    // PUT REQUEST
    .put(function (req, res){
      const project = req.params.project;
      const {_id, issue_title, issue_text, created_by, assigned_to,status_text, open} = req.body;
      if(!_id) return res.status(200).send("_id error")
      Project.findOne({project : project},(err,project) => {
        if(err) console.log(err)
        if(project !== null) {
          let updated = project.issues.map((item) => {
            if(item._id === _id) {
              if(issue_title !== undefined) {item.issue_title = issue_title}
              if(issue_text !== undefined) {item.issue_text = issue_text}
              if(created_by !== undefined) {item.created_by = created_by}
              if(assigned_to !== undefined) {item.assigned_to = assigned_to}
              if(status_text !== undefined) {item.status_text = status_text}
              if(item.open === true) {
                item.open = false
              } else if(item.open === false) {
                item.open = true
              }
              item.updated_on = new Date()
              
            }
            return item;
          }) 
          project.issues = []
          project.issues = updated
          project.save((err, doc) => {
            res.status(200).send(`updated ${_id}`)
          })
        }else {
          res.status(200).json(`Can't find project with name ${projectName}`)
        }
        
      })
      
    })
    
    // DELETE REQUEST

    .delete(function (req, res){
      var projectName = req.params.project;
      const {_id} = req.body;
      if(!_id) return res.status(200).send("_id error")
      Project.findOne({project : projectName},(err,project) => {
        if(err) console.log(err)
        if(project !== null) {
          let updatedIssues = project.issues.filter((issue) => {
            return issue._id !== _id
          })
          project.issues = [...updatedIssues]
          project.save((err, doc) => {
            if(err) console.log(err)
            res.status(200).send(`deleted ${_id}`)
          })
          
        } else {
          res.status(200).send(`Can't find project with name ${projectName}`)
        }
      })
    });
    
};
