const userModel = require('../models/users');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const validator = require('validator');
const axios = require('axios');
const qs = require('querystring');
var ObjectID = require('mongodb').ObjectID;
const appConfig = require('../../../config/appConfig');

function sendVerificationEmail(
	email,
	verificationLink
) {}

function sendResetEmail(email, resetLink) {}

async function register(req, res, next) {
	try {
		const userInfo = await userModel.create({
			contact: {
				firstName: req.body.firstName,
				lastName: req.body.lastName
			},
			email: validator.normalizeEmail(
				req.body.email
			),
			password: req.body.password
		});
		if (userInfo) {
			createdDate = new Date(
				userInfo.createdDate
			);
			const secret =
				userInfo.password +
				createdDate.toISOString();
			const token = jwt.sign(
				{
					id: userInfo._id,
					email: userInfo.email
				},
				secret,
				{ expiresIn: 86400 } // 24 hour expiration
			);
			const verificationLink =
				req.protocol +
				'://' +
				req.hostname +
				'/verify?id=' +
				userInfo._id +
				'&token=' +
				token;
			sendVerificationEmail(
				userInfo.email,
				verificationLink
			);
			res.json({
				status: 'success',
				message: 'User added successfully',
				data: verificationLink
			});
		} else {
			res.json({
				status: 'error',
				message: 'Error adding user',
				data: null
			});
		}
	} catch (err) {
		if (err) {
			if (
				err.name === 'MongoError' &&
				err.code === 11000
			) {
				res.json({
					status: 'error',
					message:
						'This email is already registered',
					data: null
				});
			}
		}
	}
}

async function signin(req, res, next) {
	try {
		const userInfo = await userModel.findOne({
			email: validator.normalizeEmail(
				req.body.email
			)
		});
		if (!userInfo) {
			res.json({
				status: 'error',
				message: 'Invalid email/password',
				data: null
			});
		} else {
			const expireTime = req.body.remember
				? 86400
				: 300; // 24 hour if remember else 5 mins
			try {
				const match = await bcrypt.compare(
					req.body.password,
					userInfo.password
				);
				if (match) {
					const token = jwt.sign(
						{ id: userInfo._id },
						req.app.get('secretKey'),
						{ expiresIn: expireTime }
					);
					res.json({
						status: 'success',
						message: 'User found.',
						data: { token: token }
					});
				} else {
					res.json({
						status: 'error',
						message: 'Invalid email/password',
						data: null
					});
				}
			} catch (err) {
				res.json({
					status: 'error',
					message: 'Invalid email/password',
					data: null
				});
				next(err);
			}
		}
	} catch (err) {
		res.json({
			status: 'error',
			message: 'Invalid email/password',
			data: null
		});
	}
}

function signout(req, res, next) {
	res.json({
		status: 'success',
		message: 'Successfully signed out',
		data: null
	});
}

function updatePassword(req, res, next) {
	if (
		req.body.oldPassword === req.body.password
	) {
		req.json({
			status: 'error',
			message:
				'New password must not be the same as the current password',
			data: null
		});
		next(err);
	}
	var userId = req.body.userId;
	if (userId !== null) {
		userModel.findById(
			userId,
			async (err, userInfo) => {
				if (err) {
					next(err);
				} else {
					try {
						const match = await bcrypt.compare(
							req.body.oldPassword,
							userInfo.password
						);
						if (match) {
							const hashedPassword = await bcrypt.hash(
								req.body.password,
								appConfig.saltRounds
							);
							userModel.updateOne(
								{
									_id: ObjectID(userId)
								},
								{
									$set: {
										password: hashedPassword
									}
								},
								async err => {
									res.json({
										status: 'success',
										message:
											'Successfully updated password',
										data: null
									});
								}
							);
						} else {
							res.json({
								status: 'error',
								message:
									"Couldn't validate old password",
								data: null
							});
						}
					} catch (err) {
						res.json({
							status: 'error',
							message:
								"Couldn't validate old password",
							data: null
						});
						next(err);
					}
				}
			}
		);
	}
}

