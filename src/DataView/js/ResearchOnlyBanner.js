import React from "react";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Divider from "@material-ui/core/Divider";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import Box from "@material-ui/core/Box";
import { useCookies } from "react-cookie";

export default function Banner() {
  const [cookies, setCookie] = useCookies(['res_only']);
  const dismissBanner = () => {
    var oneYear = new Date();
    oneYear.setYear(oneYear.getYear()+1);
    setCookie('res_only', 'dismissed', {
      path: '/',
      expires: oneYear
    });
  };

  return (
    <React.Fragment>
      {!cookies.res_only &&
        <React.Fragment>
          <CssBaseline />
          <Paper elevation={0}>
            <Box pt={5} pr={1} pb={1} pl={2} bgcolor='action.disabled'>
              <Typography component='div'>
                <Box fontWeight='bold' color='text.primary' textAlign='center' fontSize='h5.fontSize'>
                Research Use Only. Not for use in diagnostic procedures.
                </Box>
              </Typography>
              <Grid container justify="flex-end" spacing={8}>
                <Grid item>
                  <Button color="primary" onClick={dismissBanner}>Dismiss</Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
          <Divider />
        </React.Fragment>
      }
    </React.Fragment>
  );
}
