import React, {useState} from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import axios from 'axios';

const Link1 = React.forwardRef((props, ref) => <RouterLink innerRef={ref} {...props} />);

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://material-ui.com/">
        EZ-PHR
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  button: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function ForgetPasswordForm() {
  const history = useHistory();
  const [values, setValues] = useState({
    email: '',
  });

  const [errors, setErrors] = useState({
    email: {
      status: false,
      message: null,
    },
  });

  const [status, setStatus] = useState(0);
  const classes = useStyles();


  const handleChange = (e) => {
    setValues({
        ...values,
        [e.target.name]: e.target.value,
    });
  };

  const handleCancel = (e) => {
    history.push('/signin');
  };

  React.useEffect(() => {
    console.log(errors);
  }, [errors])

  const submitHandler = (e) => {
    e.preventDefault();
    axios.post('/forgetpassword', {
      email: values.email,
    })
    .then(res => {
      setStatus(res.data.message);
      sessionStorage.setItem('id', res.data.id)
      sessionStorage.setItem('reset-token', res.data.token);
    })
    .catch(err => {
      setStatus(0);
      const errs = err.response.data.errors;
      let currentErrors = {
        email: {
          status: false,
          message: null,
        },
      };
      let error;
      for (error of errs){
        Object.assign(currentErrors, {
          [error.param]: {
            status: true,
            message: error.msg,
          },
        });
      }
      setErrors(currentErrors);
    })
  };

  return (
    <Container component="main">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Forget Password
        </Typography>
        <form 
          className={classes.form}
          onSubmit={submitHandler}
          action="forgetpassword" 
          method="post" 
          noValidate
          >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                onChange={handleChange}
                error={errors.email.status}
                helperText={errors.email.message}
                required
                fullWidth
              />
            </Grid>
            <span id="status" style={{display: status ? 'inline' : 'none' }}>
              <Grid container direction="row" alignItems="center">
                <Grid item>
                  <CheckCircleIcon color="primary"/>
                </Grid>
                <Grid item>
                  <Typography id="statusMessage" variant="subtitle1" display="inline">
                    {status}
                  </Typography>
                </Grid>
              </Grid>
            </span>
          </Grid>
          <Grid container spacing={2}>
            <Grid item xs={6}>
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    color="primary"
                    className={classes.button}
                >
                    Search
                </Button>
            </Grid>
            <Grid item xs={6}>
                <Button
                    fullWidth
                    variant="contained"
                    color="default"
                    className={classes.button}
                    onClick={handleCancel}
                >
                    Cancel
                </Button>
            </Grid>
          </Grid>
        </form>
      </div>
      <Box mt={5}>
        <Copyright />
      </Box>
    </Container>
  );
}