async function forgetPassword(req, res, next) {
	try {
		const userInfo = await userModel.findOne({
			email: validator.normalizeEmail(
				req.body.email
			)
		});
		if (!userInfo) {
			return res.json({
				status: 'success',
				message:
					'Reset email sent if account exists.',
				data: null
			});
		}
		createdDate = new Date(userInfo.createdDate);
		let secret =
			userInfo.password +
			createdDate.toISOString();
		const token = jwt.sign(
			{ id: userInfo._id },
			secret,
			{ expiresIn: 86400 } // 24 hour expiration
		);
		const resetLink =
			req.protocol +
			'://' +
			req.hostname +
			'/resetpassword?id=' +
			userInfo._id +
			'&token=' +
			token;
		sendResetEmail(userInfo.email, resetLink);
		res.json({
			status: 'success',
			message:
				'Reset email sent if account exists.',
			data: resetLink
		});
	} catch (err) {
		next(err);
	}
}

async function resetPassword(req, res, next) {
	const userId = req.query.id;
	const resetToken = req.query.token;
	if (userId !== null) {
		const userInfo = await userModel.findById(
			userId
		);
		try {
			const createdDate = new Date(
				userInfo.createdDate
			);
			const secret =
				userInfo.password +
				createdDate.toISOString();
			jwt.verify(
				resetToken,
				secret,
				async (err, decoded) => {
					if (err) {
						res.json({
							status: 'error',
							message: 'Invalid reset token',
							data: null
						});
					} else {
						// check if reset token id is same as user id
						if (userId !== decoded.id) {
							res.json({
								status: 'error',
								message: 'Invalid reset token',
								data: null
							});
						} else {
							userInfo.password =
								req.body.password;
							await userInfo.save();
							try {
								res.json({
									status: 'success',
									message:
										'Successfully reset password',
									data: null
								});
							} catch (err) {
								res.json({
									status: 'error',
									message: 'Invalid reset token',
									data: null
								});
								next(err);
							}
						}
					}
				}
			);
		} catch (err) {
			res.json({
				status: 'error',
				message: 'Invalid reset token',
				data: null
			});
			next(err);
		}
	}
}

async function verify(req, res, next) {
	const userId = req.query.id;
	const verificationToken = req.query.token;
	try {
		let userInfo = await userModel.findById(
			userId
		);
		if (userInfo.isVerified) {
			return res.json({
				status: 'success',
				message: 'User already verified',
				data: null
			});
		}
		const createdDate = new Date(
			userInfo.createdDate
		);
		const secret =
			userInfo.password +
			createdDate.toISOString();
		jwt.verify(
			verificationToken,
			secret,
			async (err, decoded) => {
				if (err) {
					res.json({
						status: 'error',
						message: err.message,
						data: null
					});
				} else {
					if (userId !== decoded.id) {
						res.json({
							status: 'error',
							message:
								'Invalid verification token',
							data: null
						});
					} else {
						userInfo = await userModel.updateOne(
							{
								_id: decoded.id
							},
							{
								$set: {
									isVerified: true
								}
							}
						);
						res.json({
							status: 'success',
							message:
								'Successfully verified email',
							data: null
						});
					}
				}
			}
		);
	} catch (err) {
		res.json({
			status: 'error',
			message: 'Invalid reset token',
			data: null
		});
	}
}

async function connectFitbit(req, res, next) {
	const clientId = appConfig.clientID;
	const clientSecret = appConfig.clientSecret;
	const encString = Buffer.from(
		`${clientId}:${clientSecret}`
	).toString('base64');
	try {
		const resp = await axios.post(
			'https://api.fitbit.com/oauth2/token',
			qs.stringify({
				grant_type: 'authorization_code',
				redirect_uri:
					'http://localhost:3000/user/connecttracker',
				code: req.body.code
			}),
			{
				headers: {
					'content-type':
						'application/x-www-form-urlencoded',
					Authorization: 'Basic ' + encString
				}
			}
		);
		if (resp.status === 200) {
			console.log('Token', resp.data);
		}
	} catch (err) {
		console.log(
			"Couldn't retrieve token from Fitbit: ",
			err.response.data.errors
		);
	}
}
module.exports = {
	register,
	signin,
	signout,
	updatePassword,
	forgetPassword,
	resetPassword,
	connectFitbit,
	verify
};
