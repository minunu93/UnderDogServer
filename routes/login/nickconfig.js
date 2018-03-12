var express = require('express');
var router = express.Router();
const mysql = require('mysql');
const pool = require('../../config/dbpool');
const async = require('async');
const crypto = require('crypto');

router.post('/', (req, res) => {
	let nickname = req.body.nickname;
	let query = {
		checkIdAndPassword: "SELECT nickname FROM users WHERE nickname=?"
	};

	let taskArray = [
		(callback) => {
			pool.getConnection((err, connection) => {
				if(err){
				res.status(501).send({
					stat: "fail"
				});
				callback("connection error : ",null);
			}
				else callback(null, connection);
			});
		},
		(connection, callback) => {
			let checkIdAndPassword = query.checkIdAndPassword;
			connection.query(checkIdAndPassword, nickname, (err, userData) => {
				if(err){
					connection.release();
					res.status(501).send({
						stat: "fail"
					});
					callback("mysql proc error ", null);
				}else{
					connection.release();
					callback(null, userData);
				}
			});
		},
		(userData, callback) => {
			if(userData.length === 0){
        res.status(201).send({

						stat: "success",
						data: {"user_id":req.body.nickname}
				});
				callback("success", null);
			}else{
        res.status(201).send({
          stat: "fail"
        });
        callback("fail", null);
			}
		}
	];
	async.waterfall(taskArray, (err, result) => {
		if(err) console.log(err);
		else console.log(result);
	});


});


module.exports = router;
