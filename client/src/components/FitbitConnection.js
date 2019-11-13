import React, {
	useState,
	useEffect
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import OauthPopup from 'react-oauth-popup';
import axios from 'axios';

const useStyles = makeStyles({
	card: {
		paddingTop: 10
	},
	media: {
		padding: 5,
		width: 300,
		margin: 'auto'
	}
});

function ConnectDescription() {
	return (
		<Typography
			variant="body2"
			color="textSecondary"
			component="p"
		>
			Connect your Fitbit account and your data
			will sync with the dashboard automatically
			on login or you can start a sync manually
			using the sync button.
		</Typography>
	);
}

function DisconnectDescription() {
	return (
		<Typography
			variant="body2"
			color="textSecondary"
			component="p"
		>
			Disconnect your Fitbit account and your data
			will not sync with the Dashboard.
		</Typography>
	);
}

function Description(props) {
	if (!props.connected) {
		return <ConnectDescription />;
	} else {
		return <DisconnectDescription />;
	}
}

export default function FitbitConnection() {
	const headers = {
		'x-access-token': sessionStorage.getItem(
			'access-token'
		)
	};
	const classes = useStyles();
	const [
		connectionStatus,
		setConnectionStatus
	] = useState(false);

	useEffect(() => {
		// TODO: Get fitbit connection status
	}, []);

	const syncConnection = async code => {
		if (!connectionStatus)
			await handleConnection(code);
		else handleDisconnection();
	};
	const handleConnection = async respUrl => {
		// TODO: Add fitbit connection oauth flow
		console.log('Connecting...');
		const oauthCode = respUrl;
		setConnectionStatus(true);
		try {
			const res = await axios.post(
				'/user/connectFitbit',
				{ code: oauthCode },
				{ headers }
			);
		} catch (err) {
			console.log(err.message);
		}
	};

	const handleDisconnection = () => {
		// TODO: Add fitbit disconnection flow
		console.log('Disconnecting...');
		setConnectionStatus(false);
		console.log('Disconnected!');
	};

	return (
		<Card className={classes.card}>
			<CardMedia className={classes.media}>
				<img
					src="/Fitbit_logo_RGB.png"
					alt="Fitbit logo"
					height="100%"
					width="100%"
				/>
			</CardMedia>
			<CardContent>
				<Typography
					gutterBottom
					variant="h5"
					component="h2"
					align="center"
				>
					{connectionStatus
						? 'Connected'
						: 'Not connected'}
				</Typography>
				<Description
					connected={connectionStatus}
				/>
			</CardContent>
			<OauthPopup
				url="https://www.fitbit.com/oauth2/authorize?response_type=code&client_id=22BC4H&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fuser%2Fconnecttracker&scope=activity%20heartrate%20location%20nutrition%20profile%20settings%20sleep%20social%20weight&expires_in=604800"
				onCode={syncConnection}
			>
				<Button
					variant="contained"
					color={
						connectionStatus
							? 'secondary'
							: 'primary'
					}
					fullWidth
				>
					{connectionStatus
						? 'Disconnect'
						: 'Connect'}
				</Button>
			</OauthPopup>
		</Card>
	);
}
