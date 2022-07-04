import { useGetProfile } from '../api/auth';

function Profile() {
  const { me } = useGetProfile();

  return <div>{me && `Profile of ${me.login42}`}</div>;
}

export default Profile;
