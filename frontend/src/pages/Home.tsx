import { Grid, Typography } from "@mui/material";
import { useGetProfile } from "../api/auth";
import Chat from "../components/Chat";

function Home() {
  const { data } = useGetProfile();

  return (
    <Grid container height="100%" direction="column">
      <Grid item>
        <Typography variant="h1">{data && data.login42}</Typography>
      </Grid>
      {/* <Grid item> */}
      {/*   <Chat /> */}
      {/* </Grid> */}
    </Grid>
  );
}

export default Home;
